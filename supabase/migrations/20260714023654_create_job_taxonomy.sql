create extension if not exists pgcrypto with schema extensions;

create table if not exists public.job_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ro text not null,
  name_de text not null,
  name_en text not null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.occupations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.job_categories(id) on delete cascade,
  slug text unique not null,
  name_ro text not null,
  name_de text not null,
  name_en text not null,
  aliases text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists occupations_category_id_idx
on public.occupations (category_id);

create index if not exists job_categories_slug_idx
on public.job_categories (slug);

create index if not exists occupations_slug_idx
on public.occupations (slug);

create index if not exists occupations_aliases_gin_idx
on public.occupations using gin (aliases);

alter table public.job_categories enable row level security;
alter table public.occupations enable row level security;

drop policy if exists job_categories_select_active on public.job_categories;
drop policy if exists occupations_select_active on public.occupations;

create policy job_categories_select_active
on public.job_categories
for select
to anon, authenticated
using (is_active);

create policy occupations_select_active
on public.occupations
for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.job_categories as category
    where category.id = occupations.category_id
      and category.is_active
  )
);

revoke all on public.job_categories from anon, authenticated;
revoke all on public.occupations from anon, authenticated;

grant select on public.job_categories to anon, authenticated;
grant select on public.occupations to anon, authenticated;
