create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

set search_path = public, extensions;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  postal_code text not null,
  city text not null,
  district text,
  state text not null,
  latitude double precision,
  longitude double precision,
  is_active boolean default true,
  constraint locations_country_code_length_check check (char_length(country_code) = 2),
  constraint locations_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint locations_longitude_check check (longitude is null or longitude between -180 and 180)
);

create table if not exists public.locations_import_staging (
  country_code text,
  postal_code text,
  city text,
  district text,
  state text,
  latitude text,
  longitude text,
  source text default 'germany_csv',
  imported_at timestamptz default now()
);

create index if not exists locations_city_idx
on public.locations (city);

create index if not exists locations_postal_code_idx
on public.locations (postal_code);

create index if not exists locations_state_idx
on public.locations (state);

create index if not exists locations_city_trgm_idx
on public.locations using gin (city gin_trgm_ops);

create index if not exists locations_district_trgm_idx
on public.locations using gin (district gin_trgm_ops);

create index if not exists locations_display_name_trgm_idx
on public.locations using gin ((city || coalesce('-' || district, '')) gin_trgm_ops);

create index if not exists locations_country_active_idx
on public.locations (country_code, is_active);

create index if not exists locations_coordinates_idx
on public.locations (latitude, longitude)
where latitude is not null
  and longitude is not null;

create unique index if not exists locations_de_unique_idx
on public.locations (
  country_code,
  postal_code,
  city,
  coalesce(district, ''),
  state
);

alter table public.locations enable row level security;
alter table public.locations_import_staging enable row level security;

drop policy if exists locations_select_active on public.locations;

create policy locations_select_active
on public.locations
for select
to anon, authenticated
using (is_active);

revoke all on public.locations from anon, authenticated;
revoke all on public.locations_import_staging from anon, authenticated;

grant select on public.locations to anon, authenticated;

create or replace function public.autocomplete_locations(
  search_text text,
  country text default 'DE',
  result_limit integer default 10
)
returns table (
  id uuid,
  country_code text,
  postal_code text,
  city text,
  district text,
  state text,
  display_name text,
  latitude double precision,
  longitude double precision,
  match_rank integer
)
language sql
stable
security definer
set search_path = public
as $$
  with normalized as (
    select
      lower(trim(search_text)) as query,
      upper(trim(country)) as country_filter,
      least(greatest(coalesce(result_limit, 10), 1), 10) as safe_limit
  )
  select
    locations.id,
    locations.country_code,
    locations.postal_code,
    locations.city,
    locations.district,
    locations.state,
    locations.city || coalesce('-' || locations.district, '') as display_name,
    locations.latitude,
    locations.longitude,
    case
      when lower(locations.city || coalesce('-' || locations.district, '')) = normalized.query
        or lower(locations.city) = normalized.query
        or lower(coalesce(locations.district, '')) = normalized.query
        or lower(locations.postal_code) = normalized.query
        then 0
      when lower(locations.city || coalesce('-' || locations.district, '')) like normalized.query || '%'
        or lower(locations.city) like normalized.query || '%'
        or lower(coalesce(locations.district, '')) like normalized.query || '%'
        or lower(locations.postal_code) like normalized.query || '%'
        then 1
      else 2
    end as match_rank
  from public.locations
  cross join normalized
  where normalized.query <> ''
    and locations.is_active
    and locations.country_code = normalized.country_filter
    and (
      lower(locations.city || coalesce('-' || locations.district, '')) like '%' || normalized.query || '%'
      or lower(locations.city) like '%' || normalized.query || '%'
      or lower(coalesce(locations.district, '')) like '%' || normalized.query || '%'
      or lower(locations.postal_code) like '%' || normalized.query || '%'
    )
  order by
    match_rank asc,
    case when locations.district is null then 0 else 1 end asc,
    locations.city asc,
    locations.district asc nulls first,
    locations.postal_code asc
  limit (select safe_limit from normalized);
$$;

create or replace function public.search_locations_within_radius(
  center_latitude double precision,
  center_longitude double precision,
  radius_km double precision,
  country text default 'DE',
  result_limit integer default 10
)
returns table (
  id uuid,
  country_code text,
  postal_code text,
  city text,
  district text,
  state text,
  display_name text,
  latitude double precision,
  longitude double precision,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    locations.id,
    locations.country_code,
    locations.postal_code,
    locations.city,
    locations.district,
    locations.state,
    locations.city || coalesce('-' || locations.district, '') as display_name,
    locations.latitude,
    locations.longitude,
    null::double precision as distance_km
  from public.locations
  where false
    and center_latitude is not null
    and center_longitude is not null
    and radius_km is not null
    and country is not null
    and result_limit is not null;
$$;

comment on table public.locations_import_staging is
  'Staging table for future CSV imports of German localities. Load CSV rows here, validate them, then upsert into public.locations.';

comment on function public.autocomplete_locations(text, text, integer) is
  'Autocomplete active locations. Ranking: exact match, prefix match, then contains match. Result limit is capped at 10.';

comment on function public.search_locations_within_radius(double precision, double precision, double precision, text, integer) is
  'Placeholder RPC for future radius-based location search. Signature and return shape are prepared; distance algorithm is intentionally not implemented yet.';

grant execute on function public.autocomplete_locations(text, text, integer) to anon, authenticated;
grant execute on function public.search_locations_within_radius(double precision, double precision, double precision, text, integer) to anon, authenticated;
