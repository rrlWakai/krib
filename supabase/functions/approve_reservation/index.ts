import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { getAdminUser } from '../_shared/auth.ts'
import { mapTransitionError, isUuid, writeAudit } from '../_shared/reservations.ts'
import { readSmsSettings, sendSms, guestApprovedMessage } from '../_shared/sms.ts'

interface ApproveInput {
  reservation_id: string
}

const SELECT =
  'id, reference_code, status, guest_count, arrival_datetime, checkout_datetime, approved_at, approved_by, guest:guests(id, full_name, email, phone), villa:villas(slug, name)'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const auth = await getAdminUser(req)
    if (!auth.ok) return auth.response
    const adminUser = auth.admin

    const parsed = await req.json().catch(() => null)
    const check = requireBody<ApproveInput>(parsed, ['reservation_id'])
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
      .update({ status: 'approved', approved_by: adminUser.id })
      .eq('id', reservationId)
      .select(SELECT)
      .single()

    if (updateError) {
      const mapped = mapTransitionError(updateError)
      if (mapped) return mapped
      throw updateError
    }

    await writeAudit(admin, adminUser.id, 'approve', 'reservation', reservationId, {
      status: 'approved',
      reference_code: reservation.reference_code,
    })

    // B2: notify the guest on approval (best-effort).
    try {
      const r = reservation as unknown as {
        id: string
        reference_code: string
        arrival_datetime: string
        guest: { full_name?: string; phone?: string }
        villa: { name?: string }
      }
      const smsSettings = await readSmsSettings(admin)
      if (smsSettings.enabled && r.guest?.phone) {
        await sendSms(
          admin,
          r.id,
          r.guest.phone,
          guestApprovedMessage({
            reference_code: r.reference_code,
            villa_name: r.villa?.name ?? 'KRiB Beverly Place',
            guest_name: r.guest?.full_name ?? '',
            guest_phone: r.guest?.phone ?? '',
            arrival_datetime: r.arrival_datetime,
          }),
        )
      }
    } catch (err) {
      console.error('Guest SMS notification failed:', err)
    }

    return new Response(
      JSON.stringify({ reservation }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
