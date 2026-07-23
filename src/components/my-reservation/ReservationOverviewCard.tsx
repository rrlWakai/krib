import { motion } from "framer-motion"
import {
  CalendarDays,
  Users,
  Clock,
  Hash,
  DoorOpen,
  PartyPopper,
  Tag,
} from "lucide-react"
import { cn } from "../../lib/cn"
import type { Reservation } from "../../lib/reservationData"
import {
  getVillaImage,
  formatDate,
  formatGuests,
  formatGuestCount,
  getStayDuration,
  formatPrice,
  getStatusDisplay,
} from "../../lib/reservationData"

interface Props {
  reservation: Reservation
}

export function ReservationOverviewCard({ reservation }: Props) {
  const s = getStatusDisplay(reservation.status)
  const image = getVillaImage(reservation.villaName)
  const hasPartyFee = (reservation.partyFee ?? 0) > 0
  const hasDiscount = false

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-outline-variant/60 bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      {/* Villa Image Hero */}
      <div className="relative h-[220px] md:h-[260px] overflow-hidden">
        <img
          src={image}
          alt={reservation.villaName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-body text-[10px] text-white/50 uppercase tracking-[0.2em] font-semibold mb-1.5">
                Your Villa
              </p>
              <h3 className="font-display text-headline-md md:text-headline-lg text-white">
                {reservation.villaName}
              </h3>
            </div>
            <span
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm",
                "bg-white/90",
                s.color,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row">
        {/* Left: Details */}
        <div className="flex-1 p-6 md:p-8 md:border-r border-outline-variant/30">
          {/* Reservation Code */}
          <div className="flex items-center gap-2 mb-6">
            <Hash size={12} className="text-on-surface-variant/40" />
            <span className="font-mono text-sm text-on-surface-variant/60 tracking-tight">
              {reservation.id}
            </span>
          </div>

          {/* Stay Details Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <DetailItem
              icon={CalendarDays}
              label="Check-in"
              value={formatDate(reservation.checkIn)}
              emphasis
            />
            <DetailItem
              icon={CalendarDays}
              label="Check-out"
              value={formatDate(reservation.checkOut)}
            />
            <DetailItem
              icon={Clock}
              label="Duration"
              value={getStayDuration(reservation.checkIn, reservation.checkOut)}
            />
            <DetailItem
              icon={Users}
              label="Guests"
              value={formatGuests(reservation.guests)}
            />
            <DetailItem
              icon={DoorOpen}
              label="Capacity"
              value={`Up to ${reservation.maxGuests} guests`}
            />
            <DetailItem
              icon={Hash}
              label="Reserved on"
              value={formatDate(reservation.createdAt)}
            />
          </div>

          {/* Confirmation Number */}
          {reservation.confirmationNumber && (
            <div className="mt-6 pt-5 border-t border-outline-variant/30">
              <DetailItem
                icon={Hash}
                label="Confirmation Number"
                value={reservation.confirmationNumber}
              />
            </div>
          )}

          {/* Approval Date */}
          {reservation.approvalDate && (
            <div className="mt-4">
              <DetailItem
                icon={CalendarDays}
                label="Approved on"
                value={formatDate(reservation.approvalDate)}
              />
            </div>
          )}
        </div>

        {/* Right: Pricing Summary */}
        <div className="w-full md:w-[300px] lg:w-[340px] shrink-0 p-6 md:p-8">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50 mb-5">
            Pricing Summary
          </p>

          <div className="space-y-3">
            <PricingRow
              label="Base Rate (21-Hour Stay)"
              value={reservation.baseRate ? formatPrice(reservation.baseRate) : "—"}
            />

            {hasPartyFee && (
              <PricingRow
                label="Party Fee"
                value={formatPrice(reservation.partyFee!)}
                icon={<PartyPopper size={12} className="text-secondary/60" />}
              />
            )}

            {hasDiscount && (
              <PricingRow
                label="Discount"
                value="-₱0"
                icon={<Tag size={12} className="text-tertiary/60" />}
                valueClassName="text-tertiary"
              />
            )}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <div className="flex justify-between items-baseline">
              <span className="font-body text-sm font-semibold text-on-surface">Total</span>
              <span className="font-display text-headline-sm text-primary">
                {reservation.totalAmount ? formatPrice(reservation.totalAmount) : "—"}
              </span>
            </div>
          </div>

          {/* Payment Due */}
          {reservation.amountDue && reservation.status === "awaiting_payment" && (
            <div className="mt-5 p-4 rounded-xl bg-blue-50/60 border border-blue-200/40">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600/70 mb-1">
                Down Payment Due
              </p>
              <p className="font-display text-headline-sm text-blue-800">
                {formatPrice(reservation.amountDue)}
              </p>
              {reservation.paymentDeadline && (
                <p className="font-body text-xs text-blue-700/60 mt-1">
                  Due by {formatDate(reservation.paymentDeadline)}
                </p>
              )}
            </div>
          )}

          {/* Guest name */}
          {reservation.guestName && (
            <div className="mt-5 pt-4 border-t border-outline-variant/30">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant/50 mb-1">
                Guest Name
              </p>
              <p className="font-body text-sm text-on-surface font-medium">
                {reservation.guestName}
              </p>
            </div>
          )}

          {/* Guest count summary */}
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant/50 mb-1">
              Total Guests
            </p>
            <p className="font-body text-sm text-on-surface font-medium">
              {formatGuestCount(reservation.guests)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
  emphasis,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-primary/40" />
        <span className="font-body text-[10px] text-on-surface-variant/50 uppercase tracking-[0.1em] font-medium">
          {label}
        </span>
      </div>
      <p className={cn(
        "font-body text-sm leading-snug",
        emphasis ? "text-primary font-semibold" : "text-on-surface font-medium",
      )}>
        {value}
      </p>
    </div>
  )
}

function PricingRow({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-body text-sm text-on-surface-variant/70 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className={cn("font-body text-sm text-on-surface font-medium tabular-nums", valueClassName)}>
        {value}
      </span>
    </div>
  )
}
