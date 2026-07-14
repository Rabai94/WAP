do $$
declare
  owner_a uuid;
  owner_b uuid;
  provider_a uuid;
  provider_b uuid;
  location_augsburg uuid;
  languages_category uuid;
  safety_category uuid;
  logistics_category uuid;
  current_course_id uuid;
begin
  select id
  into owner_a
  from auth.users
  where email = 'business.owner.a.e2e.20260714050730@gmail.com'
  limit 1;

  select id
  into owner_b
  from auth.users
  where email = 'business.owner.b.e2e.20260714050730@gmail.com'
  limit 1;

  if owner_a is null then
    select id into owner_a from auth.users order by created_at asc limit 1;
  end if;

  if owner_b is null then
    select id into owner_b from auth.users where id <> owner_a order by created_at asc limit 1;
  end if;

  if owner_a is null then
    raise exception 'No auth user exists for Courses Engine test provider.';
  end if;

  if owner_b is null then
    owner_b := owner_a;
  end if;

  select id
  into location_augsburg
  from public.locations
  where city = 'Augsburg'
    and postal_code = '86150'
  order by id asc
  limit 1;

  if location_augsburg is null then
    raise exception 'Augsburg 86150 location is required for Courses Engine test data.';
  end if;

  select id into languages_category from public.course_categories where slug = 'languages';
  select id into safety_category from public.course_categories where slug = 'safety-certifications';
  select id into logistics_category from public.course_categories where slug = 'logistics-warehouse';

  select id into provider_a
  from public.course_providers
  where name = 'RabAI Test Academy GmbH'
  limit 1;

  if provider_a is null then
    insert into public.course_providers (
      owner_user_id,
      name,
      legal_name,
      description,
      website,
      email,
      phone,
      country_code,
      location_id,
      verification_status,
      status
    ) values (
      owner_a,
      'RabAI Test Academy GmbH',
      'RabAI Test Academy GmbH',
      'Provider de test pentru cursuri RabAI in Germania.',
      'https://academy.rabai.test',
      'academy@rabai.test',
      '+49 821 000000',
      'DE',
      location_augsburg,
      'verified',
      'active'
    ) returning id into provider_a;
  else
    update public.course_providers
    set
      owner_user_id = owner_a,
      legal_name = 'RabAI Test Academy GmbH',
      description = 'Provider de test pentru cursuri RabAI in Germania.',
      website = 'https://academy.rabai.test',
      email = 'academy@rabai.test',
      phone = '+49 821 000000',
      country_code = 'DE',
      location_id = location_augsburg,
      verification_status = 'verified',
      status = 'active',
      updated_at = now()
    where id = provider_a;
  end if;

  select id into provider_b
  from public.course_providers
  where name = 'RabAI Other Academy GmbH'
  limit 1;

  if provider_b is null then
    insert into public.course_providers (
      owner_user_id,
      name,
      legal_name,
      description,
      country_code,
      location_id,
      verification_status,
      status
    ) values (
      owner_b,
      'RabAI Other Academy GmbH',
      'RabAI Other Academy GmbH',
      'Provider secundar de test pentru verificari RLS.',
      'DE',
      location_augsburg,
      'verified',
      'active'
    ) returning id into provider_b;
  else
    update public.course_providers
    set
      owner_user_id = owner_b,
      verification_status = 'verified',
      status = 'active',
      location_id = location_augsburg,
      updated_at = now()
    where id = provider_b;
  end if;

  select id into current_course_id
  from public.courses
  where provider_id = provider_a
    and slug = 'germana-incepatori-a1'
  limit 1;

  if current_course_id is null then
    insert into public.courses (
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
    ) values (
      provider_a,
      languages_category,
      'Germana pentru incepatori A1',
      'germana-incepatori-a1',
      'Curs A1 pentru muncitori care incep integrarea profesionala in Germania.',
      'Program practic de limba germana pentru situatii de zi cu zi si comunicare de baza la locul de munca.',
      'ro',
      'online',
      null,
      199,
      'EUR',
      8,
      'weeks',
      current_date + interval '21 days',
      current_date + interval '77 days',
      current_date + interval '14 days',
      24,
      true,
      'beginner',
      'published',
      now(),
      current_date + interval '120 days'
    );
  else
    update public.courses
    set
      category_id = languages_category,
      title = 'Germana pentru incepatori A1',
      short_description = 'Curs A1 pentru muncitori care incep integrarea profesionala in Germania.',
      description = 'Program practic de limba germana pentru situatii de zi cu zi si comunicare de baza la locul de munca.',
      language_code = 'ro',
      delivery_mode = 'online',
      location_id = null,
      price_amount = 199,
      currency_code = 'EUR',
      duration_value = 8,
      duration_unit = 'weeks',
      start_date = current_date + interval '21 days',
      end_date = current_date + interval '77 days',
      enrollment_deadline = current_date + interval '14 days',
      capacity = 24,
      certificate_available = true,
      level = 'beginner',
      status = 'published',
      published_at = now(),
      expires_at = current_date + interval '120 days',
      updated_at = now()
    where id = current_course_id;
  end if;

  select id into current_course_id
  from public.courses
  where provider_id = provider_a
    and slug = 'siguranta-in-depozit'
  limit 1;

  if current_course_id is null then
    insert into public.courses (
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
    ) values (
      provider_a,
      safety_category,
      'Siguranta in depozit',
      'siguranta-in-depozit',
      'Training practic pentru reguli de siguranta, fluxuri si riscuri in depozit.',
      'Curs onsite pentru lucratori in depozit, cu exemple practice despre siguranta, manipulare marfa si comunicare in echipa.',
      'ro',
      'onsite',
      location_augsburg,
      149,
      'EUR',
      2,
      'days',
      current_date + interval '35 days',
      current_date + interval '36 days',
      current_date + interval '28 days',
      18,
      true,
      'all_levels',
      'published',
      now(),
      current_date + interval '150 days'
    );
  else
    update public.courses
    set
      category_id = safety_category,
      title = 'Siguranta in depozit',
      short_description = 'Training practic pentru reguli de siguranta, fluxuri si riscuri in depozit.',
      description = 'Curs onsite pentru lucratori in depozit, cu exemple practice despre siguranta, manipulare marfa si comunicare in echipa.',
      language_code = 'ro',
      delivery_mode = 'onsite',
      location_id = location_augsburg,
      price_amount = 149,
      currency_code = 'EUR',
      duration_value = 2,
      duration_unit = 'days',
      start_date = current_date + interval '35 days',
      end_date = current_date + interval '36 days',
      enrollment_deadline = current_date + interval '28 days',
      capacity = 18,
      certificate_available = true,
      level = 'all_levels',
      status = 'published',
      published_at = now(),
      expires_at = current_date + interval '150 days',
      updated_at = now()
    where id = current_course_id;
  end if;

  select id into current_course_id
  from public.courses
  where provider_id = provider_a
    and slug = 'draft-hidden-course'
  limit 1;

  if current_course_id is null then
    insert into public.courses (
      provider_id,
      category_id,
      title,
      slug,
      short_description,
      description,
      language_code,
      delivery_mode,
      location_id,
      status,
      start_date
    ) values (
      provider_a,
      logistics_category,
      'RabAI Draft Hidden Course',
      'draft-hidden-course',
      'Acest curs draft nu trebuie sa fie public.',
      'Curs draft pentru test negativ.',
      'ro',
      'online',
      null,
      'draft',
      current_date + interval '10 days'
    );
  else
    update public.courses
    set status = 'draft', updated_at = now()
    where id = current_course_id;
  end if;

  select id into current_course_id
  from public.courses
  where provider_id = provider_a
    and slug = 'expired-hidden-course'
  limit 1;

  if current_course_id is null then
    insert into public.courses (
      provider_id,
      category_id,
      title,
      slug,
      short_description,
      description,
      language_code,
      delivery_mode,
      location_id,
      status,
      published_at,
      expires_at,
      start_date
    ) values (
      provider_a,
      logistics_category,
      'RabAI Expired Hidden Course',
      'expired-hidden-course',
      'Acest curs expirat nu trebuie sa fie public.',
      'Curs expirat pentru test negativ.',
      'ro',
      'online',
      null,
      'published',
      now() - interval '20 days',
      now() - interval '1 day',
      current_date - interval '10 days'
    );
  else
    update public.courses
    set
      status = 'published',
      published_at = now() - interval '20 days',
      expires_at = now() - interval '1 day',
      start_date = current_date - interval '10 days',
      updated_at = now()
    where id = current_course_id;
  end if;
end $$;

select
  course_providers.id as provider_id,
  course_providers.name,
  courses.id as course_id,
  courses.title,
  courses.status,
  courses.expires_at
from public.course_providers
left join public.courses on courses.provider_id = course_providers.id
where course_providers.name in (
  'RabAI Test Academy GmbH',
  'RabAI Other Academy GmbH'
)
order by course_providers.name, courses.title;
