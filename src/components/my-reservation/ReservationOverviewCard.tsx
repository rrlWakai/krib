import { motion } from "framer-motion"
import { CalendarDays, Users, Clock, Hash, DoorOpen } from "lucide-react"
import { cn } from "../../lib/cn"
import type { Reservation } from "../../lib/reservationData"
import { getVillaImage, formatDate, formatGuests, getStatusDisplay } from "../../lib/reservationData"

interface Props {
  reservation: Reservation
}

export function ReservationOverviewCard({ reservation }: Props) {
  const s = getStatusDisplay(reservation.status)
  const image = getVillaImage(reservation.villaName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-outline-variant/60 bg-white overflow-hidden shadow-sm"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-[280px] lg:w-[320px] shrink-0 h-[200px] md:h-auto relative overflow-hidden">
          <img
            src={image}
            alt={reservation.villaName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-on-surface">
              <DoorOpen size={13} />
              {reservation.villaName}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-6 md:p-8 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <h3 className="font-display text-headline-md text-on-surface mb-1">
                {reservation.villaName}
              </h3>
              <p className="font-body text-sm text-on-surface-variant/60 font-mono tracking-tight truncate">
                {reservation.id}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                s.bg,
                s.color,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            <InfoRow icon={CalendarDays} label="Check-in" value={formatDate(reservation.checkIn)} />
            <InfoRow icon={CalendarDays} label="Check-out" value={formatDate(reservation.checkOut)} />
            <InfoRow icon={Clock} label="Duration" value="22 Hours" />
            <InfoRow icon={Users} label="Guests" value={formatGuests(reservation.guests)} />
            <InfoRow icon={Hash} label="Reserved on" value={formatDate(reservation.createdAt)} />
            <InfoRow icon={DoorOpen} label="Capacity" value={`Up to ${reservation.maxGuests} guests`} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} className="text-primary/50" />
        <span className="font-body text-[11px] text-on-surface-variant/60 uppercase tracking-widest font-medium">
          {label}
        </span>
      </div>
      <p className="font-body text-body-md font-medium text-on-surface">{value}</p>
    </div>
  )
}
