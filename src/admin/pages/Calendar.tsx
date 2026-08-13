import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import OccupancySummary from '../components/calendar/OccupancySummary'
import ReservationDrawer from '../components/calendar/ReservationDrawer'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatMonthYear,
  reservationDayKey,
} from '../services/calendarService'
import {
  businessDayKey,
  manilaDateKey,
  manilaParts,
  manilaDayOfKey,
  addDaysKey,
  weekdayOfKey,
  formatManilaDateKey,
  formatManilaTime,
  formatManilaStayRange,
} from '../services/calendarTime'
import type { Reservation, ReservationStatus } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { cn } from '../../lib/cn'

type ViewMode = 'month' | 'week' | 'day'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ACTIVE_STATUSES: ReservationStatus[] = ['pending', 'approved']
const HISTORICAL_STATUSES: ReservationStatus[] = ['completed', 'declined', 'cancelled']
const ALL_STATUSES: ReservationStatus[] = [...ACTIVE_STATUSES, ...HISTORICAL_STATUSES]

const STATUS_STYLE: Record<string, { bar: string; dot: string }> = {
  pending:   { bar: 'bg-[#C9A227]/30', dot: 'bg-[#C9A227]' },
  approved:  { bar: 'bg-[#0A1F44]/20', dot: 'bg-[#0A1F44]' },
  completed: { bar: 'bg-[#757575]/20', dot: 'bg-[#757575]' },
  cancelled: { bar: 'bg-[#757575]/10', dot: 'bg-[#757575]' },
  declined:  { bar: 'bg-[#757575]/10', dot: 'bg-[#757575]' },
}

function overlapsDay(res: Reservation, dayKey: string): boolean {
  return reservationDayKey(res.arrival_datetime) <= dayKey && dayKey <= reservationDayKey(res.checkout_datetime)
}

export default function Calendar() {
  const todayKey = businessDayKey(new Date())
  const [view, setView] = useState<ViewMode>('month')
  const [currentYear, setCurrentYear] = useState(() => manilaParts(new Date()).year)
  const [currentMonth, setCurrentMonth] = useState(() => manilaParts(new Date()).month - 1)
  const [currentWeekStartKey, setCurrentWeekStartKey] = useState(() => {
    const t = businessDayKey(new Date())
    return addDaysKey(t, -weekdayOfKey(t))
  })
  const [currentDayKey, setCurrentDayKey] = useState(() => businessDayKey(new Date()))
  const [villaFilter, setVillaFilter] = useState<string>('all')
  const [statusFilters, setStatusFilters] = useState<ReservationStatus[]>(ACTIVE_STATUSES)
  const [showHistorical, setShowHistorical] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [drawerKey, setDrawerKey] = useState(0)

  const reservationsQuery = useAdminQuery('reservations', async () => {
    const { fetchAllReservations } = await import('../services/api')
    return fetchAllReservations()
  })

  const villasQuery = useAdminQuery('villas', async () => {
    const { fetchVillas } = await import('../services/api')
    return fetchVillas()
  })

  const reservations = reservationsQuery.data ?? []
  const villas = villasQuery.data ?? []

  const refreshDrawer = useCallback((updated?: Reservation) => {
    setDrawerKey((k) => k + 1)
    if (updated) {
      reservationsQuery.setData((prev) => {
        if (!prev) return [updated]
        const idx = prev.findIndex((r) => r.id === updated.id)
        if (idx === -1) return [updated, ...prev]
        const next = [...prev]
        next[idx] = { ...prev[idx], ...updated, guest: prev[idx].guest, villa: prev[idx].villa }
        return next
      })
      setSelectedReservation((current) =>
        current && current.id === updated.id
          ? { ...current, ...updated, guest: current.guest, villa: current.villa }
          : current,
      )
    }
    reservationsQuery.refetch()
  }, [reservationsQuery])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const monthDates = useMemo(() => {
    const dates: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) dates.push(null)
    for (let d = 1; d <= daysInMonth; d++) dates.push(d)
    while (dates.length % 7 !== 0) dates.push(null)
    return dates
  }, [firstDay, daysInMonth])

  const weekKeys = useMemo(() => {
    const keys: string[] = []
    for (let i = 0; i < 7; i++) keys.push(addDaysKey(currentWeekStartKey, i))
    return keys
  }, [currentWeekStartKey])

  const effectiveStatuses = useMemo(() => {
    if (statusFilters.length > 0) return statusFilters
    return showHistorical ? ALL_STATUSES : ACTIVE_STATUSES
  }, [statusFilters, showHistorical])

  const filteredReservations = useMemo(() => {
    let r = [...reservations]
    if (villaFilter !== 'all') r = r.filter((res) => res.villa.slug === villaFilter)
    r = r.filter((res) => effectiveStatuses.includes(res.status))
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      r = r.filter((res) =>
        res.reference_code.toLowerCase().includes(q) ||
        res.guest.full_name.toLowerCase().includes(q),
      )
    }
    return r
  }, [reservations, villaFilter, effectiveStatuses, searchQuery])

  const getReservationsForDayInMonth = useCallback(
    (day: number) => {
      const dateKey = manilaDateKey(currentYear, currentMonth, day)
      return filteredReservations.filter((r) => overlapsDay(r, dateKey))
    },
    [currentYear, currentMonth, filteredReservations],
  )

  const isToday = useCallback(
    (day: number) => manilaDateKey(currentYear, currentMonth, day) === todayKey,
    [currentYear, currentMonth, todayKey],
  )

  const occupancy = useMemo(() => {
    const now = new Date()
    const tomorrowKey = addDaysKey(todayKey, 1)

    const arrivals = reservations.filter((r) =>
      r.status === 'approved' && businessDayKey(r.arrival_datetime) === todayKey,
    )
    const departures = reservations.filter((r) =>
      r.status === 'approved' && businessDayKey(r.checkout_datetime) === todayKey,
    )
    const inHouse = reservations.filter((r) =>
      r.status === 'approved' && new Date(r.arrival_datetime) <= now && new Date(r.checkout_datetime) > now,
    )
    const pending = reservations.filter((r) => r.status === 'pending')
    const occupiedVillaIds = new Set(
      reservations
        .filter((r) =>
          (r.status === 'pending' || r.status === 'approved') &&
          new Date(r.arrival_datetime) <= now &&
          new Date(r.checkout_datetime) > now,
        )
        .map((r) => r.villa_id),
    )
    const upcomingCheckins = reservations.filter((r) =>
      r.status === 'approved' &&
      (businessDayKey(r.arrival_datetime) === todayKey || businessDayKey(r.arrival_datetime) === tomorrowKey),
    )

    return {
      arrivals,
      departures,
      currentGuests: inHouse.reduce((sum, r) => sum + r.guest_count, 0),
      pendingRequests: pending.length,
      occupiedVillas: occupiedVillaIds.size,
      availableVillas: Math.max(0, villas.length - occupiedVillaIds.size),
      upcomingCheckins: upcomingCheckins.length,
    }
  }, [reservations, villas, todayKey])

  function navigateDelta(delta: number) {
    if (view === 'month') {
      let m = currentMonth + delta; let y = currentYear
      if (m < 0) { m = 11; y-- } else if (m > 11) { m = 0; y++ }
      setCurrentMonth(m); setCurrentYear(y)
    } else if (view === 'week') {
      setCurrentWeekStartKey((prev) => addDaysKey(prev, delta * 7))
    } else {
      setCurrentDayKey((prev) => addDaysKey(prev, delta))
    }
  }

  function goToToday() {
    const t = businessDayKey(new Date())
    const parts = manilaParts(new Date())
    setCurrentYear(parts.year)
    setCurrentMonth(parts.month - 1)
    setCurrentWeekStartKey(addDaysKey(t, -weekdayOfKey(t)))
    setCurrentDayKey(t)
  }

  function toggleStatusFilter(status: ReservationStatus) {
    setStatusFilters((prev) => prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status])
  }

  function handleReservationClick(e: React.MouseEvent, reservation: Reservation) {
    e.stopPropagation(); setSelectedReservation(reservation)
  }

  function closeDrawer() { setSelectedReservation(null) }

  const weekReservations = useMemo(() => {
    const firstKey = weekKeys[0]
    const lastKey = weekKeys[6]
    return filteredReservations.filter((r) =>
      reservationDayKey(r.arrival_datetime) <= lastKey && reservationDayKey(r.checkout_datetime) >= firstKey,
    )
  }, [filteredReservations, weekKeys])

  const dayReservations = useMemo(() => {
    return filteredReservations.filter((r) => overlapsDay(r, currentDayKey))
  }, [filteredReservations, currentDayKey])

  if (reservationsQuery.loading || villasQuery.loading) {
    return (
      <div>
        <PageHeader title="Calendar" subtitle="Reservation management at a glance" />
        <LoadingBlock />
      </div>
    )
  }

  if (reservationsQuery.error || villasQuery.error) {
    return (
      <div>
        <PageHeader title="Calendar" subtitle="Something went wrong." />
        <ErrorBlock
          message={reservationsQuery.error ?? villasQuery.error ?? 'Unknown error'}
          onRetry={reservationsQuery.refetch}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Reservation management at a glance"
        action={
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input
                type="text"
                placeholder="Search guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 rounded-lg border border-[#ECECEC] bg-transparent pl-9 pr-3 font-body text-[13px] text-[#0A1F44] outline-none placeholder:text-[#757575] focus:border-[#0A1F44]"
              />
            </div>
            <button
              onClick={goToToday}
              className="rounded-lg border border-[#ECECEC] px-4 py-1.5 font-body text-[13px] text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]"
            >
              Today
            </button>
          </div>
        }
      />

      <OccupancySummary data={{
        arrivals: occupancy.arrivals.length,
        departures: occupancy.departures.length,
        currentGuests: occupancy.currentGuests,
        pendingRequests: occupancy.pendingRequests,
        occupiedVillas: occupancy.occupiedVillas,
        availableVillas: occupancy.availableVillas,
        upcomingCheckins: occupancy.upcomingCheckins,
      }} />

      <div className="border border-[#ECECEC] rounded-lg bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECECEC] px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-[#ECECEC]">
              {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'px-3 py-1 font-body text-[12px] capitalize transition-colors',
                    view === v ? 'bg-[#0A1F44] text-white' : 'text-[#757575] hover:bg-[#f0f2f7]',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md border border-[#ECECEC] transition-colors',
                showFilters ? 'bg-[#f0f2f7] text-[#0A1F44]' : 'text-[#757575] hover:bg-[#f0f2f7]',
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={villaFilter}
              onChange={(e) => setVillaFilter(e.target.value)}
              className="h-8 rounded-md border border-[#ECECEC] bg-transparent px-2.5 font-body text-[12px] text-[#0A1F44] outline-none"
            >
              <option value="all">All Villas</option>
              {villas.map((v) => (
                <option key={v.id} value={v.slug}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden border-b border-[#ECECEC]"
            >
              <div className="flex flex-wrap items-center gap-2 px-5 py-3">
                <span className="font-body text-[11px] text-[#757575]">Status:</span>
                {ACTIVE_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatusFilter(s)}
                    className={cn(
                      'rounded-md px-2.5 py-1 font-body text-[11px] capitalize transition-colors',
                      statusFilters.includes(s) ? 'bg-[#0A1F44] text-white' : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#f0f2f7]',
                    )}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
                <button
                  onClick={() => setShowHistorical((v) => !v)}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-body text-[11px] transition-colors',
                    showHistorical ? 'bg-[#0A1F44] text-white' : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#f0f2f7]',
                  )}
                >
                  Show historical
                </button>
                {showHistorical && HISTORICAL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatusFilter(s)}
                    className={cn(
                      'rounded-md px-2.5 py-1 font-body text-[11px] capitalize transition-colors',
                      statusFilters.includes(s) ? 'bg-[#0A1F44] text-white' : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#f0f2f7]',
                    )}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
                {statusFilters.length > 0 && (
                  <button onClick={() => setStatusFilters([])} className="flex items-center gap-1 rounded-md px-2.5 py-1 font-body text-[11px] text-[#757575] transition-colors hover:bg-[#f0f2f7]">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-4 border-b border-[#ECECEC] px-5 py-2">
          {ALL_STATUSES.map((s) => (
            <span key={s} className="flex items-center gap-1.5 font-body text-[11px] text-[#757575]">
              <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_STYLE[s]?.dot ?? STATUS_STYLE.pending.dot)} />
              {s.replace('_', ' ')}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between px-5 pt-4">
          <button onClick={() => navigateDelta(-1)} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2f7]">
            <ChevronLeft size={18} className="text-[#0A1F44]" />
          </button>
          <h2 className="font-display text-[20px] font-medium text-[#0A1F44]">
            {view === 'month' && formatMonthYear(currentYear, currentMonth)}
            {view === 'week' && (
              <>{formatManilaDateKey(weekKeys[0], { month: 'short', day: 'numeric' })} – {formatManilaDateKey(weekKeys[6], { month: 'short', day: 'numeric', year: 'numeric' })}</>
            )}
            {view === 'day' && formatManilaDateKey(currentDayKey, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <button onClick={() => navigateDelta(1)} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2f7]">
            <ChevronRight size={18} className="text-[#0A1F44]" />
          </button>
        </div>

        <div className="px-5 py-4">
          {view === 'month' && (
            <MonthView
                dates={monthDates}
                getReservations={getReservationsForDayInMonth}
                isToday={isToday}
                onReservationClick={handleReservationClick}
              />
          )}
          {view === 'week' && (
            <WeekView
              keys={weekKeys}
              reservations={weekReservations}
              todayKey={todayKey}
              onReservationClick={handleReservationClick}
            />
          )}
          {view === 'day' && (
            <DayView
              dayKey={currentDayKey}
              reservations={dayReservations}
              onReservationClick={handleReservationClick}
            />
          )}
        </div>
      </div>

      {view === 'month' && (
        <div className="mt-6 md:hidden">
          <h3 className="mb-3 font-display text-[16px] font-medium text-[#0A1F44]">Upcoming This Month</h3>
          <div className="flex flex-col gap-2">
            {filteredReservations
              .filter((r) => businessDayKey(r.arrival_datetime) >= todayKey)
              .slice(0, 8)
              .map((res) => (
                <button key={res.id} onClick={() => setSelectedReservation(res)} className="flex items-center gap-3 rounded-lg border border-[#ECECEC] bg-white p-3 text-left">
                  <div className="flex w-10 flex-col items-center">
                    <span className="font-body text-[10px] text-[#757575]">{formatManilaDateKey(businessDayKey(res.arrival_datetime), { month: 'short' })}</span>
                    <span className="font-body text-[14px] font-medium text-[#0A1F44]">{manilaDayOfKey(businessDayKey(res.arrival_datetime))}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-[13px] font-medium text-[#0A1F44]">{res.guest.full_name}</p>
                    <p className="font-body text-[11px] text-[#757575]">{res.villa.name}</p>
                  </div>
                  <StatusBadge status={res.status} size="sm" />
                </button>
              ))}
          </div>
        </div>
      )}

      <ReservationDrawer
        key={drawerKey}
        reservation={selectedReservation}
        onClose={closeDrawer}
        onStatusChange={refreshDrawer}
      />
    </div>
  )
}

function MonthView({
  dates, getReservations, isToday, onReservationClick,
}: {
  dates: (number | null)[]
  getReservations: (day: number) => Reservation[]
  isToday: (day: number) => boolean
  onReservationClick: (e: React.MouseEvent, r: Reservation) => void
}) {
  return (
    <>
      <div className="mb-3 grid grid-cols-7 gap-0">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-[#ECECEC] rounded-lg overflow-hidden">
        {dates.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} className="min-h-[90px] bg-white md:min-h-[120px]" />
          const dayRes = getReservations(day)
          const today = isToday(day)
          return (
            <div key={`d-${day}`} className="min-h-[90px] bg-white p-1.5 md:min-h-[120px] md:p-2">
              <div className="mb-1.5 flex items-center justify-center md:justify-start">
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full font-body text-[12px]',
                  today ? 'bg-[#0A1F44] text-white' : 'text-[#0A1F44]',
                )}>
                  {day}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {dayRes.slice(0, 2).map((res) => {
                  const s = STATUS_STYLE[res.status] ?? STATUS_STYLE.pending
                  return (
                    <button
                      key={res.id}
                      onClick={(e) => onReservationClick(e, res)}
                      className="group flex flex-col items-start rounded px-1.5 py-1 text-left transition-all hover:bg-[#f0f2f7]"
                    >
                      <div className={cn('h-0.5 w-full rounded-full mb-1', s.bar)} />
                      <span className="font-body text-[10px] font-medium text-[#0A1F44] leading-tight">
                        {res.villa.name}
                      </span>
                      <span className="font-body text-[9px] text-[#757575] leading-tight truncate w-full">
                        {res.guest.full_name}
                      </span>
                      <span className="font-body text-[9px] text-[#757575] leading-tight truncate w-full">
                        {formatManilaTime(res.arrival_datetime)}
                      </span>
                    </button>
                  )
                })}
                {dayRes.length > 2 && (
                  <span className="px-1 font-body text-[9px] text-[#757575]">+{dayRes.length - 2} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function WeekView({
  keys, reservations, todayKey, onReservationClick,
}: {
  keys: string[]
  reservations: Reservation[]
  todayKey: string
  onReservationClick: (e: React.MouseEvent, r: Reservation) => void
}) {
  const firstKey = keys[0]
  const lastKey = keys[6]

  const getReservationPosition = useCallback((r: Reservation) => {
    const startKey = reservationDayKey(r.arrival_datetime)
    const endKey = reservationDayKey(r.checkout_datetime)
    const start = startKey < firstKey ? 0 : keys.findIndex((k) => k >= startKey)
    let end = endKey >= lastKey ? 6 : keys.findIndex((k) => k > endKey) - 1
    if (end < start) end = start
    return { start: Math.max(0, start), end: Math.min(6, end) }
  }, [keys, firstKey, lastKey])

  return (
    <>
      <div className="mb-3 grid grid-cols-7 gap-1">
        {keys.map((k, i) => (
          <div key={i} className="text-center">
            <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              {formatManilaDateKey(k, { weekday: 'short' })}
            </p>
            <span className={cn(
              'mx-auto flex h-7 w-7 items-center justify-center rounded-full font-body text-[13px]',
              k === todayKey ? 'bg-[#0A1F44] text-white' : 'text-[#0A1F44]',
            )}>
              {manilaDayOfKey(k)}
            </span>
          </div>
        ))}
      </div>
      <div className="relative min-h-[280px] rounded-lg border border-[#ECECEC] bg-[#FAFAFA]">
        {reservations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-body text-[13px] text-[#757575]">No reservations this week</p>
          </div>
        )}
        {reservations.map((res, idx) => {
          const pos = getReservationPosition(res)
          const s = STATUS_STYLE[res.status] ?? STATUS_STYLE.pending
          return (
            <motion.button
              key={res.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              onClick={(e) => onReservationClick(e, res)}
              className="absolute mx-0.5 flex flex-col items-start justify-center rounded-md px-2.5 py-1.5 text-left transition-all hover:opacity-80"
              style={{
                top: `${idx * 48 + 6}px`,
                left: `${(pos.start / 7) * 100}%`,
                width: `${((pos.end - pos.start + 1) / 7) * 100 - 4}%`,
              }}
            >
              <div className={cn('h-0.5 w-full rounded-full mb-1', s.bar)} />
              <p className="truncate font-body text-[11px] font-medium text-[#0A1F44] w-full">{res.guest.full_name}</p>
              <p className="truncate font-body text-[10px] text-[#757575] w-full">{res.villa.name}</p>
              <p className="truncate font-body text-[10px] text-[#757575] w-full">{formatManilaTime(res.arrival_datetime)}</p>
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

function DayView({
  dayKey, reservations, onReservationClick,
}: {
  dayKey: string
  reservations: Reservation[]
  onReservationClick: (e: React.MouseEvent, r: Reservation) => void
}) {
  const arrivals = reservations.filter((r) => reservationDayKey(r.arrival_datetime) === dayKey)
  const departures = reservations.filter((r) => reservationDayKey(r.checkout_datetime) === dayKey)
  const inHouse = reservations.filter((r) =>
    reservationDayKey(r.arrival_datetime) < dayKey && reservationDayKey(r.checkout_datetime) > dayKey,
  )

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="font-body text-[13px] text-[#757575]">No reservations for this day</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {arrivals.length > 0 && (
        <section>
          <h4 className="mb-2 font-body text-[11px] uppercase tracking-[0.08em] text-[#0A1F44]">Arrivals</h4>
          <div className="flex flex-col gap-1.5">
            {arrivals.map((res) => <ReservationRow key={res.id} reservation={res} onClick={onReservationClick} />)}
          </div>
        </section>
      )}
      {departures.length > 0 && (
        <section>
          <h4 className="mb-2 font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Departures</h4>
          <div className="flex flex-col gap-1.5">
            {departures.map((res) => <ReservationRow key={res.id} reservation={res} onClick={onReservationClick} />)}
          </div>
        </section>
      )}
      {inHouse.length > 0 && (
        <section>
          <h4 className="mb-2 font-body text-[11px] uppercase tracking-[0.08em] text-[#0A1F44]">In House</h4>
          <div className="flex flex-col gap-1.5">
            {inHouse.map((res) => <ReservationRow key={res.id} reservation={res} onClick={onReservationClick} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function ReservationRow({ reservation, onClick }: { reservation: Reservation; onClick: (e: React.MouseEvent, r: Reservation) => void }) {
  return (
    <button
      onClick={(e) => onClick(e, reservation)}
      className="flex w-full items-center justify-between rounded-lg border border-[#ECECEC] px-4 py-3 text-left transition-all hover:border-[#0A1F44]/20"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-[13px] font-medium text-[#0A1F44]">{reservation.guest.full_name}</p>
        <p className="truncate font-body text-[11px] text-[#757575]">
          {reservation.villa.name} · {formatManilaStayRange(reservation.arrival_datetime, reservation.checkout_datetime)}
        </p>
      </div>
      <StatusBadge status={reservation.status} size="sm" />
    </button>
  )
}
