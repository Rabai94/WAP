-- H1: once an enrollment has a completion, its accepted state and identity
-- are historical facts. Lock the relevant tables while existing rows are
-- checked and the invariant triggers are installed.
lock table public.courses in share row exclusive mode;
lock table public.course_enrollments in share row exclusive mode;
lock table public.course_completions in share row exclusive mode;

do $$
begin
  if exists (
    select 1
    from public.course_completions
    left join public.course_enrollments
      on course_enrollments.id = course_completions.enrollment_id
    left join public.courses
      on courses.id = course_completions.course_id
    where course_enrollments.id is null
      or courses.id is null
      or course_completions.course_id is distinct from course_enrollments.course_id
      or course_completions.user_id is distinct from course_enrollments.user_id
      or course_completions.issuer_provider_id is distinct from courses.provider_id
      or course_enrollments.status is distinct from 'accepted'
  ) then
    raise exception
      'Credential Wallet preflight failed: inconsistent course completion relationships exist.'
      using errcode = '23514';
  end if;
end;
$$;

create or replace function public.validate_course_completion_identity()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  enrollment_record record;
begin
  select
    course_enrollments.course_id,
    course_enrollments.user_id,
    course_enrollments.status,
    courses.provider_id
  into enrollment_record
  from public.course_enrollments
  join public.courses
    on courses.id = course_enrollments.course_id
  where course_enrollments.id = new.enrollment_id
  for share of course_enrollments, courses;

  if not found then
    raise exception 'Completion enrollment or course does not exist.'
      using errcode = '23503';
  end if;

  if new.course_id is distinct from enrollment_record.course_id
    or new.user_id is distinct from enrollment_record.user_id
    or new.issuer_provider_id is distinct from enrollment_record.provider_id
    or enrollment_record.status is distinct from 'accepted'
  then
    raise exception
      'Completion must match an accepted enrollment, its participant and its course provider.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.protect_completed_course_enrollment()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.id is not distinct from old.id
    and new.course_id is not distinct from old.course_id
    and new.user_id is not distinct from old.user_id
    and new.status is not distinct from old.status
  then
    return new;
  end if;

  if exists (
    select 1
    from public.course_completions
    where course_completions.enrollment_id = old.id
  ) then
    raise exception
      'A completed course enrollment has immutable identity and status.'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists course_completions_validate_identity
on public.course_completions;
create trigger course_completions_validate_identity
before insert on public.course_completions
for each row execute function public.validate_course_completion_identity();

drop trigger if exists course_enrollments_protect_completed
on public.course_enrollments;
create trigger course_enrollments_protect_completed
before update of id, course_id, user_id, status on public.course_enrollments
for each row execute function public.protect_completed_course_enrollment();

drop trigger if exists course_completions_prevent_delete
on public.course_completions;
drop trigger if exists course_completions_prevent_change
on public.course_completions;
create trigger course_completions_prevent_change
before update or delete on public.course_completions
for each row execute function public.protect_append_only_credential_record();

-- Keep withdrawal and finalization serialized on the same enrollment row.
-- The trigger above remains an independent database-level backstop.
create or replace function public.withdraw_course_enrollment(
  p_enrollment_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  current_user_id uuid := auth.uid();
  current_status text;
  changed_enrollment_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to withdraw a course enrollment.'
      using errcode = '28000';
  end if;

  select course_enrollments.status
  into current_status
  from public.course_enrollments
  where course_enrollments.id = p_enrollment_id
    and course_enrollments.user_id = current_user_id
  for update;

  if not found then
    raise exception 'Enrollment not found for the current user.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.course_completions
    where course_completions.enrollment_id = p_enrollment_id
  ) then
    raise exception 'A completed course enrollment cannot be withdrawn.'
      using errcode = '55000';
  end if;

  if current_status not in ('submitted', 'viewed') then
    raise exception 'Only submitted or viewed enrollments can be withdrawn.'
      using errcode = '55000';
  end if;

  update public.course_enrollments
  set
    status = 'withdrawn',
    updated_at = now()
  where course_enrollments.id = p_enrollment_id
    and course_enrollments.user_id = current_user_id
    and course_enrollments.status in ('submitted', 'viewed')
  returning course_enrollments.id into changed_enrollment_id;

  if changed_enrollment_id is null then
    raise exception 'Enrollment is no longer eligible for withdrawal.'
      using errcode = '55000';
  end if;

  return changed_enrollment_id;
end;
$$;

comment on function public.validate_course_completion_identity() is
  'Checks that a new completion exactly matches one accepted enrollment and its course provider.';
comment on function public.protect_completed_course_enrollment() is
  'Prevents identity or status changes after an enrollment has a completion.';
comment on function public.withdraw_course_enrollment(uuid) is
  'Atomically withdraws an owned submitted or viewed enrollment and rejects completed enrollments.';

revoke all on function public.validate_course_completion_identity()
from public, anon, authenticated;
revoke all on function public.protect_completed_course_enrollment()
from public, anon, authenticated;
revoke all on function public.withdraw_course_enrollment(uuid)
from public, anon, authenticated;
grant execute on function public.withdraw_course_enrollment(uuid) to authenticated;
