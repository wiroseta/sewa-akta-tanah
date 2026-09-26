-- Sewa & Akta Tanah v1.15.8
-- PBB tahunan: pisahkan PBB terutang vs jumlah yang harus dibayar, dan kontrol warning dashboard.
alter table public.pbb_records
  add column if not exists pbb_payable numeric,
  add column if not exists warning_ignored boolean not null default false,
  add column if not exists warning_ignore_reason text not null default '';
