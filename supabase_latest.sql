-- PALM v1.21.53 RC — corrected User Management migration
-- Safe to run after the failed v1.21.52 attempt.
-- PostgreSQL cannot CREATE OR REPLACE a function when its OUT/RETURNS TABLE signature changes,
-- so the two RPCs whose return shape changed are dropped and recreated explicitly.

begin;

alter table public.app_user_access
  add column if not exists is_active boolean not null default true;

update public.app_user_access set is_active=true where is_active is null;

create or replace function public.app_access_owner()
returns uuid language sql stable security definer set search_path=public as $$
 select case
   when exists(select 1 from public.app_user_access where user_id=auth.uid())
     then (select data_owner_id from public.app_user_access where user_id=auth.uid() and is_active=true)
   else auth.uid()
 end
$$;

create or replace function public.app_access_role()
returns text language sql stable security definer set search_path=public as $$
 select coalesce((select role from public.app_user_access where user_id=auth.uid() and is_active=true),'viewer')
$$;

drop function if exists public.app_get_my_access();
create function public.app_get_my_access()
returns table(role text,data_owner_id uuid,is_active boolean) language sql stable security definer set search_path=public as $$
 select a.role,a.data_owner_id,a.is_active from public.app_user_access a where a.user_id=auth.uid()
$$;

drop function if exists public.app_list_users();
create function public.app_list_users()
returns table(id uuid,email text,role text,data_owner_id uuid,warning_email_enabled boolean,warning_email text,is_active boolean)
language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 return query
 select u.id,u.email::text,a.role,a.data_owner_id,
        coalesce(a.warning_email_enabled,false),a.warning_email,a.is_active
 from public.app_user_access a
 join auth.users u on u.id=a.user_id
 where a.data_owner_id=public.app_access_owner()
 order by case when a.user_id=public.app_access_owner() then 0 else 1 end,
          case a.role when 'administrator' then 1 when 'document_manager' then 2 else 3 end,u.email;
end$$;

create or replace function public.app_set_user_active(target_user_id uuid,target_active boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 if target_user_id=public.app_access_owner() and target_active=false then raise exception 'Workspace owner tidak dapat dinonaktifkan'; end if;
 if not exists(select 1 from public.app_user_access where user_id=target_user_id and data_owner_id=public.app_access_owner()) then raise exception 'User bukan anggota workspace ini'; end if;
 update public.app_user_access set is_active=target_active,updated_at=now() where user_id=target_user_id;
end$$;

create or replace function public.app_set_user_role_by_id(target_user_id uuid,target_role text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.app_is_admin() then raise exception 'Administrator only'; end if;
 if target_role not in ('administrator','document_manager','viewer') then raise exception 'Invalid role'; end if;
 if target_user_id=public.app_access_owner() then raise exception 'Role Workspace Owner tidak dapat diubah'; end if;
 if not exists(select 1 from public.app_user_access where user_id=target_user_id and data_owner_id=public.app_access_owner()) then raise exception 'User bukan anggota workspace ini'; end if;
 update public.app_user_access set role=target_role,updated_at=now() where user_id=target_user_id;
end$$;

-- Keep old API compatible, but deactivation now preserves the member row.
create or replace function public.app_remove_user(target_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 perform public.app_set_user_active(target_user_id,false);
end$$;

revoke all on function public.app_get_my_access() from public;
grant execute on function public.app_get_my_access() to authenticated;
revoke all on function public.app_list_users() from public;
grant execute on function public.app_list_users() to authenticated;

revoke all on function public.app_set_user_active(uuid,boolean) from public;
grant execute on function public.app_set_user_active(uuid,boolean) to authenticated;
revoke all on function public.app_set_user_role_by_id(uuid,text) from public;
grant execute on function public.app_set_user_role_by_id(uuid,text) to authenticated;

commit;
