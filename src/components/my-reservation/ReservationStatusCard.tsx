import { motion } from "framer-motion"
import { Clock, ArrowRight, PartyPopper, Heart, AlertTriangle, Frown, ExternalLink } from "lucide-react"
import { cn } from "../../lib/cn"
import type { ReservationStatus } from "../../lib/reservationData"
import { getStatusContext } from "../../lib/reservationData"

interface Props {
  status: ReservationStatus
}

const STATUS_VISUAL: Record<ReservationStatus, {
  bg: string
  iconBg: string
  iconColor: string
  icon: typeof Clock
}> = {
  awaiting_confirmation: {
    bg: "bg-amber-50/60 border-amber-200/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: Clock,
  },
  awaiting_payment: {
    bg: "bg-blue-50/60 border-blue-200/50",
    iconBg: "bg-blue-100",
    iconColor: "text-[#4F91B8]",
    icon: PartyPopper,
  },
  confirmed: {
    bg: "bg-green-50/60 border-green-200/50",
    iconBg: "bg-green-100",
    iconColor: "text-[#7FAE87]",
    icon: Heart,
  },
  completed: {
    bg: "bg-tertiary-container/30 border-tertiary/10",
    iconBg: "bg-tertiary-container",
    iconColor: "text-tertiary",
    icon: Heart,
  },
  cancelled: {
    bg: "bg-surface-container-low border-outline-variant/40",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant/60",
    icon: Frown,
  },
  declined: {
    bg: "bg-red-50/60 border-red-200/50",
    iconBg: "bg-red-100",
    iconColor: "text-[#C86A5A]",
    icon: AlertTriangle,
  },
  expired: {
    bg: "bg-red-50/40 border-red-200/40",
    iconBg: "bg-red-50",
    iconColor: "text-[#C86A5A]",
    icon: Clock,
  },
}

export function ReservationStatusCard({ status }: Props) {
  const ctx = getStatusContext(status)
  const visual = STATUS_VISUAL[status]
  const Icon = visual.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn("rounded-[20px] border p-6 md:p-8", visual.bg)}
    >
      <div className="flex items-start gap-4 md:gap-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn("w-11 h-11 rounded-full flex items-center justify-center shrink-0", visual.iconBg)}
        >
          <Icon size={18} className={visual.iconColor} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-headline-sm max-md:text-headline-sm-mobile text-on-surface mb-2 leading-snug">
            {ctx.heading}
          </h3>
          <p className="font-body text-body-md text-on-surface-variant leading-relaxed mb-5">
            {ctx.body}
          </p>

          {/* Contextual actions */}
          <div className="flex flex-wrap items-center gap-3">
            {status === "awaiting_confirmation" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-100/60 border border-amber-200/40"
              >
                <Clock size={13} className="text-amber-600" />
                <span className="font-body text-xs text-amber-800 font-medium">
                  Average response time: Within a few hours
                </span>
              </motion.div>
            )}

            {status === "awaiting_payment" && (
              <motion.a
                href="#payment"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-body text-[11px] font-semibold uppercase tracking-[0.1em] shadow-[0_2px_8px_rgba(0,71,171,0.25)] hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)] transition-all duration-300"
              >
                Complete Payment
                <ArrowRight size={13} />
              </motion.a>
            )}

            {status === "confirmed" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-100/60 border border-green-200/40"
              >
                <Heart size={13} className="text-[#7FAE87]" />
                <span className="font-body text-xs text-green-800 font-medium">
                  Guest guide will be sent 3 days before check-in
                </span>
              </motion.div>
            )}

            {status === "declined" && (
              <motion.a
                href="/"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Browse Other Dates
                <ArrowRight size={14} />
              </motion.a>
            )}

            {status === "expired" && (
              <motion.a
                href="/"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Make a New Reservation
                <ArrowRight size={14} />
              </motion.a>
            )}

            {(status === "cancelled" || status === "declined" || status === "expired") && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex items-center gap-4"
              >
                <span className="text-outline-variant/40">|</span>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-body text-sm text-on-surface-variant/60 hover:text-primary transition-colors"
                >
                  Contact Us
                  <ExternalLink size={10} className="opacity-40" />
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
