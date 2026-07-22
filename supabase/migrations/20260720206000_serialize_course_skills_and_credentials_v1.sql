-- H3: course skill replacement and credential skill snapshots share one
-- transaction-scoped lock per course. The namespace makes unrelated advisory
-- lock users extremely unlikely to serialize with this workflow.
create or replace function public.lock_issued_credential_course_skills()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  perform pg_advisory_xact_lock(
    hashtextextended(
      'credential-course-skills:' || new.course_id::text,
      0
    )
  );

  return new;
end;
$$;

drop trigger if exists issued_credentials_lock_course_skills
on public.issued_credentials;
create trigger issued_credentials_lock_course_skills
before insert on public.issued_credentials
for each row execute function public.lock_issued_credential_course_skills();

create or replace function public.set_course_skills(
  p_course_id uuid,
  p_skill_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  issuer_provider_id uuid;
  requested_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  select courses.provider_id
  into issuer_provider_id
  from public.courses
  where courses.id = p_course_id;

  if issuer_provider_id is null
    or not public.can_manage_course_provider(issuer_provider_id)
  then
    raise exception 'Course not found for an active verified academy.' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      'credential-course-skills:' || p_course_id::text,
      0
    )
  );

  if exists (
    select 1
    from public.issued_credentials
    where issued_credentials.course_id = p_course_id
  ) then
    raise exception 'Course skills are frozen after the first credential is issued.'
      using errcode = '55000';
  end if;

  requested_count := coalesce(cardinality(p_skill_ids), 0);

  if requested_count > 50 then
    raise exception 'A course cannot have more than 50 skills.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_skill_ids, array[]::uuid[])) requested(skill_id)
    left join public.skills
      on skills.id = requested.skill_id
      and skills.is_active
    where requested.skill_id is null or skills.id is null
  ) then
    raise exception 'Every course skill must reference an active taxonomy skill.'
      using errcode = '22023';
  end if;

  delete from public.course_skills
  where course_skills.course_id = p_course_id;

  insert into public.course_skills (course_id, skill_id, created_by)
  select distinct p_course_id, requested.skill_id, auth.uid()
  from unnest(coalesce(p_skill_ids, array[]::uuid[])) requested(skill_id);

  return (
    select count(*)::integer
    from public.course_skills
    where course_skills.course_id = p_course_id
  );
end;
$$;

comment on function public.lock_issued_credential_course_skills() is
  'Serializes credential inserts with course skill replacement for the same course until transaction end.';
comment on function public.set_course_skills(uuid, uuid[]) is
  'Replaces course skills under the same per-course transaction lock used by credential issuance.';

revoke all on function public.lock_issued_credential_course_skills()
from public, anon, authenticated;
revoke all on function public.create_course_credential_internal(uuid, uuid)
from public, anon, authenticated;
revoke all on function public.set_course_skills(uuid, uuid[])
from public, anon, authenticated;
grant execute on function public.set_course_skills(uuid, uuid[]) to authenticated;
