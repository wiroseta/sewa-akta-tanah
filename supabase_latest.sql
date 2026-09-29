-- Sewa & Akta Tanah v1.19.47
-- Jalankan SEKALI di Supabase SQL Editor sebelum memakai fitur "Hubungkan PBB".
-- Menambah relasi langsung PBB -> Master Properti. Akta Sewa sudah memiliki contracts.asset_id.

alter table public.pbb_records
  add column if not exists asset_id uuid references public.assets(id) on delete set null;

create index if not exists pbb_records_asset_id_idx on public.pbb_records(asset_id);
