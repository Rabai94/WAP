create extension if not exists pgcrypto with schema extensions;

create table if not exists public.worker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  city text,
  postal_code text,
  location_id uuid not null references public.locations(id) on delete restrict,
  phone text,
  preferred_language text not null default 'de',
  occupation_id uuid not null references public.occupations(id) on delete restrict,
  experience_years integer not null default 0,
  availability_status text not null default 'available',
  work_authorization_status text not null default 'unknown',
  profile_status text not null default 'active',
  professional_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint worker_profiles_experience_years_check check (experience_years >= 0),
  constraint worker_profiles_preferred_language_check check (
    preferred_language in ('ro', 'de', 'en')
  ),
  constraint worker_profiles_availability_status_check check (
    availability_status in ('available', 'soon', 'employed', 'unavailable')
  ),
  constraint worker_profiles_work_authorization_status_check check (
    work_authorization_status in ('eu_citizen', 'work_permit', 'needs_permit', 'unknown')
  ),
  constraint worker_profiles_profile_status_check check (
    profile_status in ('active', 'inactive', 'suspended')
  )
);

create unique index if not exists worker_profiles_user_id_unique
on public.worker_profiles (user_id);

create index if not exists worker_profiles_location_id_idx
on public.worker_profiles (location_id);

create index if not exists worker_profiles_occupation_id_idx
on public.worker_profiles (occupation_id);

create index if not exists worker_profiles_profile_status_idx
on public.worker_profiles (profile_status);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_profile_id uuid not null references public.worker_profiles(id) on delete cascade,
  applicant_user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status text not null default 'submitted',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_applications_status_check check (
    status in ('submitted', 'viewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
  )
);

create unique index if not exists job_applications_job_worker_unique
on public.job_applications (job_id, worker_profile_id);

create index if not exists job_applications_job_id_idx
on public.job_applications (job_id);

create index if not exists job_applications_worker_profile_id_idx
on public.job_applications (worker_profile_id);

create index if not exists job_applications_applicant_user_id_idx
on public.job_applications (applicant_user_id);

create index if not exists job_applications_status_idx
on public.job_applications (status);

create index if not exists job_applications_created_at_idx
on public.job_applications (created_at desc);

create or replace function public.set_worker_apply_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists worker_profiles_set_updated_at on public.worker_profiles;

create trigger worker_profiles_set_updated_at
before update on public.worker_profiles
for each row
execute function public.set_worker_apply_updated_at();

drop trigger if exists job_applications_set_updated_at on public.job_applications;

create trigger job_applications_set_updated_at
before update on public.job_applications
for each row
execute function public.set_worker_apply_updated_at();

alter table public.worker_profiles enable row level security;
alter table public.job_applications enable row level security;

drop policy if exists worker_profiles_select_own on public.worker_profiles;
drop policy if exists worker_profiles_insert_own on public.worker_profiles;
drop policy if exists worker_profiles_update_own on public.worker_profiles;

create policy worker_profiles_select_own
on public.worker_profiles
for select
to authenticated
using (user_id = (select auth.uid()));

create policy worker_profiles_insert_own
on public.worker_profiles
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy worker_profiles_update_own
on public.worker_profiles
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists job_applications_worker_select_own on public.job_applications;
drop policy if exists job_applications_company_select_own_jobs on public.job_applications;
drop policy if exists job_applications_worker_insert_own on public.job_applications;
drop policy if exists job_applications_worker_update_withdraw on public.job_applications;
drop policy if exists job_applications_company_update_own_jobs on public.job_applications;

create policy job_applications_worker_select_own
on public.job_applications
for select
to authenticated
using (applicant_user_id = (select auth.uid()));

create policy job_applications_company_select_own_jobs
on public.job_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.jobs
    join public.companies on companies.id = jobs.company_id
    where jobs.id = job_applications.job_id
      and companies.owner_user_id = (select auth.uid())
  )
);

create policy job_applications_worker_insert_own
on public.job_applications
for insert
to authenticated
with check (
  applicant_user_id = (select auth.uid())
  and exists (
    select 1
    from public.worker_profiles
    where worker_profiles.id = job_applications.worker_profile_id
      and worker_profiles.user_id = (select auth.uid())
  )
);

create policy job_applications_worker_update_withdraw
on public.job_applications
for update
to authenticated
using (applicant_user_id = (select auth.uid()))
with check (
  applicant_user_id = (select auth.uid())
  and status = 'withdrawn'
);

create policy job_applications_company_update_own_jobs
on public.job_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.jobs
    join public.companies on companies.id = jobs.company_id
    where jobs.id = job_applications.job_id
      and companies.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.jobs
    join public.companies on companies.id = jobs.company_id
    where jobs.id = job_applications.job_id
      and companies.owner_user_id = (select auth.uid())
  )
);

revoke all on public.worker_profiles from anon, authenticated;
revoke all on public.job_applications from anon, authenticated;

grant select on public.worker_profiles to authenticated;
grant insert (
  first_name,
  last_name,
  city,
  postal_code,
  location_id,
  phone,
  preferred_language,
  occupation_id,
  experience_years,
  availability_status,
  work_authorization_status,
  professional_summary
) on public.worker_profiles to authenticated;
grant update (
  first_name,
  last_name,
  city,
  postal_code,
  location_id,
  phone,
  preferred_language,
  occupation_id,
  experience_years,
  availability_status,
  work_authorization_status,
  professional_summary,
  profile_status
) on public.worker_profiles to authenticated;

grant select on public.job_applications to authenticated;
grant insert (
  job_id,
  worker_profile_id,
  applicant_user_id,
  message
) on public.job_applications to authenticated;
grant update (status) on public.job_applications to authenticated;

create or replace function public.upsert_own_worker_profile(
  p_first_name text,
  p_last_name text,
  p_location_id uuid,
  p_occupation_id uuid,
  p_phone text default null,
  p_preferred_language text default 'de',
  p_experience_years integer default 0,
  p_availability_status text default 'available',
  p_work_authorization_status text default 'unknown',
  p_professional_summary text default null
)
returns public.worker_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  location_row public.locations;
  worker_row public.worker_profiles;
  cleaned_phone text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required to save a worker profile.'
      using errcode = '28000';
  end if;

  if nullif(trim(p_first_name), '') is null then
    raise exception 'First name is required.'
      using errcode = '22023';
  end if;

  if nullif(trim(p_last_name), '') is null then
    raise exception 'Last name is required.'
      using errcode = '22023';
  end if;

  if coalesce(p_experience_years, 0) < 0 then
    raise exception 'experience_years must be greater than or equal to 0.'
      using errcode = '22023';
  end if;

  cleaned_phone := nullif(trim(coalesce(p_phone, '')), '');

  if cleaned_phone is not null
    and cleaned_phone !~ '^[+0-9 ()-]{7,32}$'
  then
    raise exception 'Phone number is not valid.'
      using errcode = '22023';
  end if;

  select *
  into location_row
  from public.locations
  where locations.id = p_location_id
    and locations.is_active
  limit 1;

  if location_row.id is null then
    raise exception 'Selected location is not active.'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.occupations
    where occupations.id = p_occupation_id
      and occupations.is_active
  ) then
    raise exception 'Selected occupation is not active.'
      using errcode = '23503';
  end if;

  insert into public.worker_profiles (
    user_id,
    first_name,
    last_name,
    city,
    postal_code,
    location_id,
    phone,
    preferred_language,
    occupation_id,
    experience_years,
    availability_status,
    work_authorization_status,
    profile_status,
    professional_summary
  )
  values (
    current_user_id,
    trim(p_first_name),
    trim(p_last_name),
    location_row.city,
    location_row.postal_code,
    p_location_id,
    cleaned_phone,
    coalesce(nullif(trim(p_preferred_language), ''), 'de'),
    p_occupation_id,
    coalesce(p_experience_years, 0),
    coalesce(nullif(trim(p_availability_status), ''), 'available'),
    coalesce(nullif(trim(p_work_authorization_status), ''), 'unknown'),
    'active',
    nullif(trim(coalesce(p_professional_summary, '')), '')
  )
  on conflict (user_id) do update
  set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    city = excluded.city,
    postal_code = excluded.postal_code,
    location_id = excluded.location_id,
    phone = excluded.phone,
    preferred_language = excluded.preferred_language,
    occupation_id = excluded.occupation_id,
    experience_years = excluded.experience_years,
    availability_status = excluded.availability_status,
    work_authorization_status = excluded.work_authorization_status,
    profile_status = case
      when public.worker_profiles.profile_status = 'suspended' then public.worker_profiles.profile_status
      else 'active'
    end,
    professional_summary = excluded.professional_summary,
    updated_at = now()
  returning * into worker_row;

  update public.profiles
  set
    full_name = worker_row.first_name || ' ' || worker_row.last_name,
    phone = worker_row.phone
  where profiles.id = current_user_id;

  return worker_row;
end;
$$;

create or replace function public.get_job_details(p_job_id uuid)
returns table (
  job_id uuid,
  title text,
  description text,
  company_id uuid,
  company_name text,
  location_id uuid,
  location_label text,
  city text,
  postal_code text,
  state text,
  salary_from numeric,
  salary_to numeric,
  salary_type text,
  employment_type text,
  experience_level text,
  working_hours text,
  language text,
  occupation_id uuid,
  occupation_slug text,
  occupation_name_ro text,
  occupation_name_de text,
  occupation_name_en text,
  category_id uuid,
  category_slug text,
  category_name_ro text,
  category_name_de text,
  category_name_en text,
  published_at timestamptz,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    jobs.id as job_id,
    jobs.title,
    jobs.description,
    companies.id as company_id,
    companies.name as company_name,
    locations.id as location_id,
    locations.postal_code || ' ' || locations.city ||
      coalesce('-' || locations.district, '') || ', ' || locations.state
      as location_label,
    locations.city,
    locations.postal_code,
    locations.state,
    jobs.salary_from,
    jobs.salary_to,
    jobs.salary_type,
    jobs.employment_type,
    jobs.experience_level,
    jobs.working_hours,
    jobs.language,
    occupations.id as occupation_id,
    occupations.slug as occupation_slug,
    occupations.name_ro as occupation_name_ro,
    occupations.name_de as occupation_name_de,
    occupations.name_en as occupation_name_en,
    job_categories.id as category_id,
    job_categories.slug as category_slug,
    job_categories.name_ro as category_name_ro,
    job_categories.name_de as category_name_de,
    job_categories.name_en as category_name_en,
    jobs.created_at as published_at,
    jobs.expires_at
  from public.jobs
  join public.companies on companies.id = jobs.company_id
  join public.locations on locations.id = jobs.location_id
  join public.occupations on occupations.id = jobs.occupation_id
  join public.job_categories on job_categories.id = jobs.category_id
  where jobs.id = p_job_id
    and jobs.status = 'published'
    and (jobs.expires_at is null or jobs.expires_at > now())
    and companies.status = 'active'
    and companies.verification_status = 'verified'
    and locations.is_active
    and occupations.is_active
    and job_categories.is_active
  limit 1;
$$;

create or replace function public.apply_to_job(
  p_job_id uuid,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  worker_row public.worker_profiles;
  created_application_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required to apply to a job.'
      using errcode = '28000';
  end if;

  select *
  into worker_row
  from public.worker_profiles
  where worker_profiles.user_id = current_user_id
    and worker_profiles.profile_status = 'active'
  limit 1;

  if worker_row.id is null then
    raise exception 'An active worker profile is required before applying.'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.jobs
    join public.companies on companies.id = jobs.company_id
    where jobs.id = p_job_id
      and jobs.status = 'published'
      and (jobs.expires_at is null or jobs.expires_at > now())
      and companies.status = 'active'
      and companies.verification_status = 'verified'
  ) then
    raise exception 'This job is not available for applications.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.job_applications
    where job_applications.job_id = p_job_id
      and job_applications.worker_profile_id = worker_row.id
  ) then
    raise exception 'You have already applied to this job.'
      using errcode = '23505';
  end if;

  insert into public.job_applications (
    job_id,
    worker_profile_id,
    applicant_user_id,
    status,
    message
  )
  values (
    p_job_id,
    worker_row.id,
    current_user_id,
    'submitted',
    nullif(trim(coalesce(p_message, '')), '')
  )
  returning id into created_application_id;

  return created_application_id;
end;
$$;

create or replace function public.withdraw_application(p_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  changed_application_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required to withdraw an application.'
      using errcode = '28000';
  end if;

  update public.job_applications
  set status = 'withdrawn'
  where job_applications.id = p_application_id
    and job_applications.applicant_user_id = current_user_id
  returning id into changed_application_id;

  if changed_application_id is null then
    raise exception 'Application not found for the current worker.'
      using errcode = 'P0001';
  end if;

  return changed_application_id;
end;
$$;

create or replace function public.update_application_status(
  p_application_id uuid,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  changed_application_id uuid;
  normalized_status text;
begin
  current_user_id := auth.uid();
  normalized_status := nullif(trim(coalesce(p_status, '')), '');

  if current_user_id is null then
    raise exception 'Authentication is required to update an application.'
      using errcode = '28000';
  end if;

  if normalized_status not in ('viewed', 'shortlisted', 'accepted', 'rejected') then
    raise exception 'Unsupported application status.'
      using errcode = '22023';
  end if;

  update public.job_applications
  set status = normalized_status
  from public.jobs
  join public.companies on companies.id = jobs.company_id
  where job_applications.id = p_application_id
    and jobs.id = job_applications.job_id
    and companies.owner_user_id = current_user_id
    and job_applications.status <> 'withdrawn'
  returning job_applications.id into changed_application_id;

  if changed_application_id is null then
    raise exception 'Application not found for the current company.'
      using errcode = 'P0001';
  end if;

  return changed_application_id;
end;
$$;

create or replace function public.list_worker_applications()
returns table (
  application_id uuid,
  job_id uuid,
  job_title text,
  company_name text,
  location_label text,
  city text,
  status text,
  message text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    job_applications.id as application_id,
    jobs.id as job_id,
    jobs.title as job_title,
    companies.name as company_name,
    locations.postal_code || ' ' || locations.city ||
      coalesce('-' || locations.district, '') || ', ' || locations.state
      as location_label,
    locations.city,
    job_applications.status,
    job_applications.message,
    job_applications.created_at,
    job_applications.updated_at
  from public.job_applications
  join public.jobs on jobs.id = job_applications.job_id
  join public.companies on companies.id = jobs.company_id
  join public.locations on locations.id = jobs.location_id
  where job_applications.applicant_user_id = auth.uid()
  order by job_applications.created_at desc;
$$;

create or replace function public.list_company_applications()
returns table (
  application_id uuid,
  job_id uuid,
  job_title text,
  worker_profile_id uuid,
  worker_name text,
  worker_city text,
  worker_location_label text,
  occupation_name_ro text,
  occupation_name_de text,
  occupation_name_en text,
  experience_years integer,
  status text,
  message text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    job_applications.id as application_id,
    jobs.id as job_id,
    jobs.title as job_title,
    worker_profiles.id as worker_profile_id,
    worker_profiles.first_name || ' ' || worker_profiles.last_name as worker_name,
    worker_locations.city as worker_city,
    worker_locations.postal_code || ' ' || worker_locations.city ||
      coalesce('-' || worker_locations.district, '') || ', ' || worker_locations.state
      as worker_location_label,
    occupations.name_ro as occupation_name_ro,
    occupations.name_de as occupation_name_de,
    occupations.name_en as occupation_name_en,
    worker_profiles.experience_years,
    job_applications.status,
    job_applications.message,
    job_applications.created_at,
    job_applications.updated_at
  from public.job_applications
  join public.jobs on jobs.id = job_applications.job_id
  join public.companies on companies.id = jobs.company_id
  join public.worker_profiles on worker_profiles.id = job_applications.worker_profile_id
  join public.locations worker_locations on worker_locations.id = worker_profiles.location_id
  join public.occupations on occupations.id = worker_profiles.occupation_id
  where companies.owner_user_id = auth.uid()
  order by jobs.created_at desc, job_applications.created_at desc;
$$;

comment on table public.worker_profiles is
  'Worker onboarding profile owned by auth.uid(); one profile per user in v1.';

comment on table public.job_applications is
  'Applications from worker profiles to published jobs. Workers and company owners see only their own side of the flow.';

comment on function public.upsert_own_worker_profile(
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  integer,
  text,
  text,
  text
) is
  'Creates or updates the worker profile owned by auth.uid(). Browser clients never supply user_id.';

comment on function public.apply_to_job(uuid, text) is
  'Creates one submitted application for the current worker if the target job is active, published and visible.';

grant execute on function public.upsert_own_worker_profile(
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  integer,
  text,
  text,
  text
) to authenticated;

grant execute on function public.get_job_details(uuid) to anon, authenticated;
grant execute on function public.apply_to_job(uuid, text) to authenticated;
grant execute on function public.withdraw_application(uuid) to authenticated;
grant execute on function public.list_worker_applications() to authenticated;
grant execute on function public.list_company_applications() to authenticated;
grant execute on function public.update_application_status(uuid, text) to authenticated;
