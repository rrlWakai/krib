# Environment Configuration

## Variables

### Frontend (VITE_-prefixed)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (safe in browser) |
| `VITE_APP_TITLE` | No | Application title (default: "KRiB Beverly Place") |

### Server-side (never VITE_-prefixed)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side only) |
| `SEMAPHORE_API_KEY` | Yes | Semaphore SMS API key |
| `SEMAPHORE_SENDER_NAME` | No | SMS sender name (default: "KRiB") |

## Validation

### Frontend (`src/config/env.ts`)

Uses zod to validate `import.meta.env` at module load time. Missing or
invalid variables crash the app immediately with a clear error message
naming the missing key.

```typescript
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_APP_TITLE: z.string().min(1).default('KRiB Beverly Place'),
})

export const env = envSchema.parse(import.meta.env)
```

### Server-side (Edge Functions)

Each Edge Function validates its own required variables on cold start using
the same pattern.

### CI Check

`npm run env:check` validates that all variables in `.env.example` are
present in `.env` or the environment. CI greps for `import.meta.env.` and
`Deno.env.get(` usages and compares against `.env.example`.

## Security

- `SUPABASE_SERVICE_ROLE_KEY` is NOT prefixed with `VITE_` — Vite never
  bundles it
- CI grep check fails the build if `SUPABASE_SERVICE_ROLE_KEY` appears
  under `src/`
- Never commit `.env`
