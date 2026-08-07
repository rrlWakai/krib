import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { getAdminUser } from '../_shared/auth.ts'
import { mapTransitionError, isUuid, writeAudit } from '../_shared/reservations.ts'

interface DeclineInput {
  reservation_id: string
  reason?: string
}

const SELECT =
  'id, reference_code, status, guest_count, arrival_datetime, checkout_datetime, declined_at, declined_by, guest:guests(id, full_name, email, phone), villa:villas(slug, name)'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const auth = await getAdminUser(req)
    if (!auth.ok) return auth.response
    const adminUser = auth.admin

    const parsed = await req.json().catch(() => null)
    const check = requireBody<DeclineInput>(parsed, ['reservation_id'])
    if (!check.ok) return check.response

    const reservationId = String(check.data.reservation_id).trim()
    if (!isUuid(reservationId)) {
      return badRequest('reservation_id must be a valid UUID')
    }

    const admin = getAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from('reservations')
      .select('id')
      .eq('id', reservationId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) {
      return new Response(
        JSON.stringify({ code: 'NOT_FOUND', message: 'Reservation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { data: reservation, error: updateError } = await admin
      .from('reservations')
      .update({ status: 'declined', declined_by: adminUser.id })
      .eq('id', reservationId)
      .select(SELECT)
      .single()

    if (updateError) {
      const mapped = mapTransitionError(updateError)
      if (mapped) return mapped
      throw updateError
    }

    await writeAudit(admin, adminUser.id, 'decline', 'reservation', reservationId, {
      status: 'declined',
      reference_code: reservation.reference_code,
      reason: check.data.reason ?? '',
    })

    return new Response(
      JSON.stringify({ reservation }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
