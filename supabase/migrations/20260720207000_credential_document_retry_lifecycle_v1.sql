-- Credential document lifecycle:
-- pending (unclaimed or actively generating) -> ready | failed
-- failed -> pending only through the issuer-scoped retry RPC
-- ready is terminal. Credential status and document status remain separate.

alter table public.issued_credentials
  add column if not exists document_error_code text,
  add column if not exists document_generation_attempt_id uuid,
  add column if not exists document_generation_attempts integer not null default 0,
  add column if not exists document_generation_started_at timestamptz,
  add column if not exists document_failed_at timestamptz,
  add column if not exists document_ready_at timestamptz;

-- Normalize historical rows before installing the stricter lifecycle checks.
update public.issued_credentials
set
  document_error_code = case
    when document_status = 'failed'
      then coalesce(document_error_code, 'generation_failed')
    else null
  end,
  document_generation_attempt_id = null,
  document_generation_attempts = case
    when document_status in ('failed', 'ready')
      then greatest(document_generation_attempts, 1)
    else document_generation_attempts
  end,
  document_generation_started_at = case
    when document_status in ('failed', 'ready')
      then coalesce(document_generation_started_at, issued_at)
    else null
  end,
  document_failed_at = case
    when document_status = 'failed'
      then coalesce(document_failed_at, updated_at, issued_at)
    else null
  end,
  document_ready_at = case
    when document_status = 'ready'
      then coalesce(document_ready_at, updated_at, issued_at)
    else null
  end,
  pdf_storage_path = case
    when document_status = 'ready' then pdf_storage_path
    else null
  end,
  pdf_sha256 = case
    when document_status = 'ready' then pdf_sha256
    else null
  end,
  is_public = case
    when document_status = 'ready' then is_public
    else false
  end;

alter table public.issued_credentials
  drop constraint if exists issued_credentials_document_attempts_check;
alter table public.issued_credentials
  add constraint issued_credentials_document_attempts_check check (
    document_generation_attempts >= 0
  );

alter table public.issued_credentials
  drop constraint if exists issued_credentials_document_error_code_check;
alter table public.issued_credentials
  add constraint issued_credentials_document_error_code_check check (
    document_error_code is null
    or (
      char_length(document_error_code) between 1 and 64
      and document_error_code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
    )
  );

alter table public.issued_credentials
  drop constraint if exists issued_credentials_document_lifecycle_check;
alter table public.issued_credentials
  add constraint issued_credentials_document_lifecycle_check check (
    (
      document_status = 'pending'
      and pdf_storage_path is null
      and pdf_sha256 is null
      and document_error_code is null
      and document_failed_at is null
      and document_ready_at is null
      and (
        (
          document_generation_attempt_id is null
          and document_generation_started_at is null
        )
        or (
          document_generation_attempt_id is not null
          and document_generation_started_at is not null
        )
      )
    )
    or (
      document_status = 'failed'
      and pdf_storage_path is null
      and pdf_sha256 is null
      and document_error_code is not null
      and document_generation_attempt_id is null
      and document_generation_started_at is not null
      and document_failed_at is not null
      and document_ready_at is null
    )
    or (
      document_status = 'ready'
      and pdf_storage_path is not null
      and pdf_sha256 is not null
      and document_error_code is null
      and document_generation_attempt_id is null
      and document_generation_started_at is not null
      and document_failed_at is null
      and document_ready_at is not null
    )
  );

alter table public.issued_credentials
  drop constraint if exists issued_credentials_document_visibility_check;
alter table public.issued_credentials
  add constraint issued_credentials_document_visibility_check check (
    document_status = 'ready' or is_public = false
  );

-- Extend, never replace, the audit vocabulary. credential_issued remains the
-- compatibility event for a fully ready document.
alter table public.credential_audit_log
  drop constraint if exists credential_audit_log_event_type_check;
alter table public.credential_audit_log
  add constraint credential_audit_log_event_type_check check (
    event_type in (
      'course_completed',
      'credential_created',
      'document_generation_started',
      'document_generation_failed',
      'document_generation_retried',
      'document_ready',
      'credential_issued',
      'credential_downloaded',
      'visibility_changed',
      'credential_revoked',
      'credential_reissued'
    )
  );

-- Preserve a coherent lifecycle for credentials created before this migration.
insert into public.credential_audit_log (
  credential_id,
  completion_id,
  event_type,
  actor_user_id,
  actor_role,
  metadata,
  created_at
)
select
  issued_credentials.id,
  issued_credentials.completion_id,
  'credential_created',
  null,
  'system',
  jsonb_build_object('backfilled', true, 'version', issued_credentials.version),
  issued_credentials.created_at
from public.issued_credentials
where not exists (
  select 1
  from public.credential_audit_log
  where credential_audit_log.credential_id = issued_credentials.id
    and credential_audit_log.event_type = 'credential_created'
);

insert into public.credential_audit_log (
  credential_id,
  completion_id,
  event_type,
  actor_user_id,
  actor_role,
  metadata,
  created_at
)
select
  issued_credentials.id,
  issued_credentials.completion_id,
  'document_generation_started',
  null,
  'system',
  jsonb_build_object('backfilled', true),
  issued_credentials.document_generation_started_at
from public.issued_credentials
where issued_credentials.document_generation_started_at is not null
  and not exists (
    select 1
    from public.credential_audit_log
    where credential_audit_log.credential_id = issued_credentials.id
      and credential_audit_log.event_type = 'document_generation_started'
  );

insert into public.credential_audit_log (
  credential_id,
  completion_id,
  event_type,
  actor_user_id,
  actor_role,
  metadata,
  created_at
)
select
  issued_credentials.id,
  issued_credentials.completion_id,
  'document_generation_failed',
  null,
  'system',
  jsonb_build_object(
    'backfilled', true,
    'error_code', issued_credentials.document_error_code
  ),
  issued_credentials.document_failed_at
from public.issued_credentials
where issued_credentials.document_status = 'failed'
  and not exists (
    select 1
    from public.credential_audit_log
    where credential_audit_log.credential_id = issued_credentials.id
      and credential_audit_log.event_type = 'document_generation_failed'
  );

insert into public.credential_audit_log (
  credential_id,
  completion_id,
  event_type,
  actor_user_id,
  actor_role,
  metadata,
  created_at
)
select
  issued_credentials.id,
  issued_credentials.completion_id,
  'document_ready',
  null,
  'system',
  jsonb_build_object('backfilled', true),
  issued_credentials.document_ready_at
from public.issued_credentials
where issued_credentials.document_status = 'ready'
  and not exists (
    select 1
    from public.credential_audit_log
    where credential_audit_log.credential_id = issued_credentials.id
      and credential_audit_log.event_type = 'document_ready'
  );

create or replace function public.record_credential_created()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.append_credential_audit(
    new.id,
    new.completion_id,
    'credential_created',
    auth.uid(),
    case when auth.uid() is null then 'system' else 'issuer' end,
    jsonb_build_object('version', new.version)
  );

  return new;
end;
$$;

drop trigger if exists issued_credentials_record_created
on public.issued_credentials;
create trigger issued_credentials_record_created
after insert on public.issued_credentials
for each row execute function public.record_credential_created();

create or replace function public.protect_credential_document_lifecycle()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if old.document_status = 'ready'
    and (
      new.document_status is distinct from old.document_status
      or new.pdf_storage_path is distinct from old.pdf_storage_path
      or new.pdf_sha256 is distinct from old.pdf_sha256
      or new.document_error_code is distinct from old.document_error_code
      or new.document_generation_attempt_id is distinct from old.document_generation_attempt_id
      or new.document_generation_attempts is distinct from old.document_generation_attempts
      or new.document_generation_started_at is distinct from old.document_generation_started_at
      or new.document_failed_at is distinct from old.document_failed_at
      or new.document_ready_at is distinct from old.document_ready_at
    )
  then
    raise exception 'A ready credential document is immutable.'
      using errcode = '55000';
  end if;

  if old.document_status = 'failed'
    and new.document_status not in ('failed', 'pending')
  then
    raise exception 'A failed credential document can only return to pending.'
      using errcode = '55000';
  end if;

  if new.document_generation_attempts < old.document_generation_attempts then
    raise exception 'Credential document attempt history cannot decrease.'
      using errcode = '55000';
  end if;

  if old.document_status = 'pending'
    and old.document_generation_attempt_id is not null
    and new.document_status = 'pending'
    and new.document_generation_attempt_id is distinct from old.document_generation_attempt_id
  then
    raise exception 'An active credential document attempt cannot be replaced.'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists issued_credentials_protect_document_lifecycle
on public.issued_credentials;
create trigger issued_credentials_protect_document_lifecycle
before update on public.issued_credentials
for each row execute function public.protect_credential_document_lifecycle();

create or replace function public.retry_credential_document_generation(
  p_credential_id uuid
)
returns table (
  credential_id uuid,
  completion_id uuid
)
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
  for update;

  if not found
    or not public.can_manage_course_provider(credential_record.issuer_provider_id)
  then
    raise exception 'Credential not found for an active verified academy.'
      using errcode = 'P0001';
  end if;

  if credential_record.status = 'revoked' then
    raise exception 'A revoked credential cannot retry document generation.'
      using errcode = '55000';
  end if;

  if credential_record.document_status = 'ready' then
    raise exception 'The credential document is already ready.'
      using errcode = '55000';
  end if;

  if credential_record.document_status = 'failed' then
    update public.issued_credentials
    set
      document_status = 'pending',
      document_error_code = null,
      document_generation_attempt_id = null,
      document_generation_started_at = null,
      document_failed_at = null,
      document_ready_at = null,
      is_public = false
    where issued_credentials.id = credential_record.id;

    perform public.append_credential_audit(
      credential_record.id,
      credential_record.completion_id,
      'document_generation_retried',
      auth.uid(),
      'issuer',
      jsonb_build_object(
        'previous_attempts', credential_record.document_generation_attempts
      )
    );
  end if;

  return query values (
    credential_record.id,
    credential_record.completion_id
  );
end;
$$;

create or replace function public.claim_credential_document_generation(
  p_credential_id uuid
)
returns table (
  credential_id uuid,
  completion_id uuid,
  attempt_id uuid,
  document_status text
)
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  credential_record public.issued_credentials;
  created_attempt_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
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

  if credential_record.status <> 'valid' then
    raise exception 'A revoked credential document cannot be generated.'
      using errcode = '55000';
  end if;

  if credential_record.document_status = 'ready' then
    return query values (
      credential_record.id,
      credential_record.completion_id,
      null::uuid,
      'ready'::text
    );
    return;
  end if;

  if credential_record.document_status = 'failed' then
    raise exception 'Retry the failed credential document before generation.'
      using errcode = '55000';
  end if;

  if credential_record.document_generation_attempt_id is not null then
    raise exception 'Credential document generation is already in progress.'
      using errcode = '55000';
  end if;

  created_attempt_id := extensions.gen_random_uuid();

  update public.issued_credentials
  set
    document_generation_attempt_id = created_attempt_id,
    document_generation_attempts = document_generation_attempts + 1,
    document_generation_started_at = now(),
    document_error_code = null,
    document_failed_at = null,
    document_ready_at = null,
    is_public = false
  where issued_credentials.id = credential_record.id;

  perform public.append_credential_audit(
    credential_record.id,
    credential_record.completion_id,
    'document_generation_started',
    auth.uid(),
    'issuer',
    jsonb_build_object(
      'attempt', credential_record.document_generation_attempts + 1
    )
  );

  return query values (
    credential_record.id,
    credential_record.completion_id,
    created_attempt_id,
    'pending'::text
  );
end;
$$;

create or replace function public.complete_credential_document(
  p_credential_id uuid,
  p_attempt_id uuid,
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

  if credential_record.status <> 'valid'
    or credential_record.document_status <> 'pending'
    or credential_record.document_generation_attempt_id is distinct from p_attempt_id
  then
    raise exception 'Credential document attempt is no longer current.'
      using errcode = '55000';
  end if;

  update public.issued_credentials
  set
    document_status = 'ready',
    pdf_storage_path = p_storage_path,
    pdf_sha256 = p_sha256,
    document_error_code = null,
    document_generation_attempt_id = null,
    document_failed_at = null,
    document_ready_at = now(),
    is_public = false
  where issued_credentials.id = credential_record.id;

  perform public.append_credential_audit(
    credential_record.id,
    credential_record.completion_id,
    'document_ready',
    null,
    'system',
    jsonb_build_object('attempt', credential_record.document_generation_attempts)
  );

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

create or replace function public.mark_credential_document_failed(
  p_credential_id uuid,
  p_attempt_id uuid,
  p_error_code text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  credential_record public.issued_credentials;
  normalized_error_code text;
begin
  select *
  into credential_record
  from public.issued_credentials
  where issued_credentials.id = p_credential_id
  for update;

  if not found then
    raise exception 'Credential not found.' using errcode = 'P0001';
  end if;

  if credential_record.document_status = 'ready' then
    return credential_record.id;
  end if;

  if credential_record.document_status = 'failed'
    and credential_record.document_generation_attempt_id is null
  then
    return credential_record.id;
  end if;

  if credential_record.document_status <> 'pending'
    or credential_record.document_generation_attempt_id is distinct from p_attempt_id
  then
    raise exception 'Credential document attempt is no longer current.'
      using errcode = '55000';
  end if;

  normalized_error_code := lower(btrim(coalesce(p_error_code, '')));
  if normalized_error_code = ''
    or char_length(normalized_error_code) > 64
    or normalized_error_code !~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
  then
    normalized_error_code := 'generation_failed';
  end if;

  update public.issued_credentials
  set
    document_status = 'failed',
    document_error_code = normalized_error_code,
    document_generation_attempt_id = null,
    document_failed_at = now(),
    document_ready_at = null,
    pdf_storage_path = null,
    pdf_sha256 = null,
    is_public = false
  where issued_credentials.id = credential_record.id;

  perform public.append_credential_audit(
    credential_record.id,
    credential_record.completion_id,
    'document_generation_failed',
    null,
    'system',
    jsonb_build_object(
      'attempt', credential_record.document_generation_attempts,
      'error_code', normalized_error_code
    )
  );

  return credential_record.id;
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

  if p_is_public and credential_record.document_status <> 'ready' then
    raise exception 'A credential cannot be public before its document is ready.'
      using errcode = '55000';
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
    and issued_credentials.document_status = 'ready'
  limit 1;
end;
$$;

-- The original service-only signatures cannot bind a generation attempt and
-- are intentionally retired without dropping them during a rolling deploy.
revoke all on function public.complete_credential_document(uuid, text, text)
from public, anon, authenticated, service_role;
revoke all on function public.mark_credential_document_failed(uuid)
from public, anon, authenticated, service_role;

revoke all on function public.record_credential_created()
from public, anon, authenticated;
revoke all on function public.protect_credential_document_lifecycle()
from public, anon, authenticated;
revoke all on function public.retry_credential_document_generation(uuid)
from public, anon, authenticated;
revoke all on function public.claim_credential_document_generation(uuid)
from public, anon, authenticated;
revoke all on function public.complete_credential_document(uuid, uuid, text, text)
from public, anon, authenticated, service_role;
revoke all on function public.mark_credential_document_failed(uuid, uuid, text)
from public, anon, authenticated, service_role;
revoke all on function public.set_credential_visibility(uuid, boolean)
from public, anon, authenticated;
revoke all on function public.verify_credential_by_token(text)
from public, anon, authenticated;

grant execute on function public.retry_credential_document_generation(uuid)
to authenticated;
grant execute on function public.claim_credential_document_generation(uuid)
to authenticated;
grant execute on function public.complete_credential_document(uuid, uuid, text, text)
to service_role;
grant execute on function public.mark_credential_document_failed(uuid, uuid, text)
to service_role;
grant execute on function public.set_credential_visibility(uuid, boolean)
to authenticated;
grant execute on function public.verify_credential_by_token(text)
to anon, authenticated;

revoke update on table public.issued_credentials from anon, authenticated;

comment on function public.retry_credential_document_generation(uuid) is
  'Idempotently resets an issuer-owned failed document to pending without creating a credential version.';
comment on function public.claim_credential_document_generation(uuid) is
  'Atomically claims one current PDF generation attempt for an authorized active verified issuer.';
comment on function public.complete_credential_document(uuid, uuid, text, text) is
  'Service-only idempotent completion for the current PDF generation attempt and deterministic storage path.';
comment on function public.mark_credential_document_failed(uuid, uuid, text) is
  'Service-only idempotent failure transition for the current PDF generation attempt.';
comment on function public.verify_credential_by_token(text) is
  'Returns only explicitly public credentials whose private PDF document is ready.';
