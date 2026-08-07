import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError } from '../_shared/errors.ts'
import { getAdminClient } from '../_shared/adminClient.ts'

const STAY_HOURS = 21

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'GET') return methodNotAllowed(req.method)

  try {
    const url = new URL(req.url)
    const villaSlug = (url.searchParams.get('villa') ?? '').trim()
    if (!villaSlug) return badRequest('Missing required query parameter: villa')

    const arrivalRaw = url.searchParams.get('arrival')?.trim()
    const checkoutRaw = url.searchParams.get('checkout')?.trim()

    let arrival: Date | null = null
    let checkout: Date | null = null

    if (arrivalRaw) {
      arrival = new Date(arrivalRaw)
      if (Number.isNaN(arrival.getTime())) {
        return badRequest('arrival must be a valid ISO 8601 datetime')
      }
      checkout = checkoutRaw ? new Date(checkoutRaw) : new Date(arrival.getTime() + STAY_HOURS * 3600000)
      if (checkoutRaw && Number.isNaN(checkout.getTime())) {
        return badRequest('checkout must be a valid ISO 8601 datetime')
      }
      if (checkout.getTime() <= arrival.getTime()) {
        return badRequest('checkout must be after arrival')
      }
    }

    const admin = getAdminClient()

    const { data: villa, error: villaError } = await admin
      .from('villas')
      .select('id, slug, name, base_price, max_guests')
      .eq('slug', villaSlug)
      .eq('is_active', true)
      .maybeSingle()

    if (villaError) throw villaError
    if (!villa) return badRequest(`Villa not found: ${villaSlug}`)

    const now = new Date().toISOString()

    let query = admin
      .from('reservations')
      .select(
        'id, reference_code, status, guest_count, arrival_datetime, checkout_datetime, guest:guests(full_name)',
      )
      .eq('villa_id', villa.id)
      .in('status', ['pending', 'approved'])
      .gte('checkout_datetime', now)

    if (arrival && checkout) {
      query = query
        .lt('arrival_datetime', checkout.toISOString())
        .gt('checkout_datetime', arrival.toISOString())
    }

    const { data: reservations, error: reservationsError } = await query
    if (reservationsError) throw reservationsError

    const booked = reservations ?? []

    return new Response(
      JSON.stringify({
        villa: {
          id: villa.id,
          slug: villa.slug,
          name: villa.name,
          base_price: villa.base_price,
          max_guests: villa.max_guests,
        },
        arrival: arrival ? arrival.toISOString() : null,
        checkout: checkout ? checkout.toISOString() : null,
        available: arrival ? booked.length === 0 : null,
        conflicts: arrival ? booked : [],
        upcoming: arrival ? [] : booked,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
