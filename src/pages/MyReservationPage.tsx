import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { ReservationHero } from "../components/my-reservation/ReservationHero"
import { LookupForm } from "../components/my-reservation/LookupForm"
import { EmptyState } from "../components/my-reservation/EmptyState"
import { ReservationProgressTracker } from "../components/my-reservation/ReservationProgressTracker"
import { ReservationOverviewCard } from "../components/my-reservation/ReservationOverviewCard"
import { ReservationStatusCard } from "../components/my-reservation/ReservationStatusCard"
import { PaymentCard } from "../components/my-reservation/PaymentCard"
import { BeforeCheckInSection } from "../components/my-reservation/BeforeCheckInSection"
import type { Reservation, ReservationStatus } from "../lib/reservationData"
import {
  lookupReservation,
  lookupByCode,
  lookupByEmail,
} from "../lib/reservationData"

type PageStep = "lookup" | "result"

const TERMINAL: ReservationStatus[] = ["cancelled", "declined", "expired"]

export function MyReservationPage() {
  const [pageStep, setPageStep] = useState<PageStep>("lookup")
  const [error, setError] = useState("")
  const [searching, setSearching] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)

  // Auto-load from localStorage if redirected after booking
  useEffect(() => {
    const fullData = localStorage.getItem("krib_last_reservation_full")
    if (fullData) {
      try {
        const parsed: Reservation = JSON.parse(fullData)
        setReservation(parsed)
        setPageStep("result")
        localStorage.removeItem("krib_last_reservation")
        localStorage.removeItem("krib_last_reservation_full")
        return
      } catch { /* ignore */ }
    }

    const stored = localStorage.getItem("krib_last_reservation")
    if (stored) {
      try {
        const parsed: { id: string; email: string } = JSON.parse(stored)
        handleAutoLookup(parsed.id, parsed.email)
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAutoLookup(resId: string, resEmail: string) {
    setSearching(true)
    setError("")
    const result = await lookupReservation(resId, resEmail)
    if (result) {
      setReservation(result)
      setPageStep("result")
    } else {
      setError("Reservation not found.")
    }
    setSearching(false)
    localStorage.removeItem("krib_last_reservation")
  }

  const handleLookup = useCallback(async (lookupData: { id: string; email: string }) => {
    setSearching(true)
    setError("")

    let result: Reservation | null = null

    if (lookupData.id && !lookupData.email) {
      // Code-only lookup
      result = await lookupByCode(lookupData.id)
      if (!result) {
        setError("No reservation found with that code. Please double-check and try again.")
      }
    } else if (lookupData.email && !lookupData.id) {
      // Email-only lookup
      const results = await lookupByEmail(lookupData.email)
      if (results.length === 0) {
        setError("No reservations found under that email address.")
      } else if (results.length === 1) {
        result = results[0]
      } else {
        // Multiple reservations — show the most recent one
        result = results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      }
    } else if (lookupData.id && lookupData.email) {
      // Combined lookup (from auto-load)
      result = await lookupReservation(lookupData.id, lookupData.email)
      if (!result) {
        setError("No reservation found. Check your details and try again.")
      }
    }

    if (result) {
      setReservation(result)
      setPageStep("result")
    }
    setSearching(false)
  }, [])

  function handleReset() {
    setPageStep("lookup")
    setReservation(null)
    setError("")
  }

  const hasPaymentAction = reservation?.status === "awaiting_payment"
  const isTerminal = reservation ? TERMINAL.includes(reservation.status) : false
  const showGuide = reservation && !isTerminal

  return (
    <div className="min-h-screen bg-white">
      <ReservationHero />

      <section className="px-margin-desktop max-md:px-margin-mobile pb-section-gap max-md:pb-section-gap-mobile">
        <div className="max-w-container-max mx-auto">
          <AnimatePresence mode="wait">
            {pageStep === "lookup" ? (
              <motion.div
                key="lookup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <LookupForm
                  onFound={handleLookup}
                  onError={setError}
                  onSearching={setSearching}
                  searching={searching}
                />

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="max-w-lg mx-auto mt-4"
                    >
                      <EmptyState message={error} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : reservation ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-4xl mx-auto"
              >
                {/* Back button */}
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mb-8 md:mb-10"
                >
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 font-body text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                    Back to Lookup
                  </button>
                </motion.div>

                {/* Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mb-10 md:mb-14"
                >
                  <ReservationProgressTracker status={reservation.status} />
                </motion.div>

                {/* Reservation Summary */}
                <div className="space-y-5 md:space-y-6">
                  <ReservationOverviewCard reservation={reservation} />

                  <ReservationStatusCard status={reservation.status} />

                  {hasPaymentAction && reservation.amountDue && reservation.paymentDeadline && (
                    <PaymentCard
                      amountDue={reservation.amountDue}
                      deadline={reservation.paymentDeadline}
                    />
                  )}

                  {showGuide && <BeforeCheckInSection />}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
