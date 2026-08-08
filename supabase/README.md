# Supabase Infrastructure — KRiB Beverly Place

## Folder Structure

```
supabase/
├── config.toml              # Supabase CLI project configuration
├── functions/
│   ├── _shared/             # Shared utilities (admin client, CORS, errors, validation, auth, sms)
│   ├── health/              # Implemented — DB connectivity check
│   ├── availability/        # Implemented — real availability query
│   ├── create_reservation/  # Implemented — booking rules enforced
│   ├── approve_reservation/ # Implemented — approval + guest SMS
│   ├── decline_reservation/ # Implemented — decline + guest SMS
│   ├── cancel_reservation/  # Implemented — cancel + guest/owner SMS
│   ├── complete_reservation/# Implemented — completion transition
│   ├── lookup_reservation/  # Implemented — reference + matching email lookup
│   └── send_sms/            # Implemented — manual resend (confirmation | cancellation)
├── migrations/
│   └── 20260731*.sql        # Enums, tables, RLS, seeds, indexes
└── README.md
```

## Authentication

- Admin-only (email + password via Supabase Auth)
- Guests never register or log in
- Session persisted in localStorage, auto-refreshed
- Auth context exposes `role` field (null until Phase 4)

## Storage

| Bucket | Access | Max Size | Types |
|---|---|---|---|
| `villa-gallery` | Public read, admin write | 5 MB | JPEG, PNG, WebP, AVIF |
| `system` | Private, admin-only | 10 MB | PDF, JSON, CSV, JPEG, PNG |

## Edge Functions

All functions are versioned under `v1/`. Only `health` is fully implemented.
All others return `501 Not Implemented` with proper CORS handling.

## Environment Variables

See `../.env.example`. Frontend vars are `VITE_`-prefixed; server-side vars
are not. `SUPABASE_SERVICE_ROLE_KEY` must never appear under `src/`.

## Client Split

- `src/lib/supabase/` — frontend-safe client (anon key only)
- `supabase/functions/_shared/adminClient.ts` — service-role client (Edge Functions only)
