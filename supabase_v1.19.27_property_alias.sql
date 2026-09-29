-- Run once in Supabase SQL Editor before using v1.19.27
alter table public.assets add column if not exists alias text not null default '';
