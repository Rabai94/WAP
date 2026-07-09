# RabAI Admin Role

Admin access is granted only through Supabase Auth `app_metadata`, stored in
`auth.users.raw_app_meta_data`. Do not assign admin from frontend code,
`user_metadata`, local storage, route params, or signup input.

Run these statements only from a trusted Supabase SQL context.

## Grant Admin To Founder

```sql
update auth.users
set raw_app_meta_data = jsonb_set(
  jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"',
    true
  ),
  '{roles}',
  (
    select jsonb_agg(distinct value)
    from (
      select jsonb_array_elements_text(
        case
          when jsonb_typeof(coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb)) = 'array'
            then coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb)
          else '[]'::jsonb
        end
      ) as value
      union
      select 'admin'
    ) roles
  ),
  true
)
where email = 'chirasorin12@gmail.com';
```

## Grant Admin To Another Email

Replace `person@example.com` with the target user's email.

```sql
update auth.users
set raw_app_meta_data = jsonb_set(
  jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"',
    true
  ),
  '{roles}',
  (
    select jsonb_agg(distinct value)
    from (
      select jsonb_array_elements_text(
        case
          when jsonb_typeof(coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb)) = 'array'
            then coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb)
          else '[]'::jsonb
        end
      ) as value
      union
      select 'admin'
    ) roles
  ),
  true
)
where email = 'person@example.com';
```

## Remove Admin

Replace `person@example.com` with the target user's email.

```sql
update auth.users
set raw_app_meta_data = jsonb_set(
  case
    when raw_app_meta_data ->> 'role' = 'admin'
      then coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
    else coalesce(raw_app_meta_data, '{}'::jsonb)
  end,
  '{roles}',
  coalesce(
    (
      select jsonb_agg(value)
      from jsonb_array_elements_text(
        case
          when jsonb_typeof(coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb)) = 'array'
            then coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb)
          else '[]'::jsonb
        end
      ) roles(value)
      where value <> 'admin'
    ),
    '[]'::jsonb
  ),
  true
)
where email = 'person@example.com';
```

## Security Warning

Never use the Supabase service role key in the Expo mobile app or any
browser/web client. That privileged key bypasses row-level security and must
stay only in trusted server-side environments.
