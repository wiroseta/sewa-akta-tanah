-- PALM v1.20.42 RC — Property <-> Sertifikat many-to-many
-- Jalankan sekali di Supabase SQL Editor sebelum memakai fitur Hubungkan Sertifikat.

create table if not exists public.asset_land_titles (
  asset_id uuid not null references public.assets(id) on delete cascade,
  land_title_id uuid not null references public.land_titles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  covered_area numeric,
  notes text not null default '',
  created_at timestamptz not null default now(),
  primary key (asset_id, land_title_id)
);

insert into public.asset_land_titles (asset_id,land_title_id,user_id)
select lt.asset_id,lt.id,lt.user_id from public.land_titles lt
where lt.asset_id is not null
on conflict (asset_id,land_title_id) do nothing;

alter table public.asset_land_titles enable row level security;
drop policy if exists asset_land_titles_owner_all on public.asset_land_titles;
create policy asset_land_titles_owner_all on public.asset_land_titles
for all using (user_id=auth.uid()) with check (user_id=auth.uid());

create index if not exists asset_land_titles_land_idx on public.asset_land_titles(land_title_id);
create index if not exists asset_land_titles_asset_idx on public.asset_land_titles(asset_id);
