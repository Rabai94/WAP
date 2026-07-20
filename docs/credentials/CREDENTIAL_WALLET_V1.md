# Credential Wallet V1

## Architecture

The existing `course_providers` table is the issuer model. An issuer action is
authorized only when the provider is active and verified and the caller is its
owner or an active `owner`/`operator` member. The browser never supplies a
participant ID, provider ID, course ID, or completion actor during finalization.
Those values are derived from the accepted enrollment inside PostgreSQL.

Course completion, credential issuance, PDF generation, visibility, download,
revocation, reissue, skill provenance, and audit are separate operations. This
keeps destructive actions confirmable and makes retries idempotent.

## Deployment order (manual, after review)

1. Review and apply the four `2026072020*.sql` migrations through the approved
   Supabase migration workflow. They have not been applied by this worktree.
2. Configure the Edge Function secret `CREDENTIAL_VERIFICATION_BASE_URL`. Use
   either a base ending in `/credentials/verify` or a URL template containing
   `{token}`. Production must use HTTPS.
3. Deploy `generate-course-credential` and `credential-download-url`. Both must
   retain JWT verification. The platform-provided service-role secret stays only
   in the Edge runtime.
4. Configure `EXPO_PUBLIC_CREDENTIAL_VERIFICATION_BASE_URL` for native builds.
   Web builds fall back to their current origin when this variable is absent.
5. Populate the `skills` taxonomy through a trusted/admin workflow and call
   `set_course_skills` before the first credential for a course is issued.
6. Add provider operators through a trusted/admin membership workflow when the
   owner is not the only issuer. V1 intentionally has no client-side membership
   editor.

Do not put `SUPABASE_SERVICE_ROLE_KEY` in Expo environment files or mobile code.

## PDF lifecycle

`generate-course-credential` first invokes the issuer-scoped issuance RPC with
the caller's JWT. It then generates a deterministic PDF, uploads it to the
private `credential-pdfs` bucket, calculates SHA-256, and marks the document
ready through a service-only RPC. Retries use the same object path and the same
credential snapshot. The PDF contains a configured verification link rather
than a hard-coded RabAI domain.

The V1 generator uses an embedded PDF base font and transliterates unsupported
Latin-ext glyphs for portability. Replacing it later with an embedded Unicode
font does not require changing the immutable database snapshot or public API.

Downloads use a separate authenticated Edge Function. It checks the database
authorization gate, creates a 120-second download URL, and writes the audit
event. Neither wallet RPCs nor the public verification RPC return the Storage
path.

## Security properties

- Only accepted enrollments can be finalized.
- Only `passed` completions on certificate-enabled courses can be issued.
- Credential issuance is serialized per completion and returns the existing
  valid credential on retries.
- Snapshot identity fields cannot be updated; correction is revoke plus reissue.
- Audit rows, completion history, credential rows, and credential skill
  snapshots cannot be deleted by normal clients.
- Revocation marks credential-backed user skills revoked without deleting them.
- Public verification requires an unguessable token and `is_public = true`.
- Public verification returns no email, phone, address, user ID, owner ID,
  internal notes, hash, token, or Storage path.
- Sensitive tables have RLS but no direct browser table grants. Mutations use
  narrowly granted RPCs.
