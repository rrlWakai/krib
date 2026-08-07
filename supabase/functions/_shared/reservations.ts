import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

type AdminClient = ReturnType<typeof createClient>

export function transitionConflict(message: string): Response {
  return new Response(
    JSON.stringify({ code: 'INVALID_TRANSITION', message }),
    { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}

export function notFound(entity: string): Response {
  return new Response(
    JSON.stringify({ code: 'NOT_FOUND', message: `${entity} not found` }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}

export function mapTransitionError(
  error: { code: string; message: string },
): Response | null {
  if (error.code === 'P0001') {
    return transitionConflict(error.message)
  }
  if (error.code === 'PGRST116') {
    return notFound('Reservation')
  }
  return null
}

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export async function writeAudit(
  client: AdminClient,
  actor: string,
  action: string,
  entity: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await client.from('audit_logs').insert({
    actor,
    action,
    entity,
    entity_id: entityId,
    metadata,
  })
}
