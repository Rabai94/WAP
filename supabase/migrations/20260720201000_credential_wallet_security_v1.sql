create or replace function public.can_view_course_provider(p_provider_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.course_providers
      where course_providers.id = p_provider_id
        and (
          course_providers.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.course_provider_members
            where course_provider_members.provider_id = course_providers.id
              and course_provider_members.user_id = auth.uid()
              and course_provider_members.status = 'active'
              and course_provider_members.role in ('owner', 'operator', 'viewer')
          )
        )
    );
$$;

create or replace function public.can_manage_course_provider(p_provider_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.course_providers
      where course_providers.id = p_provider_id
        and course_providers.status = 'active'
        and course_providers.verification_status = 'verified'
        and (
          course_providers.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.course_provider_members
            where course_provider_members.provider_id = course_providers.id
              and course_provider_members.user_id = auth.uid()
              and course_provider_members.status = 'active'
              and course_provider_members.role in ('owner', 'operator')
          )
        )
    );
$$;

revoke all on function public.can_view_course_provider(uuid) from public, anon, authenticated;
revoke all on function public.can_manage_course_provider(uuid) from public, anon, authenticated;
grant execute on function public.can_view_course_provider(uuid) to authenticated;
grant execute on function public.can_manage_course_provider(uuid) to authenticated;

alter table public.course_provider_members enable row level security;
alter table public.skills enable row level security;
alter table public.course_skills enable row level security;
alter table public.course_completions enable row level security;
alter table public.issued_credentials enable row level security;
alter table public.credential_skills enable row level security;
alter table public.user_skills enable row level security;
alter table public.credential_audit_log enable row level security;

drop policy if exists course_provider_members_select_authorized on public.course_provider_members;
create policy course_provider_members_select_authorized
on public.course_provider_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.course_providers
    where course_providers.id = course_provider_members.provider_id
      and course_providers.owner_user_id = (select auth.uid())
  )
);

drop policy if exists skills_select_active on public.skills;
create policy skills_select_active
on public.skills
for select
to anon, authenticated
using (is_active);

drop policy if exists course_skills_select_public_courses on public.course_skills;
drop policy if exists course_skills_select_provider on public.course_skills;

create policy course_skills_select_public_courses
on public.course_skills
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.courses
    join public.course_providers
      on course_providers.id = courses.provider_id
    where courses.id = course_skills.course_id
      and courses.status = 'published'
      and course_providers.status = 'active'
      and course_providers.verification_status = 'verified'
  )
);

create policy course_skills_select_provider
on public.course_skills
for select
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_skills.course_id
      and public.can_view_course_provider(courses.provider_id)
  )
);

drop policy if exists course_completions_select_participant on public.course_completions;
drop policy if exists course_completions_select_issuer on public.course_completions;

create policy course_completions_select_participant
on public.course_completions
for select
to authenticated
using (user_id = (select auth.uid()));

create policy course_completions_select_issuer
on public.course_completions
for select
to authenticated
using (public.can_view_course_provider(issuer_provider_id));

drop policy if exists issued_credentials_select_participant on public.issued_credentials;
drop policy if exists issued_credentials_select_issuer on public.issued_credentials;

create policy issued_credentials_select_participant
on public.issued_credentials
for select
to authenticated
using (user_id = (select auth.uid()));

create policy issued_credentials_select_issuer
on public.issued_credentials
for select
to authenticated
using (public.can_view_course_provider(issuer_provider_id));

drop policy if exists credential_skills_select_participant on public.credential_skills;
drop policy if exists credential_skills_select_issuer on public.credential_skills;

create policy credential_skills_select_participant
on public.credential_skills
for select
to authenticated
using (
  exists (
    select 1
    from public.issued_credentials
    where issued_credentials.id = credential_skills.credential_id
      and issued_credentials.user_id = (select auth.uid())
  )
);

create policy credential_skills_select_issuer
on public.credential_skills
for select
to authenticated
using (
  exists (
    select 1
    from public.issued_credentials
    where issued_credentials.id = credential_skills.credential_id
      and public.can_view_course_provider(issued_credentials.issuer_provider_id)
  )
);

drop policy if exists user_skills_select_own on public.user_skills;
create policy user_skills_select_own
on public.user_skills
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists credential_audit_log_select_participant on public.credential_audit_log;
drop policy if exists credential_audit_log_select_issuer on public.credential_audit_log;

create policy credential_audit_log_select_participant
on public.credential_audit_log
for select
to authenticated
using (
  exists (
    select 1
    from public.issued_credentials
    where issued_credentials.id = credential_audit_log.credential_id
      and issued_credentials.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.course_completions
    where course_completions.id = credential_audit_log.completion_id
      and course_completions.user_id = (select auth.uid())
  )
);

create policy credential_audit_log_select_issuer
on public.credential_audit_log
for select
to authenticated
using (
  exists (
    select 1
    from public.issued_credentials
    where issued_credentials.id = credential_audit_log.credential_id
      and public.can_view_course_provider(issued_credentials.issuer_provider_id)
  )
  or exists (
    select 1
    from public.course_completions
    where course_completions.id = credential_audit_log.completion_id
      and public.can_view_course_provider(course_completions.issuer_provider_id)
  )
);

revoke all on public.course_provider_members from anon, authenticated;
revoke all on public.skills from anon, authenticated;
revoke all on public.course_skills from anon, authenticated;
revoke all on public.course_completions from anon, authenticated;
revoke all on public.issued_credentials from anon, authenticated;
revoke all on public.credential_skills from anon, authenticated;
revoke all on public.user_skills from anon, authenticated;
revoke all on public.credential_audit_log from anon, authenticated;

grant select (provider_id, user_id, role, status, created_at)
on public.course_provider_members to authenticated;

grant select (id, slug, name_ro, name_de, name_en, description)
on public.skills to anon, authenticated;

grant select (course_id, skill_id)
on public.course_skills to anon, authenticated;

-- Sensitive credential tables intentionally receive no direct browser grants.
-- All reads and every mutation go through the narrowly-scoped RPCs below.

drop policy if exists credential_pdfs_direct_select on storage.objects;
drop policy if exists credential_pdfs_direct_insert on storage.objects;
drop policy if exists credential_pdfs_direct_update on storage.objects;
drop policy if exists credential_pdfs_direct_delete on storage.objects;

comment on function public.can_manage_course_provider(uuid) is
  'True only for an authenticated owner or active operator of an active, verified course provider.';

comment on table public.course_provider_members is
  'Trusted provider membership registry. V1 membership writes remain admin/trusted-workflow only.';

revoke all on function public.set_credential_wallet_updated_at()
from public, anon, authenticated;
revoke all on function public.protect_issued_credential_snapshot()
from public, anon, authenticated;
revoke all on function public.protect_append_only_credential_record()
from public, anon, authenticated;
