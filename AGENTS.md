# RabAI Development Rules

These rules apply to the entire repository. Work under `apps/mobile` must also follow `apps/mobile/AGENTS.md`. The more specific rule applies when guidance differs, but no existing safety, validation, or quality rule may be discarded.

## General

- Always inspect the existing project before writing code.
- Search first.
- Reuse existing code whenever possible.
- Create new code only when no reusable solution exists.
- Never guess how the project works.
- If something is unclear, inspect the codebase first.

---

## Expo & React Native

Before writing any Expo or React Native code:

1. Inspect `apps/mobile/package.json`.
2. Detect the installed Expo SDK version.
3. Read the official Expo documentation matching that exact SDK version.
4. Never assume the latest Expo SDK.
5. Never use APIs unavailable in the installed SDK.
6. If the SDK version cannot be determined, stop and report the issue instead of guessing.

---

## TypeScript

- Never use `any` unless absolutely necessary.
- Prefer strict typing.
- Prefer interfaces and reusable types.
- Avoid unnecessary type assertions.

---

## Code Quality

- Never invent APIs.
- Never invent library functions.
- Never guess imports.
- Verify every API against the installed package version.
- Keep code readable and modular.
- Prefer composition over duplication.

---

## Project Architecture

- Reuse existing services.
- Reuse existing hooks.
- Reuse existing components.
- Reuse existing utilities.
- Extend existing features instead of creating parallel implementations.
- Keep files focused on a single responsibility.

---

## UI & Design

- Mobile first.
- Responsive by default.
- Never duplicate cards, forms or buttons.
- Reuse existing UI components whenever possible.
- Keep the design system consistent.
- Use accessible colors and spacing.
- Read `docs/rabai-design-system.md` before creating or materially changing a page.
- Follow `docs/rabai-new-page-checklist.md` for every new page.

---

## Accessibility

- Keyboard navigation.
- Visible focus states.
- Proper ARIA attributes where applicable.
- Respect `prefers-reduced-motion`.
- Never reduce accessibility for visual effects.

---

## Performance

- Avoid unnecessary re-renders.
- Lazy-load heavy screens.
- Use pagination for large datasets.
- Never fetch entire tables unnecessarily.
- Prefer server-side filtering.
- Debounce search inputs.
- Optimize images when appropriate.

---

## Database

- Always inspect existing migrations before creating new ones.
- Never duplicate tables.
- Never duplicate columns.
- Extend the existing schema whenever possible.
- Prefer reusable database structures.

---

## Supabase

- Never bypass Row Level Security (RLS).
- Never expose Service Role keys.
- Never place secrets in frontend code.
- Prefer RPC functions for business logic.
- Use authenticated user context whenever possible.
- Respect existing RLS policies.

---

## Security

- Never hardcode secrets.
- Never expose API keys.
- Validate every route parameter.
- Prevent open redirects.
- Sanitize user input.
- Validate server-side whenever applicable.

---

## Routing

- Reuse existing routes.
- Preserve navigation context whenever possible.
- Preserve query parameters when appropriate.
- Use safe fallback routes.
- Never break browser navigation.

---

## Forms

- Validate on both client and server.
- Show user-friendly validation messages.
- Never trust client input.
- Prevent duplicate submissions.

---

## Search

- Use autocomplete where appropriate.
- Debounce search requests.
- Use pagination.
- Prefer indexed database queries.
- Never load unnecessary records.

---

## Testing

Before completing any task:

- Run lint.
- Run typecheck.
- Run available tests.
- Report any remaining limitations honestly.
- Never claim browser testing if browser automation is unavailable.

---

## Git

- Never commit automatically.
- Never push automatically.
- Never modify git history.
- Always report modified files.
- Wait for user confirmation before commit or push.

---

## Documentation

When introducing significant functionality:

- Explain the architecture briefly.
- Keep naming consistent.
- Avoid unnecessary complexity.
- Document important decisions inside the code where appropriate.

---

## Development Philosophy

- Build scalable solutions.
- Keep the codebase maintainable.
- Prefer simplicity over cleverness.
- Write production-quality code.
- Think long-term.
- Every new feature should integrate naturally with the existing RabAI architecture.

---

## RABAI UI CONTRACT — OBLIGATORIU

Orice Codex care creează sau modifică o pagină trebuie:

1. să citească `AGENTS.md`;
2. să citească `docs/rabai-design-system.md`;
3. să reutilizeze componentele din `apps/mobile/src/components/ui`;
4. să folosească design tokens;
5. să nu creeze butoane one-off;
6. să nu hardcodeze culori, border radius sau shadows;
7. să nu folosească magic spacing fără justificare;
8. să ofere loading, empty și error state;
9. să suporte 320px, tabletă, desktop și 1920px;
10. să ofere `accessibilityLabel` și `accessibilityRole`;
11. să ofere focus vizibil;
12. să folosească touch targets minimum 44px;
13. să evite nested `Pressable`;
14. să evite overflow orizontal;
15. să nu inventeze date;
16. să nu afișeze butoane fără handler;
17. să ruleze lint și typecheck;
18. să raporteze orice abatere de la design system.

Use `docs/rabai-new-page-checklist.md` as the mandatory implementation and review checklist.
