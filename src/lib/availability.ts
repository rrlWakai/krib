import {
  ARRIVAL_TIME_SLOTS,
  KRIB1_FIXED_CHECKIN_TIME,
  KRIB2_FIXED_CHECKIN_TIME,
  hasFixedCheckin,
  combineArrivalDatetime,
  computeCheckout,
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
  const firstArrivalTime = new Date(firstArrival).getTime()
  const firstCheckoutTime = new Date(firstCheckout).getTime()
  const secondArrivalTime = new Date(secondArrival).getTime()
  const secondCheckoutTime = new Date(secondCheckout).getTime()

  if ([firstArrivalTime, firstCheckoutTime, secondArrivalTime, secondCheckoutTime].some(Number.isNaN)) {
    return true
  }

  return firstArrivalTime < secondCheckoutTime && firstCheckoutTime > secondArrivalTime
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
  villaId: string,
): Set<string> {
  const today = toLocalDateString(new Date())
  const fixedTime = hasFixedCheckin(villaId)
    ? (villaId === 'krib-1' ? KRIB1_FIXED_CHECKIN_TIME : KRIB2_FIXED_CHECKIN_TIME)
    : null
  const times = fixedTime ? [fixedTime] : ARRIVAL_TIME_SLOTS
  const unavailable = new Set<string>()

  for (let offset = 0; offset <= 730; offset += 1) {
    const date = dateWithOffset(today, offset)
    if (times.every((time) => isBlockedArrival(date, time, reservations))) {
      unavailable.add(date)
    }
  }

  return unavailable
}