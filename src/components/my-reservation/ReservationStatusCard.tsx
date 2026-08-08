import { motion } from "framer-motion"
import { Clock, ArrowRight, Heart, AlertTriangle, Frown, ExternalLink } from "lucide-react"
import { cn } from "../../lib/cn"
import type { ReservationStatus } from "../../lib/reservationData"
import { getStatusContext } from "../../lib/reservationData"
import { useSiteSettings } from "../../hooks/useSiteSettings"

interface Props {
  status: ReservationStatus
}

const STATUS_VISUAL: Record<ReservationStatus, {
  bg: string
  iconBg: string
  iconColor: string
  icon: typeof Clock
}> = {
  pending: {
    bg: "bg-amber-50/60 border-amber-200/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: Clock,
  },
  approved: {
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
}

export function ReservationStatusCard({ status }: Props) {
  const ctx = getStatusContext(status)
  const visual = STATUS_VISUAL[status]
  const Icon = visual.icon
  const { settings } = useSiteSettings()
  const contactHref =
    settings?.business?.facebook ||
    settings?.business?.instagram ||
    "https://facebook.com"

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
            {status === "pending" && (
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

            {status === "approved" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-100/60 border border-green-200/40"
              >
                <Heart size={13} className="text-[#7FAE87]" />
                <span className="font-body text-xs text-green-800 font-medium">
                  Check-in details were sent to your mobile number
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

            {(status === "cancelled" || status === "declined") && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex items-center gap-4"
              >
                <span className="text-outline-variant/40">|</span>
                <a
                  href={contactHref}
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
