# Security

## Service-Role / Anon Key Split

The most critical security boundary in this project:

```
Browser (src/)                        Edge Functions (supabase/functions/)
──────────────────────                ──────────────────────────────────
VITE_SUPABASE_ANON_KEY                SUPABASE_SERVICE_ROLE_KEY
  ↓                                     ↓
anon key — read-only,                   service-role key — full access,
safe to expose                          NEVER expose to browser
```

## Enforcement

1. **Folder boundary**: `adminClient.ts` lives in `supabase/functions/_shared/`,
   not under `src/`. It can never be imported by frontend code.

2. **Vite prefix rule**: `SUPABASE_SERVICE_ROLE_KEY` is NOT prefixed with
   `VITE_`. Vite only bundles `VITE_`-prefixed env vars. Any attempt to
   read `SUPABASE_SERVICE_ROLE_KEY` via `import.meta.env` will return
   `undefined` in the browser.

3. **CI grep check**: The build fails if `SUPABASE_SERVICE_ROLE_KEY` appears
   anywhere under `src/`.

## RLS Convention

Every table created in a migration must enable Row Level Security in the
**same migration** that creates it. Never a table that exists even
momentarily without RLS, even in a dev branch.

## Client-Side Storage

- PII is never stored in localStorage. The `localStorage` → `sessionStorage`
  migration ensures any transient data auto-clears on tab close.
- Admin auth sessions use Supabase's default localStorage persistence
  (encrypted JWT only, no PII).

## Edge Functions

- Auth state is verified server-side via the service-role client
- Input validation uses the shared validation helpers in `_shared/validate.ts`
- Internal error details (stack traces, DB internals) are never serialized
  to client responses
