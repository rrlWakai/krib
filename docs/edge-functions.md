# Edge Functions

## Structure

```
supabase/functions/
  _shared/
    adminClient.ts    Service-role client — NEVER importable from src/
    cors.ts           CORS headers and OPTIONS handler
    errors.ts         Standardized error response helpers
    validate.ts       Request validation helpers
  v1/
    health/               Fully implemented — returns 200 with DB connectivity check
    create_reservation/   501 Not Implemented
    approve_reservation/  501 Not Implemented
    decline_reservation/  501 Not Implemented
    cancel_reservation/   501 Not Implemented
    availability/          501 Not Implemented
    send_sms/              501 Not Implemented
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
