-- ════════════════════════════════════════════════════════════════════
--  LifeLab — Community schema v3 (profile editing)
--
--  Run AFTER community_v2.sql, in Supabase → SQL Editor → New Query → Run.
--  Idempotent: safe to run multiple times.
--
--  Adds:
--   * `avatar_color`    — metallic palette key chosen by the user
--   * `avatar_initials` — up to 3 chars, overrides name-derived defaults
--   * `last_rename_at`  — enforces 30-day cooldown on display_name changes
--   * `update_profile`  RPC — atomic edit endpoint (rename + avatar)
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles_public
  add column if not exists avatar_color    text not null default '',
  add column if not exists avatar_initials text not null default '',
  add column if not exists last_rename_at  timestamptz;

-- 30-day cooldown helper (returns the next allowed rename time, or NULL if free)
create or replace function public.next_rename_allowed_at(p_uid uuid)
returns timestamptz
language sql
stable
as $$
  select case
    when last_rename_at is null then null
    when last_rename_at + interval '30 days' <= now() then null
    else last_rename_at + interval '30 days'
  end
  from public.profiles_public where id = p_uid
$$;

-- update_profile — atomic profile edit. Any field can be omitted by
-- passing null (no change). Renames are gated by a 30-day cooldown.
-- Avatar fields can be changed freely.
create or replace function public.update_profile(
  p_display_name    text default null,
  p_avatar_color    text default null,
  p_avatar_initials text default null
)
returns public.profiles_public
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid       uuid := auth.uid();
  v_current   public.profiles_public;
  v_row       public.profiles_public;
  v_next_at   timestamptz;
  v_new_name  text;
  v_new_color text;
  v_new_init  text;
  v_renaming  boolean := false;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_current from public.profiles_public where id = v_uid;
  if v_current.id is null then raise exception 'profile_missing'; end if;

  -- ── Display name (with cooldown) ────────────────────────────────
  if p_display_name is not null and length(trim(p_display_name)) > 0 then
    v_new_name := trim(p_display_name);
    if v_new_name <> v_current.display_name then
      if length(v_new_name) < 3 or length(v_new_name) > 20 then
        raise exception 'name_length' using errcode = '22023';
      end if;
      if v_new_name !~ '^[A-Za-z0-9_\.]+$' then
        raise exception 'name_chars' using errcode = '22023';
      end if;
      if public.is_display_name_reserved(v_new_name) then
        raise exception 'name_reserved' using errcode = '23505';
      end if;
      if exists (
        select 1 from public.profiles_public
        where lower(display_name) = lower(v_new_name) and id <> v_uid
      ) then
        raise exception 'name_taken' using errcode = '23505';
      end if;
      v_next_at := public.next_rename_allowed_at(v_uid);
      if v_next_at is not null then
        raise exception 'rename_cooldown' using
          errcode = '42P10',
          detail  = to_char(v_next_at at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
      end if;
      v_renaming := true;
    else
      -- same name as before: no-op, no cooldown burn
      v_new_name := null;
    end if;
  end if;

  -- ── Avatar ──────────────────────────────────────────────────────
  if p_avatar_color is not null then
    v_new_color := substring(trim(p_avatar_color), 1, 32);
  end if;
  if p_avatar_initials is not null then
    v_new_init := upper(substring(regexp_replace(p_avatar_initials, '[^A-Za-z0-9]', '', 'g'), 1, 3));
  end if;

  update public.profiles_public set
    display_name    = coalesce(v_new_name,  display_name),
    avatar_color    = coalesce(v_new_color, avatar_color),
    avatar_initials = coalesce(v_new_init,  avatar_initials),
    last_rename_at  = case when v_renaming then now() else last_rename_at end,
    updated_at      = now()
  where id = v_uid
  returning * into v_row;

  return v_row;
end$$;

revoke all on function public.update_profile(text, text, text) from public;
grant execute on function public.update_profile(text, text, text) to authenticated;

-- Refresh ranking views to expose the new avatar fields ─────────────
drop view if exists public.ranking_global;
drop view if exists public.ranking_monthly;

create view public.ranking_global as
select
  p.id,
  p.display_name,
  p.avatar_seed,
  p.avatar_color,
  p.avatar_initials,
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

create view public.ranking_monthly as
select
  p.id,
  p.display_name,
  p.avatar_seed,
  p.avatar_color,
  p.avatar_initials,
  p.monthly_xp as xp,
  p.streak,
  p.days_active,
  public.division_for_user(p.monthly_xp, p.days_active) as division_key,
  row_number() over (order by p.monthly_xp desc, p.id) as position
from public.profiles_public p;

grant select on public.ranking_global  to anon, authenticated;
grant select on public.ranking_monthly to anon, authenticated;

-- Refresh my_friends to include avatar fields too ───────────────────
drop function if exists public.my_friends();
create or replace function public.my_friends()
returns table (
  friend_id        uuid,
  display_name     text,
  avatar_seed      text,
  avatar_color     text,
  avatar_initials  text,
  total_xp         bigint,
  monthly_xp       bigint,
  streak           integer,
  days_active      integer,
  division_key     text
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
  select p.id, p.display_name, p.avatar_seed, p.avatar_color, p.avatar_initials,
         p.total_xp, p.monthly_xp, p.streak, p.days_active,
         public.division_for_user(p.total_xp, p.days_active)
  from my_pairs mp
  join public.profiles_public p on p.id = mp.friend_id
  order by p.total_xp desc;
$$;

revoke all on function public.my_friends() from public;
grant execute on function public.my_friends() to authenticated;

-- ── Done ────────────────────────────────────────────────────────────
