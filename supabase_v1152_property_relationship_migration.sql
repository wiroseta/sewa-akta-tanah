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
