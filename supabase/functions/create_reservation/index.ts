import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { writeAudit } from '../_shared/reservations.ts'
import { readSmsSettings, sendSms, ownerNewReservationMessage } from '../_shared/sms.ts'

const STAY_HOURS = 21

// KRiB 1 constants (server-authoritative)
const KRIB1_STANDARD_CAPACITY = 20
const KRIB1_PARTY_MAX_CAPACITY = 60
const KRIB1_ADDITIONAL_GUEST_FEE = 200
const KRIB1_PARTY_FEE = 5000

interface CreateReservationInput {
  villa_id: string
  arrival_datetime: string
  full_name: string
  email: string
  phone: string
  special_requests?: string
  adults: number
  children: number
  infants?: number
  pets?: number
  is_party?: boolean
  terms_accepted: boolean
  privacy_accepted: boolean
}

function conflict(message: string): Response {
  return new Response(
    JSON.stringify({ code: 'DATE_UNAVAILABLE', message }),
    { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}

function mapReservationError(error: { code: string; message: string }): Response {
  switch (error.code) {
    case 'P0001':
      return badRequest(error.message)
    case '23514': {
      if (error.message.includes('terms_must_be_accepted')) {
        return badRequest('terms_must_be_accepted')
      }
      if (error.message.includes('privacy_must_be_accepted')) {
        return badRequest('privacy_must_be_accepted')
      }
      if (error.message.includes('checkout_after_arrival')) {
        return badRequest('checkout must be after arrival')
      }
      return badRequest(error.message)
    }
    case '23P01':
      return conflict(
        'That villa is already reserved for your requested dates. Please choose another arrival date.',
      )
    case '23505':
      return conflict('A duplicate reservation was detected. Please try again.')
    case '23503':
      return badRequest('Invalid villa reference.')
    default:
      return internalError(error)
  }
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const parsed = await req.json().catch(() => null)

    const check = requireBody<CreateReservationInput>(parsed, [
      'villa_id',
      'arrival_datetime',
      'full_name',
      'email',
      'phone',
      'adults',
      'children',
      'terms_accepted',
      'privacy_accepted',
    ])
    if (!check.ok) return check.response
    const input = check.data

    if (input.terms_accepted !== true) {
      return badRequest('terms_must_be_accepted')
    }
    if (input.privacy_accepted !== true) {
      return badRequest('privacy_must_be_accepted')
    }

    const fullName = String(input.full_name).trim()
    const email = String(input.email).trim()
    const phone = String(input.phone).trim()

    if (!fullName) return badRequest('full_name is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest('email must be a valid email address')
    }
    if (!phone) return badRequest('phone is required')

    const arrival = new Date(input.arrival_datetime)
    if (Number.isNaN(arrival.getTime())) {
      return badRequest('arrival_datetime must be a valid ISO 8601 datetime')
    }

    const adults = Number(input.adults)
    const children = Number(input.children)
    const infants = Number(input.infants ?? 0)
    const pets = Number(input.pets ?? 0)
    const isParty = input.is_party === true

    if (!Number.isInteger(adults) || adults < 1) {
      return badRequest('adults must be a positive integer')
    }
    if (!Number.isInteger(children) || children < 0) {
      return badRequest('children must be a non-negative integer')
    }
    if (!Number.isInteger(infants) || infants < 0) {
      return badRequest('infants must be a non-negative integer')
    }
    if (!Number.isInteger(pets) || pets < 0) {
      return badRequest('pets must be a non-negative integer')
    }

    const guestCount = adults + children

    // Backend contract (B1): checkout is always arrival + 21 hours,
    // computed server-side. Any client-supplied checkout is ignored.
    const checkout = new Date(arrival.getTime() + STAY_HOURS * 3600000)

    const admin = getAdminClient()

    const { data: villa, error: villaError } = await admin
      .from('villas')
      .select('id, slug, name, max_guests, base_price')
      .eq('slug', input.villa_id)
      .maybeSingle()

    if (villaError) throw villaError
    if (!villa) return badRequest(`Villa not found: ${input.villa_id}`)

    // ── KRiB 1 server-side validation ──────────
    if (villa.slug === 'krib-1') {
      if (guestCount > KRIB1_PARTY_MAX_CAPACITY) {
        return badRequest(
          `KRiB 1 maximum capacity is ${KRIB1_PARTY_MAX_CAPACITY} guests. You requested ${guestCount}.`,
        )
      }
    }

    const { data: guest, error: guestError } = await admin
      .from('guests')
      .upsert(
        { email, full_name: fullName, phone },
        { onConflict: 'email' },
      )
      .select('id')
      .single()

    if (guestError) {
      if (guestError.code === '23514' || guestError.code === '23502') {
        return badRequest(guestError.message)
      }
      throw guestError
    }

    // ── Server-authoritative fee calculation ────
    let additionalGuestFee = 0
    let partyFee = 0
    let totalAmount = Number(villa.base_price)

    if (villa.slug === 'krib-1') {
      const additionalGuests = Math.max(0, guestCount - KRIB1_STANDARD_CAPACITY)
      additionalGuestFee = additionalGuests * KRIB1_ADDITIONAL_GUEST_FEE
      partyFee = isParty ? KRIB1_PARTY_FEE : 0
      totalAmount = Number(villa.base_price) + additionalGuestFee + partyFee
    } else {
      partyFee = isParty ? KRIB1_PARTY_FEE : 0
      totalAmount = Number(villa.base_price) + partyFee
    }

    const { data: reservation, error: reservationError } = await admin
      .from('reservations')
      .insert({
        villa_id: villa.id,
        guest_id: guest.id,
        guest_count: guestCount,
        arrival_datetime: arrival.toISOString(),
        checkout_datetime: checkout.toISOString(),
        special_requests: input.special_requests ?? '',
        terms_accepted: input.terms_accepted,
        privacy_accepted: input.privacy_accepted,
        is_party: isParty,
        status: 'pending',
      })
      .select(
        'id, reference_code, status, guest_count, arrival_datetime, checkout_datetime, created_at, special_requests, is_party, additional_guest_fee, party_fee, total_amount, guest:guests(id, full_name, email, phone), villa:villas(slug, name)',
      )
      .single()

    if (reservationError) {
      return mapReservationError(reservationError)
    }

    // B1: notify the owner on every new reservation request (best-effort).
    try {
      const r = reservation as unknown as {
        id: string
        reference_code: string
        guest_count: number
        arrival_datetime: string
        is_party: boolean
        guest: { full_name?: string; phone?: string }
        villa: { name?: string }
      }
      const smsSettings = await readSmsSettings(admin)
      if (smsSettings.enabled && smsSettings.ownerMobile) {
        await sendSms(
          admin,
          r.id,
          smsSettings.ownerMobile,
          ownerNewReservationMessage(
            {
              reference_code: r.reference_code,
              villa_name: r.villa?.name ?? 'KRiB Beverly Place',
              guest_name: r.guest?.full_name ?? '',
              guest_phone: r.guest?.phone ?? '',
              arrival_datetime: r.arrival_datetime,
            },
            r.guest_count,
          ),
        )
      }
    } catch (err) {
      console.error('Owner SMS notification failed:', err)
    }

    // C1: audit the guest-created reservation.
    await writeAudit(admin, guest.id, 'create', 'reservation', reservation.id, {
      status: 'pending',
      reference_code: reservation.reference_code,
      actor_name: fullName,
      actor_email: email,
    })

    return new Response(
      JSON.stringify({ reservation }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
