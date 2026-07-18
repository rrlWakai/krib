import { motion } from "framer-motion"
import { Check, X, Clock } from "lucide-react"
import { cn } from "../../lib/cn"
import type { ReservationStatus } from "../../lib/reservationData"
import { TIMELINE_STEPS } from "../../lib/reservationData"

interface Props {
  status: ReservationStatus
}

const TERMINAL: ReservationStatus[] = ["cancelled", "declined", "expired"]

const TERMINAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof X }> = {
  cancelled: { label: "Cancelled", color: "text-on-surface-variant", bg: "bg-surface-container-high border-outline-variant/60", icon: X },
  declined: { label: "Declined", color: "text-red-800", bg: "bg-red-50 border-red-200/60", icon: X },
  expired: { label: "Expired", color: "text-red-800", bg: "bg-red-50 border-red-200/60", icon: Clock },
}

function getStepStatus(
  stepIndex: number,
  currentStep: number,
  isTerminal: boolean,
): "done" | "active" | "upcoming" {
  if (isTerminal) return "upcoming"
  if (stepIndex < currentStep) return "done"
  if (stepIndex === currentStep) return "active"
  return "upcoming"
}

export function ReservationProgressTracker({ status }: Props) {
  const isTerminal = TERMINAL.includes(status)

  const STATUS_RANK: Record<string, number> = {
    awaiting_confirmation: 1,
    awaiting_payment: 3,
    confirmed: 5,
    completed: 6,
  }
  const currentStep = isTerminal ? -1 : (STATUS_RANK[status] ?? -1)

  return (
    <div className="w-full">
      {/* Horizontal timeline */}
      <div className="relative overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex items-start justify-between min-w-[640px] gap-1">
          {TIMELINE_STEPS.map((step, i) => {
            const stepStatus = getStepStatus(i, currentStep, isTerminal)
            const isLast = i === TIMELINE_STEPS.length - 1

            return (
              <div key={step.key} className="flex-1 relative flex flex-col items-center">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] h-[2px] top-[18px] -translate-y-1/2">
                    <div className="w-full h-full bg-outline-variant/60" />
                    {stepStatus === "done" && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 bg-primary origin-left"
                      />
                    )}
                  </div>
                )}

                {/* Node */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                    stepStatus === "done" && "bg-primary text-white shadow-[0_0_0_4px_rgba(0,71,171,0.08)]",
                    stepStatus === "active" && "bg-[#4F91B8] text-white shadow-[0_0_0_4px_rgba(79,145,184,0.12)]",
                    stepStatus === "upcoming" && "bg-white border-2 border-outline-variant/60 text-on-surface-variant/30",
                  )}
                >
                  {stepStatus === "done" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.08 + 0.15, duration: 0.3 }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  ) : stepStatus === "active" ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  ) : (
                    <span className="text-[11px] font-medium">{i + 1}</span>
                  )}
                </motion.div>

                {/* Label */}
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.1, duration: 0.3 }}
                  className={cn(
                    "font-body text-[10px] md:text-[11px] font-medium mt-3 text-center leading-tight max-w-[70px] md:max-w-none transition-colors duration-500",
                    stepStatus === "done" || stepStatus === "active"
                      ? "text-on-surface"
                      : "text-on-surface-variant/40",
                  )}
                >
                  {step.label}
                </motion.p>

                {/* Emotional subtitle for active step */}
                {stepStatus === "active" && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 + 0.2, duration: 0.3 }}
                    className="font-body text-[10px] text-primary/70 mt-1 text-center max-w-[80px] md:max-w-[100px] leading-tight hidden md:block"
                  >
                    {step.emotionalLabel}
                  </motion.p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Terminal status badge */}
      {isTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 text-center"
        >
          {(() => {
            const config = TERMINAL_CONFIG[status]
            if (!config) return null
            const Icon = config.icon
            return (
              <span className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium",
                config.bg,
                config.color,
              )}>
                <Icon size={14} />
                {config.label}
              </span>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}
