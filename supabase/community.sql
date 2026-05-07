-- ════════════════════════════════════════════════════════════════════
--  LifeLab — Community / Leaderboard schema (Phase 1)
--  Run AFTER schema.sql, in Supabase → SQL Editor → New Query → Run.
--  Idempotent: safe to run multiple times.
-- ════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────
create extension if not exists pgcrypto;
-- pg_cron may not be enabled by default. Try, ignore if no privilege.
do $$
begin
  perform 1 from pg_extension where extname = 'pg_cron';
  if not found then
    begin
      create extension pg_cron;
    exception when others then
      raise notice 'pg_cron not available in this project — schedule the rollover manually';
    end;
  end if;
end$$;

-- ════════════════════════════════════════════════════════════════════
--  1) profiles_public — public-readable identity + ranking columns
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.profiles_public (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text        not null,
  avatar_seed     text        not null default '',          -- hex color or hash for the avatar tile
  total_xp        bigint      not null default 0,
  monthly_xp      bigint      not null default 0,
  streak          integer     not null default 0,
  best_streak     integer     not null default 0,
  last_active_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- snapshot of position 24h ago, used for the ↑↓ movement indicator
  prev_position   integer,
  prev_position_at timestamptz
);

-- Case-insensitive uniqueness on display_name
create unique index if not exists profiles_public_display_name_ci_idx
  on public.profiles_public (lower(display_name));

create index if not exists profiles_public_total_xp_idx
  on public.profiles_public (total_xp desc, id);

create index if not exists profiles_public_monthly_xp_idx
  on public.profiles_public (monthly_xp desc, id);

create index if not exists profiles_public_streak_idx
  on public.profiles_public (streak desc, id);

-- RLS: open read, write only own row
alter table public.profiles_public enable row level security;

drop policy if exists "profiles_public_select_all" on public.profiles_public;
create policy "profiles_public_select_all"
  on public.profiles_public for select
  using (true);

drop policy if exists "profiles_public_insert_own" on public.profiles_public;
create policy "profiles_public_insert_own"
  on public.profiles_public for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_public_update_own" on public.profiles_public;
create policy "profiles_public_update_own"
  on public.profiles_public for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_public_delete_own" on public.profiles_public;
create policy "profiles_public_delete_own"
  on public.profiles_public for delete
  using (auth.uid() = id);

-- Realtime: full row replication so subscribers see all column changes
alter table public.profiles_public replica identity full;
do $$
begin
  -- add to publication if not already there
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'profiles_public'
  ) then
    execute 'alter publication supabase_realtime add table public.profiles_public';
  end if;
exception when others then
  raise notice 'could not add profiles_public to supabase_realtime publication';
end$$;

-- ════════════════════════════════════════════════════════════════════
--  2) seasons + season_history
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.seasons (
  id          serial primary key,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  label       text not null  -- e.g. '2026-05'
);

create unique index if not exists seasons_one_open_idx
  on public.seasons (ended_at) where ended_at is null;

alter table public.seasons enable row level security;

drop policy if exists "seasons_select_all" on public.seasons;
create policy "seasons_select_all"
  on public.seasons for select using (true);
-- writes restricted: only service_role (via Edge Function / RPC) can mutate

-- Bootstrap the first season if none exists.
insert into public.seasons (label)
select to_char(now() at time zone 'utc', 'YYYY-MM')
where not exists (select 1 from public.seasons where ended_at is null);

create table if not exists public.season_history (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  season_id       integer not null references public.seasons(id) on delete cascade,
  final_xp        bigint  not null,
  final_position  integer not null,
  division_key    text    not null,
  ended_at        timestamptz not null default now(),
  acknowledged_at timestamptz,
  unique (user_id, season_id)
);

create index if not exists season_history_user_idx
  on public.season_history (user_id, ended_at desc);

create index if not exists season_history_season_pos_idx
  on public.season_history (season_id, final_position);

alter table public.season_history enable row level security;

drop policy if exists "season_history_select_all" on public.season_history;
create policy "season_history_select_all"
  on public.season_history for select using (true);

drop policy if exists "season_history_ack_own" on public.season_history;
create policy "season_history_ack_own"
  on public.season_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
--  3) Friends (schema only; UI is phase 2)
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.friend_requests (
  id          bigserial primary key,
  from_user   uuid not null references auth.users(id) on delete cascade,
  to_user     uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending'
              check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  unique (from_user, to_user)
);

create table if not exists public.friendships (
  id          bigserial primary key,
  user_a      uuid not null references auth.users(id) on delete cascade,
  user_b      uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b) -- canonical ordering
);

alter table public.friend_requests enable row level security;
alter table public.friendships     enable row level security;

drop policy if exists "friend_requests_select_involved" on public.friend_requests;
create policy "friend_requests_select_involved"
  on public.friend_requests for select
  using (auth.uid() = from_user or auth.uid() = to_user);

drop policy if exists "friend_requests_insert_self" on public.friend_requests;
create policy "friend_requests_insert_self"
  on public.friend_requests for insert
  with check (auth.uid() = from_user);

drop policy if exists "friend_requests_update_target" on public.friend_requests;
create policy "friend_requests_update_target"
  on public.friend_requests for update
  using (auth.uid() = to_user or auth.uid() = from_user);

drop policy if exists "friendships_select_involved" on public.friendships;
create policy "friendships_select_involved"
  on public.friendships for select
  using (auth.uid() = user_a or auth.uid() = user_b);

-- ════════════════════════════════════════════════════════════════════
--  4) xp_audit_log + suspicion_flags
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.xp_audit_log (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  source       text not null,        -- 'habit'|'mission'|'bible'|'prayer'|'workout'|'other'
  amount       integer not null,
  occurred_at  timestamptz not null default now(),
  context_hash text,
  client_meta  jsonb
);

create index if not exists xp_audit_user_time_idx
  on public.xp_audit_log (user_id, occurred_at desc);

alter table public.xp_audit_log enable row level security;

drop policy if exists "xp_audit_insert_own" on public.xp_audit_log;
create policy "xp_audit_insert_own"
  on public.xp_audit_log for insert
  with check (auth.uid() = user_id);

drop policy if exists "xp_audit_select_own" on public.xp_audit_log;
create policy "xp_audit_select_own"
  on public.xp_audit_log for select
  using (auth.uid() = user_id);

create table if not exists public.suspicion_flags (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  flag_type   text not null,         -- 'xp_spike'|'abnormal_frequency'|'replay'|'manual'
  severity    integer not null default 1,
  payload     jsonb,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists suspicion_user_time_idx
  on public.suspicion_flags (user_id, created_at desc);

create index if not exists suspicion_open_idx
  on public.suspicion_flags (created_at desc) where resolved_at is null;

alter table public.suspicion_flags enable row level security;
-- No direct policies for non-admin users → blanket deny by RLS.
-- Service role bypasses RLS for moderation tooling.

-- ════════════════════════════════════════════════════════════════════
--  5) Helpers — division thresholds
-- ════════════════════════════════════════════════════════════════════
-- Keep these THRESHOLDS in sync with lib/community/divisions.ts on the client.
-- Tier 1 → 2 should happen FAST. Tier 4 ("Apenas um Cara Focado") ≈ 1 month
-- of consistent use (~3000 XP assuming average ~100 XP/day).
create or replace function public.division_for_xp(p_xp bigint)
returns text
language sql
immutable
as $$
  select case
    when p_xp < 50    then 'ze_bosta'
    when p_xp < 200   then 'faixa_branca'
    when p_xp < 800   then 'sargento'
    when p_xp < 3000  then 'cara_focado'
    when p_xp < 8000  then 'obstinado'
    when p_xp < 20000 then 'capitao'
    when p_xp < 50000 then 'goggins'
    else                   'pele'
  end
$$;

-- ════════════════════════════════════════════════════════════════════
--  6) RPC: ensure_profile_public / claim_display_name
-- ════════════════════════════════════════════════════════════════════
-- Reserved name list (keep small; case-insensitive)
create or replace function public.is_display_name_reserved(p_name text)
returns boolean language sql immutable as $$
  select lower(p_name) = any (array[
    'admin','administrator','root','system','staff','support',
    'moderator','mod','lifelab','official','null','undefined'
  ])
$$;

create or replace function public.claim_display_name(p_name text, p_avatar_seed text default '')
returns public.profiles_public
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_name text := trim(p_name);
  v_row  public.profiles_public;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if v_name is null or length(v_name) < 3 or length(v_name) > 20 then
    raise exception 'name_length' using errcode = '22023';
  end if;
  if v_name !~ '^[A-Za-z0-9_\.]+$' then
    raise exception 'name_chars' using errcode = '22023';
  end if;
  if public.is_display_name_reserved(v_name) then
    raise exception 'name_reserved' using errcode = '23505';
  end if;
  if exists (
    select 1 from public.profiles_public
    where lower(display_name) = lower(v_name) and id <> v_uid
  ) then
    raise exception 'name_taken' using errcode = '23505';
  end if;

  insert into public.profiles_public (id, display_name, avatar_seed, last_active_at)
  values (v_uid, v_name, coalesce(p_avatar_seed, ''), now())
  on conflict (id) do update
    set display_name   = excluded.display_name,
        avatar_seed    = coalesce(nullif(excluded.avatar_seed, ''), public.profiles_public.avatar_seed),
        updated_at     = now(),
        last_active_at = now()
  returning * into v_row;

  return v_row;
end$$;

revoke all on function public.claim_display_name(text, text) from public;
grant execute on function public.claim_display_name(text, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════
--  7) RPC: award_xp — single source of truth for XP changes
-- ════════════════════════════════════════════════════════════════════
create or replace function public.award_xp(
  p_amount    integer,
  p_source    text,
  p_streak    integer default null,
  p_context   text    default null
)
returns public.profiles_public
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_row  public.profiles_public;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_amount is null or p_amount < 0 or p_amount > 5000 then
    raise exception 'amount_out_of_range' using errcode = '22023';
  end if;
  if p_source is null or p_source = '' then
    p_source := 'other';
  end if;

  -- audit first (immutable record even if profile update fails)
  insert into public.xp_audit_log (user_id, source, amount, context_hash)
  values (v_uid, p_source, p_amount, p_context);

  -- upsert profile_public; if missing, the user has not finished onboarding yet
  -- but we still track their XP so it appears as soon as they claim a name.
  insert into public.profiles_public (id, display_name, avatar_seed, total_xp, monthly_xp, streak, last_active_at)
  values (
    v_uid,
    -- placeholder name (rare path); claim_display_name will overwrite later
    'user_' || substr(v_uid::text, 1, 8),
    '',
    p_amount,
    p_amount,
    coalesce(p_streak, 0),
    now()
  )
  on conflict (id) do update
    set total_xp       = public.profiles_public.total_xp   + p_amount,
        monthly_xp     = public.profiles_public.monthly_xp + p_amount,
        streak         = coalesce(p_streak, public.profiles_public.streak),
        best_streak    = greatest(public.profiles_public.best_streak, coalesce(p_streak, public.profiles_public.streak)),
        last_active_at = now(),
        updated_at     = now()
  returning * into v_row;

  return v_row;
end$$;

revoke all on function public.award_xp(integer, text, integer, text) from public;
grant execute on function public.award_xp(integer, text, integer, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════
--  8) RPC: sync_streak — periodic streak refresh (no XP delta)
-- ════════════════════════════════════════════════════════════════════
create or replace function public.sync_streak(p_streak integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return; end if;
  if p_streak is null or p_streak < 0 then p_streak := 0; end if;

  update public.profiles_public
    set streak         = p_streak,
        best_streak    = greatest(best_streak, p_streak),
        last_active_at = now(),
        updated_at     = now()
  where id = v_uid;
end$$;

revoke all on function public.sync_streak(integer) from public;
grant execute on function public.sync_streak(integer) to authenticated;

-- ════════════════════════════════════════════════════════════════════
--  9) Anti-cheat triggers
-- ════════════════════════════════════════════════════════════════════
create or replace function public.flag_xp_anomaly()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_recent_total integer;
  v_today_count  integer;
begin
  -- spike: more than 800 XP in the last 60 seconds
  select coalesce(sum(amount), 0)
    into v_recent_total
  from public.xp_audit_log
  where user_id = new.user_id
    and occurred_at > now() - interval '60 seconds';

  if v_recent_total > 800 then
    insert into public.suspicion_flags (user_id, flag_type, severity, payload)
    values (
      new.user_id, 'xp_spike', 2,
      jsonb_build_object('window_seconds', 60, 'total_xp', v_recent_total)
    );
  end if;

  -- frequency: more than 250 XP-awarding actions in last 24h
  select count(*) into v_today_count
  from public.xp_audit_log
  where user_id = new.user_id
    and occurred_at > now() - interval '24 hours';

  if v_today_count > 250 then
    insert into public.suspicion_flags (user_id, flag_type, severity, payload)
    values (
      new.user_id, 'abnormal_frequency', 1,
      jsonb_build_object('window_hours', 24, 'count', v_today_count)
    );
  end if;

  return new;
end$$;

drop trigger if exists trg_flag_xp_anomaly on public.xp_audit_log;
create trigger trg_flag_xp_anomaly
  after insert on public.xp_audit_log
  for each row execute function public.flag_xp_anomaly();

-- ════════════════════════════════════════════════════════════════════
--  10) Position movement snapshot (runs daily via cron when available)
-- ════════════════════════════════════════════════════════════════════
create or replace function public.snapshot_positions()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  with ranked as (
    select id, row_number() over (order by total_xp desc, id) as pos
    from public.profiles_public
  )
  update public.profiles_public p
    set prev_position    = r.pos,
        prev_position_at = now()
  from ranked r
  where p.id = r.id;
end$$;

-- ════════════════════════════════════════════════════════════════════
--  11) Season rollover RPC
-- ════════════════════════════════════════════════════════════════════
create or replace function public.close_current_season()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_season_id integer;
  v_count     integer;
begin
  select id into v_season_id from public.seasons where ended_at is null limit 1;
  if v_season_id is null then
    -- no open season: open one and exit
    insert into public.seasons (label) values (to_char(now() at time zone 'utc', 'YYYY-MM'));
    return 0;
  end if;

  -- snapshot final standings
  with ranked as (
    select id, monthly_xp, row_number() over (order by monthly_xp desc, id) as pos
    from public.profiles_public
    where monthly_xp > 0
  )
  insert into public.season_history (user_id, season_id, final_xp, final_position, division_key)
  select id, v_season_id, monthly_xp, pos, public.division_for_xp(monthly_xp)
  from ranked
  on conflict (user_id, season_id) do nothing;

  get diagnostics v_count = row_count;

  -- close season
  update public.seasons set ended_at = now() where id = v_season_id;

  -- reset monthly XP
  update public.profiles_public set monthly_xp = 0;

  -- open new season
  insert into public.seasons (label) values (to_char(now() at time zone 'utc', 'YYYY-MM'));

  return v_count;
end$$;

revoke all on function public.close_current_season() from public;
-- only service_role (Edge Function) calls this; do not grant to authenticated

-- Schedule via pg_cron if available — 1st of every month at 00:00 UTC
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('lifelab_close_season') where exists
      (select 1 from cron.job where jobname = 'lifelab_close_season');
    perform cron.schedule(
      'lifelab_close_season',
      '0 0 1 * *',
      $cron$ select public.close_current_season(); $cron$
    );

    perform cron.unschedule('lifelab_snapshot_positions') where exists
      (select 1 from cron.job where jobname = 'lifelab_snapshot_positions');
    perform cron.schedule(
      'lifelab_snapshot_positions',
      '0 */6 * * *',  -- every 6 hours
      $cron$ select public.snapshot_positions(); $cron$
    );
  end if;
exception when others then
  raise notice 'pg_cron schedule skipped';
end$$;

-- ════════════════════════════════════════════════════════════════════
--  12) Convenience views
-- ════════════════════════════════════════════════════════════════════
create or replace view public.ranking_global as
select
  p.id,
  p.display_name,
  p.avatar_seed,
  p.total_xp,
  p.streak,
  public.division_for_xp(p.total_xp) as division_key,
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
  public.division_for_xp(p.monthly_xp) as division_key,
  row_number() over (order by p.monthly_xp desc, p.id) as position
from public.profiles_public p;

grant select on public.ranking_global  to anon, authenticated;
grant select on public.ranking_monthly to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- Done.
-- ════════════════════════════════════════════════════════════════════
