import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { getAdminUser } from '../_shared/auth.ts'
import { isUuid, writeAudit } from '../_shared/reservations.ts'

interface DeleteInput {
  reservation_id: string
  [key: string]: unknown
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const auth = await getAdminUser(req)
    if (!auth.ok) return auth.response
    const adminUser = auth.admin

    const parsed = await req.json().catch(() => null)
    const check = requireBody<DeleteInput>(parsed, ['reservation_id'])
    if (!check.ok) return check.response

    const reservationId = String(check.data.reservation_id).trim()
    if (!isUuid(reservationId)) {
      return badRequest('reservation_id must be a valid UUID')
    }

    const admin = getAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from('reservations')
      .select('id, reference_code, guest_id')
      .eq('id', reservationId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) {
      return new Response(
        JSON.stringify({ code: 'NOT_FOUND', message: 'Reservation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const referenceCode = existing.reference_code as string
    const guestId = existing.guest_id as string

    const { error: smsError } = await admin
      .from('sms_logs')
      .delete()
      .eq('reservation_id', reservationId)

    if (smsError) throw smsError

    const { error: deleteError } = await admin
      .from('reservations')
      .delete()
      .eq('id', reservationId)

    if (deleteError) throw deleteError

    if (guestId) {
      const { count, error: countError } = await admin
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('guest_id', guestId)

      if (!countError && count === 0) {
        await admin.from('guests').delete().eq('id', guestId)
      }
    }

    await writeAudit(admin, adminUser.id, 'delete', 'reservation', reservationId, {
      status: 'deleted',
      reference_code: referenceCode,
    })

    return new Response(
      JSON.stringify({ success: true, reference_code: referenceCode }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
