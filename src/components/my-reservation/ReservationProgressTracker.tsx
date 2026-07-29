import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "../../lib/cn"
import type { ReservationStatus } from "../../lib/reservationData"
import { TIMELINE_STEPS } from "../../lib/reservationData"

interface Props {
  status: ReservationStatus
}

const TERMINAL: ReservationStatus[] = ["cancelled", "declined", "expired"]

const TERMINAL_LABELS: Record<string, string> = {
  cancelled: "Reservation Cancelled",
  declined: "Reservation Declined",
  expired: "Reservation Expired",
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
    confirmed: 3,
    completed: 3,
  }
  const currentStep = isTerminal ? -1 : (STATUS_RANK[status] ?? -1)

  return (
    <div className="w-full">
      {/* Desktop — 3 steps horizontal */}
      <div className="hidden md:flex items-start justify-between gap-8">
        {TIMELINE_STEPS.map((step, i) => {
          const stepStatus = getStepStatus(i, currentStep, isTerminal)
          const isLast = i === TIMELINE_STEPS.length - 1

          return (
            <div key={step.key} className="flex-1 relative flex flex-col items-center">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] h-px top-[19px]">
                  <div className="w-full h-full bg-outline-variant/40" />
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
                  "relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                  stepStatus === "done" && "bg-primary text-white",
                  stepStatus === "active" && "border-2 border-primary bg-white",
                  stepStatus === "upcoming" && "border-[1.5px] border-outline-variant/30 bg-white",
                )}
              >
                {stepStatus === "done" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.15, duration: 0.3 }}
                  >
                    <Check size={15} strokeWidth={2.5} />
                  </motion.div>
                ) : stepStatus === "active" ? (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ) : (
                  <span className="text-xs font-body font-medium text-on-surface-variant/25">{i + 1}</span>
                )}
              </motion.div>

              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 + 0.1, duration: 0.3 }}
                className={cn(
                  "font-body text-xs font-medium mt-3 text-center transition-colors duration-500",
                  stepStatus === "done" && "text-on-surface",
                  stepStatus === "active" && "text-primary",
                  stepStatus === "upcoming" && "text-on-surface-variant/35",
                )}
              >
                {step.label}
              </motion.p>

              {/* Description for active step */}
              {stepStatus === "active" && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.3 }}
                  className="font-body text-xs text-on-surface-variant/60 mt-1.5 text-center leading-relaxed max-w-[200px]"
                >
                  {step.description}
                </motion.p>
              )}
            </div>
          )
        })}
      </div>

      {/* Tablet — wrap to 2 rows */}
      <div className="hidden sm:flex md:hidden flex-wrap items-start justify-between gap-y-8">
        {TIMELINE_STEPS.map((step, i) => {
          const stepStatus = getStepStatus(i, currentStep, isTerminal)
          const isLast = i === TIMELINE_STEPS.length - 1

          return (
            <div key={step.key} className="relative flex flex-col items-center" style={{ width: i < 2 ? '50%' : '100%' }}>
              {/* Connector line */}
              {!isLast && (
                <div className={cn(
                  "absolute h-px top-[19px]",
                  i === 0 ? "left-[calc(50%+22px)] right-4" : "",
                  i === 1 ? "left-4 right-[calc(50%+22px)]" : "",
                )}>
                  <div className="w-full h-full bg-outline-variant/40" />
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
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                  stepStatus === "done" && "bg-primary text-white",
                  stepStatus === "active" && "border-2 border-primary bg-white",
                  stepStatus === "upcoming" && "border-[1.5px] border-outline-variant/30 bg-white",
                )}
              >
                {stepStatus === "done" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.15, duration: 0.3 }}
                  >
                    <Check size={15} strokeWidth={2.5} />
                  </motion.div>
                ) : stepStatus === "active" ? (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ) : (
                  <span className="text-xs font-body font-medium text-on-surface-variant/25">{i + 1}</span>
                )}
              </motion.div>

              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 + 0.1, duration: 0.3 }}
                className={cn(
                  "font-body text-xs font-medium mt-3 text-center transition-colors duration-500",
                  stepStatus === "done" && "text-on-surface",
                  stepStatus === "active" && "text-primary",
                  stepStatus === "upcoming" && "text-on-surface-variant/35",
                )}
              >
                {step.label}
              </motion.p>
            </div>
          )
        })}
      </div>

      {/* Mobile — 3 steps vertical */}
      <div className="sm:hidden space-y-0">
        {TIMELINE_STEPS.map((step, i) => {
          const stepStatus = getStepStatus(i, currentStep, isTerminal)
          const isLast = i === TIMELINE_STEPS.length - 1

          return (
            <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <div className="absolute left-[18.5px] top-10 bottom-0 w-px bg-outline-variant/40">
                  {stepStatus === "done" && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-primary origin-top"
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
                  "relative z-10 w-[37px] h-[37px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                  stepStatus === "done" && "bg-primary text-white",
                  stepStatus === "active" && "border-2 border-primary bg-white",
                  stepStatus === "upcoming" && "border-[1.5px] border-outline-variant/30 bg-white",
                )}
              >
                {stepStatus === "done" ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : stepStatus === "active" ? (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ) : (
                  <span className="text-xs font-body font-medium text-on-surface-variant/25">{i + 1}</span>
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 pt-1.5">
                <p className={cn(
                  "font-body text-sm font-medium transition-colors duration-500",
                  stepStatus === "done" && "text-on-surface",
                  stepStatus === "active" && "text-primary font-semibold",
                  stepStatus === "upcoming" && "text-on-surface-variant/35",
                )}>
                  {step.label}
                </p>
                {stepStatus === "active" && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="font-body text-xs text-on-surface-variant/60 mt-1.5 leading-relaxed"
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Terminal states */}
      {isTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 md:mt-10"
        >
          <div className="flex items-start gap-3 p-5 md:p-6 rounded-xl bg-red-50/50 border border-red-200/40">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <X size={16} className="text-[#C86A5A]" />
            </div>
            <div>
              <p className="font-display text-headline-xs text-on-surface mb-1">
                {TERMINAL_LABELS[status] ?? status}
              </p>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {status === "declined"
                  ? "Your requested dates are not available. Please try booking a different date or contact us for assistance."
                  : status === "cancelled"
                    ? "This reservation has been cancelled. If you have any questions, please contact us."
                    : "The reservation window for this request has passed. Please contact us if you would like to explore new dates."}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 mt-3 font-body text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                {status === "declined" ? "Browse Other Dates" : "Make a New Reservation"}
                <span className="text-xs ml-0.5">→</span>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
