-- Sewa & Akta Tanah v1.19.57 RC
-- Jalankan SEKALI di Supabase SQL Editor sebelum memakai modul Perizinan & Legalitas / Agen Properti.

create table if not exists public.property_permits (
 id uuid primary key default gen_random_uuid(), user_id uuid not null, asset_id uuid not null references public.assets(id) on delete cascade,
 category text not null default 'Lainnya', document_type text not null default '', document_no text not null default '', issuer text not null default '', holder text not null default '',
 issue_date date, valid_from date, valid_until date, status text not null default 'Tidak Ditentukan', related_object text not null default '', drive_url text not null default '', notes text not null default '',
 ai_verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.property_agent_agreements (
 id uuid primary key default gen_random_uuid(), user_id uuid not null, asset_id uuid not null references public.assets(id) on delete cascade, contract_id uuid references public.contracts(id) on delete set null,
 agency_name text not null default '', broker_name text not null default '', business_license_no text not null default '', competency_no text not null default '', agreement_no text not null default '', agreement_date date,
 start_date date, end_date date, transaction_type text not null default '', exclusivity text not null default 'Tidak ditentukan', transaction_value numeric, commission_pct numeric, commission_amount numeric,
 commission_payer text not null default '', commission_status text not null default 'Belum Dibayar', commission_paid_date date, payment_terms text not null default '', important_clauses text not null default '', drive_url text not null default '', payment_proof_url text not null default '',
 ai_verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists property_permits_asset_idx on public.property_permits(asset_id);
create index if not exists property_permits_expiry_idx on public.property_permits(valid_until);
create index if not exists property_agent_agreements_asset_idx on public.property_agent_agreements(asset_id);
create index if not exists property_agent_agreements_contract_idx on public.property_agent_agreements(contract_id);
alter table public.property_permits enable row level security;
alter table public.property_agent_agreements enable row level security;
do $$ declare t text; pol record; begin
 foreach t in array array['property_permits','property_agent_agreements'] loop
  for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy if exists %I on public.%I',pol.policyname,t); end loop;
  execute format('create policy %I on public.%I for select to authenticated using (user_id=public.app_access_owner())',t||'_workspace_select',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using (user_id=public.app_access_owner() and public.app_can_write()) with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_update',t);
  execute format('create policy %I on public.%I for delete to authenticated using (user_id=public.app_access_owner() and public.app_is_admin())',t||'_workspace_delete',t);
 end loop;
end $$;
