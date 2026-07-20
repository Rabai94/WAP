-- Keep withdrawal as an owned, auditable state transition exposed only by RPC.
drop policy if exists course_enrollments_user_update_withdraw
on public.course_enrollments;

revoke update on table public.course_enrollments from anon, authenticated;
revoke update (status) on public.course_enrollments from anon, authenticated;

-- SECURITY DEFINER is intentional: authenticated cannot update the table
-- directly, so this function is the only client-facing transition boundary.
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

  if current_status not in ('submitted', 'viewed') then
    raise exception 'Only submitted or viewed enrollments can be withdrawn.'
      using errcode = 'P0001';
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
      using errcode = 'P0001';
  end if;

  return changed_enrollment_id;
end;
$$;

comment on function public.withdraw_course_enrollment(uuid) is
  'Atomically withdraws an enrollment owned by auth.uid() only from submitted or viewed, preserving the enrollment row.';

revoke all on function public.withdraw_course_enrollment(uuid) from public;
revoke all on function public.withdraw_course_enrollment(uuid) from anon;
revoke all on function public.withdraw_course_enrollment(uuid) from authenticated;
grant execute on function public.withdraw_course_enrollment(uuid) to authenticated;
