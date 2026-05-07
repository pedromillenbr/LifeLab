-- ════════════════════════════════════════════════════════════════════
--  LifeLab — Community schema v2 (recalibrated thresholds + friends)
--
--  Run AFTER community.sql, in Supabase → SQL Editor → New Query → Run.
--  Idempotent: safe to run multiple times.
--
--  Adds:
--   * `days_active` column on profiles_public (used as a gate for promotions)
--   * `bump_days_active` RPC (client calls when a new local "access day" is seen)
--   * Recalibrated thresholds — promotion to Faixa Branca needs ≥2 days AND ≥200 XP
--   * `division_for_user(xp, days_active)` — gated version of division_for_xp
--   * `promotion_events` log so the client can detect rank-up cinematics
--   * `friend_messages` (trash-talk) with pre-fills + RLS for friends only
--   * `add_friend_by_name` and `respond_friend_request` RPCs
-- ════════════════════════════════════════════════════════════════════

-- ── 1) days_active column ────────────────────────────────────────────
alter table public.profiles_public
  add column if not exists days_active integer not null default 0;

-- ── 2) Recalibrated, gated division function ─────────────────────────
-- The original division_for_xp(xp) stays for legacy callers; new code
-- should call division_for_user(xp, days_active).
create or replace function public.division_for_user(p_xp bigint, p_days integer)
returns text
language sql
immutable
as $$
  select case
    -- Rank 1 → 2: needs at least 2 distinct active days AND 200 XP.
    when p_xp < 200 or p_days < 2  then 'ze_bosta'
    -- Rank 2 → 3: 800 XP and 5 days
    when p_xp < 800 or p_days < 5  then 'faixa_branca'
    -- Rank 3 → 4: 3000 XP and 12 days (~"Cara Focado" ≈ 1 month)
    when p_xp < 3000 or p_days < 12 then 'sargento'
    -- From here on the gate is XP-driven; user already has the habit.
    when p_xp < 8000  then 'cara_focado'
    when p_xp < 20000 then 'obstinado'
    when p_xp < 50000 then 'capitao'
    when p_xp < 120000 then 'goggins'
    else                    'pele'
  end
$$;

-- ── 3) bump_days_active — called by client whenever a new local
--     "access day" is recorded (lib/community/xpSync.ts). Idempotent
--     per (user, day). The RPC takes the YYYY-MM-DD string so the
--     client controls the day boundary in the user's timezone.
create table if not exists public.user_access_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);

alter table public.user_access_days enable row level security;
drop policy if exists "user_access_days_self" on public.user_access_days;
create policy "user_access_days_self"
  on public.user_access_days for select
  using (auth.uid() = user_id);

create or replace function public.bump_days_active(p_day date)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then return 0; end if;
  if p_day is null then p_day := (now() at time zone 'utc')::date; end if;

  insert into public.user_access_days (user_id, day)
  values (v_uid, p_day)
  on conflict do nothing;

  select count(*) into v_count
  from public.user_access_days
  where user_id = v_uid;

  update public.profiles_public
    set days_active    = v_count,
        last_active_at = now(),
        updated_at     = now()
  where id = v_uid;

  return v_count;
end$$;

revoke all on function public.bump_days_active(date) from public;
grant execute on function public.bump_days_active(date) to authenticated;

-- ── 4) Promotion events ──────────────────────────────────────────────
-- Whenever a user crosses a division boundary, we insert a row here.
-- The client polls/subscribes and shows the cinematic on first sight.
create table if not exists public.promotion_events (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  from_division   text not null,
  to_division     text not null,
  occurred_at     timestamptz not null default now(),
  acknowledged_at timestamptz
);

create index if not exists promotion_events_user_unack_idx
  on public.promotion_events (user_id, occurred_at desc) where acknowledged_at is null;

alter table public.promotion_events enable row level security;

drop policy if exists "promotion_events_select_own" on public.promotion_events;
create policy "promotion_events_select_own"
  on public.promotion_events for select using (auth.uid() = user_id);

drop policy if exists "promotion_events_ack_own" on public.promotion_events;
create policy "promotion_events_ack_own"
  on public.promotion_events for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger: detects division transitions on profiles_public updates.
create or replace function public.detect_promotion()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old text;
  v_new text;
begin
  v_old := public.division_for_user(coalesce(old.total_xp, 0), coalesce(old.days_active, 0));
  v_new := public.division_for_user(new.total_xp, new.days_active);
  if v_new <> v_old then
    insert into public.promotion_events (user_id, from_division, to_division)
    values (new.id, v_old, v_new);
  end if;
  return new;
end$$;

drop trigger if exists trg_detect_promotion on public.profiles_public;
create trigger trg_detect_promotion
  after update of total_xp, days_active on public.profiles_public
  for each row execute function public.detect_promotion();

-- ── 5) Refresh ranking views to use the new gated division ──────────
create or replace view public.ranking_global as
select
  p.id,
  p.display_name,
  p.avatar_seed,
  p.total_xp,
  p.streak,
  p.days_active,
  public.division_for_user(p.total_xp, p.days_active) as division_key,
  row_number() over (order by p.total_xp desc, p.id) as position,
  case
    when p.prev_position is null then 0
    else p.prev_position - (row_number() over (order by p.total_xp desc, p.id))
  end as movement
from public.profiles_public p;

create or replace view public.ranking_monthly as
select
  p.id,
  p.display_name,
  p.avatar_seed,
  p.monthly_xp as xp,
  p.streak,
  p.days_active,
  public.division_for_user(p.monthly_xp, p.days_active) as division_key,
  row_number() over (order by p.monthly_xp desc, p.id) as position
from public.profiles_public p;

grant select on public.ranking_global  to anon, authenticated;
grant select on public.ranking_monthly to anon, authenticated;

-- ── 6) FRIENDS — UI-driven RPCs ─────────────────────────────────────

-- Add a friend by display_name (case-insensitive). Creates a request
-- that the target must accept. Idempotent — re-issuing a pending
-- request is a no-op; if the target already sent us one, accepts
-- automatically and creates the friendship row.
create or replace function public.add_friend_by_name(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid       uuid := auth.uid();
  v_target    uuid;
  v_reverse   public.friend_requests;
  v_a         uuid;
  v_b         uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name_required' using errcode = '22023';
  end if;

  select id into v_target
  from public.profiles_public
  where lower(display_name) = lower(trim(p_name))
  limit 1;

  if v_target is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  if v_target = v_uid then
    return jsonb_build_object('status', 'self');
  end if;

  -- canonical pair
  v_a := least(v_uid, v_target);
  v_b := greatest(v_uid, v_target);

  -- already friends?
  if exists (select 1 from public.friendships where user_a = v_a and user_b = v_b) then
    return jsonb_build_object('status', 'already_friends');
  end if;

  -- if the target already requested us → accept now
  select * into v_reverse from public.friend_requests
  where from_user = v_target and to_user = v_uid and status = 'pending'
  limit 1;
  if v_reverse.id is not null then
    update public.friend_requests set status = 'accepted', resolved_at = now()
      where id = v_reverse.id;
    insert into public.friendships (user_a, user_b) values (v_a, v_b)
      on conflict do nothing;
    return jsonb_build_object('status', 'accepted');
  end if;

  -- otherwise create or refresh outgoing request
  insert into public.friend_requests (from_user, to_user, status)
  values (v_uid, v_target, 'pending')
  on conflict (from_user, to_user) do update
    set status = 'pending', resolved_at = null;

  return jsonb_build_object('status', 'sent');
end$$;

revoke all on function public.add_friend_by_name(text) from public;
grant execute on function public.add_friend_by_name(text) to authenticated;

-- Respond to a pending friend request (accept | decline).
create or replace function public.respond_friend_request(p_request_id bigint, p_accept boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_req public.friend_requests;
  v_a   uuid;
  v_b   uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select * into v_req from public.friend_requests where id = p_request_id;
  if v_req.id is null then return jsonb_build_object('status', 'not_found'); end if;
  if v_req.to_user <> v_uid then return jsonb_build_object('status', 'forbidden'); end if;
  if v_req.status <> 'pending' then return jsonb_build_object('status', 'already_resolved'); end if;

  if p_accept then
    update public.friend_requests set status = 'accepted', resolved_at = now() where id = p_request_id;
    v_a := least(v_req.from_user, v_req.to_user);
    v_b := greatest(v_req.from_user, v_req.to_user);
    insert into public.friendships (user_a, user_b) values (v_a, v_b) on conflict do nothing;
    return jsonb_build_object('status', 'accepted');
  else
    update public.friend_requests set status = 'declined', resolved_at = now() where id = p_request_id;
    return jsonb_build_object('status', 'declined');
  end if;
end$$;

revoke all on function public.respond_friend_request(bigint, boolean) from public;
grant execute on function public.respond_friend_request(bigint, boolean) to authenticated;

-- Helper: get my friends list with their public profile + ranking position.
create or replace function public.my_friends()
returns table (
  friend_id     uuid,
  display_name  text,
  avatar_seed   text,
  total_xp      bigint,
  monthly_xp    bigint,
  streak        integer,
  days_active   integer,
  division_key  text
)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  with my_pairs as (
    select case when user_a = auth.uid() then user_b else user_a end as friend_id
    from public.friendships
    where auth.uid() in (user_a, user_b)
  )
  select p.id, p.display_name, p.avatar_seed,
         p.total_xp, p.monthly_xp, p.streak, p.days_active,
         public.division_for_user(p.total_xp, p.days_active)
  from my_pairs mp
  join public.profiles_public p on p.id = mp.friend_id
  order by p.total_xp desc;
$$;

revoke all on function public.my_friends() from public;
grant execute on function public.my_friends() to authenticated;

-- ── 7) FRIEND MESSAGES (trash-talk) ──────────────────────────────────
create table if not exists public.friend_messages (
  id          bigserial primary key,
  from_user   uuid not null references auth.users(id) on delete cascade,
  to_user     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  pre_fill_id text,                 -- which template was used (or null = custom)
  created_at  timestamptz not null default now(),
  read_at     timestamptz,
  check (length(body) between 1 and 200)
);

create index if not exists friend_messages_inbox_idx
  on public.friend_messages (to_user, created_at desc);
create index if not exists friend_messages_thread_idx
  on public.friend_messages (least(from_user, to_user), greatest(from_user, to_user), created_at desc);

alter table public.friend_messages enable row level security;

-- Read: only sender or recipient. Insert: must be friends. Update (read flag): only recipient.
drop policy if exists "friend_messages_select_involved" on public.friend_messages;
create policy "friend_messages_select_involved"
  on public.friend_messages for select
  using (auth.uid() in (from_user, to_user));

drop policy if exists "friend_messages_update_recipient" on public.friend_messages;
create policy "friend_messages_update_recipient"
  on public.friend_messages for update
  using (auth.uid() = to_user) with check (auth.uid() = to_user);

-- Insert is gated by an RPC so we can validate friendship.
create or replace function public.send_friend_message(p_to uuid, p_body text, p_pre_fill text default null)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_a   uuid;
  v_b   uuid;
  v_id  bigint;
  v_recent integer;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_to is null or p_to = v_uid then raise exception 'invalid_target'; end if;
  if p_body is null or length(trim(p_body)) = 0 then raise exception 'body_required' using errcode = '22023'; end if;
  if length(p_body) > 200 then raise exception 'body_too_long' using errcode = '22023'; end if;

  v_a := least(v_uid, p_to);
  v_b := greatest(v_uid, p_to);
  if not exists (select 1 from public.friendships where user_a = v_a and user_b = v_b) then
    raise exception 'not_friends' using errcode = '42501';
  end if;

  -- Rate limit: 12 messages per hour to the same recipient
  select count(*) into v_recent
  from public.friend_messages
  where from_user = v_uid and to_user = p_to
    and created_at > now() - interval '1 hour';
  if v_recent >= 12 then
    raise exception 'rate_limited' using errcode = '42P01';
  end if;

  insert into public.friend_messages (from_user, to_user, body, pre_fill_id)
  values (v_uid, p_to, trim(p_body), p_pre_fill)
  returning id into v_id;
  return v_id;
end$$;

revoke all on function public.send_friend_message(uuid, text, text) from public;
grant execute on function public.send_friend_message(uuid, text, text) to authenticated;

-- ── Done ────────────────────────────────────────────────────────────
