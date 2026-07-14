drop policy if exists companies_insert_own on public.companies;
drop policy if exists companies_update_own on public.companies;

create policy companies_insert_own
on public.companies
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and status in ('draft', 'pending')
);

create policy companies_update_own
on public.companies
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (
  profile_id = (select auth.uid())
  and status in ('draft', 'pending')
);

revoke insert (profile_id, name, status) on public.companies from authenticated;
revoke update (name, status) on public.companies from authenticated;

grant insert (profile_id, name) on public.companies to authenticated;
grant update (name) on public.companies to authenticated;
