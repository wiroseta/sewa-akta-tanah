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
