import { motion } from "framer-motion"
import { Clock, ArrowRight } from "lucide-react"
import { cn } from "../../lib/cn"
import type { ReservationStatus } from "../../lib/reservationData"
import { getStatusContext, getStatusDisplay } from "../../lib/reservationData"

interface Props {
  status: ReservationStatus
}

export function ReservationStatusCard({ status }: Props) {
  const ctx = getStatusContext(status)
  const s = getStatusDisplay(status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("rounded-[24px] border p-8 max-md:p-6", s.bg)}
    >
      <div className="flex items-start gap-5">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", s.dot.replace('bg-', 'bg-').replace(/bg-.+/, `bg-${s.dot.split('-')[1]}/10`))}>
          <Clock size={22} className={s.dot.replace('bg-', 'text-')} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-headline-sm max-md:text-headline-sm-mobile text-on-surface mb-2">
            {ctx.heading}
          </h3>
          <p className="font-body text-body-md text-on-surface-variant leading-relaxed mb-4">
            {ctx.body}
          </p>
          {status === "declined" && (
            <a
              href="/"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Browse Villas <ArrowRight size={14} />
            </a>
          )}
          {status === "awaiting_confirmation" && (
            <div className="flex items-center gap-2 mt-2">
              <Clock size={13} className="text-amber-500" />
              <span className="font-body text-sm text-amber-700">Average review time: Within a few hours</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
