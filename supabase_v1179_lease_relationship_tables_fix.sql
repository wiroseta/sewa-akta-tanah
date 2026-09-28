-- Sewa & Akta Tanah v1.17.9 RC
-- Fix: tabel relasi yang dipakai app.js v1.17.x belum dibuat oleh schema lama.
-- Aman dijalankan berulang (idempotent). Data relasi lama ikut disalin.

create table if not exists public.lease_land_titles (
  contract_id uuid not null references public.contracts(id) on delete cascade,
  land_title_id uuid not null references public.land_titles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  notes text not null default '',
  primary key(contract_id,land_title_id)
);

create table if not exists public.lease_buildings (
  contract_id uuid not null references public.contracts(id) on delete cascade,
  building_id uuid not null references public.buildings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  notes text not null default '',
  primary key(contract_id,building_id)
);

create table if not exists public.lease_pbb (
  contract_id uuid not null references public.contracts(id) on delete cascade,
  pbb_id uuid not null references public.pbb_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key(contract_id,pbb_id)
);

create table if not exists public.lease_facilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete cascade,
  facility_type text not null default '',
  provider text not null default '',
  customer_id text not null default '',
  meter_no text not null default '',
  phone text not null default '',
  registered_name text not null default '',
  plan_power text not null default '',
  drive_url text not null default '',
  google_maps_url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- Salin relasi dari nama tabel versi lama bila tabelnya tersedia.
do $$
begin
  if to_regclass('public.contract_land_titles') is not null then
    insert into public.lease_land_titles(contract_id,land_title_id,user_id,notes)
    select contract_id,land_title_id,user_id,coalesce(notes,'') from public.contract_land_titles
    on conflict (contract_id,land_title_id) do nothing;
  end if;
  if to_regclass('public.contract_buildings') is not null then
    insert into public.lease_buildings(contract_id,building_id,user_id,notes)
    select contract_id,building_id,user_id,coalesce(notes,'') from public.contract_buildings
    on conflict (contract_id,building_id) do nothing;
  end if;
  if to_regclass('public.contract_pbb') is not null then
    insert into public.lease_pbb(contract_id,pbb_id,user_id)
    select contract_id,pbb_id,user_id from public.contract_pbb
    on conflict (contract_id,pbb_id) do nothing;
  end if;
  if to_regclass('public.facilities') is not null then
    insert into public.lease_facilities(user_id,contract_id,facility_type,provider,customer_id,meter_no,phone,registered_name,plan_power,drive_url,google_maps_url,notes,created_at)
    select user_id,contract_id,coalesce(type,''),coalesce(provider,''),coalesce(customer_id,''),coalesce(meter_no,''),coalesce(phone,''),coalesce(registered_name,''),coalesce(plan,''),coalesce(drive_url,''),coalesce(google_maps_url,''),coalesce(notes,''),coalesce(created_at,now())
    from public.facilities f
    where not exists (
      select 1 from public.lease_facilities n
      where n.contract_id=f.contract_id and n.user_id=f.user_id
        and n.facility_type=coalesce(f.type,'') and n.provider=coalesce(f.provider,'')
        and n.customer_id=coalesce(f.customer_id,'') and n.meter_no=coalesce(f.meter_no,'')
    );
  end if;
end $$;

create index if not exists lease_land_titles_contract_idx on public.lease_land_titles(contract_id);
create index if not exists lease_buildings_contract_idx on public.lease_buildings(contract_id);
create index if not exists lease_pbb_contract_idx on public.lease_pbb(contract_id);
create index if not exists lease_facilities_contract_idx on public.lease_facilities(contract_id);

alter table public.lease_land_titles enable row level security;
alter table public.lease_buildings enable row level security;
alter table public.lease_pbb enable row level security;
alter table public.lease_facilities enable row level security;

do $$
declare t text; pol record;
begin
 foreach t in array array['lease_land_titles','lease_buildings','lease_pbb','lease_facilities'] loop
  for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
    execute format('drop policy if exists %I on public.%I',pol.policyname,t);
  end loop;
  execute format('create policy %I on public.%I for select to authenticated using (user_id=public.app_access_owner())',t||'_workspace_select',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using (user_id=public.app_access_owner() and public.app_can_write()) with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_update',t);
  execute format('create policy %I on public.%I for delete to authenticated using (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_delete',t);
 end loop;
end $$;

-- Minta PostgREST memuat ulang schema setelah tabel baru dibuat.
notify pgrst, 'reload schema';
