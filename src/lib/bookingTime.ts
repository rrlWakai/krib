export const STAY_HOURS = 21
export const ASIA_MANILA_UTC_OFFSET_MINUTES = 480

export const ARRIVAL_TIME_SLOTS = [
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
] as const

export const DEFAULT_ARRIVAL_TIME = '14:00'

// KRiB 1: Fixed 2:00 PM check-in
export const KRIB1_FIXED_CHECKIN_TIME = '14:00'
export const KRIB1_STANDARD_CAPACITY = 20
export const KRIB1_PARTY_MAX_CAPACITY = 60
export const KRIB1_ADDITIONAL_GUEST_FEE = 200
export const KRIB1_PARTY_FEE = 5000

export function isKrib1(villaId: string): boolean {
  return villaId === 'krib-1'
}

export function computeAdditionalGuestFee(
  villaId: string,
  guestCount: number,
): number {
  if (!isKrib1(villaId)) return 0
  const additional = Math.max(0, guestCount - KRIB1_STANDARD_CAPACITY)
  return additional * KRIB1_ADDITIONAL_GUEST_FEE
}

export function computePartyFee(
  villaId: string,
  isParty: boolean,
): number {
  if (!isKrib1(villaId)) return 0
  return isParty ? KRIB1_PARTY_FEE : 0
}

export function computeTotalAdditionalCharges(
  villaId: string,
  guestCount: number,
  isParty: boolean,
): { additionalGuestFee: number; partyFee: number; total: number } {
  const additionalGuestFee = computeAdditionalGuestFee(villaId, guestCount)
  const partyFee = computePartyFee(villaId, isParty)
  return { additionalGuestFee, partyFee, total: additionalGuestFee + partyFee }
}

export function toLocalDateString(d: Date): string {
  const shifted = new Date(d.getTime() + ASIA_MANILA_UTC_OFFSET_MINUTES * 60000)
  const y = shifted.getUTCFullYear()
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const day = String(shifted.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function combineArrivalDatetime(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const utcMs =
    Date.UTC(y, m - 1, d, hh, mm) - ASIA_MANILA_UTC_OFFSET_MINUTES * 60000
  return new Date(utcMs).toISOString()
}

export function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3600000).toISOString()
}

export function computeCheckout(arrivalIso: string): string {
  return addHours(arrivalIso, STAY_HOURS)
}

interface ManilaParts {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
}

export function toManilaParts(iso: string): ManilaParts {
  const shifted = new Date(new Date(iso).getTime() + ASIA_MANILA_UTC_OFFSET_MINUTES * 60000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
  }
}

export function formatTime12(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return `${h12}:${String(minutes).padStart(2, '0')} ${period}`
}

export function formatArrivalLabel(iso: string): string {
  const p = toManilaParts(iso)
  const date = new Date(Date.UTC(p.year, p.month, p.day))
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${dateLabel} · ${formatTime12(p.hours, p.minutes)}`
}

export function formatCheckoutLabel(iso: string): string {
  return formatArrivalLabel(iso)
}

export function formatTimeLabel(time: string): string {
  const [hh, mm] = time.split(':').map(Number)
  return formatTime12(hh, mm)
}
