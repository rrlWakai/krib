import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { cn } from '../../lib/cn'
import { generateMockAvailability } from '../../lib/data'
import type { AvailabilityStatus, CalendarDay } from '../../types'

const statusColors: Record<AvailabilityStatus, string> = {
  available: 'bg-[#7FAE87]',
  limited: 'bg-[#D6A04B]',
  booked: 'bg-[#C86A5A]',
}

const statusLabels: Record<AvailabilityStatus, string> = {
  available: 'Available',
  limited: 'Limited Availability',
  booked: 'Booked',
}

interface AvailabilityCalendarProps {
  villaId: string
  villaName: string
  onDateSelect?: (date: string | null) => void
}

export function AvailabilityCalendar({ villaId, onDateSelect }: AvailabilityCalendarProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const months = useMemo(() => generateMockAvailability(villaId), [villaId])

  const currentMonth = months[currentIndex]
  if (!currentMonth) return null

  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month - 1, 1).getDay()
  const monthName = new Date(currentMonth.year, currentMonth.month - 1, 1).toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' }
  )

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < months.length - 1

  function handleDateClick(day: CalendarDay) {
    if (day.status === 'booked') return
    setSelectedDate(day.date)
    onDateSelect?.(day.date)
  }

  const departureDate = selectedDate
    ? new Date(new Date(selectedDate).getTime() + 21 * 60 * 60 * 1000)
    : null

  return (
    <div className="bg-white border border-outline-variant rounded-default shadow-card overflow-hidden">
      <div className="p-8 max-md:p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => canGoPrev && setCurrentIndex((i) => i - 1)}
            disabled={!canGoPrev}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer',
              canGoPrev
                ? 'text-on-surface hover:bg-surface-container-high'
                : 'text-on-surface-variant/30 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-display text-headline-sm text-on-surface">{monthName}</h3>
          <button
            onClick={() => canGoNext && setCurrentIndex((i) => i + 1)}
            disabled={!canGoNext}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer',
              canGoNext
                ? 'text-on-surface hover:bg-surface-container-high'
                : 'text-on-surface-variant/30 cursor-not-allowed'
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] text-center py-2"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {currentMonth.days.map((day) => {
            const isSelected = day.date === selectedDate
            return (
              <button
                key={day.date}
                onClick={() => handleDateClick(day)}
                disabled={day.status === 'booked'}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-default font-body text-body-md transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'bg-[#0047ab] text-white shadow-button'
                    : day.status === 'booked'
                      ? 'text-on-surface-variant/40 line-through cursor-not-allowed'
                      : day.status === 'limited'
                        ? 'text-[#D6A04B] hover:bg-[#fef5e7]'
                        : 'text-on-surface hover:bg-surface-container-high'
                )}
              >
                {new Date(day.date).getDate()}
              </button>
            )
          })}
        </div>

        {selectedDate && departureDate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <div className="bg-surface-container-low rounded-default p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-on-surface-variant" />
                  <span className="font-body text-body-md font-medium text-on-surface">21-Hour Stay</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-body-md text-on-surface-variant">Arrival</span>
                  <span className="font-body text-body-md text-on-surface font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · 2:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-body-md text-on-surface-variant">Departure (auto)</span>
                  <span className="font-body text-body-md text-primary font-medium">
                    {departureDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · 11:00 AM
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="border-t border-outline-variant px-8 py-4 flex items-center gap-6 flex-wrap">
        {(['available', 'limited', 'booked'] as AvailabilityStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full', statusColors[status])} />
            <span className="font-body text-body-md text-on-surface-variant text-sm">
              {statusLabels[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
