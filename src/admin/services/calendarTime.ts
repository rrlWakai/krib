export const BUSINESS_TIMEZONE = 'Asia/Manila'

export interface ManilaParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

const manilaFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const manilaDateFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: BUSINESS_TIMEZONE,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const manilaTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function manilaParts(date: Date): ManilaParts {
  const values: Record<string, number> = {}
  for (const part of manilaFormatter.formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value)
  }
  let hour = values['hour'] ?? 0
  if (hour === 24) hour = 0
  return {
    year: values['year'] ?? 1970,
    month: values['month'] ?? 1,
    day: values['day'] ?? 1,
    hour,
    minute: values['minute'] ?? 0,
  }
}

export function businessDayKey(instant: string | Date): string {
  const date = typeof instant === 'string' ? new Date(instant) : instant
  const p = manilaParts(date)
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

export function manilaDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseKey(key: string): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number)
  return [y, m, d]
}

export function addDaysKey(key: string, days: number): string {
  const [y, m, d] = parseKey(key)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function weekdayOfKey(key: string): number {
  const [y, m, d] = parseKey(key)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function manilaDayOfKey(key: string): number {
  const [, , d] = parseKey(key)
  return d
}

export function formatManilaDateKey(key: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = parseKey(key)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-PH', {
    ...options,
    timeZone: 'UTC',
  })
}

export function formatManilaDate(instant: string | Date): string {
  return manilaDateFormatter.format(typeof instant === 'string' ? new Date(instant) : instant)
}

export function formatManilaTime(instant: string | Date): string {
  return manilaTimeFormatter.format(typeof instant === 'string' ? new Date(instant) : instant)
}

export function formatManilaStayRange(arrival: string | Date, checkout: string | Date): string {
  return `${formatManilaTime(arrival)} – ${formatManilaTime(checkout)}`
}
