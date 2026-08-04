import { Clock, Info } from 'lucide-react'

export function AvailabilityCalendar() {
  return (
    <div className="bg-white border border-outline-variant rounded-default shadow-card overflow-hidden">
      <div className="p-8 max-md:p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high">
            <Clock size={24} className="text-on-surface-variant/60" />
          </div>
          <h3 className="font-display text-headline-sm text-on-surface mb-2">Check Availability</h3>
          <p className="font-body text-body-md text-on-surface-variant max-w-md">
            Availability calendar will appear once dates are synced from the booking system.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-3">
            <Info size={14} className="text-primary shrink-0" />
            <span className="font-body text-body-sm text-on-surface-variant">
              Send us a message to check real-time availability for your preferred dates.
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant px-8 py-4 flex items-center gap-6 flex-wrap">
        {['available', 'limited', 'booked'].map((status) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-outline" />
            <span className="font-body text-body-md text-on-surface-variant text-sm capitalize">
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
