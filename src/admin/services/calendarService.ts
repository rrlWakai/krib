import { reservations as initialReservations } from '../data/mockData'
import type { Reservation, ReservationStatus } from '../types'

let data: Reservation[] = structuredClone(initialReservations)

export function getReservations(): Reservation[] {
  return data
}

export function getReservationById(id: string): Reservation | undefined {
  return data.find((r) => r.id === id)
}

export function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Reservation | undefined {
  const idx = data.findIndex((r) => r.id === id)
  if (idx === -1) return undefined
  data[idx] = { ...data[idx], status }
  return data[idx]
}

export function filterReservations(params: {
  villaId?: string
  statuses?: ReservationStatus[]
  search?: string
  dateFrom?: string
  dateTo?: string
}): Reservation[] {
  let result = [...data]

  if (params.villaId && params.villaId !== 'all') {
    result = result.filter((r) => r.villaId === params.villaId)
  }

  if (params.statuses && params.statuses.length > 0) {
    result = result.filter((r) => params.statuses!.includes(r.status))
  }

  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        r.guestPhone.includes(q),
    )
  }

  if (params.dateFrom) {
    result = result.filter((r) => r.checkOut > params.dateFrom!)
  }
  if (params.dateTo) {
    result = result.filter((r) => r.checkIn < params.dateTo!)
  }

  return result
}

export function getReservationsForMonth(
  year: number,
  month: number,
): Reservation[] {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59)
  return data.filter((r) => {
    const ci = new Date(r.checkIn)
    const co = new Date(r.checkOut)
    return ci <= end && co >= start
  })
}

export function getReservationsForWeek(date: Date): Reservation[] {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return data.filter((r) => {
    const ci = new Date(r.checkIn)
    const co = new Date(r.checkOut)
    return ci <= end && co >= start
  })
}

export function getReservationsForDay(date: Date): Reservation[] {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)
  return data.filter((r) => {
    const ci = new Date(r.checkIn)
    const co = new Date(r.checkOut)
    return ci <= dayEnd && co >= dayStart
  })
}

export function getOccupancySummary(date: Date) {
  const dateStr = formatDateStr(date)
  const all = data
  const arrivals = all.filter((r) => r.checkIn === dateStr)
  const departures = all.filter((r) => r.checkOut === dateStr)
  const active = all.filter(
    (r) => r.checkIn <= dateStr && r.checkOut > dateStr,
  )
  return {
    arrivals,
    departures,
    currentGuests: active.reduce(
      (sum, r) =>
        sum + r.guests.adults + r.guests.children + r.guests.infants,
      0,
    ),
    pendingRequests: all.filter((r) => r.status === 'pending').length,
    occupiedVillas: new Set(active.map((r) => r.villaId)).size,
    availableVillas: 2 - new Set(active.map((r) => r.villaId)).size,
    upcomingCheckins: all.filter(
      (r) =>
        r.checkIn > dateStr &&
        (r.status === 'confirmed' || r.status === 'approved'),
    ).length,
  }
}

export function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
  })
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}
