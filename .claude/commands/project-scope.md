# Project Scope

Remind yourself of the core architectural constraints for this project before making changes.

## API & Auth conventions

- **All API calls must be added to `@/lib/api.ts`** — no `fetch` calls anywhere else in the codebase.
- **All auth-related logic must live in `@/lib/auth.ts`** — session storage, token retrieval, cookie management, and role routing all belong here.

When adding a new backend endpoint:
1. Define the request/response types in `@/lib/api.ts` (or in `@/types/assessment.ts` if shared across components).
2. Export a typed async function from `@/lib/api.ts` that calls `fetch` with the correct method, headers, and error handling pattern already used in that file.
3. Import and call that function from the component — never call `fetch` directly in a component.

When adding new auth behavior:
1. Add it to `@/lib/auth.ts` and export it.
2. Auth state is stored in both `localStorage` and cookies — keep both in sync via `storeAuthSession` / `clearAuthSession`.
