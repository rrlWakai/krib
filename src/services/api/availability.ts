import { getSupabaseConfig } from '../../lib/supabase/config'

export interface AvailabilityReservation {
  id: string
  status: 'pending' | 'approved'
  arrival_datetime: string
  checkout_datetime: string
}

interface AvailabilityResponse {
  available: boolean | null
  upcoming: AvailabilityReservation[]
  conflicts: AvailabilityReservation[]
}

async function requestAvailability(path: string): Promise<AvailabilityResponse> {
  const { url, anonKey } = getSupabaseConfig()
  const response = await fetch(`${url}/functions/v1/availability${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  })

  const body = (await response.json().catch(() => null)) as
    | AvailabilityResponse
    | { message?: string }
    | null

  if (!response.ok) {
    throw new Error(body && 'message' in body && body.message ? body.message : 'Unable to check availability.')
  }

  return body as AvailabilityResponse
}

export async function fetchUpcomingAvailability(villaSlug: string): Promise<AvailabilityReservation[]> {
  const result = await requestAvailability(`?villa=${encodeURIComponent(villaSlug)}`)
  return result.upcoming ?? []
}

export async function checkAvailability(
  villaSlug: string,
  arrivalDatetime: string,
  checkoutDatetime: string,
): Promise<boolean> {
  const result = await requestAvailability(
    `?villa=${encodeURIComponent(villaSlug)}&arrival=${encodeURIComponent(arrivalDatetime)}&checkout=${encodeURIComponent(checkoutDatetime)}`,
  )
  return result.available === true
}
