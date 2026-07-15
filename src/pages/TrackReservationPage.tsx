import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  X,
  CalendarDays,
  Users,
  Hash,
  Mail,
  Clock,
} from "lucide-react";
import { cn } from "../lib/cn";
import { lookupReservation, getStatusDisplay } from "../lib/reservationData";
import type { Reservation } from "../lib/reservationData";
import { ReservationStatusBadge } from "../components/ui/ReservationStatusBadge";
import { ReservationTimeline } from "../components/ui/ReservationTimeline";

export function TrackReservationPage() {
  const [reservationId, setReservationId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "found" | "not_found"
  >("idle");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [errors, setErrors] = useState<{ id?: string; email?: string }>({});

  function validate(): boolean {
    const e: { id?: string; email?: string } = {};
    if (!reservationId.trim()) e.id = "Reservation ID is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSearch() {
    if (!validate()) return;
    setStatus("loading");
    setReservation(null);
    const result = await lookupReservation(reservationId, email);
    if (result) {
      setReservation(result);
      setStatus("found");
    } else {
      setStatus("not_found");
    }
  }

  function handleReset() {
    setStatus("idle");
    setReservation(null);
    setReservationId("");
    setEmail("");
    setErrors({});
  }

  return (
    <main className="min-h-screen pt-28 pb-24 px-margin-desktop max-md:px-margin-mobile">
      <div className="mx-auto max-w-2xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-headline-2xl max-md:text-headline-2xl-mobile text-on-surface mb-3">
            Track Your Reservation
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Enter your Reservation ID and email address to check the status of
            your booking.
          </p>
        </motion.div>

        {/* Lookup Form */}
        {status !== "found" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[24px] border border-outline-variant/60 bg-white p-8 shadow-sm"
          >
            <div className="space-y-5">
              <div>
                <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                  <Hash size={12} className="inline mr-1.5 -mt-0.5" />
                  Reservation ID
                </label>
                <input
                  type="text"
                  value={reservationId}
                  onChange={(e) => setReservationId(e.target.value)}
                  placeholder="e.g. KRIB-20260715-8F3XK2"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200"
                />
                {errors.id && (
                  <p className="font-body text-[12px] text-error mt-1">
                    {errors.id}
                  </p>
                )}
              </div>
              <div>
                <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                  <Mail size={12} className="inline mr-1.5 -mt-0.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200"
                />
                {errors.email && (
                  <p className="font-body text-[12px] text-error mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={status === "loading"}
              className="mt-6 w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary font-body text-label-caps uppercase tracking-widest rounded-default shadow-button hover:bg-primary-hover hover:shadow-elevated transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === "loading" ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={14} />
                  Look Up Reservation
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Not Found */}
        {status === "not_found" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[24px] border border-outline-variant/60 bg-white p-8 md:p-12 shadow-sm text-center"
          >
            <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-5">
              <Search size={24} className="text-on-surface-variant/50" />
            </div>
            <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile text-on-surface mb-2">
              Reservation Not Found
            </h2>
            <p className="font-body text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed mb-6">
              We couldn't find a reservation matching the ID and email you
              provided. Please double-check your information and try again.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary font-body text-label-caps uppercase tracking-widest rounded-default shadow-button hover:bg-primary-hover transition-all duration-300 cursor-pointer"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Found - Reservation Details */}
        {status === "found" && reservation && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <ReservationStatusBadge status={reservation.status} />
              <button
                type="button"
                onClick={handleReset}
                className="font-body text-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X size={14} />
                Look up another
              </button>
            </div>

            {/* Summary Card */}
            <ReservationSummaryCard reservation={reservation} />

            {/* Awaiting Payment Card */}
            {reservation.status === "awaiting_payment" &&
              reservation.amountDue && (
                <AwaitingPaymentCard
                  amountDue={reservation.amountDue}
                  deadline={reservation.paymentDeadline!}
                />
              )}

            {/* Timeline */}
            <div className="rounded-[24px] border border-outline-variant/60 bg-white p-8 shadow-sm">
              <h3 className="font-display text-headline-md text-on-surface mb-6">
                Reservation Progress
              </h3>
              <ReservationTimeline status={reservation.status} />
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function ReservationSummaryCard({ reservation }: { reservation: Reservation }) {
  return (
    <div className="rounded-[24px] border border-outline-variant/60 bg-white p-8 shadow-sm">
      <h3 className="font-display text-headline-md text-on-surface mb-6">
        Reservation Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField
          icon={Hash}
          label="Reservation ID"
          value={reservation.id}
        />
        <DetailField
          icon={CalendarDays}
          label="Check-in"
          value={formatDate(reservation.checkIn)}
        />
        <DetailField
          icon={CalendarDays}
          label="Check-out"
          value={formatDate(reservation.checkOut)}
        />
        <DetailField
          icon={Users}
          label="Guests"
          value={formatGuests(reservation.guests)}
        />
        <DetailField
          icon={Clock}
          label="Status"
          value={getStatusDisplay(reservation.status).label}
        />
        <DetailField icon={Mail} label="Email" value={reservation.email} />
      </div>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-surface-container-low rounded-default">
      <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5 items-center gap-1.5">
        <Icon size={12} className="text-primary/60" />
        {label}
      </label>
      <p className="font-body text-body-md font-medium text-on-surface break-all">
        {value}
      </p>
    </div>
  );
}

function AwaitingPaymentCard({
  amountDue,
  deadline,
}: {
  amountDue: number;
  deadline: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-[24px] border p-8 shadow-sm",
        "border-blue-200/60 bg-linear-to-br from-blue-50/60 to-white",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Clock size={20} className="text-[#4F91B8]" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-headline-md text-on-surface mb-1">
            Payment Required
          </h3>
          <p className="font-body text-body-md text-on-surface-variant leading-relaxed mb-4">
            Your reservation has been confirmed! Please complete the payment of{" "}
            <strong className="text-on-surface">
              ₱{(amountDue / 100).toLocaleString()}
            </strong>{" "}
            to secure your booking.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 mb-4">
            <Clock size={13} className="text-amber-600" />
            <span className="font-body text-body-md text-sm font-medium text-amber-800">
              Due by {formatDate(deadline)}
            </span>
          </div>
          <div className="w-full bg-white border border-blue-200/60 rounded-default p-6 text-center">
            <p className="font-body text-sm text-on-surface-variant/60 mb-1">
              Payment via
            </p>
            <p className="font-display text-headline-sm font-semibold text-on-surface">
              PayMongo
            </p>
            <p className="font-body text-xs text-on-surface-variant/40 mt-2">
              Online payment integration coming soon.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-PH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatGuests(g: {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}): string {
  const parts: string[] = [];
  if (g.adults)
    parts.push(`${g.adults} ${g.adults === 1 ? "Adult" : "Adults"}`);
  if (g.children)
    parts.push(`${g.children} ${g.children === 1 ? "Child" : "Children"}`);
  if (g.infants)
    parts.push(`${g.infants} ${g.infants === 1 ? "Infant" : "Infants"}`);
  if (g.pets) parts.push(`${g.pets} ${g.pets === 1 ? "Pet" : "Pets"}`);
  return parts.join(", ");
}
