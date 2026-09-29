-- Sewa & Akta Tanah v1.19.35 RC
-- Model cakupan PBB ↔ Sertifikat Tanah. Jalankan SEKALI di Supabase SQL Editor.

alter table public.pbb_land_titles
  add column if not exists coverage_type text not null default 'unknown',
  add column if not exists covered_area numeric,
  add column if not exists coverage_notes text not null default '';

-- Nilai yang dipakai aplikasi: unknown = belum diketahui, full = seluruh sertifikat, partial = sebagian.
-- Tidak dibuat constraint yang memaksa satu sertifikat hanya punya satu PBB; relasi many-to-many memang diperbolehkan.
create index if not exists pbb_land_titles_land_title_idx
  on public.pbb_land_titles (land_title_id);
