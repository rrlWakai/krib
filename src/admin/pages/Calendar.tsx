import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import OccupancySummary from '../components/calendar/OccupancySummary'
import ReservationDrawer from '../components/calendar/ReservationDrawer'
import {
  getReservationsForMonth,
  getReservationsForWeek,
  getReservationsForDay,
  getOccupancySummary,
  formatDateStr,
  getDaysInMonth,
  getFirstDayOfMonth,
  formatMonthYear,
  getInitials,
} from '../services/calendarService'
import type { Reservation, ReservationStatus } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { cn } from '../../lib/cn'

type ViewMode = 'month' | 'week' | 'day'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const VILLA_IDS = ['all', 'krib-1', 'krib-2'] as const
const VILLA_LABELS: Record<string, string> = { all: 'All Villas', 'krib-1': 'KRiB 1', 'krib-2': 'KRiB 2' }

const STATUS_STYLE: Record<string, { bar: string; dot: string }> = {
  pending:           { bar: 'bg-[#C9A227]/30', dot: 'bg-[#C9A227]' },
  approved:          { bar: 'bg-[#0A1F44]/20', dot: 'bg-[#0A1F44]' },
  awaiting_payment:  { bar: 'bg-[#0A1F44]/15', dot: 'bg-[#0A1F44]' },
  payment_submitted: { bar: 'bg-[#0A1F44]/20', dot: 'bg-[#0A1F44]' },
  confirmed:         { bar: 'bg-[#0A1F44]/20', dot: 'bg-[#0A1F44]' },
  completed:         { bar: 'bg-[#757575]/20', dot: 'bg-[#757575]' },
  cancelled:         { bar: 'bg-[#757575]/10', dot: 'bg-[#757575]' },
  declined:          { bar: 'bg-[#757575]/10', dot: 'bg-[#757575]' },
  expired:           { bar: 'bg-[#757575]/10', dot: 'bg-[#757575]' },
}

export default function Calendar() {
  const today = new Date()
  const [view, setView] = useState<ViewMode>('month')
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d
  })
  const [currentDay, setCurrentDay] = useState(() => new Date(today))
  const [villaFilter, setVillaFilter] = useState<string>('all')
  const [statusFilters, setStatusFilters] = useState<ReservationStatus[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [drawerKey, setDrawerKey] = useState(0)

  const refreshDrawer = useCallback(() => setDrawerKey((k) => k + 1), [])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const monthDates = useMemo(() => {
    const dates: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) dates.push(null)
    for (let d = 1; d <= daysInMonth; d++) dates.push(d)
    while (dates.length % 7 !== 0) dates.push(null)
    return dates
  }, [firstDay, daysInMonth])

  const weekDates = useMemo(() => {
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart); d.setDate(d.getDate() + i); dates.push(d)
    }
    return dates
  }, [currentWeekStart])

  const allMonthReservations = useMemo(() => getReservationsForMonth(currentYear, currentMonth), [currentYear, currentMonth])
  const weekReservations = useMemo(() => getReservationsForWeek(currentWeekStart), [currentWeekStart])
  const dayReservations = useMemo(() => getReservationsForDay(currentDay), [currentDay])
  const occupancyData = useMemo(() => getOccupancySummary(today), [drawerKey])

  const filteredMonthReservations = useMemo(() => {
    let r = [...allMonthReservations]
    if (villaFilter !== 'all') r = r.filter((res) => res.villaId === villaFilter)
    if (statusFilters.length > 0) r = r.filter((res) => statusFilters.includes(res.status))
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      r = r.filter((res) => res.id.toLowerCase().includes(q) || res.guestName.toLowerCase().includes(q))
    }
    return r
  }, [allMonthReservations, villaFilter, statusFilters, searchQuery])

  const getReservationsForDayInMonth = useCallback(
    (day: number) => {
      const dateStr = formatDateStr(new Date(currentYear, currentMonth, day))
      return filteredMonthReservations.filter((r) => dateStr >= r.checkIn && dateStr < r.checkOut)
    },
    [currentYear, currentMonth, filteredMonthReservations],
  )

  const isToday = useCallback(
    (day: number) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear(),
    [currentYear, currentMonth, today],
  )

  const isTodayDate = useCallback((date: Date) => {
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
  }, [])

  function navigate(delta: number) {
    if (view === 'month') {
      let m = currentMonth + delta; let y = currentYear
      if (m < 0) { m = 11; y-- } else if (m > 11) { m = 0; y++ }
      setCurrentMonth(m); setCurrentYear(y)
    } else if (view === 'week') {
      const d = new Date(currentWeekStart); d.setDate(d.getDate() + delta * 7); setCurrentWeekStart(d)
    } else {
      const d = new Date(currentDay); d.setDate(d.getDate() + delta); setCurrentDay(d)
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    const d = new Date(today); d.setDate(d.getDate() - d.getDay()); setCurrentWeekStart(d)
    setCurrentDay(new Date(today))
  }

  function toggleStatusFilter(status: ReservationStatus) {
    setStatusFilters((prev) => prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status])
  }

  function handleReservationClick(e: React.MouseEvent, reservation: Reservation) {
    e.stopPropagation(); setSelectedReservation(reservation)
  }

  function closeDrawer() { setSelectedReservation(null) }

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
        arrivals: occupancyData.arrivals.length,
        departures: occupancyData.departures.length,
        currentGuests: occupancyData.currentGuests,
        pendingRequests: occupancyData.pendingRequests,
        occupiedVillas: occupancyData.occupiedVillas,
        availableVillas: occupancyData.availableVillas,
        upcomingCheckins: occupancyData.upcomingCheckins,
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
              {VILLA_IDS.map((id) => <option key={id} value={id}>{VILLA_LABELS[id]}</option>)}
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
                {(['pending', 'approved', 'confirmed', 'completed', 'cancelled'] as ReservationStatus[]).map((s) => (
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

        <div className="flex items-center justify-between px-5 pt-4">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2f7]">
            <ChevronLeft size={18} className="text-[#0A1F44]" />
          </button>
          <h2 className="font-display text-[20px] font-medium text-[#0A1F44]">
            {view === 'month' && formatMonthYear(currentYear, currentMonth)}
            {view === 'week' && (
              <>{weekDates[0].toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} – {weekDates[6].toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</>
            )}
            {view === 'day' && currentDay.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <button onClick={() => navigate(1)} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2f7]">
            <ChevronRight size={18} className="text-[#0A1F44]" />
          </button>
        </div>

        <div className="px-5 py-4">
          {view === 'month' && (
            <MonthView
              dates={monthDates}
              year={currentYear}
              month={currentMonth}
              getReservations={getReservationsForDayInMonth}
              isToday={isToday}
              onReservationClick={handleReservationClick}
            />
          )}
          {view === 'week' && (
            <WeekView
              dates={weekDates}
              reservations={weekReservations}
              villaFilter={villaFilter}
              isTodayDate={isTodayDate}
              onReservationClick={handleReservationClick}
            />
          )}
          {view === 'day' && (
            <DayView
              date={currentDay}
              reservations={dayReservations}
              villaFilter={villaFilter}
              onReservationClick={handleReservationClick}
            />
          )}
        </div>
      </div>

      {view === 'month' && (
        <div className="mt-6 md:hidden">
          <h3 className="mb-3 font-display text-[16px] font-medium text-[#0A1F44]">Upcoming This Month</h3>
          <div className="flex flex-col gap-2">
            {filteredMonthReservations.filter((r) => r.checkIn >= formatDateStr(today)).slice(0, 8).map((res) => (
              <button key={res.id} onClick={() => setSelectedReservation(res)} className="flex items-center gap-3 rounded-lg border border-[#ECECEC] bg-white p-3 text-left">
                <div className="flex w-10 flex-col items-center">
                  <span className="font-body text-[10px] text-[#757575]">{new Date(res.checkIn + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short' })}</span>
                  <span className="font-body text-[14px] font-medium text-[#0A1F44]">{new Date(res.checkIn + 'T00:00:00').getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-[13px] font-medium text-[#0A1F44]">{res.guestName}</p>
                  <p className="font-body text-[11px] text-[#757575]">{res.villaName}</p>
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
  dates, year, month, getReservations, isToday, onReservationClick,
}: {
  dates: (number | null)[]
  year: number; month: number
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
                        {res.villaName}
                      </span>
                      <span className="font-body text-[9px] text-[#757575] leading-tight truncate w-full">
                        {res.guestName}
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
  dates, reservations, villaFilter, isTodayDate, onReservationClick,
}: {
  dates: Date[]
  reservations: Reservation[]
  villaFilter: string
  isTodayDate: (d: Date) => boolean
  onReservationClick: (e: React.MouseEvent, r: Reservation) => void
}) {
  const filtered = useMemo(() => {
    let r = [...reservations]
    if (villaFilter !== 'all') r = r.filter((res) => res.villaId === villaFilter)
    return r
  }, [reservations, villaFilter])

  const getDayStr = (d: Date) => formatDateStr(d)
  const firstDay = getDayStr(dates[0])
  const lastDay = getDayStr(dates[6])

  const weekRes = filtered.filter((r) => r.checkIn <= lastDay && r.checkOut > firstDay)

  const getReservationPosition = useCallback((r: Reservation) => {
    const start = r.checkIn < firstDay ? 0 : dates.findIndex((d) => getDayStr(d) >= r.checkIn)
    const end = r.checkOut > lastDay ? 6 : dates.findIndex((d) => getDayStr(d) >= r.checkOut) - 1
    return { start: Math.max(0, start), end: Math.min(6, end < 0 ? 6 : end) }
  }, [dates, firstDay, lastDay])

  return (
    <>
      <div className="mb-3 grid grid-cols-7 gap-1">
        {dates.map((d, i) => (
          <div key={i} className="text-center">
            <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              {d.toLocaleDateString('en-PH', { weekday: 'short' })}
            </p>
            <span className={cn(
              'mx-auto flex h-7 w-7 items-center justify-center rounded-full font-body text-[13px]',
              isTodayDate(d) ? 'bg-[#0A1F44] text-white' : 'text-[#0A1F44]',
            )}>
              {d.getDate()}
            </span>
          </div>
        ))}
      </div>
      <div className="relative min-h-[280px] rounded-lg border border-[#ECECEC] bg-[#FAFAFA]">
        {weekRes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-body text-[13px] text-[#757575]">No reservations this week</p>
          </div>
        )}
        {weekRes.map((res, idx) => {
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
              <p className="truncate font-body text-[11px] font-medium text-[#0A1F44] w-full">{res.guestName}</p>
              <p className="truncate font-body text-[10px] text-[#757575] w-full">{res.villaName}</p>
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

function DayView({
  date, reservations, villaFilter, onReservationClick,
}: {
  date: Date
  reservations: Reservation[]
  villaFilter: string
  onReservationClick: (e: React.MouseEvent, r: Reservation) => void
}) {
  const filtered = useMemo(() => {
    let r = [...reservations]
    if (villaFilter !== 'all') r = r.filter((res) => res.villaId === villaFilter)
    return r
  }, [reservations, villaFilter])

  const dateStr = formatDateStr(date)
  const arrivals = filtered.filter((r) => r.checkIn === dateStr)
  const departures = filtered.filter((r) => r.checkOut === dateStr)
  const inHouse = filtered.filter((r) => r.checkIn < dateStr && r.checkOut > dateStr)

  if (filtered.length === 0) {
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
        <p className="truncate font-body text-[13px] font-medium text-[#0A1F44]">{reservation.guestName}</p>
        <p className="truncate font-body text-[11px] text-[#757575]">{reservation.villaName}</p>
      </div>
      <StatusBadge status={reservation.status} size="sm" />
    </button>
  )
}
