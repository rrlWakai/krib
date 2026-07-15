import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import type { ReservationStatus } from "../../lib/reservationData";
import { TIMELINE_STEPS } from "../../lib/reservationData";

interface Props {
  status: ReservationStatus;
}

const STATUS_RANK: Record<string, number> = {
  submitted: 0,
  awaiting_confirmation: 1,
  awaiting_payment: 2,
  confirmed: 3,
  completed: 4,
};

const TERMINAL: ReservationStatus[] = ["cancelled", "declined", "expired"];

export function ReservationTimeline({ status }: Props) {
  const isTerminal = TERMINAL.includes(status);
  const currentRank = isTerminal ? -1 : STATUS_RANK[status] ?? -1;

  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, i) => {
        const rank = STATUS_RANK[step.key];
        const done = !isTerminal && currentRank >= rank;
        const active = !isTerminal && currentRank === rank;
        const last = i === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-500",
                  done
                    ? "border-primary bg-primary text-white"
                    : active
                      ? "border-[#4F91B8] bg-[#4F91B8] text-white"
                      : "border-outline bg-white text-on-surface-variant",
                )}
              >
                {done ? "✓" : active ? "●" : i + 1}
              </motion.div>
              {!last && (
                <div
                  className={cn(
                    "mt-1 h-full w-px transition-colors duration-500",
                    done ? "bg-primary" : "bg-outline-variant",
                  )}
                />
              )}
            </div>
            <div className="pt-1.5">
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "font-body text-sm font-medium transition-colors duration-500",
                  done || active
                    ? "text-on-surface"
                    : "text-on-surface-variant/60",
                )}
              >
                {step.label}
              </motion.p>
            </div>
          </div>
        );
      })}

      {isTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-start gap-4"
        >
          <div className="flex flex-col items-center">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#C86A5A] bg-[#C86A5A] text-white text-xs font-bold">
              ✕
            </div>
          </div>
          <div className="pt-1.5">
            <p className="font-body text-sm font-medium text-[#C86A5A]">
              {status === "cancelled"
                ? "Cancelled"
                : status === "declined"
                  ? "Declined"
                  : "Expired"}
            </p>
            <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">
              {status === "cancelled"
                ? "This reservation was cancelled."
                : status === "declined"
                  ? "The owner declined this reservation request."
                  : "The payment deadline passed and this reservation has expired."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
