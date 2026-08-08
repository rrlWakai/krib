import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError, unauthorized, notFound } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { isUuid } from '../_shared/reservations.ts'

interface LookupInput {
  reference_code?: string
  id?: string
  email?: string
}

const SELECT =
  'id, reference_code, status, guest_count, arrival_datetime, checkout_datetime, special_requests, created_at, approved_at, cancelled_at, guest:guests(id, full_name, email, phone), villa:villas(slug, name, base_price, max_guests)'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const parsed = await req.json().catch(() => null)
    const check = requireBody<LookupInput>(parsed, [])
    if (!check.ok) return check.response

    const input = check.data
    const referenceCode = input.reference_code?.toString().trim().toUpperCase()
    const id = input.id?.toString().trim()
    const email = input.email?.toString().trim()

    if (!referenceCode && !id && !email) {
      return badRequest('Provide reference_code, id, or email')
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest('email must be a valid email address')
    }

    const admin = getAdminClient()

    if (referenceCode) {
      const { data: reservation, error: fetchError } = await admin
        .from('reservations')
        .select(SELECT)
        .eq('reference_code', referenceCode)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!reservation) {
        return notFound('No reservation found for that reference code')
      }

      if (email) {
        const guestEmail = (reservation.guest as unknown as { email?: string })?.email ?? ''
        if (guestEmail.toLowerCase() !== email.toLowerCase()) {
          return unauthorized('Email does not match the reservation')
        }
      }

      return new Response(
        JSON.stringify({ reservation }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (id) {
      if (!isUuid(id)) {
        return badRequest('id must be a valid UUID')
      }

      const { data: reservation, error: fetchError } = await admin
        .from('reservations')
        .select(SELECT)
        .eq('id', id)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!reservation) {
        return notFound('Reservation not found')
      }

      if (email) {
        const guestEmail = (reservation.guest as unknown as { email?: string })?.email ?? ''
        if (guestEmail.toLowerCase() !== email.toLowerCase()) {
          return unauthorized('Email does not match the reservation')
        }
      }

      return new Response(
        JSON.stringify({ reservation }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Email-only lookup -> all reservations under that email.
    const { data: reservations, error: listError } = await admin
      .from('reservations')
      .select(SELECT)
      .eq('guest.email', email)
      .order('created_at', { ascending: false })

    if (listError) throw listError

    return new Response(
      JSON.stringify({ reservations: reservations ?? [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
