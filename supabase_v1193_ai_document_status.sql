-- Sewa & Akta Tanah v1.19.3 — AI read status for historical lease documents
alter table public.lease_documents add column if not exists ai_status text not null default 'belum_dibaca';
alter table public.lease_documents add column if not exists ai_read_at timestamptz;

-- Existing historical documents with saved AI extraction are already AI-read.
update public.lease_documents
set ai_status='sudah_dibaca',
    ai_read_at=coalesce(ai_read_at, created_at)
where extracted_data is not null
  and extracted_data <> '{}'::jsonb;

-- Keep status values predictable.
alter table public.lease_documents drop constraint if exists lease_documents_ai_status_check;
alter table public.lease_documents add constraint lease_documents_ai_status_check check (ai_status in ('belum_dibaca','sudah_dibaca'));
