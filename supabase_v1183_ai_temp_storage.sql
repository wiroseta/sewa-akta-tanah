-- v1.18.3: private temporary storage for AI files larger than 18 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ai-temp','ai-temp',false,47185920,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=47185920,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "ai-temp insert own" on storage.objects;
drop policy if exists "ai-temp select own" on storage.objects;
drop policy if exists "ai-temp delete own" on storage.objects;
create policy "ai-temp insert own" on storage.objects for insert to authenticated with check (bucket_id='ai-temp' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "ai-temp select own" on storage.objects for select to authenticated using (bucket_id='ai-temp' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "ai-temp delete own" on storage.objects for delete to authenticated using (bucket_id='ai-temp' and (storage.foldername(name))[1]=auth.uid()::text);
