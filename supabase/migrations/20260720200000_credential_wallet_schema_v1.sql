create extension if not exists pgcrypto with schema extensions;

create table if not exists public.course_provider_members (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.course_providers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'viewer',
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_provider_members_provider_user_unique unique (provider_id, user_id),
  constraint course_provider_members_role_check check (
    role in ('owner', 'operator', 'viewer')
  ),
  constraint course_provider_members_status_check check (
    status in ('active', 'inactive')
  )
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ro text not null,
  name_de text not null,
  name_en text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_slug_check check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create table if not exists public.course_skills (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint course_skills_course_skill_unique unique (course_id, skill_id)
);

create table if not exists public.course_completions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  issuer_provider_id uuid not null references public.course_providers(id) on delete restrict,
  outcome text not null,
  score numeric(5, 2),
  notes text,
  completed_at timestamptz not null default now(),
  completed_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_completions_enrollment_unique unique (enrollment_id),
  constraint course_completions_outcome_check check (
    outcome in ('passed', 'failed', 'abandoned')
  ),
  constraint course_completions_score_check check (
    score is null or (score >= 0 and score <= 100)
  ),
  constraint course_completions_notes_check check (
    notes is null or char_length(notes) <= 2000
  )
);

create table if not exists public.issued_credentials (
  id uuid primary key default gen_random_uuid(),
  credential_number text not null unique,
  completion_id uuid not null references public.course_completions(id) on delete restrict,
  enrollment_id uuid not null references public.course_enrollments(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  issuer_provider_id uuid not null references public.course_providers(id) on delete restrict,
  title text not null,
  participant_display_name text not null,
  course_title text not null,
  issuer_name text not null,
  course_start_date date,
  course_end_date date,
  duration_value integer,
  duration_unit text,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'valid',
  verification_token text not null unique,
  document_status text not null default 'pending',
  pdf_storage_path text,
  pdf_sha256 text,
  is_public boolean not null default false,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  revoked_reason text,
  replaces_credential_id uuid references public.issued_credentials(id) on delete restrict,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  constraint issued_credentials_completion_version_unique unique (completion_id, version),
  constraint issued_credentials_status_check check (
    status in ('valid', 'revoked')
  ),
  constraint issued_credentials_document_status_check check (
    document_status in ('pending', 'ready', 'failed')
  ),
  constraint issued_credentials_version_check check (version > 0),
  constraint issued_credentials_duration_check check (
    duration_value is null or duration_value > 0
  ),
  constraint issued_credentials_token_check check (
    char_length(verification_token) = 64
    and verification_token ~ '^[0-9a-f]{64}$'
  ),
  constraint issued_credentials_pdf_hash_check check (
    pdf_sha256 is null
    or (
      char_length(pdf_sha256) = 64
      and pdf_sha256 ~ '^[0-9a-f]{64}$'
    )
  ),
  constraint issued_credentials_document_ready_check check (
    document_status <> 'ready'
    or (pdf_storage_path is not null and pdf_sha256 is not null)
  ),
  constraint issued_credentials_revocation_check check (
    (
      status = 'valid'
      and revoked_at is null
      and revoked_by is null
      and revoked_reason is null
    )
    or (
      status = 'revoked'
      and revoked_at is not null
      and revoked_reason is not null
      and char_length(revoked_reason) between 5 and 1000
    )
  )
);

create unique index if not exists issued_credentials_one_valid_per_completion_idx
on public.issued_credentials (completion_id)
where status = 'valid';

create table if not exists public.credential_skills (
  id uuid primary key default gen_random_uuid(),
  credential_id uuid not null references public.issued_credentials(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  skill_slug text not null,
  skill_name_ro text not null,
  skill_name_de text not null,
  skill_name_en text not null,
  created_at timestamptz not null default now(),
  constraint credential_skills_credential_skill_unique unique (credential_id, skill_id)
);

create table if not exists public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  source_type text not null,
  credential_id uuid references public.issued_credentials(id) on delete restrict,
  issuer_provider_id uuid references public.course_providers(id) on delete restrict,
  obtained_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'valid',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_skills_source_type_check check (
    source_type in ('self_declared', 'course_credential', 'organization_verified')
  ),
  constraint user_skills_status_check check (
    status in ('valid', 'revoked', 'expired')
  ),
  constraint user_skills_source_consistency_check check (
    (
      source_type = 'self_declared'
      and credential_id is null
      and issuer_provider_id is null
      and is_verified = false
    )
    or (
      source_type = 'course_credential'
      and credential_id is not null
      and issuer_provider_id is not null
      and is_verified = true
    )
    or (
      source_type = 'organization_verified'
      and credential_id is null
      and issuer_provider_id is not null
      and is_verified = true
    )
  )
);

create unique index if not exists user_skills_credential_source_unique_idx
on public.user_skills (user_id, skill_id, credential_id)
where credential_id is not null;

create unique index if not exists user_skills_self_declared_unique_idx
on public.user_skills (user_id, skill_id)
where source_type = 'self_declared';

create table if not exists public.credential_audit_log (
  id bigint generated always as identity primary key,
  credential_id uuid references public.issued_credentials(id) on delete restrict,
  completion_id uuid references public.course_completions(id) on delete restrict,
  event_type text not null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_role text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint credential_audit_log_event_type_check check (
    event_type in (
      'course_completed',
      'credential_issued',
      'credential_downloaded',
      'visibility_changed',
      'credential_revoked',
      'credential_reissued'
    )
  ),
  constraint credential_audit_log_actor_role_check check (
    actor_role in ('participant', 'issuer', 'system')
  ),
  constraint credential_audit_log_target_check check (
    credential_id is not null or completion_id is not null
  )
);

create index if not exists course_provider_members_provider_idx
on public.course_provider_members (provider_id, status, role);

create index if not exists course_provider_members_user_idx
on public.course_provider_members (user_id, status);

create index if not exists course_skills_course_idx
on public.course_skills (course_id);

create index if not exists course_completions_course_idx
on public.course_completions (course_id, completed_at desc);

create index if not exists course_completions_user_idx
on public.course_completions (user_id, completed_at desc);

create index if not exists issued_credentials_user_idx
on public.issued_credentials (user_id, issued_at desc);

create index if not exists issued_credentials_issuer_idx
on public.issued_credentials (issuer_provider_id, issued_at desc);

create index if not exists issued_credentials_token_idx
on public.issued_credentials (verification_token);

create index if not exists credential_skills_credential_idx
on public.credential_skills (credential_id);

create index if not exists user_skills_user_status_idx
on public.user_skills (user_id, status, obtained_at desc);

create index if not exists credential_audit_log_credential_idx
on public.credential_audit_log (credential_id, created_at desc);

create index if not exists credential_audit_log_completion_idx
on public.credential_audit_log (completion_id, created_at desc);

create or replace function public.set_credential_wallet_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists course_provider_members_set_updated_at on public.course_provider_members;
create trigger course_provider_members_set_updated_at
before update on public.course_provider_members
for each row execute function public.set_credential_wallet_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
before update on public.skills
for each row execute function public.set_credential_wallet_updated_at();

drop trigger if exists course_completions_set_updated_at on public.course_completions;
create trigger course_completions_set_updated_at
before update on public.course_completions
for each row execute function public.set_credential_wallet_updated_at();

drop trigger if exists user_skills_set_updated_at on public.user_skills;
create trigger user_skills_set_updated_at
before update on public.user_skills
for each row execute function public.set_credential_wallet_updated_at();

create or replace function public.protect_issued_credential_snapshot()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.credential_number is distinct from old.credential_number
    or new.completion_id is distinct from old.completion_id
    or new.enrollment_id is distinct from old.enrollment_id
    or new.course_id is distinct from old.course_id
    or new.user_id is distinct from old.user_id
    or new.issuer_provider_id is distinct from old.issuer_provider_id
    or new.title is distinct from old.title
    or new.participant_display_name is distinct from old.participant_display_name
    or new.course_title is distinct from old.course_title
    or new.issuer_name is distinct from old.issuer_name
    or new.course_start_date is distinct from old.course_start_date
    or new.course_end_date is distinct from old.course_end_date
    or new.duration_value is distinct from old.duration_value
    or new.duration_unit is distinct from old.duration_unit
    or new.issued_at is distinct from old.issued_at
    or new.expires_at is distinct from old.expires_at
    or new.verification_token is distinct from old.verification_token
    or new.replaces_credential_id is distinct from old.replaces_credential_id
    or new.version is distinct from old.version
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Issued credential snapshot fields are immutable.'
      using errcode = '55000';
  end if;

  if old.status = 'revoked' and new.status <> 'revoked' then
    raise exception 'A revoked credential cannot become valid again.'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists issued_credentials_protect_snapshot on public.issued_credentials;
create trigger issued_credentials_protect_snapshot
before update on public.issued_credentials
for each row execute function public.protect_issued_credential_snapshot();

create or replace function public.protect_append_only_credential_record()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception 'Credential history is append-only.'
    using errcode = '55000';
end;
$$;

drop trigger if exists course_completions_prevent_delete on public.course_completions;
create trigger course_completions_prevent_delete
before delete on public.course_completions
for each row execute function public.protect_append_only_credential_record();

drop trigger if exists issued_credentials_prevent_delete on public.issued_credentials;
create trigger issued_credentials_prevent_delete
before delete on public.issued_credentials
for each row execute function public.protect_append_only_credential_record();

drop trigger if exists credential_skills_prevent_change on public.credential_skills;
create trigger credential_skills_prevent_change
before update or delete on public.credential_skills
for each row execute function public.protect_append_only_credential_record();

drop trigger if exists credential_audit_log_prevent_change on public.credential_audit_log;
create trigger credential_audit_log_prevent_change
before update or delete on public.credential_audit_log
for each row execute function public.protect_append_only_credential_record();

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'credential-pdfs',
  'credential-pdfs',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.course_completions is
  'Immutable server-derived course outcomes. Course, user and issuer are copied from the accepted enrollment.';

comment on table public.issued_credentials is
  'Immutable credential snapshots. Only visibility, document lifecycle and one-way revocation fields may change.';

comment on table public.credential_audit_log is
  'Append-only audit events for completion, issuance, access, visibility, revocation and reissue.';

comment on table public.user_skills is
  'Skill provenance records. Revoked credential sources are retained and marked revoked instead of deleted.';

comment on column public.issued_credentials.pdf_storage_path is
  'Private Storage object path. Never return this column to browser/mobile clients.';
