-- SUPABASE SCHEMA / MIGRATION HISTORY
-- Arsip gabungan. JANGAN dijalankan untuk update normal.
-- Dibuat dari migration historis sampai v1.17.3.


-- ============================================================
-- SOURCE: supabase_setup.sql
-- ============================================================
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


-- ============================================================
-- SOURCE: supabase_v17_migration.sql
-- ============================================================
-- V1.7 migration. Jalankan sekali setelah supabase_setup.sql.
alter table public.contracts add column if not exists lessor text default '';
alter table public.contracts add column if not exists property_address text default '';
alter table public.contracts add column if not exists property_area text default '';
alter table public.contracts add column if not exists renewal_term text default '';
alter table public.contracts add column if not exists deposit numeric default 0;
alter table public.contracts add column if not exists contacts jsonb not null default '[]'::jsonb;
alter table public.contracts add column if not exists bank_accounts jsonb not null default '[]'::jsonb;
alter table public.contracts add column if not exists land_rights jsonb not null default '[]'::jsonb;
alter table public.contracts add column if not exists clauses jsonb not null default '[]'::jsonb;
alter table public.contracts add column if not exists verification_status text not null default 'perlu_verifikasi';
alter table public.contracts add column if not exists source_pages text default '';


-- ============================================================
-- SOURCE: supabase_v114_migration.sql
-- ============================================================
-- v1.14: simpan link lokasi aset/sewa dari Google Maps.
-- Jalankan sekali di Supabase > SQL Editor > New query > Run.
alter table public.contracts
  add column if not exists google_maps_url text not null default '';


-- ============================================================
-- SOURCE: supabase_v1152_property_relationship_migration.sql
-- ============================================================
-- Sewa & Akta Tanah v1.15.2 — Property Relationship Model
-- Jalankan SETELAH v1.14. Jangan jalankan migration v1.15 / v1.15.1 lama.
-- Model: properti/lokasi, sertifikat tanah, bangunan, sewa, PBB dan fasilitas dipisahkan.

create table if not exists public.assets (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null default '', address text not null default '', area text not null default '', google_maps_url text not null default '', notes text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.land_titles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 asset_id uuid references public.assets(id) on delete set null, right_type text not null default '', certificate_no text not null default '',
 land_area numeric, valid_until date, address text not null default '', drive_url text not null default '', map_plan_url text not null default '', google_maps_url text not null default '', notes text not null default '', created_at timestamptz not null default now());

create table if not exists public.buildings (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 asset_id uuid references public.assets(id) on delete set null, name text not null default '', building_type text not null default '', building_area numeric,
 address text not null default '', drive_url text not null default '', floor_plan_url text not null default '', google_maps_url text not null default '', notes text not null default '', created_at timestamptz not null default now());

alter table public.contracts add column if not exists asset_id uuid references public.assets(id) on delete set null;
alter table public.contracts add column if not exists lease_plan_url text not null default '';
alter table public.contracts add column if not exists lease_plan_notes text not null default '';

create table if not exists public.contract_land_titles (
 contract_id uuid not null references public.contracts(id) on delete cascade, land_title_id uuid not null references public.land_titles(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, notes text not null default '', primary key(contract_id,land_title_id));
create table if not exists public.contract_buildings (
 contract_id uuid not null references public.contracts(id) on delete cascade, building_id uuid not null references public.buildings(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, notes text not null default '', primary key(contract_id,building_id));

create table if not exists public.pbb_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 nop text not null default '', tax_year integer, land_area numeric, building_area numeric,
 njop_land_per_m2 numeric, njop_land_total numeric, njop_building_per_m2 numeric, njop_building_total numeric, njop_total numeric,
 pbb_due numeric, due_date date, payment_status text not null default '', paid_date date,
 drive_sppt_url text not null default '', drive_payment_url text not null default '', google_maps_url text not null default '', notes text not null default '', created_at timestamptz not null default now());
create table if not exists public.pbb_land_titles (
 pbb_id uuid not null references public.pbb_records(id) on delete cascade, land_title_id uuid not null references public.land_titles(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, primary key(pbb_id,land_title_id));
create table if not exists public.pbb_buildings (
 pbb_id uuid not null references public.pbb_records(id) on delete cascade, building_id uuid not null references public.buildings(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, primary key(pbb_id,building_id));
create table if not exists public.contract_pbb (
 contract_id uuid not null references public.contracts(id) on delete cascade, pbb_id uuid not null references public.pbb_records(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, primary key(contract_id,pbb_id));

create table if not exists public.facilities (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 contract_id uuid references public.contracts(id) on delete cascade, type text not null default '', provider text not null default '', customer_id text not null default '',
 meter_no text not null default '', phone text not null default '', registered_name text not null default '', plan text not null default '', contact text not null default '',
 notes text not null default '', drive_url text not null default '', google_maps_url text not null default '', created_at timestamptz not null default now());

create table if not exists public.land_documents (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 land_title_id uuid references public.land_titles(id) on delete cascade, type text not null default '', number text not null default '', document_date date,
 description text not null default '', drive_url text not null default '', google_maps_url text not null default '', created_at timestamptz not null default now());
create table if not exists public.contract_documents (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 contract_id uuid references public.contracts(id) on delete cascade, type text not null default '', description text not null default '', drive_url text not null default '', google_maps_url text not null default '', created_at timestamptz not null default now());

-- Buat master lokasi dari kontrak v1.14 agar data lama tidak hilang.
insert into public.assets(user_id,name,address,area,google_maps_url)
select c.user_id,c.asset,max(coalesce(c.property_address,'')),max(coalesce(c.property_area,'')),max(coalesce(c.google_maps_url,''))
from public.contracts c where coalesce(trim(c.asset),'')<>'' and c.asset_id is null
and not exists(select 1 from public.assets a where a.user_id=c.user_id and lower(trim(a.name))=lower(trim(c.asset))) group by c.user_id,c.asset;
update public.contracts c set asset_id=a.id from public.assets a where c.asset_id is null and a.user_id=c.user_id and lower(trim(a.name))=lower(trim(c.asset));

-- RLS
alter table public.assets enable row level security; alter table public.land_titles enable row level security; alter table public.buildings enable row level security;
alter table public.contract_land_titles enable row level security; alter table public.contract_buildings enable row level security; alter table public.pbb_records enable row level security;
alter table public.pbb_land_titles enable row level security; alter table public.pbb_buildings enable row level security; alter table public.contract_pbb enable row level security;
alter table public.facilities enable row level security; alter table public.land_documents enable row level security; alter table public.contract_documents enable row level security;
do $$ declare t text; begin foreach t in array array['assets','land_titles','buildings','contract_land_titles','contract_buildings','pbb_records','pbb_land_titles','pbb_buildings','contract_pbb','facilities','land_documents','contract_documents'] loop
 execute format('drop policy if exists %I on public.%I',t||'_all_own',t);
 execute format('create policy %I on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t||'_all_own',t);
end loop; end $$;

create index if not exists land_titles_asset_idx on public.land_titles(asset_id); create index if not exists buildings_asset_idx on public.buildings(asset_id);
create index if not exists facilities_contract_idx on public.facilities(contract_id); create index if not exists pbb_nop_year_idx on public.pbb_records(nop,tax_year);


-- ============================================================
-- SOURCE: supabase_v1155_migration.sql
-- ============================================================
-- Sewa & Akta Tanah v1.15.5
-- Luas disimpan per dokumen; tidak saling menimpa.
alter table public.contracts add column if not exists lease_land_area numeric, add column if not exists lease_building_area numeric;
alter table public.land_titles add column if not exists holder_name text not null default '', add column if not exists survey_no text not null default '', add column if not exists survey_date date;
alter table public.pbb_records add column if not exists taxpayer_name text not null default '', add column if not exists object_address text not null default '';


-- ============================================================
-- SOURCE: supabase_v1158_migration.sql
-- ============================================================
-- Sewa & Akta Tanah v1.15.8
-- PBB tahunan: pisahkan PBB terutang vs jumlah yang harus dibayar, dan kontrol warning dashboard.
alter table public.pbb_records
  add column if not exists pbb_payable numeric,
  add column if not exists warning_ignored boolean not null default false,
  add column if not exists warning_ignore_reason text not null default '';


-- ============================================================
-- SOURCE: supabase_v117_user_roles_migration.sql
-- ============================================================
-- Sewa & Akta Tanah v1.17.1 — shared workspace + professional user roles
-- Run ONCE in Supabase > SQL Editor after backing up your database.

create table if not exists public.app_user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data_owner_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('administrator','document_manager','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.app_user_access enable row level security;

-- Bootstrap existing installations: every existing account starts as administrator of its own data.
-- This preserves all v1.16.x data exactly where it is.
insert into public.app_user_access(user_id,data_owner_id,role)
select id,id,'administrator' from auth.users
on conflict (user_id) do nothing;

create or replace function public.app_access_owner()
returns uuid language sql stable security definer set search_path=public as $$
 select coalesce((select data_owner_id from public.app_user_access where user_id=auth.uid()),auth.uid())
$$;
create or replace function public.app_access_role()
returns text language sql stable security definer set search_path=public as $$
 select coalesce((select role from public.app_user_access where user_id=auth.uid()),'viewer')
$$;
create or replace function public.app_can_write()
returns boolean language sql stable security definer set search_path=public as $$
 select public.app_access_role() in ('administrator','document_manager')
$$;
create or replace function public.app_is_admin()
returns boolean language sql stable security definer set search_path=public as $$
 select public.app_access_role()='administrator'
$$;

create or replace function public.app_get_my_access()
returns table(role text,data_owner_id uuid) language sql stable security definer set search_path=public as $$
 select a.role,a.data_owner_id from public.app_user_access a where a.user_id=auth.uid()
$$;

create or replace function public.app_list_users()
returns table(id uuid,email text,role text,data_owner_id uuid) language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 return query select u.id,u.email::text,a.role,a.data_owner_id from public.app_user_access a join auth.users u on u.id=a.user_id where a.data_owner_id=public.app_access_owner() order by case a.role when 'administrator' then 1 when 'document_manager' then 2 else 3 end,u.email;
end$$;

create or replace function public.app_find_user_by_email(target_email text)
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare uid uuid;
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 select id into uid from auth.users where lower(email)=lower(trim(target_email)) limit 1; return uid;
end$$;

create or replace function public.app_set_user_role(target_email text,target_role text)
returns void language plpgsql security definer set search_path=public,auth as $$
declare uid uuid; owner uuid;
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 if target_role not in ('administrator','document_manager','viewer') then raise exception 'Invalid role'; end if;
 owner:=public.app_access_owner(); select id into uid from auth.users where lower(email)=lower(trim(target_email)) limit 1;
 if uid is null then raise exception 'User account belum tersedia. Coba lagi setelah proses sign-up selesai.'; end if;
 insert into public.app_user_access(user_id,data_owner_id,role) values(uid,owner,target_role)
 on conflict(user_id) do update set data_owner_id=excluded.data_owner_id,role=excluded.role,updated_at=now();
end$$;

create or replace function public.app_remove_user(target_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 if target_user_id=public.app_access_owner() then raise exception 'Workspace owner tidak dapat dinonaktifkan'; end if;
 if not exists(select 1 from public.app_user_access where user_id=target_user_id and data_owner_id=public.app_access_owner()) then raise exception 'User bukan anggota workspace ini'; end if;
 delete from public.app_user_access where user_id=target_user_id;
end$$;

revoke all on function public.app_get_my_access() from public; grant execute on function public.app_get_my_access() to authenticated;
revoke all on function public.app_list_users() from public; grant execute on function public.app_list_users() to authenticated;
revoke all on function public.app_find_user_by_email(text) from public; grant execute on function public.app_find_user_by_email(text) to authenticated;
revoke all on function public.app_set_user_role(text,text) from public; grant execute on function public.app_set_user_role(text,text) to authenticated;
revoke all on function public.app_remove_user(uuid) from public; grant execute on function public.app_remove_user(uuid) to authenticated;

-- app_user_access itself is not directly exposed; access goes through the RPCs above.
drop policy if exists app_user_access_select on public.app_user_access;
create policy app_user_access_select on public.app_user_access for select to authenticated using (user_id=auth.uid());

-- Replace old per-user RLS with workspace-aware role policies.
do $$
declare t text; pol record;
begin
 foreach t in array array['assets','land_titles','buildings','contracts','pbb_records','lease_land_titles','lease_buildings','lease_pbb','lease_facilities','pbb_land_titles','pbb_buildings'] loop
  -- Some installations do not contain every historical/relationship table.
  -- Skip missing tables instead of aborting the entire migration.
  if to_regclass(format('public.%I', t)) is null then
   raise notice 'Skipping missing table public.%', t;
   continue;
  end if;
  execute format('alter table public.%I enable row level security',t);
  for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy if exists %I on public.%I',pol.policyname,t); end loop;
  execute format('create policy %I on public.%I for select to authenticated using (user_id=public.app_access_owner())',t||'_workspace_select',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using (user_id=public.app_access_owner() and public.app_can_write()) with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_update',t);
  if t in ('lease_land_titles','lease_buildings','lease_pbb','lease_facilities','pbb_land_titles','pbb_buildings') then
   execute format('create policy %I on public.%I for delete to authenticated using (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_delete',t);
  else
   execute format('create policy %I on public.%I for delete to authenticated using (user_id=public.app_access_owner() and public.app_is_admin())',t||'_workspace_delete',t);
  end if;
 end loop;
end$$;


-- ============================================================
-- SOURCE: supabase_v1179_lease_relationship_tables_fix.sql
-- IMPORTANT: run the standalone migration file in Supabase SQL Editor.
-- ============================================================
-- v1.17.9 creates lease_* relationship tables used by app.js and workspace-aware RLS.

-- v1.19.27: human-friendly property alias
alter table public.assets add column if not exists alias text not null default '';
