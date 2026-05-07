-- ════════════════════════════════════════════════════════════════════
--  LifeLab — Supabase schema
--  Run this once in Supabase → SQL Editor → New Query → Run.
--  Idempotent: safe to run multiple times.
-- ════════════════════════════════════════════════════════════════════

-- 1) Tabela única de sincronização — payload JSONB por usuário.
create table if not exists public.user_data (
  id          uuid primary key references auth.users(id) on delete cascade,
  payload     jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- 2) Index implícito pela PK já cobre os SELECTs por id.
--    Nada mais é necessário.

-- 3) RLS — cada usuário só vê e altera a própria linha.
alter table public.user_data enable row level security;

drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own"
  on public.user_data
  for select
  using (auth.uid() = id);

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own"
  on public.user_data
  for insert
  with check (auth.uid() = id);

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own"
  on public.user_data
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "user_data_delete_own" on public.user_data;
create policy "user_data_delete_own"
  on public.user_data
  for delete
  using (auth.uid() = id);

-- 4) Trigger para manter updated_at automático em UPDATEs (defensivo).
create or replace function public.user_data_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_data_updated_at on public.user_data;
create trigger trg_user_data_updated_at
  before update on public.user_data
  for each row
  execute function public.user_data_set_updated_at();
