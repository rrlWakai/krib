import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError, unauthorized } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { getAdminUser } from '../_shared/auth.ts'
import { mapTransitionError, isUuid, writeAudit } from '../_shared/reservations.ts'

interface AdminCancelInput {
  reservation_id: string
}

interface GuestCancelInput {
  reference_code: string
  email: string
}

const SELECT =
  'id, reference_code, status, guest_count, arrival_datetime, checkout_datetime, cancelled_at, cancelled_by, guest:guests(id, full_name, email, phone), villa:villas(slug, name)'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const parsed = await req.json().catch(() => null)
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()

    if (token) {
      const admin = getAdminClient()
      const { data: authUser, error } = await admin.auth.getUser(token)
      if (error || !authUser.user) {
        // Not a real user session (e.g. anon key) -> treat as guest.
        return handleGuestCancel(parsed)
      }
      const adminCheck = await getAdminUser(req)
      if (!adminCheck.ok) return adminCheck.response
      return handleAdminCancel(req, parsed)
    }

    return handleGuestCancel(parsed)
  } catch (err) {
    return internalError(err)
  }
})

async function handleAdminCancel(
  req: Request,
  parsed: unknown,
): Promise<Response> {
  const auth = await getAdminUser(req)
  if (!auth.ok) return auth.response
  const adminUser = auth.admin

  const check = requireBody<AdminCancelInput>(parsed, ['reservation_id'])
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
    .update({ status: 'cancelled', cancelled_by: adminUser.id })
    .eq('id', reservationId)
    .select(SELECT)
    .single()

  if (updateError) {
    const mapped = mapTransitionError(updateError)
    if (mapped) return mapped
    throw updateError
  }

  await writeAudit(admin, adminUser.id, 'cancel', 'reservation', reservationId, {
    status: 'cancelled',
    reference_code: reservation.reference_code,
  })

  return new Response(
    JSON.stringify({ reservation }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}

async function handleGuestCancel(parsed: unknown): Promise<Response> {
  const check = requireBody<GuestCancelInput>(parsed, ['reference_code', 'email'])
  if (!check.ok) return check.response

  const referenceCode = String(check.data.reference_code).trim().toUpperCase()
  const email = String(check.data.email).trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest('email must be a valid email address')
  }

  const admin = getAdminClient()

  const { data: reservation, error: fetchError } = await admin
    .from('reservations')
    .select(SELECT)
    .eq('reference_code', referenceCode)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!reservation) {
    return new Response(
      JSON.stringify({
        code: 'NOT_FOUND',
        message: 'No reservation found for that reference code',
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const guestEmail = (reservation.guest as unknown as { email?: string })?.email ?? ''
  if (guestEmail.toLowerCase() !== email.toLowerCase()) {
    return unauthorized('Email does not match the reservation')
  }

  if (reservation.status !== 'pending') {
    return new Response(
      JSON.stringify({
        code: 'GUEST_CANCEL_NOT_ALLOWED',
        message:
          'Only pending reservations can be cancelled online. Please contact us to cancel an approved reservation.',
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const { data: cancelled, error: updateError } = await admin
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservation.id)
    .select(SELECT)
    .single()

  if (updateError) {
    const mapped = mapTransitionError(updateError)
    if (mapped) return mapped
    throw updateError
  }

  return new Response(
    JSON.stringify({ reservation: cancelled }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}
