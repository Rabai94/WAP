revoke insert on public.jobs from authenticated;
revoke update on public.jobs from authenticated;

revoke insert (
  company_id,
  title,
  description,
  category_id,
  occupation_id,
  location_id,
  salary_from,
  salary_to,
  salary_type,
  employment_type,
  experience_level,
  working_hours,
  language,
  expires_at,
  status
) on public.jobs from authenticated;

revoke update (
  title,
  description,
  category_id,
  occupation_id,
  location_id,
  salary_from,
  salary_to,
  salary_type,
  employment_type,
  experience_level,
  working_hours,
  language,
  expires_at,
  status
) on public.jobs from authenticated;

grant update (
  title,
  description,
  category_id,
  occupation_id,
  location_id,
  salary_from,
  salary_to,
  salary_type,
  employment_type,
  experience_level,
  working_hours,
  language,
  expires_at
) on public.jobs to authenticated;

comment on function public.publish_job(
  text,
  text,
  uuid,
  uuid,
  uuid,
  numeric,
  numeric,
  text,
  text,
  text,
  text,
  text,
  timestamptz
) is
  'Publishes a job for the active company owned by auth.uid(). Direct inserts are not granted to browser clients.';
