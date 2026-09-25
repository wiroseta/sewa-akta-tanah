-- Jalankan SELURUH file ini sekali di Supabase > SQL Editor > New query > Run.
-- Data tiap user hanya dapat dibaca/diubah oleh user tersebut (RLS).

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant text not null default '',
  asset text not null default '',
  deed_no text,
  deed_date date,
  start_date date,
  end_date date,
  rent numeric,
  renewal_notice date,
  pic1 text,
  phone1 text,
  pic2 text,
  phone2 text,
  bank text,
  account text,
  account_name text,
  hgb_no text,
  hgb_end date,
  doc_url text,
  notes text,
  payments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contracts enable row level security;

create index if not exists contracts_user_id_idx on public.contracts(user_id);

drop policy if exists "contracts_select_own" on public.contracts;
create policy "contracts_select_own" on public.contracts for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "contracts_insert_own" on public.contracts;
create policy "contracts_insert_own" on public.contracts for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "contracts_update_own" on public.contracts;
create policy "contracts_update_own" on public.contracts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "contracts_delete_own" on public.contracts;
create policy "contracts_delete_own" on public.contracts for delete to authenticated using ((select auth.uid()) = user_id);
