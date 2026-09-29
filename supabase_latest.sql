-- Sewa & Akta Tanah v1.19.34 RC
-- PBB Alias / Nama Properti per NOP. Jalankan SQL ini SEKALI di Supabase SQL Editor sebelum memakai v1.19.34.

alter table public.pbb_records
  add column if not exists property_alias text not null default '';

create index if not exists pbb_property_alias_idx
  on public.pbb_records (property_alias);
