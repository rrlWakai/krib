import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import type { ReservationStatus } from "../../lib/reservationData";
import { getStatusDisplay } from "../../lib/reservationData";

interface Props {
  status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: Props) {
  const s = getStatusDisplay(status);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold tracking-tight",
        s.bg,
        s.color,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      {s.label}
    </motion.span>
  );
}
