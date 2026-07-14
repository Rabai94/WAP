insert into public.job_categories (
  slug,
  name_ro,
  name_de,
  name_en,
  sort_order,
  is_active
)
values
  ('logistics-warehouse', 'Logistică și depozitare', 'Logistik und Lager', 'Logistics and warehouse', 10, true),
  ('transport', 'Transport', 'Transport', 'Transport', 20, true),
  ('cleaning', 'Curățenie', 'Reinigung', 'Cleaning', 30, true),
  ('construction', 'Construcții', 'Bauwesen', 'Construction', 40, true),
  ('manufacturing', 'Producție', 'Produktion', 'Manufacturing', 50, true),
  ('retail', 'Retail', 'Einzelhandel', 'Retail', 60, true),
  ('hospitality', 'HoReCa și ospitalitate', 'Gastronomie und Hotellerie', 'Hospitality', 70, true),
  ('care', 'Îngrijire', 'Pflege', 'Care', 80, true),
  ('office-administration', 'Birou și administrație', 'Büro und Verwaltung', 'Office and administration', 90, true),
  ('it', 'IT', 'IT', 'IT', 100, true),
  ('beauty', 'Beauty și îngrijire personală', 'Beauty und Körperpflege', 'Beauty', 110, true),
  ('education', 'Educație', 'Bildung', 'Education', 120, true),
  ('security', 'Securitate', 'Sicherheit', 'Security', 130, true)
on conflict (slug) do update
set
  name_ro = excluded.name_ro,
  name_de = excluded.name_de,
  name_en = excluded.name_en,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

with logistics_category as (
  select id
  from public.job_categories
  where slug = 'logistics-warehouse'
)
insert into public.occupations (
  category_id,
  slug,
  name_ro,
  name_de,
  name_en,
  aliases,
  is_active
)
select
  logistics_category.id,
  occupation.slug,
  occupation.name_ro,
  occupation.name_de,
  occupation.name_en,
  occupation.aliases,
  true
from logistics_category
cross join (
  values
    (
      'warehouse-worker',
      'Lucrător depozit',
      'Lagermitarbeiter',
      'Warehouse worker',
      array[
        'Lagerhelfer',
        'Lagerarbeiter',
        'Warehouse operative',
        'Lucrător depozit',
        'Muncitor depozit'
      ]::text[]
    ),
    (
      'picker',
      'Picker',
      'Kommissionierer',
      'Picker',
      array[
        'Order picker',
        'Kommissionierung',
        'Picking',
        'Pregătitor comenzi',
        'Lucrător picking'
      ]::text[]
    ),
    (
      'packer',
      'Ambalator',
      'Verpacker',
      'Packer',
      array[
        'Packer',
        'Verpackungsmitarbeiter',
        'Pack worker',
        'Lucrător ambalare',
        'Operator ambalare'
      ]::text[]
    ),
    (
      'forklift-driver',
      'Stivuitorist',
      'Gabelstaplerfahrer',
      'Forklift driver',
      array[
        'Staplerfahrer',
        'Forklift operator',
        'Operator stivuitor',
        'Motostivuitorist',
        'Gabelstaplerfahrer/in'
      ]::text[]
    ),
    (
      'sorter',
      'Sortator',
      'Sortierer',
      'Sorter',
      array[
        'Sortiermitarbeiter',
        'Parcel sorter',
        'Lucrător sortare',
        'Sortare colete',
        'Package sorter'
      ]::text[]
    ),
    (
      'logistics-dispatcher',
      'Dispecer logistică',
      'Logistikdisponent',
      'Logistics dispatcher',
      array[
        'Disponent',
        'Logistics coordinator',
        'Coordonator logistică',
        'Dispatcher',
        'Transport dispatcher'
      ]::text[]
    ),
    (
      'warehouse-manager',
      'Manager depozit',
      'Lagerleiter',
      'Warehouse manager',
      array[
        'Warehouse supervisor',
        'Lagerverwalter',
        'Șef depozit',
        'Warehouse lead',
        'Lagermeister'
      ]::text[]
    )
) as occupation(slug, name_ro, name_de, name_en, aliases)
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name_ro = excluded.name_ro,
  name_de = excluded.name_de,
  name_en = excluded.name_en,
  aliases = excluded.aliases,
  is_active = excluded.is_active;
