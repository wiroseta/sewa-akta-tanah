-- Sewa & Akta Tanah v1.15
-- Menambahkan data terstruktur tanpa menghapus data v1.14.
alter table public.contracts add column if not exists land_documents jsonb not null default '[]'::jsonb;
alter table public.contracts add column if not exists pbb_records jsonb not null default '[]'::jsonb;
alter table public.contracts add column if not exists facilities jsonb not null default '[]'::jsonb;
