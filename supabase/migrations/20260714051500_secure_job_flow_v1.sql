drop policy if exists companies_select_own on public.companies;
drop policy if exists companies_insert_own on public.companies;
drop policy if exists companies_update_own on public.companies;
drop policy if exists jobs_select_own on public.jobs;
drop policy if exists jobs_insert_own on public.jobs;
drop policy if exists jobs_update_own on public.jobs;

create policy companies_select_own
on public.companies
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy companies_insert_own
on public.companies
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy companies_update_own
on public.companies
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy jobs_select_own
on public.jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.profile_id = (select auth.uid())
  )
);

create policy jobs_insert_own
on public.jobs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.profile_id = (select auth.uid())
  )
);

create policy jobs_update_own
on public.jobs
for update
to authenticated
using (
  exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.profile_id = (select auth.uid())
  )
);

grant insert (profile_id, name, status) on public.companies to authenticated;
grant update (name, status) on public.companies to authenticated;
grant insert (
  company_id,
  title,
  description,
  category_id,
  occupation_id,
  location_id,
  salary_from,
  salary_to,
  salary_type,
  employment_type,
  experience_level,
  working_hours,
  language,
  expires_at,
  status
) on public.jobs to authenticated;
grant update (
  title,
  description,
  category_id,
  occupation_id,
  location_id,
  salary_from,
  salary_to,
  salary_type,
  employment_type,
  experience_level,
  working_hours,
  language,
  expires_at,
  status
) on public.jobs to authenticated;

create or replace function public.publish_job(
  p_title text,
  p_description text,
  p_category_id uuid,
  p_occupation_id uuid,
  p_location_id uuid,
  p_salary_from numeric default null,
  p_salary_to numeric default null,
  p_salary_type text default 'monthly',
  p_employment_type text default 'full_time',
  p_experience_level text default 'entry',
  p_working_hours text default null,
  p_language text default 'de',
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_company_id uuid;
  created_job_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to publish a job.'
      using errcode = '28000';
  end if;

  select companies.id
  into current_company_id
  from public.companies
  where companies.profile_id = auth.uid()
    and companies.status in ('verified', 'active')
  order by companies.created_at asc
  limit 1;

  if current_company_id is null then
    raise exception 'No active company profile is linked to the current user.'
      using errcode = 'P0001';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'Job title is required.'
      using errcode = '22023';
  end if;

  if nullif(trim(p_description), '') is null then
    raise exception 'Job description is required.'
      using errcode = '22023';
  end if;

  if p_salary_from is not null and p_salary_to is not null and p_salary_from > p_salary_to then
    raise exception 'salary_from cannot be greater than salary_to.'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.occupations
    where occupations.id = p_occupation_id
      and occupations.category_id = p_category_id
      and occupations.is_active
  ) then
    raise exception 'Selected occupation does not belong to the selected category.'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.job_categories
    where job_categories.id = p_category_id
      and job_categories.is_active
  ) then
    raise exception 'Selected job category is not active.'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.locations
    where locations.id = p_location_id
      and locations.is_active
  ) then
    raise exception 'Selected location is not active.'
      using errcode = '23503';
  end if;

  insert into public.jobs (
    company_id,
    title,
    description,
    category_id,
    occupation_id,
    location_id,
    salary_from,
    salary_to,
    salary_type,
    employment_type,
    experience_level,
    working_hours,
    language,
    expires_at,
    status
  )
  values (
    current_company_id,
    trim(p_title),
    trim(p_description),
    p_category_id,
    p_occupation_id,
    p_location_id,
    p_salary_from,
    p_salary_to,
    p_salary_type,
    p_employment_type,
    p_experience_level,
    nullif(trim(coalesce(p_working_hours, '')), ''),
    p_language,
    p_expires_at,
    'published'
  )
  returning id into created_job_id;

  return created_job_id;
end;
$$;

comment on function public.publish_job(
  text,
  text,
  uuid,
  uuid,
  uuid,
  numeric,
  numeric,
  text,
  text,
  text,
  text,
  text,
  timestamptz
) is
  'Publishes a job for the active company owned by auth.uid(). The client never supplies company_id.';

grant execute on function public.publish_job(
  text,
  text,
  uuid,
  uuid,
  uuid,
  numeric,
  numeric,
  text,
  text,
  text,
  text,
  text,
  timestamptz
) to authenticated;
