-- Credential Wallet foreign keys and RPCs assume every auth user has a
-- matching public profile. The auth trigger covers future writes; this
-- backfill closes the historical gap without changing existing profiles.
insert into public.profiles (
  id,
  email,
  full_name,
  phone,
  role
)
select
  auth_users.id,
  auth_users.email,
  nullif(auth_users.raw_user_meta_data ->> 'full_name', ''),
  nullif(auth_users.raw_user_meta_data ->> 'phone', ''),
  public.normalize_profile_role(auth_users.raw_user_meta_data ->> 'role')
from auth.users as auth_users
where not exists (
  select 1
  from public.profiles
  where profiles.id = auth_users.id
)
on conflict (id) do nothing;

-- Treat complete profile coverage as a preflight condition for every later
-- Credential Wallet hardening migration.
do $$
begin
  if exists (
    select 1
    from auth.users as auth_users
    left join public.profiles
      on profiles.id = auth_users.id
    where profiles.id is null
  ) then
    raise exception
      'Credential Wallet preflight failed: auth users without public profiles remain.'
      using errcode = '23503';
  end if;
end;
$$;
