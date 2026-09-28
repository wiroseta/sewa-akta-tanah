-- Sewa & Akta Tanah v1.17.1 — shared workspace + professional user roles
-- Run ONCE in Supabase > SQL Editor after backing up your database.

create table if not exists public.app_user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data_owner_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('administrator','document_manager','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.app_user_access enable row level security;

-- Bootstrap existing installations: every existing account starts as administrator of its own data.
-- This preserves all v1.16.x data exactly where it is.
insert into public.app_user_access(user_id,data_owner_id,role)
select id,id,'administrator' from auth.users
on conflict (user_id) do nothing;

create or replace function public.app_access_owner()
returns uuid language sql stable security definer set search_path=public as $$
 select coalesce((select data_owner_id from public.app_user_access where user_id=auth.uid()),auth.uid())
$$;
create or replace function public.app_access_role()
returns text language sql stable security definer set search_path=public as $$
 select coalesce((select role from public.app_user_access where user_id=auth.uid()),'viewer')
$$;
create or replace function public.app_can_write()
returns boolean language sql stable security definer set search_path=public as $$
 select public.app_access_role() in ('administrator','document_manager')
$$;
create or replace function public.app_is_admin()
returns boolean language sql stable security definer set search_path=public as $$
 select public.app_access_role()='administrator'
$$;

create or replace function public.app_get_my_access()
returns table(role text,data_owner_id uuid) language sql stable security definer set search_path=public as $$
 select a.role,a.data_owner_id from public.app_user_access a where a.user_id=auth.uid()
$$;

create or replace function public.app_list_users()
returns table(id uuid,email text,role text,data_owner_id uuid) language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 return query select u.id,u.email::text,a.role,a.data_owner_id from public.app_user_access a join auth.users u on u.id=a.user_id where a.data_owner_id=public.app_access_owner() order by case a.role when 'administrator' then 1 when 'document_manager' then 2 else 3 end,u.email;
end$$;

create or replace function public.app_find_user_by_email(target_email text)
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare uid uuid;
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 select id into uid from auth.users where lower(email)=lower(trim(target_email)) limit 1; return uid;
end$$;

create or replace function public.app_set_user_role(target_email text,target_role text)
returns void language plpgsql security definer set search_path=public,auth as $$
declare uid uuid; owner uuid;
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 if target_role not in ('administrator','document_manager','viewer') then raise exception 'Invalid role'; end if;
 owner:=public.app_access_owner(); select id into uid from auth.users where lower(email)=lower(trim(target_email)) limit 1;
 if uid is null then raise exception 'User account belum tersedia. Coba lagi setelah proses sign-up selesai.'; end if;
 insert into public.app_user_access(user_id,data_owner_id,role) values(uid,owner,target_role)
 on conflict(user_id) do update set data_owner_id=excluded.data_owner_id,role=excluded.role,updated_at=now();
end$$;

create or replace function public.app_remove_user(target_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 if target_user_id=public.app_access_owner() then raise exception 'Workspace owner tidak dapat dinonaktifkan'; end if;
 if not exists(select 1 from public.app_user_access where user_id=target_user_id and data_owner_id=public.app_access_owner()) then raise exception 'User bukan anggota workspace ini'; end if;
 delete from public.app_user_access where user_id=target_user_id;
end$$;

revoke all on function public.app_get_my_access() from public; grant execute on function public.app_get_my_access() to authenticated;
revoke all on function public.app_list_users() from public; grant execute on function public.app_list_users() to authenticated;
revoke all on function public.app_find_user_by_email(text) from public; grant execute on function public.app_find_user_by_email(text) to authenticated;
revoke all on function public.app_set_user_role(text,text) from public; grant execute on function public.app_set_user_role(text,text) to authenticated;
revoke all on function public.app_remove_user(uuid) from public; grant execute on function public.app_remove_user(uuid) to authenticated;

-- app_user_access itself is not directly exposed; access goes through the RPCs above.
drop policy if exists app_user_access_select on public.app_user_access;
create policy app_user_access_select on public.app_user_access for select to authenticated using (user_id=auth.uid());

-- Replace old per-user RLS with workspace-aware role policies.
do $$
declare t text; pol record;
begin
 foreach t in array array['assets','land_titles','buildings','contracts','pbb_records','lease_land_titles','lease_buildings','lease_pbb','lease_facilities','pbb_land_titles','pbb_buildings'] loop
  -- Some installations do not contain every historical/relationship table.
  -- Skip missing tables instead of aborting the entire migration.
  if to_regclass(format('public.%I', t)) is null then
   raise notice 'Skipping missing table public.%', t;
   continue;
  end if;
  execute format('alter table public.%I enable row level security',t);
  for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy if exists %I on public.%I',pol.policyname,t); end loop;
  execute format('create policy %I on public.%I for select to authenticated using (user_id=public.app_access_owner())',t||'_workspace_select',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using (user_id=public.app_access_owner() and public.app_can_write()) with check (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_update',t);
  if t in ('lease_land_titles','lease_buildings','lease_pbb','lease_facilities','pbb_land_titles','pbb_buildings') then
   execute format('create policy %I on public.%I for delete to authenticated using (user_id=public.app_access_owner() and public.app_can_write())',t||'_workspace_delete',t);
  else
   execute format('create policy %I on public.%I for delete to authenticated using (user_id=public.app_access_owner() and public.app_is_admin())',t||'_workspace_delete',t);
  end if;
 end loop;
end$$;
