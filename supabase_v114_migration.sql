-- v1.14: simpan link lokasi aset/sewa dari Google Maps.
-- Jalankan sekali di Supabase > SQL Editor > New query > Run.
alter table public.contracts
  add column if not exists google_maps_url text not null default '';
