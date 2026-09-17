import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { getAdminUser } from '../_shared/auth.ts'
import { writeAudit } from '../_shared/reservations.ts'

const STAY_HOURS = 21
const MANILA_OFFSET_MINUTES = 480
const FIXED_ARRIVAL_HOUR = 14

interface ManualReservationInput {
  villa_id: string
  arrival_date: string
  full_name: string
  email: string
  phone: string
  adults: number
  children: number
  infants?: number
  pets?: number
  is_party?: boolean
  special_requests?: string
}

const SELECT =
  'id, reference_code, villa_id, guest_id, guest_count, status, special_requests, terms_accepted, privacy_accepted, arrival_datetime, checkout_datetime, created_at, updated_at, approved_at, approved_by, declined_at, declined_by, cancelled_at, cancelled_by, completed_at, is_party, additional_guest_fee, party_fee, total_amount, guest:guests(id, full_name, email, phone, created_at), villa:villas(id, name, slug, description, base_price, max_guests, is_active, created_at, updated_at)'

function conflict(message: string): Response {
  return new Response(
    JSON.stringify({ code: 'DATE_UNAVAILABLE', message }),
    { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}

function parseArrivalDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null

  return new Date(
    Date.UTC(year, month - 1, day, FIXED_ARRIVAL_HOUR, 0) -
      MANILA_OFFSET_MINUTES * 60 * 1000,
  )
}

function integer(value: unknown, fallback = 0): number {
  const parsed = Number(value ?? fallback)
  return Number.isInteger(parsed) ? parsed : Number.NaN
}

function mapInsertError(error: { code: string; message: string }): Response {
  if (error.code === '23P01') {
    return conflict('This date is no longer available. Another reservation has already been made for this schedule.')
  }
  if (error.code === '23503') return badRequest('Invalid villa or guest reference.')
  if (error.code === '23514') return badRequest(error.message)
  return internalError(error)
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const auth = await getAdminUser(req)
    if (!auth.ok) return auth.response

    const parsed = await req.json().catch(() => null)
    const check = requireBody<ManualReservationInput>(parsed, [
      'villa_id',
      'arrival_date',
      'full_name',
      'email',
      'phone',
      'adults',
      'children',
    ])
    if (!check.ok) return check.response
    const input = check.data

    const villaSlug = String(input.villa_id).trim()
    const arrivalDate = String(input.arrival_date).trim()
    const fullName = String(input.full_name).trim()
    const email = String(input.email).trim()
    const phone = String(input.phone).trim()
    const arrival = parseArrivalDate(arrivalDate)

    if (!villaSlug) return badRequest('villa_id is required')
    if (!arrival) return badRequest('arrival_date must be a valid YYYY-MM-DD date')
    if (!fullName) return badRequest('full_name is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest('email must be a valid email address')
    }
    if (!phone) return badRequest('phone is required')

    const adults = integer(input.adults)
    const children = integer(input.children)
    const infants = integer(input.infants)
    const pets = integer(input.pets)
    if (!Number.isInteger(adults) || adults < 1) return badRequest('adults must be a positive integer')
    if (!Number.isInteger(children) || children < 0) return badRequest('children must be a non-negative integer')
    if (!Number.isInteger(infants) || infants < 0) return badRequest('infants must be a non-negative integer')
    if (!Number.isInteger(pets) || pets < 0) return badRequest('pets must be a non-negative integer')

    const guestCount = adults + children
    const checkout = new Date(arrival.getTime() + STAY_HOURS * 60 * 60 * 1000)
    const isParty = input.is_party === true
    const admin = getAdminClient()

    const { data: villa, error: villaError } = await admin
      .from('villas')
      .select('id, slug, name, max_guests, base_price, is_active')
      .eq('slug', villaSlug)
      .eq('is_active', true)
      .maybeSingle()
    if (villaError) throw villaError
    if (!villa) return badRequest(`Villa not found: ${villaSlug}`)

    const { data: guest, error: guestError } = await admin
      .from('guests')
      .upsert({ email, full_name: fullName, phone }, { onConflict: 'email' })
      .select('id')
      .single()
    if (guestError) {
      if (guestError.code === '23514' || guestError.code === '23502') return badRequest(guestError.message)
      throw guestError
    }

    const { data: reservation, error: reservationError } = await admin
      .from('reservations')
      .insert({
        villa_id: villa.id,
        guest_id: guest.id,
        guest_count: guestCount,
        arrival_datetime: arrival.toISOString(),
        checkout_datetime: checkout.toISOString(),
        special_requests: input.special_requests?.trim() ?? '',
        terms_accepted: true,
        privacy_accepted: true,
        is_party: isParty,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: auth.admin.id,
      })
      .select(SELECT)
      .single()

    if (reservationError) return mapInsertError(reservationError)

    await writeAudit(admin, auth.admin.id, 'create_manual', 'reservation', reservation.id, {
      status: 'approved',
      reference_code: reservation.reference_code,
      villa_slug: villa.slug,
      arrival_date: arrivalDate,
      guest_id: guest.id,
    })

    return new Response(
      JSON.stringify({ reservation }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
