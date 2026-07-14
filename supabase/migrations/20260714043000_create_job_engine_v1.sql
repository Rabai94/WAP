create extension if not exists pgcrypto with schema extensions;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_status_check check (
    status in ('draft', 'pending', 'verified', 'active', 'suspended', 'archived')
  )
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  category_id uuid not null references public.job_categories(id) on delete restrict,
  occupation_id uuid not null references public.occupations(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  salary_from numeric(12, 2),
  salary_to numeric(12, 2),
  salary_type text not null default 'monthly',
  employment_type text not null default 'full_time',
  experience_level text not null default 'entry',
  working_hours text,
  language text not null default 'de',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'draft',
  constraint jobs_salary_from_check check (salary_from is null or salary_from >= 0),
  constraint jobs_salary_to_check check (salary_to is null or salary_to >= 0),
  constraint jobs_salary_range_check check (
    salary_from is null
    or salary_to is null
    or salary_to >= salary_from
  ),
  constraint jobs_salary_type_check check (
    salary_type in ('hourly', 'daily', 'weekly', 'monthly', 'yearly', 'fixed')
  ),
  constraint jobs_employment_type_check check (
    employment_type in (
      'full_time',
      'part_time',
      'mini_job',
      'temporary',
      'contract',
      'internship',
      'freelance'
    )
  ),
  constraint jobs_experience_level_check check (
    experience_level in ('entry', 'junior', 'mid', 'senior', 'lead', 'any')
  ),
  constraint jobs_language_check check (
    language in ('ro', 'de', 'en', 'any')
  ),
  constraint jobs_status_check check (
    status in ('draft', 'published', 'paused', 'expired', 'archived')
  )
);

create index if not exists companies_profile_id_idx
on public.companies (profile_id);

create index if not exists companies_status_idx
on public.companies (status);

create index if not exists jobs_occupation_id_idx
on public.jobs (occupation_id);

create index if not exists jobs_location_id_idx
on public.jobs (location_id);

create index if not exists jobs_category_id_idx
on public.jobs (category_id);

create index if not exists jobs_created_at_idx
on public.jobs (created_at desc);

create index if not exists jobs_status_idx
on public.jobs (status);

create index if not exists jobs_status_created_at_idx
on public.jobs (status, created_at desc);

create or replace function public.set_job_engine_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;

create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_job_engine_updated_at();

drop trigger if exists jobs_set_updated_at on public.jobs;

create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_job_engine_updated_at();

alter table public.companies enable row level security;
alter table public.jobs enable row level security;

drop policy if exists companies_select_public on public.companies;
drop policy if exists jobs_select_published on public.jobs;

create policy companies_select_public
on public.companies
for select
to anon, authenticated
using (status in ('verified', 'active'));

create policy jobs_select_published
on public.jobs
for select
to anon, authenticated
using (
  status = 'published'
  and (expires_at is null or expires_at > now())
);

revoke all on public.companies from anon, authenticated;
revoke all on public.jobs from anon, authenticated;

grant select on public.companies to anon, authenticated;
grant select on public.jobs to anon, authenticated;

create or replace function public.search_jobs(
  p_occupation_id uuid default null,
  p_occupation_slug text default null,
  p_category_id uuid default null,
  p_category_slug text default null,
  p_location_id uuid default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_radius_km double precision default null,
  p_salary_min numeric default null,
  p_employment_type text default null,
  p_language text default null,
  p_experience_level text default null,
  p_page integer default 1
)
returns table (
  job_id uuid,
  title text,
  company_id uuid,
  company_name text,
  location_id uuid,
  location_label text,
  city text,
  postal_code text,
  state text,
  latitude double precision,
  longitude double precision,
  salary_from numeric,
  salary_to numeric,
  salary_type text,
  employment_type text,
  experience_level text,
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
  total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with normalized as (
    select
      nullif(trim(p_occupation_slug), '') as occupation_slug,
      nullif(trim(p_category_slug), '') as category_slug,
      nullif(trim(p_employment_type), '') as employment_type,
      nullif(trim(p_language), '') as job_language,
      nullif(trim(p_experience_level), '') as experience_level,
      greatest(coalesce(p_page, 1), 1) as safe_page
  ),
  matched_jobs as (
    select
      jobs.id as job_id,
      jobs.title,
      companies.id as company_id,
      companies.name as company_name,
      locations.id as location_id,
      locations.postal_code || ' ' || locations.city ||
        coalesce('-' || locations.district, '') || ', ' || locations.state
        as location_label,
      locations.city,
      locations.postal_code,
      locations.state,
      locations.latitude,
      locations.longitude,
      jobs.salary_from,
      jobs.salary_to,
      jobs.salary_type,
      jobs.employment_type,
      jobs.experience_level,
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
      jobs.created_at as published_at
    from public.jobs
    join public.companies
      on companies.id = jobs.company_id
    join public.locations
      on locations.id = jobs.location_id
    join public.occupations
      on occupations.id = jobs.occupation_id
    join public.job_categories
      on job_categories.id = jobs.category_id
    cross join normalized
    where jobs.status = 'published'
      and companies.status in ('verified', 'active')
      and (jobs.expires_at is null or jobs.expires_at > now())
      and locations.is_active
      and occupations.is_active
      and job_categories.is_active
      and (p_occupation_id is null or jobs.occupation_id = p_occupation_id)
      and (normalized.occupation_slug is null or occupations.slug = normalized.occupation_slug)
      and (p_category_id is null or jobs.category_id = p_category_id)
      and (normalized.category_slug is null or job_categories.slug = normalized.category_slug)
      and (p_location_id is null or jobs.location_id = p_location_id)
      and (
        p_salary_min is null
        or coalesce(jobs.salary_to, jobs.salary_from) >= p_salary_min
      )
      and (
        normalized.employment_type is null
        or jobs.employment_type = normalized.employment_type
      )
      and (
        normalized.job_language is null
        or jobs.language = normalized.job_language
        or jobs.language = 'any'
      )
      and (
        normalized.experience_level is null
        or jobs.experience_level = normalized.experience_level
        or jobs.experience_level = 'any'
      )
      and (
        p_radius_km is null
        or p_latitude is null
        or p_longitude is null
        or (
          locations.latitude is not null
          and locations.longitude is not null
          and (
            6371 * acos(
              least(
                1,
                greatest(
                  -1,
                  sin(radians(p_latitude)) * sin(radians(locations.latitude)) +
                  cos(radians(p_latitude)) * cos(radians(locations.latitude)) *
                  cos(radians(locations.longitude) - radians(p_longitude))
                )
              )
            )
          ) <= p_radius_km
        )
      )
  )
  select
    matched_jobs.job_id,
    matched_jobs.title,
    matched_jobs.company_id,
    matched_jobs.company_name,
    matched_jobs.location_id,
    matched_jobs.location_label,
    matched_jobs.city,
    matched_jobs.postal_code,
    matched_jobs.state,
    matched_jobs.latitude,
    matched_jobs.longitude,
    matched_jobs.salary_from,
    matched_jobs.salary_to,
    matched_jobs.salary_type,
    matched_jobs.employment_type,
    matched_jobs.experience_level,
    matched_jobs.language,
    matched_jobs.occupation_id,
    matched_jobs.occupation_slug,
    matched_jobs.occupation_name_ro,
    matched_jobs.occupation_name_de,
    matched_jobs.occupation_name_en,
    matched_jobs.category_id,
    matched_jobs.category_slug,
    matched_jobs.category_name_ro,
    matched_jobs.category_name_de,
    matched_jobs.category_name_en,
    matched_jobs.published_at,
    count(*) over() as total_count
  from matched_jobs
  cross join normalized
  order by matched_jobs.published_at desc
  limit 20
  offset (select (safe_page - 1) * 20 from normalized);
$$;

comment on function public.search_jobs(
  uuid,
  text,
  uuid,
  text,
  uuid,
  double precision,
  double precision,
  double precision,
  numeric,
  text,
  text,
  text,
  integer
) is
  'Search published jobs with taxonomy, location, salary, contract, language, experience and pagination filters. Radius filtering is prepared with latitude/longitude and radius_km.';

grant execute on function public.search_jobs(
  uuid,
  text,
  uuid,
  text,
  uuid,
  double precision,
  double precision,
  double precision,
  numeric,
  text,
  text,
  text,
  integer
) to anon, authenticated;
