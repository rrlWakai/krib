import { motion } from "framer-motion"
import { cn } from "../../lib/cn"
import type { ReservationStatus } from "../../lib/reservationData"
import { TIMELINE_STEPS } from "../../lib/reservationData"

interface Props {
  status: ReservationStatus
}

const STATUS_RANK: Record<string, number> = {
  submitted: 0,
  awaiting_confirmation: 1,
  awaiting_payment: 2,
  confirmed: 3,
  completed: 4,
}

const TERMINAL: ReservationStatus[] = ["cancelled", "declined", "expired"]

export function ReservationProgressTracker({ status }: Props) {
  const isTerminal = TERMINAL.includes(status)
  const currentRank = isTerminal ? -1 : STATUS_RANK[status] ?? -1

  return (
    <div className="w-full">
      <div className="relative flex items-start justify-between gap-0 md:gap-4">
        {TIMELINE_STEPS.map((step, i) => {
          const rank = STATUS_RANK[step.key]
          const done = !isTerminal && currentRank > rank
          const active = !isTerminal && currentRank === rank
          const last = i === TIMELINE_STEPS.length - 1

          return (
            <div key={step.key} className="flex-1 relative flex flex-col items-center">
              <div className="relative w-full flex items-center justify-center">
                {!last && (
                  <div
                    className={cn(
                      "absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] h-px top-1/2 -translate-y-1/2 transition-colors duration-700",
                      done ? "bg-primary" : "bg-outline-variant",
                    )}
                  />
                )}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500",
                    done
                      ? "border-primary bg-primary text-white shadow-[0_0_0_4px_rgba(0,71,171,0.1)]"
                      : active
                        ? "border-[#4F91B8] bg-[#4F91B8] text-white shadow-[0_0_0_4px_rgba(79,145,184,0.12)]"
                        : "border-outline bg-white text-on-surface-variant/50",
                  )}
                >
                  {done ? (
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="w-4 h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <motion.path
                        d="M3 8.5L6.5 12L13 4"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1 + 0.15 }}
                      />
                    </motion.svg>
                  ) : active ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-current"
                    />
                  ) : (
                    <span className="text-xs">{i + 1}</span>
                  )}
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.15, duration: 0.3 }}
                className={cn(
                  "font-body text-[11px] md:text-xs font-medium mt-3 text-center leading-tight max-w-[80px] md:max-w-none transition-colors duration-500",
                  done || active ? "text-on-surface" : "text-on-surface-variant/50",
                )}
              >
                {step.label}
              </motion.p>
            </div>
          )
        })}
      </div>

      {isTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200/60 text-sm font-medium text-red-800">
            <span className="w-2 h-2 rounded-full bg-[#C86A5A]" />
            {status === "cancelled"
              ? "Cancelled"
              : status === "declined"
                ? "Declined"
                : "Expired"}
          </span>
        </motion.div>
      )}
    </div>
  )
}
