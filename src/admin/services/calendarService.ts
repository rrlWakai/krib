import { businessDayKey } from './calendarTime'

export function formatDateStr(date: Date): string {
  return businessDayKey(date)
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 1)).getUTCDay()
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

export function reservationDayKey(ts: string): string {
  return businessDayKey(ts)
}
