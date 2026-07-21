import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { reservations } from '../data/mockData'
import { cn } from '../../lib/cn'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', border: 'border-[#fbbf24]' },
  approved: { bg: 'bg-primary-container', text: 'text-on-primary-container', border: 'border-primary' },
  awaiting_payment: { bg: 'bg-primary-container', text: 'text-on-primary-container', border: 'border-primary' },
  payment_submitted: { bg: 'bg-[#f3e8ff]', text: 'text-[#6b21a8]', border: 'border-[#9333ea]' },
  confirmed: { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', border: 'border-tertiary' },
  completed: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline' },
  cancelled: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant/50', border: 'border-outline-variant' },
  declined: { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error' },
  expired: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant/50', border: 'border-outline-variant' },
}

const LEGEND_ITEMS = [
  { label: 'Pending', color: 'bg-[#fef3c7] border-[#fbbf24]' },
  { label: 'Approved', color: 'bg-primary-container border-primary' },
  { label: 'Confirmed', color: 'bg-tertiary-container border-tertiary' },
  { label: 'Completed', color: 'bg-surface-container-high border-outline' },
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
  })
}

export default function Calendar() {
  const navigate = useNavigate()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [direction, setDirection] = useState(0)

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const monthDates = useMemo(() => {
    const dates: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) {
      dates.push(null)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      dates.push(d)
    }
    return dates
  }, [firstDay, daysInMonth])

  const reservationsThisMonth = useMemo(() => {
    const year = currentYear
    const month = currentMonth
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59)

    return reservations.filter((r) => {
      const checkIn = new Date(r.checkIn)
      const checkOut = new Date(r.checkOut)
      return checkIn <= monthEnd && checkOut >= monthStart
    })
  }, [currentYear, currentMonth])

  function getReservationsForDay(day: number) {
    const date = new Date(currentYear, currentMonth, day)
    const dateStr = formatDateStr(date)
    return reservationsThisMonth.filter((r) => {
      const checkIn = r.checkIn
      const checkOut = r.checkOut
      return dateStr >= checkIn && dateStr < checkOut
    })
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  function isCheckInDay(day: number) {
    const dateStr = formatDateStr(new Date(currentYear, currentMonth, day))
    return reservationsThisMonth.some((r) => r.checkIn === dateStr)
  }

  function isCheckOutDay(day: number) {
    const dateStr = formatDateStr(new Date(currentYear, currentMonth, day))
    return reservationsThisMonth.some((r) => r.checkOut === dateStr)
  }

  function prevMonth() {
    setDirection(-1)
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    setDirection(1)
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  function goToToday() {
    setDirection(0)
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <PageHeader
        title="Calendar"
        subtitle="Visual overview of all reservations"
        action={
          <button
            onClick={goToToday}
            className="rounded-[12px] border border-outline-variant px-4 py-2 font-body text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Today
          </button>
        }
      />

      <div className="rounded-[16px] bg-white p-6 shadow-card">
        {/* Month Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-low"
          >
            <ChevronLeft size={20} className="text-on-surface" />
          </button>
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-primary" />
            <h2 className="font-display text-title-lg font-medium text-on-surface">
              {formatMonthYear(currentYear, currentMonth)}
            </h2>
          </div>
          <button
            onClick={nextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-low"
          >
            <ChevronRight size={20} className="text-on-surface" />
          </button>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {LEGEND_ITEMS.map((legend) => (
            <div key={legend.label} className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-6 rounded-sm border',
                  legend.color
                )}
              />
              <span className="font-body text-body-sm text-on-surface-variant">
                {legend.label}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Weekday Headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center font-body text-label-caps uppercase tracking-widest text-on-surface-variant"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${currentYear}-${currentMonth}`}
                initial={{ opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-7 gap-1"
              >
                {monthDates.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="min-h-[100px]" />
                  }

                  const dayReservations = getReservationsForDay(day)
                  const todayHighlight = isToday(day)
                  const hasCheckIn = isCheckInDay(day)
                  const hasCheckOut = isCheckOutDay(day)

                  return (
                    <div
                      key={`day-${day}`}
                      className={cn(
                        'min-h-[100px] rounded-[12px] border p-1.5 transition-colors',
                        todayHighlight
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant/50 hover:bg-surface-container-low/50'
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between px-1">
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full font-body text-body-md',
                            todayHighlight
                              ? 'bg-primary font-medium text-on-primary'
                              : 'text-on-surface'
                          )}
                        >
                          {day}
                        </span>
                        <div className="flex gap-0.5">
                          {hasCheckIn && (
                            <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                          )}
                          {hasCheckOut && (
                            <span className="h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {dayReservations.slice(0, 3).map((res) => {
                          const colors =
                            STATUS_COLORS[res.status] ?? STATUS_COLORS.pending
                          return (
                            <button
                              key={res.id}
                              onClick={() =>
                                navigate(`/admin/reservations/${res.id}`)
                              }
                              className={cn(
                                'truncate rounded-sm px-1.5 py-0.5 text-left font-body text-[10px] font-medium leading-tight border transition-colors hover:opacity-80',
                                colors.bg,
                                colors.text,
                                colors.border
                              )}
                            >
                              {res.guestName}
                            </button>
                          )
                        })}
                        {dayReservations.length > 3 && (
                          <span className="px-1 font-body text-[10px] text-on-surface-variant">
                            +{dayReservations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
