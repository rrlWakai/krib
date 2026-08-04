# Authentication Flow

## Overview

Authentication is admin-only. Guests never register or log in — they interact
through public Edge Function endpoints.

## Providers

- **Supabase Auth** (email + password)
- **Session storage**: localStorage (Supabase default, persistent across tabs)
- **Auto-refresh**: Enabled — Supabase SDK refreshes the session automatically

## Auth State

Managed by `src/contexts/AuthContext.tsx`:

| Field | Description |
|---|---|
| `user` | Supabase User object or null |
| `session` | Supabase Session object or null |
| `role` | Admin role string or null (populated in Phase 4) |
| `loading` | True during initial session recovery |
| `initialized` | True after first session check completes |

## Flows

### Login
1. Admin visits `/admin/login`
2. Enters email + password
3. `signIn()` calls `supabase.auth.signInWithPassword()`
4. On success → redirect to intended route (or `/admin`)
5. On error → display user-friendly message

### Session Recovery (Hard Refresh)
1. `AuthProvider` mounts, sets `loading: true`
2. Calls `supabase.auth.getSession()` to restore from localStorage
3. On resolve → sets `loading: false`, `initialized: true`
4. `AuthGuard` waits for `initialized` before rendering children or redirecting
5. This prevents the "flash of login page" on reload

### Logout
1. Admin clicks logout
2. `signOut()` calls `supabase.auth.signOut()`
3. State reset to unauthenticated
4. Redirect to `/admin/login`

## Route Protection

- `AuthGuard` component wraps admin routes
- Checks `initialized` (not just `user`) to avoid redirect during session recovery
- Shows a spinner while loading
- Redirects to `/admin/login` if no session after recovery

## Phase 4

In Phase 4, `role` will be populated from the `admin_users` table. The auth
context is already role-agnostic — `role` is `null` until populated.
