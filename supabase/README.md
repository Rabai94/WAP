# Supabase CLI setup for RabAI

This folder is reserved for Supabase CLI configuration, migrations, and Edge Functions. Do not store Supabase secrets here.

## Link the local project to remote Supabase

Install the Supabase CLI first if `supabase --version` is not available.

From the repository root:

```bash
supabase login
supabase init
supabase link --project-ref <your-project-ref>
```

Use the project reference from the Supabase Dashboard URL or project settings. Do not put the database password or service role key in code.

## Create migrations

Create a migration from the repository root:

```bash
supabase migration new <migration_name>
```

Edit the generated SQL file under `supabase/migrations/`. Keep migrations reviewable and scoped.

## Push migrations

Only push after review and explicit approval:

```bash
supabase db push
```

Do not run `supabase db push` until the intended schema changes are reviewed.

## Create Edge Functions

Create a function from the repository root:

```bash
supabase functions new <function_name>
```

Serve locally during development:

```bash
supabase functions serve <function_name>
```

Deploy only after review and explicit approval:

```bash
supabase functions deploy <function_name>
```

## Set secrets safely

Use Supabase CLI secrets or the Dashboard. Never commit secret values.

```bash
supabase secrets set NAME=value
```

For local development, keep local values in ignored `.env` files only.

## Security notes

- Never commit Supabase service role keys.
- Never put Supabase service role keys in Expo/mobile code.
- `.env` files must stay ignored.
- Do not store the database password in source code.
- Dashboard settings like Email Templates and Custom SMTP may still need manual Supabase Dashboard configuration.
