create or replace function public.resolve_profile_display_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    nullif(btrim(profiles.full_name), ''),
    nullif(btrim(concat_ws(' ', worker_profiles.first_name, worker_profiles.last_name)), '')
  )
  from public.profiles
  left join public.worker_profiles
    on worker_profiles.user_id = profiles.id
  where profiles.id = p_user_id
  limit 1;
$$;

create or replace function public.credential_effective_status(
  p_status text,
  p_expires_at timestamptz
)
returns text
language sql
stable
set search_path = pg_catalog, public
as $$
  select case
    when p_status = 'revoked' then 'revoked'
    when p_expires_at is not null and p_expires_at <= now() then 'expired'
    else 'valid'
  end;
$$;

create or replace function public.new_credential_number()
returns text
language sql
volatile
security definer
set search_path = pg_catalog, public, extensions
as $$
  select 'RABAI-'
    || to_char(current_date, 'YYYY')
    || '-'
    || upper(substr(encode(extensions.gen_random_bytes(12), 'hex'), 1, 20));
$$;

create or replace function public.append_credential_audit(
  p_credential_id uuid,
  p_completion_id uuid,
  p_event_type text,
  p_actor_user_id uuid,
  p_actor_role text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.credential_audit_log (
    credential_id,
    completion_id,
    event_type,
    actor_user_id,
    actor_role,
    metadata
  )
  values (
    p_credential_id,
    p_completion_id,
    p_event_type,
    p_actor_user_id,
    p_actor_role,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.resolve_profile_display_name(uuid) from public, anon, authenticated;
revoke all on function public.credential_effective_status(text, timestamptz) from public, anon, authenticated;
revoke all on function public.new_credential_number() from public, anon, authenticated;
revoke all on function public.append_credential_audit(uuid, uuid, text, uuid, text, jsonb)
from public, anon, authenticated;

create or replace function public.list_issuer_courses()
returns table (
  course_id uuid,
  course_title text,
  course_status text,
  provider_id uuid,
  provider_name text,
  provider_status text,
  provider_verification_status text,
  start_date date,
  end_date date,
  participant_count bigint,
  completion_count bigint,
  credential_count bigint,
  can_manage boolean
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  return query
  select
    courses.id,
    courses.title,
    courses.status,
    course_providers.id,
    course_providers.name,
    course_providers.status,
    course_providers.verification_status,
    courses.start_date,
    courses.end_date,
    count(distinct course_enrollments.id),
    count(distinct course_completions.id),
    count(distinct issued_credentials.id),
    public.can_manage_course_provider(course_providers.id)
  from public.courses
  join public.course_providers
    on course_providers.id = courses.provider_id
  left join public.course_enrollments
    on course_enrollments.course_id = courses.id
  left join public.course_completions
    on course_completions.course_id = courses.id
  left join public.issued_credentials
    on issued_credentials.course_id = courses.id
  where public.can_view_course_provider(course_providers.id)
  group by courses.id, course_providers.id
  order by courses.start_date desc nulls last, courses.created_at desc;
end;
$$;

create or replace function public.list_course_participants_for_issuer(p_course_id uuid)
returns table (
  enrollment_id uuid,
  participant_display_name text,
  enrollment_status text,
  enrolled_at timestamptz,
  completion_id uuid,
  completion_outcome text,
  completion_score numeric,
  completion_notes text,
  completed_at timestamptz,
  credential_id uuid,
  credential_number text,
  credential_status text,
  credential_document_status text
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  issuer_provider_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  select courses.provider_id
  into issuer_provider_id
  from public.courses
  where courses.id = p_course_id;

  if issuer_provider_id is null
    or not public.can_view_course_provider(issuer_provider_id)
  then
    raise exception 'Course not found for the current academy.' using errcode = 'P0001';
  end if;

  return query
  select
    course_enrollments.id,
    public.resolve_profile_display_name(course_enrollments.user_id),
    course_enrollments.status,
    course_enrollments.created_at,
    course_completions.id,
    course_completions.outcome,
    course_completions.score,
    course_completions.notes,
    course_completions.completed_at,
    latest_credential.id,
    latest_credential.credential_number,
    public.credential_effective_status(
      latest_credential.status,
      latest_credential.expires_at
    ),
    latest_credential.document_status
  from public.course_enrollments
  left join public.course_completions
    on course_completions.enrollment_id = course_enrollments.id
  left join lateral (
    select
      issued_credentials.id,
      issued_credentials.credential_number,
      issued_credentials.status,
      issued_credentials.expires_at,
      issued_credentials.document_status
    from public.issued_credentials
    where issued_credentials.completion_id = course_completions.id
    order by issued_credentials.version desc
    limit 1
  ) latest_credential on true
  where course_enrollments.course_id = p_course_id
  order by course_enrollments.created_at desc;
end;
$$;

create or replace function public.update_course_enrollment_status_for_issuer(
  p_enrollment_id uuid,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  enrollment_record record;
  normalized_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  normalized_status := lower(btrim(coalesce(p_status, '')));

  if normalized_status not in ('viewed', 'accepted', 'rejected') then
    raise exception 'Unsupported enrollment status.' using errcode = '22023';
  end if;

  select
    course_enrollments.id,
    course_enrollments.status,
    courses.provider_id
  into enrollment_record
  from public.course_enrollments
  join public.courses on courses.id = course_enrollments.course_id
  where course_enrollments.id = p_enrollment_id
  for update of course_enrollments;

  if not found or not public.can_manage_course_provider(enrollment_record.provider_id) then
    raise exception 'Enrollment not found for an active verified academy.'
      using errcode = 'P0001';
  end if;

  if enrollment_record.status = normalized_status then
    return enrollment_record.id;
  end if;

  if not (
    (enrollment_record.status = 'submitted' and normalized_status in ('viewed', 'accepted', 'rejected'))
    or (enrollment_record.status = 'viewed' and normalized_status in ('accepted', 'rejected'))
  ) then
    raise exception 'This enrollment status transition is not allowed.'
      using errcode = '55000';
  end if;

  update public.course_enrollments
  set status = normalized_status
  where course_enrollments.id = enrollment_record.id;

  return enrollment_record.id;
end;
$$;

create or replace function public.finalize_course_enrollment(
  p_enrollment_id uuid,
  p_outcome text,
  p_score numeric default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  enrollment_record record;
  existing_completion public.course_completions;
  created_completion_id uuid;
  normalized_outcome text;
  normalized_notes text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  normalized_outcome := lower(btrim(coalesce(p_outcome, '')));
  normalized_notes := nullif(btrim(coalesce(p_notes, '')), '');

  if normalized_outcome not in ('passed', 'failed', 'abandoned') then
    raise exception 'Outcome must be passed, failed or abandoned.' using errcode = '22023';
  end if;

  if p_score is not null and (p_score < 0 or p_score > 100) then
    raise exception 'Score must be between 0 and 100.' using errcode = '22023';
  end if;

  if normalized_notes is not null and char_length(normalized_notes) > 2000 then
    raise exception 'Internal notes cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  select
    course_enrollments.id,
    course_enrollments.course_id,
    course_enrollments.user_id,
    course_enrollments.status,
    courses.provider_id
  into enrollment_record
  from public.course_enrollments
  join public.courses on courses.id = course_enrollments.course_id
  where course_enrollments.id = p_enrollment_id
  for update of course_enrollments;

  if not found or not public.can_manage_course_provider(enrollment_record.provider_id) then
    raise exception 'Enrollment not found for an active verified academy.'
      using errcode = 'P0001';
  end if;

  if enrollment_record.status <> 'accepted' then
    raise exception 'Only an accepted enrollment can be finalized.' using errcode = '55000';
  end if;

  select *
  into existing_completion
  from public.course_completions
  where course_completions.enrollment_id = enrollment_record.id;

  if found then
    if existing_completion.outcome = normalized_outcome
      and existing_completion.score is not distinct from p_score
      and existing_completion.notes is not distinct from normalized_notes
    then
      return existing_completion.id;
    end if;

    raise exception 'Course completion is immutable. Revoke and reissue the credential for corrections.'
      using errcode = '55000';
  end if;

  insert into public.course_completions (
    enrollment_id,
    course_id,
    user_id,
    issuer_provider_id,
    outcome,
    score,
    notes,
    completed_by
  )
  values (
    enrollment_record.id,
    enrollment_record.course_id,
    enrollment_record.user_id,
    enrollment_record.provider_id,
    normalized_outcome,
    p_score,
    normalized_notes,
    auth.uid()
  )
  returning id into created_completion_id;

  perform public.append_credential_audit(
    null,
    created_completion_id,
    'course_completed',
    auth.uid(),
    'issuer',
    jsonb_build_object('outcome', normalized_outcome, 'score', p_score)
  );

  return created_completion_id;
end;
$$;

create or replace function public.create_course_credential_internal(
  p_completion_id uuid,
  p_replaces_credential_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  completion_record record;
  replacement_record public.issued_credentials;
  participant_name text;
  existing_credential_id uuid;
  created_credential_id uuid;
  next_version integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_completion_id::text, 0));

  select
    course_completions.id,
    course_completions.enrollment_id,
    course_completions.course_id,
    course_completions.user_id,
    course_completions.issuer_provider_id,
    course_completions.outcome,
    course_completions.completed_at,
    courses.title as course_title,
    courses.start_date,
    courses.end_date,
    courses.duration_value,
    courses.duration_unit,
    courses.certificate_available,
    course_providers.name as issuer_name
  into completion_record
  from public.course_completions
  join public.courses on courses.id = course_completions.course_id
  join public.course_providers
    on course_providers.id = course_completions.issuer_provider_id
  where course_completions.id = p_completion_id;

  if not found
    or not public.can_manage_course_provider(completion_record.issuer_provider_id)
  then
    raise exception 'Completion not found for an active verified academy.'
      using errcode = 'P0001';
  end if;

  if completion_record.outcome <> 'passed' then
    raise exception 'Credentials can only be issued for a passed completion.'
      using errcode = '55000';
  end if;

  if completion_record.certificate_available is not true then
    raise exception 'This course is not configured to issue certificates.'
      using errcode = '55000';
  end if;

  participant_name := public.resolve_profile_display_name(completion_record.user_id);

  if participant_name is null then
    raise exception 'The participant needs a display name before a credential can be issued.'
      using errcode = '55000';
  end if;

  if p_replaces_credential_id is null then
    select issued_credentials.id
    into existing_credential_id
    from public.issued_credentials
    where issued_credentials.completion_id = p_completion_id
      and issued_credentials.status = 'valid'
    order by issued_credentials.version desc
    limit 1;

    if existing_credential_id is not null then
      return existing_credential_id;
    end if;

    if exists (
      select 1
      from public.issued_credentials
      where issued_credentials.completion_id = p_completion_id
    ) then
      raise exception 'The previous credential is revoked. Use the explicit reissue flow.'
        using errcode = '55000';
    end if;

    next_version := 1;
  else
    select *
    into replacement_record
    from public.issued_credentials
    where issued_credentials.id = p_replaces_credential_id
    for update;

    if not found
      or replacement_record.completion_id <> p_completion_id
      or replacement_record.status <> 'revoked'
    then
      raise exception 'Only a revoked credential from this completion can be replaced.'
        using errcode = '55000';
    end if;

    if exists (
      select 1
      from public.issued_credentials
      where issued_credentials.completion_id = p_completion_id
        and issued_credentials.status = 'valid'
    ) then
      raise exception 'A valid credential already exists for this completion.'
        using errcode = '23505';
    end if;

    select coalesce(max(issued_credentials.version), 0) + 1
    into next_version
    from public.issued_credentials
    where issued_credentials.completion_id = p_completion_id;
  end if;

  insert into public.issued_credentials (
    credential_number,
    completion_id,
    enrollment_id,
    course_id,
    user_id,
    issuer_provider_id,
    title,
    participant_display_name,
    course_title,
    issuer_name,
    course_start_date,
    course_end_date,
    duration_value,
    duration_unit,
    verification_token,
    replaces_credential_id,
    version
  )
  values (
    public.new_credential_number(),
    completion_record.id,
    completion_record.enrollment_id,
    completion_record.course_id,
    completion_record.user_id,
    completion_record.issuer_provider_id,
    completion_record.course_title,
    participant_name,
    completion_record.course_title,
    completion_record.issuer_name,
    completion_record.start_date,
    completion_record.end_date,
    completion_record.duration_value,
    completion_record.duration_unit,
    encode(extensions.gen_random_bytes(32), 'hex'),
    p_replaces_credential_id,
    next_version
  )
  returning id into created_credential_id;

  insert into public.credential_skills (
    credential_id,
    skill_id,
    skill_slug,
    skill_name_ro,
    skill_name_de,
    skill_name_en
  )
  select
    created_credential_id,
    skills.id,
    skills.slug,
    skills.name_ro,
    skills.name_de,
    skills.name_en
  from public.course_skills
  join public.skills on skills.id = course_skills.skill_id
  where course_skills.course_id = completion_record.course_id;

  insert into public.user_skills (
    user_id,
    skill_id,
    source_type,
    credential_id,
    issuer_provider_id,
    obtained_at,
    expires_at,
    status,
    is_verified
  )
  select
    completion_record.user_id,
    credential_skills.skill_id,
    'course_credential',
    created_credential_id,
    completion_record.issuer_provider_id,
    now(),
    null,
    'valid',
    true
  from public.credential_skills
  where credential_skills.credential_id = created_credential_id
  on conflict (user_id, skill_id, credential_id)
    where credential_id is not null
  do nothing;

  if p_replaces_credential_id is not null then
    perform public.append_credential_audit(
      created_credential_id,
      completion_record.id,
      'credential_reissued',
      auth.uid(),
      'issuer',
      jsonb_build_object('replaces_credential_id', p_replaces_credential_id)
    );
  end if;

  return created_credential_id;
end;
$$;

create or replace function public.issue_course_credential(p_completion_id uuid)
returns uuid
language sql
security definer
set search_path = pg_catalog, public
as $$
  select public.create_course_credential_internal(p_completion_id, null);
$$;

create or replace function public.reissue_course_credential(p_credential_id uuid)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  target_completion_id uuid;
begin
  select issued_credentials.completion_id
  into target_completion_id
  from public.issued_credentials
  where issued_credentials.id = p_credential_id
    and issued_credentials.status = 'revoked';

  if target_completion_id is null then
    raise exception 'Revoked credential not found.' using errcode = 'P0001';
  end if;

  return public.create_course_credential_internal(
    target_completion_id,
    p_credential_id
  );
end;
$$;

create or replace function public.revoke_credential(
  p_credential_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  credential_record public.issued_credentials;
  normalized_reason text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  normalized_reason := nullif(btrim(coalesce(p_reason, '')), '');

  if normalized_reason is null or char_length(normalized_reason) < 5 then
    raise exception 'A revocation reason of at least 5 characters is required.'
      using errcode = '22023';
  end if;

  if char_length(normalized_reason) > 1000 then
    raise exception 'Revocation reason cannot exceed 1000 characters.'
      using errcode = '22023';
  end if;

  select *
  into credential_record
  from public.issued_credentials
  where issued_credentials.id = p_credential_id
  for update;

  if not found
    or not public.can_manage_course_provider(credential_record.issuer_provider_id)
  then
    raise exception 'Credential not found for an active verified academy.'
      using errcode = 'P0001';
  end if;

  if credential_record.status = 'revoked' then
    return credential_record.id;
  end if;

  update public.issued_credentials
  set
    status = 'revoked',
    revoked_at = now(),
    revoked_by = auth.uid(),
    revoked_reason = normalized_reason
  where issued_credentials.id = credential_record.id;

  update public.user_skills
  set status = 'revoked'
  where user_skills.credential_id = credential_record.id
    and user_skills.status <> 'revoked';

  perform public.append_credential_audit(
    credential_record.id,
    credential_record.completion_id,
    'credential_revoked',
    auth.uid(),
    'issuer',
    jsonb_build_object('reason', normalized_reason)
  );

  return credential_record.id;
end;
$$;

create or replace function public.list_own_credentials()
returns table (
  credential_id uuid,
  category text,
  credential_number text,
  title text,
  issuer_name text,
  issued_at timestamptz,
  expires_at timestamptz,
  status text,
  document_status text,
  is_public boolean,
  verification_token text,
  skills jsonb
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  return query
  select
    issued_credentials.id,
    'certificate'::text,
    issued_credentials.credential_number,
    issued_credentials.title,
    issued_credentials.issuer_name,
    issued_credentials.issued_at,
    issued_credentials.expires_at,
    public.credential_effective_status(
      issued_credentials.status,
      issued_credentials.expires_at
    ),
    issued_credentials.document_status,
    issued_credentials.is_public,
    issued_credentials.verification_token,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'slug', credential_skills.skill_slug,
          'name_ro', credential_skills.skill_name_ro,
          'name_de', credential_skills.skill_name_de,
          'name_en', credential_skills.skill_name_en
        )
        order by credential_skills.skill_name_en
      )
      from public.credential_skills
      where credential_skills.credential_id = issued_credentials.id
    ), '[]'::jsonb)
  from public.issued_credentials
  where issued_credentials.user_id = auth.uid()
  order by issued_credentials.issued_at desc;
end;
$$;

create or replace function public.get_own_credential_details(p_credential_id uuid)
returns table (
  credential_id uuid,
  credential_number text,
  title text,
  participant_display_name text,
  course_title text,
  issuer_name text,
  course_start_date date,
  course_end_date date,
  duration_value integer,
  duration_unit text,
  issued_at timestamptz,
  expires_at timestamptz,
  status text,
  document_status text,
  pdf_sha256 text,
  is_public boolean,
  verification_token text,
  revoked_at timestamptz,
  revoked_reason text,
  replaces_credential_id uuid,
  version integer,
  skills jsonb
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  return query
  select
    issued_credentials.id,
    issued_credentials.credential_number,
    issued_credentials.title,
    issued_credentials.participant_display_name,
    issued_credentials.course_title,
    issued_credentials.issuer_name,
    issued_credentials.course_start_date,
    issued_credentials.course_end_date,
    issued_credentials.duration_value,
    issued_credentials.duration_unit,
    issued_credentials.issued_at,
    issued_credentials.expires_at,
    public.credential_effective_status(
      issued_credentials.status,
      issued_credentials.expires_at
    ),
    issued_credentials.document_status,
    issued_credentials.pdf_sha256,
    issued_credentials.is_public,
    issued_credentials.verification_token,
    issued_credentials.revoked_at,
    issued_credentials.revoked_reason,
    issued_credentials.replaces_credential_id,
    issued_credentials.version,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'slug', credential_skills.skill_slug,
          'name_ro', credential_skills.skill_name_ro,
          'name_de', credential_skills.skill_name_de,
          'name_en', credential_skills.skill_name_en
        )
        order by credential_skills.skill_name_en
      )
      from public.credential_skills
      where credential_skills.credential_id = issued_credentials.id
    ), '[]'::jsonb)
  from public.issued_credentials
  where issued_credentials.id = p_credential_id
    and issued_credentials.user_id = auth.uid()
  limit 1;
end;
$$;

create or replace function public.list_own_skills()
returns table (
  user_skill_id uuid,
  skill_id uuid,
  skill_slug text,
  skill_name_ro text,
  skill_name_de text,
  skill_name_en text,
  source_type text,
  status text,
  is_verified boolean,
  obtained_at timestamptz,
  expires_at timestamptz,
  credential_id uuid,
  credential_number text,
  credential_title text,
  issuer_name text
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  return query
  select
    user_skills.id,
    skills.id,
    skills.slug,
    skills.name_ro,
    skills.name_de,
    skills.name_en,
    user_skills.source_type,
    case
      when user_skills.status = 'revoked' then 'revoked'
      when user_skills.expires_at is not null and user_skills.expires_at <= now() then 'expired'
      else user_skills.status
    end,
    user_skills.is_verified,
    user_skills.obtained_at,
    user_skills.expires_at,
    user_skills.credential_id,
    issued_credentials.credential_number,
    issued_credentials.title,
    course_providers.name
  from public.user_skills
  join public.skills on skills.id = user_skills.skill_id
  left join public.issued_credentials
    on issued_credentials.id = user_skills.credential_id
  left join public.course_providers
    on course_providers.id = user_skills.issuer_provider_id
  where user_skills.user_id = auth.uid()
  order by user_skills.obtained_at desc, skills.name_en;
end;
$$;

create or replace function public.set_credential_visibility(
  p_credential_id uuid,
  p_is_public boolean
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  credential_record public.issued_credentials;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  select *
  into credential_record
  from public.issued_credentials
  where issued_credentials.id = p_credential_id
    and issued_credentials.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Credential not found for the current user.' using errcode = 'P0001';
  end if;

  if credential_record.is_public = p_is_public then
    return credential_record.id;
  end if;

  update public.issued_credentials
  set is_public = p_is_public
  where issued_credentials.id = credential_record.id;

  perform public.append_credential_audit(
    credential_record.id,
    credential_record.completion_id,
    'visibility_changed',
    auth.uid(),
    'participant',
    jsonb_build_object('is_public', p_is_public)
  );

  return credential_record.id;
end;
$$;

create or replace function public.verify_credential_by_token(p_token text)
returns table (
  credential_number text,
  title text,
  participant_display_name text,
  issuer_name text,
  course_title text,
  issued_at timestamptz,
  expires_at timestamptz,
  status text,
  revoked_at timestamptz,
  skills jsonb
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_token is null
    or char_length(p_token) <> 64
    or p_token !~ '^[0-9a-f]{64}$'
  then
    return;
  end if;

  return query
  select
    issued_credentials.credential_number,
    issued_credentials.title,
    issued_credentials.participant_display_name,
    issued_credentials.issuer_name,
    issued_credentials.course_title,
    issued_credentials.issued_at,
    issued_credentials.expires_at,
    public.credential_effective_status(
      issued_credentials.status,
      issued_credentials.expires_at
    ),
    issued_credentials.revoked_at,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'slug', credential_skills.skill_slug,
          'name_ro', credential_skills.skill_name_ro,
          'name_de', credential_skills.skill_name_de,
          'name_en', credential_skills.skill_name_en
        )
        order by credential_skills.skill_name_en
      )
      from public.credential_skills
      where credential_skills.credential_id = issued_credentials.id
    ), '[]'::jsonb)
  from public.issued_credentials
  where issued_credentials.verification_token = p_token
    and issued_credentials.is_public
  limit 1;
end;
$$;

create or replace function public.list_credential_audit(p_credential_id uuid)
returns table (
  event_id bigint,
  event_type text,
  actor_role text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  credential_record public.issued_credentials;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  select *
  into credential_record
  from public.issued_credentials
  where issued_credentials.id = p_credential_id;

  if not found
    or not (
      credential_record.user_id = auth.uid()
      or public.can_view_course_provider(credential_record.issuer_provider_id)
    )
  then
    raise exception 'Credential audit is not available.' using errcode = 'P0001';
  end if;

  return query
  select
    credential_audit_log.id,
    credential_audit_log.event_type,
    credential_audit_log.actor_role,
    credential_audit_log.metadata,
    credential_audit_log.created_at
  from public.credential_audit_log
  where credential_audit_log.credential_id = p_credential_id
    or (
      credential_audit_log.credential_id is null
      and credential_audit_log.completion_id = credential_record.completion_id
    )
  order by credential_audit_log.created_at desc;
end;
$$;

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

create or replace function public.can_access_credential_document(p_credential_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.issued_credentials
      where issued_credentials.id = p_credential_id
        and issued_credentials.document_status = 'ready'
        and (
          issued_credentials.user_id = auth.uid()
          or public.can_manage_course_provider(issued_credentials.issuer_provider_id)
        )
    );
$$;

create or replace function public.complete_credential_document(
  p_credential_id uuid,
  p_storage_path text,
  p_sha256 text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  credential_record public.issued_credentials;
  expected_path text;
begin
  select *
  into credential_record
  from public.issued_credentials
  where issued_credentials.id = p_credential_id
  for update;

  if not found then
    raise exception 'Credential not found.' using errcode = 'P0001';
  end if;

  expected_path := credential_record.user_id::text
    || '/'
    || credential_record.id::text
    || '.pdf';

  if p_storage_path is distinct from expected_path then
    raise exception 'Unexpected credential storage path.' using errcode = '22023';
  end if;

  if p_sha256 is null
    or char_length(p_sha256) <> 64
    or p_sha256 !~ '^[0-9a-f]{64}$'
  then
    raise exception 'A lowercase SHA-256 hash is required.' using errcode = '22023';
  end if;

  if credential_record.document_status = 'ready' then
    if credential_record.pdf_storage_path = p_storage_path
      and credential_record.pdf_sha256 = p_sha256
    then
      return credential_record.id;
    end if;

    raise exception 'The credential document is already immutable and ready.'
      using errcode = '55000';
  end if;

  update public.issued_credentials
  set
    document_status = 'ready',
    pdf_storage_path = p_storage_path,
    pdf_sha256 = p_sha256
  where issued_credentials.id = credential_record.id;

  if not exists (
    select 1
    from public.credential_audit_log
    where credential_audit_log.credential_id = credential_record.id
      and credential_audit_log.event_type = 'credential_issued'
  ) then
    perform public.append_credential_audit(
      credential_record.id,
      credential_record.completion_id,
      'credential_issued',
      null,
      'system',
      jsonb_build_object('pdf_sha256', p_sha256)
    );
  end if;

  return credential_record.id;
end;
$$;

create or replace function public.mark_credential_document_failed(p_credential_id uuid)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.issued_credentials
  set document_status = 'failed'
  where issued_credentials.id = p_credential_id
    and issued_credentials.document_status <> 'ready';

  if not found then
    raise exception 'Pending credential not found.' using errcode = 'P0001';
  end if;

  return p_credential_id;
end;
$$;

create or replace function public.record_credential_download(
  p_credential_id uuid,
  p_actor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  credential_record public.issued_credentials;
  resolved_actor_role text;
begin
  select *
  into credential_record
  from public.issued_credentials
  where issued_credentials.id = p_credential_id
    and issued_credentials.document_status = 'ready';

  if not found or p_actor_user_id is null then
    raise exception 'Credential document is not available.' using errcode = 'P0001';
  end if;

  if credential_record.user_id = p_actor_user_id then
    resolved_actor_role := 'participant';
  elsif exists (
    select 1
    from public.course_providers
    where course_providers.id = credential_record.issuer_provider_id
      and course_providers.status = 'active'
      and course_providers.verification_status = 'verified'
      and (
        course_providers.owner_user_id = p_actor_user_id
        or exists (
          select 1
          from public.course_provider_members
          where course_provider_members.provider_id = course_providers.id
            and course_provider_members.user_id = p_actor_user_id
            and course_provider_members.status = 'active'
            and course_provider_members.role in ('owner', 'operator')
        )
      )
  ) then
    resolved_actor_role := 'issuer';
  else
    raise exception 'Credential document access is not allowed.' using errcode = '42501';
  end if;

  perform public.append_credential_audit(
    credential_record.id,
    credential_record.completion_id,
    'credential_downloaded',
    p_actor_user_id,
    resolved_actor_role,
    '{}'::jsonb
  );
end;
$$;

revoke all on function public.create_course_credential_internal(uuid, uuid)
from public, anon, authenticated;

revoke all on function public.list_issuer_courses() from public, anon, authenticated;
revoke all on function public.list_course_participants_for_issuer(uuid) from public, anon, authenticated;
revoke all on function public.update_course_enrollment_status_for_issuer(uuid, text)
from public, anon, authenticated;
revoke all on function public.finalize_course_enrollment(uuid, text, numeric, text)
from public, anon, authenticated;
revoke all on function public.issue_course_credential(uuid) from public, anon, authenticated;
revoke all on function public.reissue_course_credential(uuid) from public, anon, authenticated;
revoke all on function public.revoke_credential(uuid, text) from public, anon, authenticated;
revoke all on function public.list_own_credentials() from public, anon, authenticated;
revoke all on function public.get_own_credential_details(uuid) from public, anon, authenticated;
revoke all on function public.list_own_skills() from public, anon, authenticated;
revoke all on function public.set_credential_visibility(uuid, boolean)
from public, anon, authenticated;
revoke all on function public.verify_credential_by_token(text)
from public, anon, authenticated;
revoke all on function public.list_credential_audit(uuid) from public, anon, authenticated;
revoke all on function public.set_course_skills(uuid, uuid[]) from public, anon, authenticated;
revoke all on function public.can_access_credential_document(uuid)
from public, anon, authenticated;
revoke all on function public.complete_credential_document(uuid, text, text)
from public, anon, authenticated;
revoke all on function public.mark_credential_document_failed(uuid)
from public, anon, authenticated;
revoke all on function public.record_credential_download(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.list_issuer_courses() to authenticated;
grant execute on function public.list_course_participants_for_issuer(uuid) to authenticated;
grant execute on function public.update_course_enrollment_status_for_issuer(uuid, text)
to authenticated;
grant execute on function public.finalize_course_enrollment(uuid, text, numeric, text)
to authenticated;
grant execute on function public.issue_course_credential(uuid) to authenticated;
grant execute on function public.reissue_course_credential(uuid) to authenticated;
grant execute on function public.revoke_credential(uuid, text) to authenticated;
grant execute on function public.list_own_credentials() to authenticated;
grant execute on function public.get_own_credential_details(uuid) to authenticated;
grant execute on function public.list_own_skills() to authenticated;
grant execute on function public.set_credential_visibility(uuid, boolean) to authenticated;
grant execute on function public.verify_credential_by_token(text) to anon, authenticated;
grant execute on function public.list_credential_audit(uuid) to authenticated;
grant execute on function public.set_course_skills(uuid, uuid[]) to authenticated;
grant execute on function public.can_access_credential_document(uuid) to authenticated;

grant execute on function public.complete_credential_document(uuid, text, text) to service_role;
grant execute on function public.mark_credential_document_failed(uuid) to service_role;
grant execute on function public.record_credential_download(uuid, uuid) to service_role;

comment on function public.finalize_course_enrollment(uuid, text, numeric, text) is
  'Finalizes one accepted enrollment. Course, participant, provider and actor are derived server-side.';

comment on function public.issue_course_credential(uuid) is
  'Idempotently creates an immutable pending credential for a passed completion owned by the active verified issuer.';

comment on function public.verify_credential_by_token(text) is
  'Public capability-token verification. Returns only an explicitly public credential snapshot and no private identifiers.';

comment on function public.can_access_credential_document(uuid) is
  'Authorization gate used by the signed-URL Edge Function. It never returns a Storage path.';
