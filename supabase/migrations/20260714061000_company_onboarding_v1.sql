alter table public.companies
add column if not exists owner_user_id uuid;

alter table public.companies
add column if not exists legal_name text;

alter table public.companies
add column if not exists country_code text not null default 'DE';

alter table public.companies
add column if not exists city text;

alter table public.companies
add column if not exists postal_code text;

alter table public.companies
add column if not exists address text;

alter table public.companies
add column if not exists website text;

alter table public.companies
add column if not exists description text;

alter table public.companies
add column if not exists industry text;

alter table public.companies
add column if not exists employee_count_range text;

alter table public.companies
add column if not exists verification_status text not null default 'pending';

update public.companies
set owner_user_id = profile_id
where owner_user_id is null
  and profile_id is not null;

do $$
begin
  if exists (
    select 1
    from public.companies
    where owner_user_id is null
  ) then
    raise exception 'Cannot make companies.owner_user_id required while rows without profile_id exist.';
  end if;
end
$$;

alter table public.companies
alter column owner_user_id set not null;

alter table public.companies
alter column owner_user_id set default auth.uid();

alter table public.companies
alter column status set default 'active';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'companies_owner_user_id_fkey'
      and conrelid = 'public.companies'::regclass
  ) then
    alter table public.companies
    add constraint companies_owner_user_id_fkey
    foreign key (owner_user_id)
    references public.profiles(id)
    on delete cascade;
  end if;
end
$$;

drop index if exists public.companies_owner_user_id_unique;

create unique index companies_owner_user_id_unique
on public.companies (owner_user_id);

drop index if exists public.companies_owner_user_id_idx;

create index companies_owner_user_id_idx
on public.companies (owner_user_id);

drop index if exists public.companies_verification_status_idx;

create index companies_verification_status_idx
on public.companies (verification_status);

alter table public.companies
drop constraint if exists companies_status_check;

alter table public.companies
add constraint companies_status_check check (
  status in ('active', 'inactive', 'suspended', 'archived', 'draft', 'pending', 'verified')
);

alter table public.companies
drop constraint if exists companies_verification_status_check;

alter table public.companies
add constraint companies_verification_status_check check (
  verification_status in ('pending', 'verified', 'rejected')
);

drop policy if exists companies_select_public on public.companies;
drop policy if exists companies_select_own on public.companies;
drop policy if exists companies_insert_own on public.companies;
drop policy if exists companies_update_own on public.companies;
drop policy if exists jobs_select_published on public.jobs;
drop policy if exists jobs_select_own on public.jobs;
drop policy if exists jobs_insert_own on public.jobs;
drop policy if exists jobs_update_own on public.jobs;

create policy companies_select_public
on public.companies
for select
to anon, authenticated
using (
  status = 'active'
  and verification_status = 'verified'
);

create policy companies_select_own
on public.companies
for select
to authenticated
using (owner_user_id = (select auth.uid()));

create policy companies_insert_own
on public.companies
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and status = 'active'
  and verification_status = 'pending'
);

create policy companies_update_own
on public.companies
for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

create policy jobs_select_published
on public.jobs
for select
to anon, authenticated
using (
  jobs.status = 'published'
  and (jobs.expires_at is null or jobs.expires_at > now())
  and exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.status = 'active'
      and companies.verification_status = 'verified'
  )
);

create policy jobs_select_own
on public.jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.owner_user_id = (select auth.uid())
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
      and companies.owner_user_id = (select auth.uid())
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
      and companies.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.owner_user_id = (select auth.uid())
  )
);

revoke insert on public.companies from authenticated;
revoke update on public.companies from authenticated;
revoke insert (profile_id, name, status) on public.companies from authenticated;
revoke update (name, status) on public.companies from authenticated;

grant select on public.companies to anon, authenticated;
grant insert (
  name,
  legal_name,
  country_code,
  city,
  postal_code,
  address,
  website,
  description,
  industry,
  employee_count_range
) on public.companies to authenticated;
grant update (
  name,
  legal_name,
  country_code,
  city,
  postal_code,
  address,
  website,
  description,
  industry,
  employee_count_range
) on public.companies to authenticated;

create or replace function public.upsert_own_company(
  p_name text,
  p_legal_name text default null,
  p_country_code text default 'DE',
  p_city text default null,
  p_postal_code text default null,
  p_address text default null,
  p_website text default null,
  p_description text default null,
  p_industry text default null,
  p_employee_count_range text default null
)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  cleaned_website text;
  company_row public.companies;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required to save a company.'
      using errcode = '28000';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Company name is required.'
      using errcode = '22023';
  end if;

  if nullif(trim(coalesce(p_city, '')), '') is null then
    raise exception 'Company city is required.'
      using errcode = '22023';
  end if;

  if nullif(trim(coalesce(p_industry, '')), '') is null then
    raise exception 'Company industry is required.'
      using errcode = '22023';
  end if;

  cleaned_website := nullif(trim(coalesce(p_website, '')), '');

  if cleaned_website is not null
    and cleaned_website !~* '^https?://[^[:space:]]+\.[^[:space:]]+'
  then
    raise exception 'Company website must be a valid http or https URL.'
      using errcode = '22023';
  end if;

  insert into public.companies (
    owner_user_id,
    profile_id,
    name,
    legal_name,
    country_code,
    city,
    postal_code,
    address,
    website,
    description,
    industry,
    employee_count_range,
    verification_status,
    status
  )
  values (
    current_user_id,
    current_user_id,
    trim(p_name),
    nullif(trim(coalesce(p_legal_name, '')), ''),
    coalesce(upper(nullif(trim(coalesce(p_country_code, '')), '')), 'DE'),
    trim(p_city),
    nullif(trim(coalesce(p_postal_code, '')), ''),
    nullif(trim(coalesce(p_address, '')), ''),
    cleaned_website,
    nullif(trim(coalesce(p_description, '')), ''),
    trim(p_industry),
    nullif(trim(coalesce(p_employee_count_range, '')), ''),
    'pending',
    'active'
  )
  on conflict (owner_user_id) do update
  set
    profile_id = excluded.profile_id,
    name = excluded.name,
    legal_name = excluded.legal_name,
    country_code = excluded.country_code,
    city = excluded.city,
    postal_code = excluded.postal_code,
    address = excluded.address,
    website = excluded.website,
    description = excluded.description,
    industry = excluded.industry,
    employee_count_range = excluded.employee_count_range,
    status = case
      when public.companies.status in ('suspended', 'archived') then public.companies.status
      else 'active'
    end,
    updated_at = now()
  returning * into company_row;

  return company_row;
end;
$$;

comment on column public.companies.verification_status is
  'Company verification status. In v1, set verified only through trusted SQL/admin workflows; browser clients cannot update this column.';

comment on function public.upsert_own_company(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) is
  'Creates or updates the company owned by auth.uid(). The browser never supplies owner_user_id.';

grant execute on function public.upsert_own_company(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

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
  where companies.owner_user_id = auth.uid()
    and companies.status = 'active'
    and companies.verification_status = 'verified'
  order by companies.created_at asc
  limit 1;

  if current_company_id is null then
    raise exception 'No verified active company profile is linked to the current user.'
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
  'Publishes a job for the verified active company owned by auth.uid(). The client never supplies company_id.';

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
      and companies.status = 'active'
      and companies.verification_status = 'verified'
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
