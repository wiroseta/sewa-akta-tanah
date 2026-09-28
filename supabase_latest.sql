-- v1.19.14: metadata pembayaran/pajak, ledger FIFO, dan perjanjian tambahan
alter table public.contracts add column if not exists payments_meta jsonb not null default '{}'::jsonb;
update public.contracts set payments_meta='{}'::jsonb where payments_meta is null;

-- Sewa & Akta Tanah — LATEST DATABASE UPDATE (v1.19.15)
-- Jalankan file ini untuk instalasi/update terbaru. Idempotent.
create table if not exists public.lease_documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 contract_id uuid not null references public.contracts(id) on delete cascade,
 asset_id uuid references public.assets(id) on delete set null,
 document_type text not null default 'akta_lama',
 label text not null default '',
 document_date date,
 deed_no text,
 drive_url text not null default '',
 extracted_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.lease_documents add column if not exists ai_status text not null default 'belum_dibaca';
alter table public.lease_documents add column if not exists ai_read_at timestamptz;
create index if not exists lease_documents_contract_idx on public.lease_documents(user_id,contract_id,document_date,created_at);
alter table public.lease_documents enable row level security;
drop policy if exists lease_documents_workspace_select on public.lease_documents;
drop policy if exists lease_documents_workspace_insert on public.lease_documents;
drop policy if exists lease_documents_workspace_update on public.lease_documents;
drop policy if exists lease_documents_workspace_delete on public.lease_documents;
create policy lease_documents_workspace_select on public.lease_documents for select to authenticated using (user_id=public.app_access_owner());
create policy lease_documents_workspace_insert on public.lease_documents for insert to authenticated with check (user_id=public.app_access_owner() and public.app_can_write());
create policy lease_documents_workspace_update on public.lease_documents for update to authenticated using (user_id=public.app_access_owner() and public.app_can_write()) with check (user_id=public.app_access_owner() and public.app_can_write());
create policy lease_documents_workspace_delete on public.lease_documents for delete to authenticated using (user_id=public.app_access_owner() and public.app_is_admin());
update public.lease_documents set ai_status='sudah_dibaca', ai_read_at=coalesce(ai_read_at,created_at)
where extracted_data is not null and extracted_data <> '{}'::jsonb;
notify pgrst, 'reload schema';
