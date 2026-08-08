import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ReservationHero } from "../components/my-reservation/ReservationHero"
import { LookupForm } from "../components/my-reservation/LookupForm"
import { EmptyState } from "../components/my-reservation/EmptyState"
import { ReservationProgressTracker } from "../components/my-reservation/ReservationProgressTracker"
import { ReservationOverviewCard } from "../components/my-reservation/ReservationOverviewCard"
import { ReservationStatusCard } from "../components/my-reservation/ReservationStatusCard"
import { BeforeCheckInSection } from "../components/my-reservation/BeforeCheckInSection"
import type { Reservation, ReservationStatus } from "../lib/reservationData"
import {
  lookupByReference,
  lookupById,
  lookupByEmail,
  cancelReservation,
} from "../services/api/lookup"

type PageStep = "lookup" | "result"

const TERMINAL: ReservationStatus[] = ["cancelled", "declined"]

export function MyReservationPage() {
  const [pageStep, setPageStep] = useState<PageStep>("lookup")
  const [error, setError] = useState("")
  const [searching, setSearching] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)

  // Auto-load from sessionStorage if redirected after booking
  useEffect(() => {
    const fullData = sessionStorage.getItem("krib_last_reservation_full")
    if (fullData) {
      try {
        const parsed: Reservation = JSON.parse(fullData)
        setReservation(parsed)
        setPageStep("result")
        sessionStorage.removeItem("krib_last_reservation")
        sessionStorage.removeItem("krib_last_reservation_full")
        return
      } catch { /* ignore */ }
    }

    const stored = sessionStorage.getItem("krib_last_reservation")
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
    const result = await lookupById(resId, resEmail)
    if (result.reservation) {
      setReservation(result.reservation)
      setPageStep("result")
    } else {
      setError(result.error?.message ?? "Reservation not found.")
    }
    setSearching(false)
    sessionStorage.removeItem("krib_last_reservation")
  }

  const handleLookup = useCallback(async (lookupData: { id: string; email: string }) => {
    setSearching(true)
    setError("")

    let result: Reservation | null = null
    let resultError: string | null = null

    if (lookupData.id && !lookupData.email) {
      // Code-only lookup
      const res = await lookupByReference(lookupData.id)
      result = res.reservation
      resultError = res.error?.message ?? null
      if (!result && !resultError) {
        resultError = "No reservation found with that code. Please double-check and try again."
      }
    } else if (lookupData.email && !lookupData.id) {
      // Email-only lookup
      const res = await lookupByEmail(lookupData.email)
      if (res.reservation) {
        result = res.reservation
      } else if (res.error) {
        resultError = res.error.message
      } else if (res.reservations && res.reservations.length > 0) {
        // Multiple reservations — show the most recent one
        result = res.reservations[0]
      } else {
        resultError = "No reservations found under that email address."
      }
    } else if (lookupData.id && lookupData.email) {
      // Combined lookup (from auto-load)
      const res = await lookupByReference(lookupData.id, lookupData.email)
      result = res.reservation
      resultError = res.error?.message ?? null
      if (!result && !resultError) {
        resultError = "No reservation found. Check your details and try again."
      }
    }

    if (result) {
      setReservation(result)
      setPageStep("result")
    } else if (resultError) {
      setError(resultError)
    }
    setSearching(false)
  }, [])

  function handleReset() {
    setPageStep("lookup")
    setReservation(null)
    setError("")
  }

  async function handleCancelReservation() {
    if (!reservation?.referenceCode) return
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation? This action cannot be undone.",
    )
    if (!confirmed) return

    setCancelling(true)
    setError("")
    const result = await cancelReservation(reservation.referenceCode, reservation.email)
    if (result.reservation) {
      setReservation((prev) => (prev ? { ...prev, status: "cancelled" } : prev))
    } else if (result.error) {
      setError(result.error.message)
    }
    setCancelling(false)
  }

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
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl border border-red-200/60 bg-red-50/60 px-5 py-4 font-body text-sm text-red-800"
                    >
                      {error}
                    </motion.div>
                  )}

                  <ReservationOverviewCard reservation={reservation} />

                  <ReservationStatusCard status={reservation.status} />

                  {showGuide && <BeforeCheckInSection />}

                  {reservation.status === "pending" && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="pt-2"
                    >
                      <button
                        onClick={handleCancelReservation}
                        disabled={cancelling}
                        className="inline-flex items-center gap-2 font-body text-sm text-red-700 hover:text-red-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling && (
                          <Loader2 size={14} className="animate-spin" />
                        )}
                        {cancelling ? "Cancelling..." : "Cancel this reservation"}
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
