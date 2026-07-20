-- PostgreSQL grants EXECUTE to PUBLIC on new functions by default. Preserve the
-- existing course API while making its intended role grants explicit.

revoke all on function public.search_courses(
  text,
  uuid,
  uuid,
  text,
  text,
  numeric,
  text,
  integer,
  integer
) from public, anon, authenticated;

revoke all on function public.get_course_details(uuid)
from public, anon, authenticated;
revoke all on function public.enroll_in_course(uuid, text)
from public, anon, authenticated;
revoke all on function public.withdraw_course_enrollment(uuid)
from public, anon, authenticated;
revoke all on function public.list_user_course_enrollments()
from public, anon, authenticated;
revoke all on function public.list_provider_course_enrollments()
from public, anon, authenticated;

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
