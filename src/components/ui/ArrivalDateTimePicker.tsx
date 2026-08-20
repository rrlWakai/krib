import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from 'lucide-react'
import { cn } from '../../lib/cn'
import {
  ARRIVAL_TIME_SLOTS,
  toLocalDateString,
  combineArrivalDatetime,
  computeCheckout,
  formatArrivalLabel,
  formatCheckoutLabel,
  formatTimeLabel,
} from '../../lib/bookingTime'

interface ArrivalDateTimePickerProps {
  arrivalDate: string | null
  arrivalTime: string | null
  onArrivalDateChange: (date: string) => void
  onArrivalTimeChange: (time: string) => void
  dateError?: string
  timeError?: string
  fixedTime?: string
  fixedTimeLabel?: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function ArrivalDateTimePicker({
  arrivalDate,
  arrivalTime,
  onArrivalDateChange,
  onArrivalTimeChange,
  dateError,
  timeError,
  fixedTime,
  fixedTimeLabel,
}: ArrivalDateTimePickerProps) {
  const todayStr = useMemo(() => toLocalDateString(new Date()), [])
  const [todayY, todayM] = todayStr.split('-').map(Number)

  const initial = arrivalDate
    ? (() => {
        const [y, m] = arrivalDate.split('-').map(Number)
        return { year: y, month: m - 1 }
      })()
    : { year: todayY, month: todayM }

  const [view, setView] = useState(initial)

  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = getDaysInMonth(view.year, view.month)
  const viewLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const canGoPrev = view.year > todayY || (view.year === todayY && view.month > todayM)
  const canGoNext = view.year < todayY + 2 || (view.year === todayY + 2 && view.month < todayM)

  const isBeforeToday = (dateStr: string): boolean => dateStr < todayStr
  const isSelected = (dateStr: string): boolean => dateStr === arrivalDate

  const arrivalDatetime =
    arrivalDate && arrivalTime ? combineArrivalDatetime(arrivalDate, arrivalTime) : null
  const checkoutDatetime = arrivalDatetime ? computeCheckout(arrivalDatetime) : null

  return (
    <div className="bg-white border border-outline-variant rounded-default shadow-card overflow-hidden">
      <div className="p-6 lg:p-7">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays size={16} className="text-primary" />
          <span className="font-body text-[11px] font-semibold uppercase tracking-0.1em text-on-surface-variant">
            Arrival Date
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setView((v) => ({ year: v.month === 0 ? v.year - 1 : v.year, month: v.month === 0 ? 11 : v.month - 1 }))}
            disabled={!canGoPrev}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              canGoPrev
                ? 'text-on-surface-variant hover:bg-surface-container-low cursor-pointer'
                : 'text-on-surface-variant/25',
            )}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-display text-base text-on-surface">{viewLabel}</span>
          <button
            type="button"
            onClick={() => setView((v) => ({ year: v.month === 11 ? v.year + 1 : v.year, month: v.month === 11 ? 0 : v.month + 1 }))}
            disabled={!canGoNext}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              canGoNext
                ? 'text-on-surface-variant hover:bg-surface-container-low cursor-pointer'
                : 'text-on-surface-variant/25',
            )}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="flex items-center justify-center font-body text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/50 py-1.5"
            >
              {w}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const disabled = isBeforeToday(dateStr)
            const selected = isSelected(dateStr)
            const isToday = dateStr === todayStr
            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                onClick={() => onArrivalDateChange(dateStr)}
                aria-pressed={selected}
                aria-disabled={disabled}
                className={cn(
                  'flex items-center justify-center h-9 rounded-lg font-body text-sm transition-all duration-150',
                  disabled
                    ? 'text-on-surface-variant/25'
                    : selected
                      ? 'bg-primary text-on-primary font-semibold shadow-sm'
                      : isToday
                        ? 'text-primary border border-primary/40 font-medium hover:bg-primary/5 cursor-pointer'
                        : 'text-on-surface hover:bg-primary/5 hover:text-primary cursor-pointer',
                )}
              >
                {day}
              </button>
            )
          })}
        </div>

        {dateError && (
          <p className="font-body text-[12px] text-error mt-3">{dateError}</p>
        )}

        <div className="h-px bg-outline-variant/40 my-6" />

        {fixedTime ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-primary" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-0.1em text-on-surface-variant">
                Arrival Time
              </span>
            </div>
            <div className="px-4 py-3.5 rounded-lg bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock size={14} className="text-primary" />
                </div>
                <div>
                  <p className="font-body text-sm text-on-surface font-medium">
                    {fixedTimeLabel ?? formatTimeLabel(fixedTime)}
                  </p>
                  <p className="font-body text-[11px] text-on-surface-variant/60 mt-0.5">
                    Fixed check-in time for this villa
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-primary" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-0.1em text-on-surface-variant">
                Arrival Time
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {ARRIVAL_TIME_SLOTS.map((slot) => {
                const active = slot === arrivalTime
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onArrivalTimeChange(slot)}
                    aria-pressed={active}
                    className={cn(
                      'px-2 py-2.5 rounded-lg border font-body text-sm transition-all duration-150',
                      active
                        ? 'bg-primary border-primary text-on-primary font-semibold shadow-sm'
                        : 'border-outline-variant/60 text-on-surface hover:border-primary/40 hover:text-primary cursor-pointer',
                    )}
                  >
                    {formatTimeLabel(slot)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {timeError && (
          <p className="font-body text-[12px] text-error mt-3">{timeError}</p>
        )}

        {arrivalDatetime && checkoutDatetime && (
          <div className="mt-6 p-5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-primary" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-0.1em text-primary">
                Your 21-Hour Stay
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-body text-on-surface-variant">Arrival</span>
              <span className="font-body text-on-surface font-medium">
                {formatArrivalLabel(arrivalDatetime)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1.5">
              <span className="font-body text-on-surface-variant">Checkout</span>
              <span className="font-body text-primary font-medium">
                {formatCheckoutLabel(checkoutDatetime)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-outline-variant px-6 py-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="font-body text-body-md text-on-surface-variant text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/50" />
          <span className="font-body text-body-md text-on-surface-variant text-sm">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-outline/40" />
          <span className="font-body text-body-md text-on-surface-variant text-sm">Unavailable</span>
        </div>
      </div>
    </div>
  )
}
