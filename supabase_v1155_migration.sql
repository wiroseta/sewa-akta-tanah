-- Sewa & Akta Tanah v1.15.5
-- Luas disimpan per dokumen; tidak saling menimpa.
alter table public.contracts add column if not exists lease_land_area numeric, add column if not exists lease_building_area numeric;
alter table public.land_titles add column if not exists holder_name text not null default '', add column if not exists survey_no text not null default '', add column if not exists survey_date date;
alter table public.pbb_records add column if not exists taxpayer_name text not null default '', add column if not exists object_address text not null default '';
