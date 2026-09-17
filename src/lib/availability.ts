import {
  ARRIVAL_TIME_SLOTS,
  KRIB1_FIXED_CHECKIN_TIME,
  combineArrivalDatetime,
  computeCheckout,
  isKrib1,
  toLocalDateString,
} from './bookingTime'
import type { AvailabilityReservation } from '../services/api/availability'

export function dateWithOffset(date: string, offset: number): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + offset)
  return value.toISOString().slice(0, 10)
}

export function overlapIntervals(
  firstArrival: string,
  firstCheckout: string,
  secondArrival: string,
  secondCheckout: string,
): boolean {
  return firstArrival < secondCheckout && firstCheckout > secondArrival
}

export function isBlockedArrival(
  arrivalDate: string,
  arrivalTime: string,
  reservations: AvailabilityReservation[],
): boolean {
  const arrival = combineArrivalDatetime(arrivalDate, arrivalTime)
  const checkout = computeCheckout(arrival)
  if (new Date(arrival).getTime() <= Date.now()) return true
  return reservations.some((reservation) =>
    overlapIntervals(
      arrival,
      checkout,
      reservation.arrival_datetime,
      reservation.checkout_datetime,
    ),
  )
}

export function getUnavailableDates(
  reservations: AvailabilityReservation[],
  isKrib1Villa: boolean,
): Set<string> {
  const today = toLocalDateString(new Date())
  const times = isKrib1Villa ? [KRIB1_FIXED_CHECKIN_TIME] : ARRIVAL_TIME_SLOTS
  const unavailable = new Set<string>()

  for (let offset = 0; offset <= 730; offset += 1) {
    const date = dateWithOffset(today, offset)
    if (times.every((time) => isBlockedArrival(date, time, reservations))) {
      unavailable.add(date)
    }
  }

  return unavailable
}