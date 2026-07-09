do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'profile_role'
  ) then
    create type public.profile_role as enum (
      'worker',
      'business',
      'student',
      'freelancer'
    );
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.profile_role not null default 'worker'::public.profile_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.normalize_profile_role(role_value text)
returns public.profile_role
language sql
stable
as $$
  select case role_value
    when 'business' then 'business'::public.profile_role
    when 'student' then 'student'::public.profile_role
    when 'freelancer' then 'freelancer'::public.profile_role
    else 'worker'::public.profile_role
  end;
$$;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    public.normalize_profile_role(new.raw_user_meta_data ->> 'role')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_auth_user_profile();

drop trigger if exists on_auth_user_updated_profile on auth.users;

create trigger on_auth_user_updated_profile
after update of email, raw_user_meta_data on auth.users
for each row
execute function public.handle_auth_user_profile();

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant usage on type public.profile_role to authenticated;
grant select on public.profiles to authenticated;
grant insert (id, email, full_name, phone, role) on public.profiles to authenticated;
grant update (email, full_name, phone) on public.profiles to authenticated;
