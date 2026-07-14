alter table public.locations
add column if not exists source text default 'geonames';

create unique index if not exists locations_import_unique_idx
on public.locations (
  country_code,
  postal_code,
  city,
  district,
  state
) nulls not distinct;
