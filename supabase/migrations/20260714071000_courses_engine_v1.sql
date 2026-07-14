create extension if not exists pgcrypto with schema extensions;

create table if not exists public.course_providers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  legal_name text,
  description text,
  website text,
  email text,
  phone text,
  country_code text default 'DE',
  location_id uuid references public.locations(id) on delete set null,
  verification_status text not null default 'pending',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_providers_country_code_check check (
    country_code is null or char_length(country_code) = 2
  ),
  constraint course_providers_verification_status_check check (
    verification_status in ('pending', 'verified', 'rejected')
  ),
  constraint course_providers_status_check check (
    status in ('active', 'inactive', 'suspended', 'archived')
  )
);

create table if not exists public.course_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ro text not null,
  name_de text not null,
  name_en text not null,
  sort_order integer default 0,
  is_active boolean default true
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.course_providers(id) on delete cascade,
  category_id uuid references public.course_categories(id) on delete set null,
  title text not null,
  slug text,
  short_description text,
  description text not null,
  language_code text,
  delivery_mode text,
  location_id uuid references public.locations(id) on delete set null,
  price_amount numeric(12, 2),
  currency_code text default 'EUR',
  duration_value integer,
  duration_unit text,
  start_date date,
  end_date date,
  enrollment_deadline date,
  capacity integer,
  certificate_available boolean default false,
  level text,
  status text not null default 'draft',
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_delivery_mode_check check (
    delivery_mode is null or delivery_mode in ('online', 'onsite', 'hybrid')
  ),
  constraint courses_level_check check (
    level is null or level in ('beginner', 'intermediate', 'advanced', 'all_levels')
  ),
  constraint courses_status_check check (
    status in ('draft', 'published', 'paused', 'archived')
  ),
  constraint courses_price_amount_check check (
    price_amount is null or price_amount >= 0
  ),
  constraint courses_duration_value_check check (
    duration_value is null or duration_value > 0
  ),
  constraint courses_capacity_check check (
    capacity is null or capacity > 0
  ),
  constraint courses_date_range_check check (
    start_date is null or end_date is null or end_date >= start_date
  )
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  status text not null default 'submitted',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_enrollments_status_check check (
    status in ('submitted', 'viewed', 'accepted', 'rejected', 'withdrawn')
  )
);

create unique index if not exists course_enrollments_course_user_unique
on public.course_enrollments (course_id, user_id);

create index if not exists courses_provider_id_idx
on public.courses (provider_id);

create index if not exists courses_category_id_idx
on public.courses (category_id);

create index if not exists courses_location_id_idx
on public.courses (location_id);

create index if not exists courses_status_idx
on public.courses (status);

create index if not exists courses_start_date_idx
on public.courses (start_date);

create index if not exists courses_created_at_idx
on public.courses (created_at desc);

create index if not exists course_enrollments_course_id_idx
on public.course_enrollments (course_id);

create index if not exists course_enrollments_user_id_idx
on public.course_enrollments (user_id);

create or replace function public.set_courses_engine_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists course_providers_set_updated_at on public.course_providers;

create trigger course_providers_set_updated_at
before update on public.course_providers
for each row
execute function public.set_courses_engine_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;

create trigger courses_set_updated_at
before update on public.courses
for each row
execute function public.set_courses_engine_updated_at();

drop trigger if exists course_enrollments_set_updated_at on public.course_enrollments;

create trigger course_enrollments_set_updated_at
before update on public.course_enrollments
for each row
execute function public.set_courses_engine_updated_at();

insert into public.course_categories (
  slug,
  name_ro,
  name_de,
  name_en,
  sort_order,
  is_active
)
values
  ('languages', 'Limbi straine', 'Sprachen', 'Languages', 10, true),
  ('logistics-warehouse', 'Logistica si depozit', 'Logistik und Lager', 'Logistics and warehouse', 20, true),
  ('driving-transport', 'Soferie si transport', 'Fahren und Transport', 'Driving and transport', 30, true),
  ('construction', 'Constructii', 'Bauwesen', 'Construction', 40, true),
  ('care-health', 'Ingrijire si sanatate', 'Pflege und Gesundheit', 'Care and health', 50, true),
  ('it-digital', 'IT si digital', 'IT und Digitales', 'IT and digital', 60, true),
  ('business-administration', 'Business si administratie', 'Business und Verwaltung', 'Business and administration', 70, true),
  ('hospitality', 'HoReCa si ospitalitate', 'Gastronomie und Hotellerie', 'Hospitality', 80, true),
  ('beauty', 'Beauty si ingrijire personala', 'Beauty und Koerperpflege', 'Beauty', 90, true),
  ('safety-certifications', 'Siguranta si certificari', 'Sicherheit und Zertifizierungen', 'Safety and certifications', 100, true),
  ('professional-development', 'Dezvoltare profesionala', 'Berufliche Entwicklung', 'Professional development', 110, true)
on conflict (slug) do update
set
  name_ro = excluded.name_ro,
  name_de = excluded.name_de,
  name_en = excluded.name_en,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

alter table public.course_providers enable row level security;
alter table public.course_categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_enrollments enable row level security;

drop policy if exists course_providers_select_public on public.course_providers;
drop policy if exists course_providers_select_own on public.course_providers;
drop policy if exists course_providers_insert_own on public.course_providers;
drop policy if exists course_providers_update_own on public.course_providers;

create policy course_providers_select_public
on public.course_providers
for select
to anon, authenticated
using (
  status = 'active'
  and verification_status = 'verified'
);

create policy course_providers_select_own
on public.course_providers
for select
to authenticated
using (owner_user_id = (select auth.uid()));

create policy course_providers_insert_own
on public.course_providers
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and status = 'active'
  and verification_status = 'pending'
);

create policy course_providers_update_own
on public.course_providers
for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

drop policy if exists course_categories_select_active on public.course_categories;

create policy course_categories_select_active
on public.course_categories
for select
to anon, authenticated
using (is_active);

drop policy if exists courses_select_public on public.courses;
drop policy if exists courses_select_own on public.courses;
drop policy if exists courses_insert_own on public.courses;
drop policy if exists courses_update_own on public.courses;

create policy courses_select_public
on public.courses
for select
to anon, authenticated
using (
  status = 'published'
  and (expires_at is null or expires_at > now())
  and exists (
    select 1
    from public.course_providers
    where course_providers.id = courses.provider_id
      and course_providers.status = 'active'
      and course_providers.verification_status = 'verified'
  )
);

create policy courses_select_own
on public.courses
for select
to authenticated
using (
  exists (
    select 1
    from public.course_providers
    where course_providers.id = courses.provider_id
      and course_providers.owner_user_id = (select auth.uid())
  )
);

create policy courses_insert_own
on public.courses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.course_providers
    where course_providers.id = courses.provider_id
      and course_providers.owner_user_id = (select auth.uid())
  )
);

create policy courses_update_own
on public.courses
for update
to authenticated
using (
  exists (
    select 1
    from public.course_providers
    where course_providers.id = courses.provider_id
      and course_providers.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.course_providers
    where course_providers.id = courses.provider_id
      and course_providers.owner_user_id = (select auth.uid())
  )
);

drop policy if exists course_enrollments_user_select_own on public.course_enrollments;
drop policy if exists course_enrollments_provider_select_own_courses on public.course_enrollments;
drop policy if exists course_enrollments_user_insert_own on public.course_enrollments;
drop policy if exists course_enrollments_user_update_withdraw on public.course_enrollments;

create policy course_enrollments_user_select_own
on public.course_enrollments
for select
to authenticated
using (user_id = (select auth.uid()));

create policy course_enrollments_provider_select_own_courses
on public.course_enrollments
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    join public.course_providers
      on course_providers.id = courses.provider_id
    where courses.id = course_enrollments.course_id
      and course_providers.owner_user_id = (select auth.uid())
  )
);

create policy course_enrollments_user_insert_own
on public.course_enrollments
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.courses
    join public.course_providers
      on course_providers.id = courses.provider_id
    where courses.id = course_enrollments.course_id
      and courses.status = 'published'
      and (courses.expires_at is null or courses.expires_at > now())
      and course_providers.status = 'active'
      and course_providers.verification_status = 'verified'
  )
);

create policy course_enrollments_user_update_withdraw
on public.course_enrollments
for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and status = 'withdrawn'
);

revoke all on public.course_providers from anon, authenticated;
revoke all on public.course_categories from anon, authenticated;
revoke all on public.courses from anon, authenticated;
revoke all on public.course_enrollments from anon, authenticated;

grant select on public.course_providers to anon, authenticated;
grant insert (
  name,
  legal_name,
  description,
  website,
  email,
  phone,
  country_code,
  location_id
) on public.course_providers to authenticated;
grant update (
  name,
  legal_name,
  description,
  website,
  email,
  phone,
  country_code,
  location_id
) on public.course_providers to authenticated;

grant select on public.course_categories to anon, authenticated;

grant select on public.courses to anon, authenticated;
grant insert (
  provider_id,
  category_id,
  title,
  slug,
  short_description,
  description,
  language_code,
  delivery_mode,
  location_id,
  price_amount,
  currency_code,
  duration_value,
  duration_unit,
  start_date,
  end_date,
  enrollment_deadline,
  capacity,
  certificate_available,
  level,
  status,
  published_at,
  expires_at
) on public.courses to authenticated;
grant update (
  category_id,
  title,
  slug,
  short_description,
  description,
  language_code,
  delivery_mode,
  location_id,
  price_amount,
  currency_code,
  duration_value,
  duration_unit,
  start_date,
  end_date,
  enrollment_deadline,
  capacity,
  certificate_available,
  level,
  status,
  published_at,
  expires_at
) on public.courses to authenticated;

grant select on public.course_enrollments to authenticated;
grant insert (
  course_id,
  user_id,
  message
) on public.course_enrollments to authenticated;
grant update (status) on public.course_enrollments to authenticated;

create or replace function public.search_courses(
  p_search_text text default null,
  p_category_id uuid default null,
  p_location_id uuid default null,
  p_delivery_mode text default null,
  p_language_code text default null,
  p_maximum_price numeric default null,
  p_level text default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns table (
  course_id uuid,
  title text,
  short_description text,
  provider_id uuid,
  provider_name text,
  category_id uuid,
  category_slug text,
  category_name_ro text,
  category_name_de text,
  category_name_en text,
  location_id uuid,
  location_label text,
  city text,
  postal_code text,
  state text,
  delivery_mode text,
  language_code text,
  price_amount numeric,
  currency_code text,
  duration_value integer,
  duration_unit text,
  start_date date,
  certificate_available boolean,
  level text,
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
      nullif(lower(trim(coalesce(p_search_text, ''))), '') as query,
      nullif(trim(coalesce(p_delivery_mode, '')), '') as delivery_mode,
      nullif(trim(coalesce(p_language_code, '')), '') as language_code,
      nullif(trim(coalesce(p_level, '')), '') as course_level,
      greatest(coalesce(p_page, 1), 1) as safe_page,
      least(greatest(coalesce(p_page_size, 20), 1), 50) as safe_page_size
  ),
  matched_courses as (
    select
      courses.id as course_id,
      courses.title,
      courses.short_description,
      course_providers.id as provider_id,
      course_providers.name as provider_name,
      course_categories.id as category_id,
      course_categories.slug as category_slug,
      course_categories.name_ro as category_name_ro,
      course_categories.name_de as category_name_de,
      course_categories.name_en as category_name_en,
      locations.id as location_id,
      case
        when courses.delivery_mode = 'online' then 'Online'
        when locations.id is null then 'Online'
        else locations.postal_code || ' ' || locations.city ||
          coalesce('-' || locations.district, '') || ', ' || locations.state
      end as location_label,
      locations.city,
      locations.postal_code,
      locations.state,
      courses.delivery_mode,
      courses.language_code,
      courses.price_amount,
      courses.currency_code,
      courses.duration_value,
      courses.duration_unit,
      courses.start_date,
      courses.certificate_available,
      courses.level,
      coalesce(courses.published_at, courses.created_at) as published_at,
      courses.created_at
    from public.courses
    join public.course_providers
      on course_providers.id = courses.provider_id
    left join public.course_categories
      on course_categories.id = courses.category_id
    left join public.locations
      on locations.id = courses.location_id
    cross join normalized
    where courses.status = 'published'
      and (courses.expires_at is null or courses.expires_at > now())
      and course_providers.status = 'active'
      and course_providers.verification_status = 'verified'
      and (course_categories.id is null or course_categories.is_active)
      and (locations.id is null or locations.is_active)
      and (p_category_id is null or courses.category_id = p_category_id)
      and (p_location_id is null or courses.location_id = p_location_id)
      and (
        normalized.delivery_mode is null
        or courses.delivery_mode = normalized.delivery_mode
      )
      and (
        normalized.language_code is null
        or courses.language_code = normalized.language_code
      )
      and (
        p_maximum_price is null
        or courses.price_amount is null
        or courses.price_amount <= p_maximum_price
      )
      and (
        normalized.course_level is null
        or courses.level = normalized.course_level
        or courses.level = 'all_levels'
      )
      and (
        normalized.query is null
        or lower(courses.title) like '%' || normalized.query || '%'
        or lower(coalesce(courses.short_description, '')) like '%' || normalized.query || '%'
        or lower(courses.description) like '%' || normalized.query || '%'
        or lower(course_providers.name) like '%' || normalized.query || '%'
        or lower(coalesce(course_categories.name_ro, '')) like '%' || normalized.query || '%'
        or lower(coalesce(course_categories.name_de, '')) like '%' || normalized.query || '%'
        or lower(coalesce(course_categories.name_en, '')) like '%' || normalized.query || '%'
      )
  )
  select
    matched_courses.course_id,
    matched_courses.title,
    matched_courses.short_description,
    matched_courses.provider_id,
    matched_courses.provider_name,
    matched_courses.category_id,
    matched_courses.category_slug,
    matched_courses.category_name_ro,
    matched_courses.category_name_de,
    matched_courses.category_name_en,
    matched_courses.location_id,
    matched_courses.location_label,
    matched_courses.city,
    matched_courses.postal_code,
    matched_courses.state,
    matched_courses.delivery_mode,
    matched_courses.language_code,
    matched_courses.price_amount,
    matched_courses.currency_code,
    matched_courses.duration_value,
    matched_courses.duration_unit,
    matched_courses.start_date,
    matched_courses.certificate_available,
    matched_courses.level,
    matched_courses.published_at,
    count(*) over() as total_count
  from matched_courses
  cross join normalized
  order by
    case when matched_courses.start_date is null then 1 else 0 end asc,
    matched_courses.start_date asc nulls last,
    matched_courses.created_at desc
  limit (select safe_page_size from normalized)
  offset (select (safe_page - 1) * safe_page_size from normalized);
$$;

create or replace function public.get_course_details(p_course_id uuid)
returns table (
  course_id uuid,
  title text,
  slug text,
  short_description text,
  description text,
  provider_id uuid,
  provider_name text,
  provider_description text,
  provider_website text,
  provider_email text,
  provider_phone text,
  category_id uuid,
  category_slug text,
  category_name_ro text,
  category_name_de text,
  category_name_en text,
  location_id uuid,
  location_label text,
  city text,
  postal_code text,
  state text,
  delivery_mode text,
  language_code text,
  price_amount numeric,
  currency_code text,
  duration_value integer,
  duration_unit text,
  start_date date,
  end_date date,
  enrollment_deadline date,
  capacity integer,
  enrolled_count bigint,
  available_spots integer,
  certificate_available boolean,
  level text,
  published_at timestamptz,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with enrollment_counts as (
    select
      course_enrollments.course_id,
      count(*) filter (where course_enrollments.status <> 'withdrawn') as enrolled_count
    from public.course_enrollments
    group by course_enrollments.course_id
  )
  select
    courses.id as course_id,
    courses.title,
    courses.slug,
    courses.short_description,
    courses.description,
    course_providers.id as provider_id,
    course_providers.name as provider_name,
    course_providers.description as provider_description,
    course_providers.website as provider_website,
    course_providers.email as provider_email,
    course_providers.phone as provider_phone,
    course_categories.id as category_id,
    course_categories.slug as category_slug,
    course_categories.name_ro as category_name_ro,
    course_categories.name_de as category_name_de,
    course_categories.name_en as category_name_en,
    locations.id as location_id,
    case
      when courses.delivery_mode = 'online' then 'Online'
      when locations.id is null then 'Online'
      else locations.postal_code || ' ' || locations.city ||
        coalesce('-' || locations.district, '') || ', ' || locations.state
    end as location_label,
    locations.city,
    locations.postal_code,
    locations.state,
    courses.delivery_mode,
    courses.language_code,
    courses.price_amount,
    courses.currency_code,
    courses.duration_value,
    courses.duration_unit,
    courses.start_date,
    courses.end_date,
    courses.enrollment_deadline,
    courses.capacity,
    coalesce(enrollment_counts.enrolled_count, 0) as enrolled_count,
    case
      when courses.capacity is null then null
      else greatest(courses.capacity - coalesce(enrollment_counts.enrolled_count, 0)::integer, 0)
    end as available_spots,
    courses.certificate_available,
    courses.level,
    coalesce(courses.published_at, courses.created_at) as published_at,
    courses.expires_at
  from public.courses
  join public.course_providers
    on course_providers.id = courses.provider_id
  left join public.course_categories
    on course_categories.id = courses.category_id
  left join public.locations
    on locations.id = courses.location_id
  left join enrollment_counts
    on enrollment_counts.course_id = courses.id
  where courses.id = p_course_id
    and courses.status = 'published'
    and (courses.expires_at is null or courses.expires_at > now())
    and course_providers.status = 'active'
    and course_providers.verification_status = 'verified'
    and (course_categories.id is null or course_categories.is_active)
    and (locations.id is null or locations.is_active)
  limit 1;
$$;

create or replace function public.enroll_in_course(
  p_course_id uuid,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  current_capacity integer;
  current_enrolled integer;
  created_enrollment_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required to enroll in a course.'
      using errcode = '28000';
  end if;

  select courses.capacity
  into current_capacity
  from public.courses
  join public.course_providers
    on course_providers.id = courses.provider_id
  where courses.id = p_course_id
    and courses.status = 'published'
    and (courses.expires_at is null or courses.expires_at > now())
    and (
      courses.enrollment_deadline is null
      or courses.enrollment_deadline >= current_date
    )
    and course_providers.status = 'active'
    and course_providers.verification_status = 'verified'
  limit 1;

  if not found then
    raise exception 'This course is not available for enrollment.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.course_enrollments
    where course_enrollments.course_id = p_course_id
      and course_enrollments.user_id = current_user_id
  ) then
    raise exception 'You are already enrolled in this course.'
      using errcode = '23505';
  end if;

  if current_capacity is not null then
    select count(*)::integer
    into current_enrolled
    from public.course_enrollments
    where course_enrollments.course_id = p_course_id
      and course_enrollments.status <> 'withdrawn';

    if current_enrolled >= current_capacity then
      raise exception 'This course is full.'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.course_enrollments (
    course_id,
    user_id,
    status,
    message
  )
  values (
    p_course_id,
    current_user_id,
    'submitted',
    nullif(trim(coalesce(p_message, '')), '')
  )
  returning id into created_enrollment_id;

  return created_enrollment_id;
end;
$$;

create or replace function public.withdraw_course_enrollment(p_enrollment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  changed_enrollment_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required to withdraw a course enrollment.'
      using errcode = '28000';
  end if;

  update public.course_enrollments
  set status = 'withdrawn'
  where course_enrollments.id = p_enrollment_id
    and course_enrollments.user_id = current_user_id
  returning id into changed_enrollment_id;

  if changed_enrollment_id is null then
    raise exception 'Enrollment not found for the current user.'
      using errcode = 'P0001';
  end if;

  return changed_enrollment_id;
end;
$$;

create or replace function public.list_user_course_enrollments()
returns table (
  enrollment_id uuid,
  course_id uuid,
  course_title text,
  provider_name text,
  location_label text,
  status text,
  message text,
  start_date date,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    course_enrollments.id as enrollment_id,
    courses.id as course_id,
    courses.title as course_title,
    course_providers.name as provider_name,
    case
      when courses.delivery_mode = 'online' then 'Online'
      when locations.id is null then 'Online'
      else locations.postal_code || ' ' || locations.city ||
        coalesce('-' || locations.district, '') || ', ' || locations.state
    end as location_label,
    course_enrollments.status,
    course_enrollments.message,
    courses.start_date,
    course_enrollments.created_at,
    course_enrollments.updated_at
  from public.course_enrollments
  join public.courses on courses.id = course_enrollments.course_id
  join public.course_providers on course_providers.id = courses.provider_id
  left join public.locations on locations.id = courses.location_id
  where course_enrollments.user_id = auth.uid()
  order by course_enrollments.created_at desc;
$$;

create or replace function public.list_provider_course_enrollments()
returns table (
  enrollment_id uuid,
  course_id uuid,
  course_title text,
  applicant_user_id uuid,
  applicant_email text,
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
    course_enrollments.id as enrollment_id,
    courses.id as course_id,
    courses.title as course_title,
    course_enrollments.user_id as applicant_user_id,
    profiles.email as applicant_email,
    course_enrollments.status,
    course_enrollments.message,
    course_enrollments.created_at,
    course_enrollments.updated_at
  from public.course_enrollments
  join public.courses on courses.id = course_enrollments.course_id
  join public.course_providers on course_providers.id = courses.provider_id
  left join public.profiles on profiles.id = course_enrollments.user_id
  where course_providers.owner_user_id = auth.uid()
  order by courses.start_date asc nulls last, course_enrollments.created_at desc;
$$;

comment on table public.course_providers is
  'Course provider profile owned by auth.uid(). Verification is set only by trusted SQL/admin workflows.';

comment on table public.courses is
  'Published and draft courses for verified course providers.';

comment on table public.course_enrollments is
  'User enrollments to published courses. Users and provider owners see only their own side of the flow.';

comment on function public.search_courses(
  text,
  uuid,
  uuid,
  text,
  text,
  numeric,
  text,
  integer,
  integer
) is
  'Search public courses with text, category, location, delivery, language, price, level and pagination filters.';

comment on function public.get_course_details(uuid) is
  'Returns a single public course only when it is published, not expired and owned by an active verified provider.';

comment on function public.enroll_in_course(uuid, text) is
  'Creates one submitted enrollment for auth.uid() if the course is public, open and not already enrolled.';

grant execute on function public.search_courses(
  text,
  uuid,
  uuid,
  text,
  text,
  numeric,
  text,
  integer,
  integer
) to anon, authenticated;

grant execute on function public.get_course_details(uuid) to anon, authenticated;
grant execute on function public.enroll_in_course(uuid, text) to authenticated;
grant execute on function public.withdraw_course_enrollment(uuid) to authenticated;
grant execute on function public.list_user_course_enrollments() to authenticated;
grant execute on function public.list_provider_course_enrollments() to authenticated;
