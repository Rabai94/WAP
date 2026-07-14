create or replace function public.deactivate_own_job(p_job_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  changed_job_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required to deactivate a job.'
      using errcode = '28000';
  end if;

  update public.jobs
  set
    status = 'paused',
    updated_at = now()
  from public.companies
  where jobs.id = p_job_id
    and companies.id = jobs.company_id
    and companies.owner_user_id = current_user_id
    and jobs.status in ('draft', 'published', 'paused')
  returning jobs.id into changed_job_id;

  if changed_job_id is null then
    raise exception 'Job not found for the current company.'
      using errcode = 'P0001';
  end if;

  return changed_job_id;
end;
$$;

comment on function public.deactivate_own_job(uuid) is
  'Pauses a job owned by the company linked to auth.uid(). Browser clients cannot set arbitrary job statuses.';

grant execute on function public.deactivate_own_job(uuid) to authenticated;
