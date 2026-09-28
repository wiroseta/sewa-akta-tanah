-- Sewa & Akta Tanah v1.19.1 — Document History & AI Comparison
create table if not exists public.document_history (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 entity_type text not null check (entity_type in ('lease','land')),
 entity_id text not null,
 asset_id uuid references public.assets(id) on delete set null,
 event_type text not null default 'snapshot',
 label text not null default '',
 snapshot jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists document_history_entity_idx on public.document_history(user_id,entity_type,entity_id,created_at);
alter table public.document_history enable row level security;
drop policy if exists document_history_workspace_select on public.document_history;
drop policy if exists document_history_workspace_insert on public.document_history;
drop policy if exists document_history_workspace_update on public.document_history;
drop policy if exists document_history_workspace_delete on public.document_history;
create policy document_history_workspace_select on public.document_history for select to authenticated using (user_id=public.app_access_owner());
create policy document_history_workspace_insert on public.document_history for insert to authenticated with check (user_id=public.app_access_owner() and public.app_can_write());
create policy document_history_workspace_update on public.document_history for update to authenticated using (user_id=public.app_access_owner() and public.app_can_write()) with check (user_id=public.app_access_owner() and public.app_can_write());
create policy document_history_workspace_delete on public.document_history for delete to authenticated using (user_id=public.app_access_owner() and public.app_is_admin());
