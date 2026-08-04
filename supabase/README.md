# Supabase Infrastructure — KRiB Beverly Place

## Folder Structure

```
supabase/
├── config.toml              # Supabase CLI project configuration
├── functions/
│   ├── _shared/             # Shared utilities (admin client, CORS, errors, validation)
│   └── v1/                  # Versioned Edge Functions (v1/)
│       ├── health/               # Fully implemented — DB connectivity check
│       ├── create_reservation/   # 501 Not Implemented
│       ├── approve_reservation/  # 501 Not Implemented
│       ├── decline_reservation/  # 501 Not Implemented
│       ├── cancel_reservation/   # 501 Not Implemented
│       ├── availability/         # 501 Not Implemented
│       └── send_sms/             # 501 Not Implemented
├── migrations/
│   ├── 20260730000001_extensions.sql  # Extensions + timezone
│   └── 20260730000002_storage.sql     # Storage buckets
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
