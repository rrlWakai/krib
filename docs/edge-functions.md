# Edge Functions

## Structure

```
supabase/functions/
  _shared/
    adminClient.ts    Service-role client — NEVER importable from src/
    cors.ts           CORS headers and OPTIONS handler
    errors.ts         Standardized error response helpers
    validate.ts       Request validation helpers
    auth.ts           Admin JWT → admin_users lookup
    reservations.ts   Shared UUID / audit / transition helpers
    sms.ts            Semaphore sendSms (auto + manual) + sanitized diagnostics
  health/                   Implemented — 200 with DB connectivity check
  availability/             Implemented — real availability query
  create_reservation/       Implemented — booking rules enforced
  approve_reservation/      Implemented — approval + guest SMS
  decline_reservation/      Implemented — decline + guest SMS
  cancel_reservation/       Implemented — cancel + guest/owner SMS
  complete_reservation/     Implemented — completion transition
  lookup_reservation/       Implemented — reference + matching email lookup
  send_sms/                 Implemented — manual resend (confirmation | cancellation)
```

## Versioning

Functions are versioned under `v1/` from day one. This means:

- Function name: `v1-health`, `v1-create-reservation`, etc.
- URL: `https://<project>.supabase.co/functions/v1/v1-health`

## Health Endpoint

The `health` function is the only fully implemented function in this phase.

```typescript
// GET /v1/health
// Response:
//   { status: "ok", timestamp: "...", database: "connected" }
//   { status: "degraded", timestamp: "...", database: "unreachable", detail: "..." }
//   { status: "error", timestamp: "...", database: "unknown" }
```

It performs a lightweight `SELECT 1` query against Postgres to confirm
database connectivity. Used by CI smoke tests and uptime monitoring.

## CORS

Every function uses the shared CORS handler. OPTIONS requests return 200
with permissive CORS headers. This is safe because authentication happens
at the application layer, not the transport layer.

## Error Responses

All functions return a standardized error shape:

```typescript
{ code: "NOT_IMPLEMENTED", message: "create_reservation not implemented" }
{ code: "BAD_REQUEST", message: "Missing required field: ..." }
{ code: "UNAUTHORIZED", message: "Unauthorized" }
{ code: "INTERNAL_ERROR", message: "An unexpected error occurred" }
```

## Adding a New Function

1. Create `supabase/functions/v1/<name>/index.ts`
2. Use the shared CORS and error handlers
3. Serve with `Deno.serve`
4. Deploy with `supabase functions deploy v1-<name>`
