import { getSupabaseClient } from '../../lib/supabase/client'
import type {
  AuditLog,
  DashboardStats,
  GalleryImage,
  Guest,
  GuestProfile,
  GuestStat,
  OccupancyData,
  Reservation,
  ReservationTrend,
  SmsLog,
  StatusDistribution,
  Villa,
  VillaAdmin,
  VillaAmenity,
  VillaPopularity,
} from '../types'
import type { SiteSettings } from '../../services/api/settings'

const RESERVATION_SELECT =
  'id, reference_code, villa_id, guest_id, guest_count, status, special_requests, terms_accepted, privacy_accepted, arrival_datetime, checkout_datetime, created_at, updated_at, approved_at, approved_by, declined_at, declined_by, cancelled_at, cancelled_by, completed_at, guest:guests(id, full_name, email, phone, created_at), villa:villas(id, name, slug, description, base_price, max_guests, is_active, created_at, updated_at)'

export async function fetchSiteSettingsAdmin(): Promise<SiteSettings | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('settings')
    .select('id, business, sms, legal, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data ?? null) as SiteSettings | null
}

export async function fetchAllReservations(): Promise<Reservation[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Reservation[]
}

export async function fetchReservationById(id: string): Promise<Reservation | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data ?? null) as Reservation | null
}

export async function fetchVillas(): Promise<Villa[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('villas').select('*').order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Villa[]
}

export async function fetchVillaAmenities(): Promise<VillaAmenity[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('villa_amenities')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as VillaAmenity[]
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, villa_id, storage_path, alt_text, sort_order')
  if (error) throw new Error(error.message)
  return (data ?? []) as GalleryImage[]
}

export async function fetchGuests(): Promise<Guest[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}

export async function fetchSmsLogs(): Promise<SmsLog[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sms_logs')
    .select('*, reservation:reservations(reference_code, guest:guests(id, full_name, email, phone, created_at))')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as SmsLog[]
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const { data: admins, error: adminError } = await supabase
    .from('admin_users')
    .select('id, auth_user_id, full_name')
  if (adminError) throw new Error(adminError.message)

  const adminMap: Record<string, { id: string; full_name: string }> = {}
  for (const admin of admins ?? []) {
    adminMap[admin.auth_user_id] = { id: admin.id, full_name: admin.full_name }
  }

  return (data ?? []).map((row) => ({
    ...row,
    admin: row.actor ? adminMap[row.actor] ?? null : null,
  })) as unknown as AuditLog[]
}

// ──────────────────────────────────────────────
// Derived helpers
// ──────────────────────────────────────────────

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function reservationNights(reservation: Reservation): number {
  const arrival = new Date(reservation.arrival_datetime).getTime()
  const checkout = new Date(reservation.checkout_datetime).getTime()
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.max(0, Math.round((checkout - arrival) / msPerDay))
}

export function estimateReservationValue(reservation: Reservation): number {
  const price = Number(reservation.villa?.base_price ?? 0)
  return price * reservationNights(reservation)
}

export function isActiveReservation(status: Reservation['status']): boolean {
  return status === 'pending' || status === 'approved' || status === 'completed'
}

function lastMonths(count: number): Date[] {
  const months: Date[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
  }
  return months
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export interface DashboardData {
  stats: DashboardStats
  recentReservations: Reservation[]
  todayCheckins: Reservation[]
  todayCheckouts: Reservation[]
  upcomingArrivals: Reservation[]
}

export interface SmsStats {
  total: number
  sent: number
  failed: number
  thisWeek: number
}

export function computeSmsStats(smsLogs: SmsLog[]): SmsStats {
  const now = new Date()
  const weekStart = addDays(startOfDay(now), -6)
  return {
    total: smsLogs.length,
    sent: smsLogs.filter((l) => l.status === 'sent').length,
    failed: smsLogs.filter((l) => l.status === 'failed').length,
    thisWeek: smsLogs.filter((l) => new Date(l.created_at) >= weekStart).length,
  }
}

export function computeDashboard(
  reservations: Reservation[],
  villas: Villa[],
  guests: Guest[],
): DashboardData {
  const now = new Date()
  const todayStart = startOfDay(now)
  const tomorrowStart = addDays(todayStart, 1)

  const pending = reservations.filter((r) => r.status === 'pending')

  const active = reservations.filter((r) => isActiveReservation(r.status))

  const todayCheckins = active.filter((r) => {
    const arrival = new Date(r.arrival_datetime)
    return arrival >= todayStart && arrival < tomorrowStart
  })

  const todayCheckouts = reservations.filter((r) => {
    if (r.status !== 'approved' && r.status !== 'completed') return false
    const checkout = new Date(r.checkout_datetime)
    return checkout >= todayStart && checkout < tomorrowStart
  })

  const inHouse = reservations.filter(
    (r) => r.status === 'approved' && new Date(r.arrival_datetime) <= now && new Date(r.checkout_datetime) > now,
  )
  const occupiedGuests = inHouse.reduce((sum, r) => sum + r.guest_count, 0)
  const totalCapacity = villas.reduce((sum, v) => sum + Number(v.max_guests), 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((occupiedGuests / totalCapacity) * 100) : 0

  const upcomingApproved = reservations
    .filter((r) => r.status === 'approved' && new Date(r.arrival_datetime) >= now)
    .sort((a, b) => a.arrival_datetime.localeCompare(b.arrival_datetime))

  const recentReservations = [...reservations]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6)

  const stats: DashboardStats = {
    totalReservations: reservations.length,
    pendingReservations: pending.length,
    todayCheckins: todayCheckins.length,
    todayCheckouts: todayCheckouts.length,
    occupancyRate,
    confirmedUpcoming: upcomingApproved.length,
    recentlyApproved: reservations.filter((r) => r.status === 'approved').length,
    totalGuests: guests.length,
  }

  return {
    stats,
    recentReservations,
    todayCheckins,
    todayCheckouts,
    upcomingArrivals: upcomingApproved.slice(0, 6),
  }
}

// ──────────────────────────────────────────────
// Villas (admin view)
// ──────────────────────────────────────────────

export function computeVillaAdmins(
  villas: Villa[],
  amenities: VillaAmenity[],
  galleryImages: GalleryImage[],
  reservations: Reservation[],
): VillaAdmin[] {
  const now = new Date()
  const horizon = addDays(startOfDay(now), 30)

  return villas.map((villa) => {
    const villaReservations = reservations.filter((r) => r.villa_id === villa.id)
    const upcoming = villaReservations
      .filter((r) => isActiveReservation(r.status) && new Date(r.checkout_datetime) > now)
      .sort((a, b) => a.arrival_datetime.localeCompare(b.arrival_datetime))

    const availableToday = !villaReservations.some(
      (r) =>
        (r.status === 'pending' || r.status === 'approved') &&
        new Date(r.arrival_datetime) < now &&
        new Date(r.checkout_datetime) > now,
    )

    let bookedNights = 0
    const totalDays = 30
    for (const r of villaReservations) {
      if (!isActiveReservation(r.status)) continue
      const arrival = new Date(r.arrival_datetime)
      const checkout = new Date(r.checkout_datetime)
      const rangeStart = arrival < now ? now : arrival
      const rangeEnd = checkout > horizon ? horizon : checkout
      if (rangeEnd > rangeStart) {
        bookedNights += Math.round((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    return {
      ...villa,
      amenities: amenities.filter((a) => a.villa_id === villa.id),
      galleryCount: galleryImages.filter((g) => g.villa_id === villa.id).length,
      upcomingReservations: upcoming.length,
      nextArrival: upcoming[0]?.arrival_datetime ?? null,
      availableToday,
      occupancyNext30Days: totalDays > 0 ? Math.round((bookedNights / totalDays) * 100) : 0,
    }
  })
}

// ──────────────────────────────────────────────
// Guests
// ──────────────────────────────────────────────

export function computeGuestProfiles(
  guests: Guest[],
  reservations: Reservation[],
): GuestProfile[] {
  return guests
    .map((guest) => {
      const guestReservations = reservations
        .filter((r) => r.guest_id === guest.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))

      const stayingReservations = guestReservations.filter((r) =>
        isActiveReservation(r.status),
      )
      const completedReservations = guestReservations.filter((r) => r.status === 'completed')
      const cancelledReservations = guestReservations.filter((r) => r.status === 'cancelled')
      const declinedReservations = guestReservations.filter((r) => r.status === 'declined')

      const totalStays = stayingReservations.length
      const totalSpending = stayingReservations.reduce((sum, r) => sum + estimateReservationValue(r), 0)

      const visitDates = stayingReservations
        .map((r) => r.completed_at ?? r.checkout_datetime)
        .filter(Boolean) as string[]
      const lastVisit = visitDates.length > 0 ? visitDates.sort().slice(-1)[0] : null

      const upcomingReservations = guestReservations.filter(
        (r) => r.status === 'approved' && new Date(r.arrival_datetime) >= new Date(),
      )

      return {
        ...guest,
        totalStays,
        totalSpending,
        lastVisit,
        upcomingReservations,
        completedReservations,
        cancelledReservations,
        declinedReservations,
        allReservations: guestReservations,
      }
    })
    .sort((a, b) => b.allReservations.length - a.allReservations.length)
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

export interface ReportData {
  reservationTrends: ReservationTrend[]
  occupancyData: OccupancyData[]
  villaPopularity: VillaPopularity[]
  guestStats: GuestStat[]
  statusDistribution: StatusDistribution[]
  avgOccupancy: number
  totalBookings: number
  totalGuests: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#C9A227',
  approved: '#0A1F44',
  completed: '#757575',
  declined: '#B0B0B0',
  cancelled: '#B0B0B0',
}

export function computeReports(
  reservations: Reservation[],
  villas: Villa[],
  guests: Guest[],
): ReportData {
  const months = lastMonths(6)
  const bookingReservations = reservations.filter((r) => isActiveReservation(r.status))

  const reservationTrends: ReservationTrend[] = months.map((month) => {
    const monthRes = reservations.filter(
      (r) => new Date(r.created_at).getFullYear() === month.getFullYear() &&
        new Date(r.created_at).getMonth() === month.getMonth(),
    )
    const byStatus: Record<Reservation['status'], number> = {
      pending: 0,
      approved: 0,
      completed: 0,
      declined: 0,
      cancelled: 0,
    }
    for (const r of monthRes) byStatus[r.status] += 1
    return {
      month: month.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' }),
      total: monthRes.length,
      pending: byStatus.pending,
      approved: byStatus.approved,
      completed: byStatus.completed,
      declined: byStatus.declined,
      cancelled: byStatus.cancelled,
    }
  })

  const occupancyData: OccupancyData[] = months.map((month) => {
    const year = month.getFullYear()
    const monthIdx = month.getMonth()
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
    const monthStart = new Date(year, monthIdx, 1)
    const monthEnd = new Date(year, monthIdx + 1, 1)

    let totalNights = 0
    const villaNights: Record<string, number> = {}
    for (const v of villas) villaNights[v.slug] = 0

    for (const r of bookingReservations) {
      const arrival = new Date(r.arrival_datetime)
      const checkout = new Date(r.checkout_datetime)
      const overlapStart = arrival < monthStart ? monthStart : arrival
      const overlapEnd = checkout > monthEnd ? monthEnd : checkout
      if (overlapEnd <= overlapStart) continue
      const nights = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
      totalNights += nights
      if (villaNights[r.villa.slug] !== undefined) villaNights[r.villa.slug] += nights
    }

    const totalAvailable = Math.max(1, villas.length * daysInMonth)
    return {
      month: month.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' }),
      rate: Math.min(100, Math.round((totalNights / totalAvailable) * 100)),
      krib1: villaNights['krib-1'] ?? 0,
      krib2: villaNights['krib-2'] ?? 0,
    }
  })

  const villaPopularity: VillaPopularity[] = villas.map((villa) => {
    const villaReservations = reservations.filter((r) => r.villa_id === villa.id)
    const bookings = villaReservations.filter((r) => isActiveReservation(r.status))
    const revenue = bookings.reduce((sum, r) => sum + estimateReservationValue(r), 0)
    const avgStay = bookings.length > 0
      ? bookings.reduce((sum, r) => sum + reservationNights(r), 0) / bookings.length
      : 0
    return {
      villaName: villa.name,
      totalBookings: bookings.length,
      totalRevenue: revenue,
      averageStay: Math.round(avgStay * 10) / 10,
    }
  })

  const profiles = computeGuestProfiles(guests, reservations)
  const returningGuests = profiles.filter((p) => p.totalStays >= 2).length
  const nowMonth = new Date().getMonth()
  const nowYear = new Date().getFullYear()
  const reservationsThisMonth = reservations.filter(
    (r) => new Date(r.created_at).getFullYear() === nowYear && new Date(r.created_at).getMonth() === nowMonth,
  ).length
  const avgNights = bookingReservations.length > 0
    ? bookingReservations.reduce((sum, r) => sum + reservationNights(r), 0) / bookingReservations.length
    : 0

  const guestStats: GuestStat[] = [
    { label: 'Total Guests', value: guests.length, total: guests.length },
    { label: 'Returning Guests', value: returningGuests, total: Math.max(1, guests.length) },
    { label: 'Reservations This Month', value: reservationsThisMonth, total: Math.max(1, reservations.length) },
    { label: 'Avg Nights per Stay', value: Math.round(avgNights * 10) / 10, total: 1 },
  ]

  const statusDistribution: StatusDistribution[] = (
    ['pending', 'approved', 'completed', 'declined', 'cancelled'] as const
  ).map((status) => ({
    status,
    count: reservations.filter((r) => r.status === status).length,
    color: STATUS_COLORS[status] ?? '#757575',
  }))

  const totalBookings = bookingReservations.length
  const avgOccupancy =
    occupancyData.length > 0
      ? occupancyData.reduce((sum, d) => sum + d.rate, 0) / occupancyData.length
      : 0

  return {
    reservationTrends,
    occupancyData,
    villaPopularity,
    guestStats,
    statusDistribution,
    avgOccupancy,
    totalBookings,
    totalGuests: guests.length,
  }
}
