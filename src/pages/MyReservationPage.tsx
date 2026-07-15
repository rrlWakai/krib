import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowLeft } from "lucide-react"
import { ReservationHero } from "../components/my-reservation/ReservationHero"
import { ReservationProgressTracker } from "../components/my-reservation/ReservationProgressTracker"
import { ReservationStatusCard } from "../components/my-reservation/ReservationStatusCard"
import { ReservationOverviewCard } from "../components/my-reservation/ReservationOverviewCard"
import { PaymentCard } from "../components/my-reservation/PaymentCard"
import { BeforeCheckInSection } from "../components/my-reservation/BeforeCheckInSection"
import type { Reservation, ReservationStatus } from "../lib/reservationData"
import { lookupReservation } from "../lib/reservationData"

type PageStep = "lookup" | "result"

const TERMINAL: ReservationStatus[] = ["cancelled", "declined", "expired"]

export function MyReservationPage() {
  const [pageStep, setPageStep] = useState<PageStep>("lookup")
  const [id, setId] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [searching, setSearching] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)

  // auto-load from localStorage if redirected after booking
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
        setId(parsed.id)
        setEmail(parsed.email)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id.trim() || !email.trim()) {
      setError("Please enter both reservation ID and email.")
      return
    }
    setSearching(true)
    setError("")
    const result = await lookupReservation(id, email)
    if (result) {
      setReservation(result)
      setPageStep("result")
    } else {
      setError("No reservation found. Check your ID and email and try again.")
    }
    setSearching(false)
  }

  function handleReset() {
    setPageStep("lookup")
    setReservation(null)
    setError("")
  }

  const hasPaymentAction = reservation?.status === "awaiting_payment"
  const isTerminal = reservation ? TERMINAL.includes(reservation.status) : false

  return (
    <div className="min-h-screen bg-white">
      <ReservationHero />

      <section className="px-margin-desktop max-md:px-margin-mobile pb-24">
        <div className="max-w-container-max mx-auto">
          <AnimatePresence mode="wait">
            {pageStep === "lookup" ? (
              <motion.div
                key="lookup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-lg mx-auto"
              >
                <div className="rounded-[24px] border border-outline-variant/60 bg-white p-8 max-md:p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-6 h-px bg-primary/40" />
                    <span className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px]">
                      Find Your Reservation
                    </span>
                  </div>
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="res-id" className="font-body text-sm font-medium text-on-surface block mb-1.5">
                          Reservation ID
                        </label>
                        <input
                          id="res-id"
                          type="text"
                          value={id}
                          onChange={(e) => setId(e.target.value)}
                          placeholder="e.g. KRIB-20260715-8F3XK2"
                          className="w-full px-4 py-3.5 rounded-default border border-outline-variant bg-white text-on-surface font-body text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label htmlFor="res-email" className="font-body text-sm font-medium text-on-surface block mb-1.5">
                          Email Address
                        </label>
                        <input
                          id="res-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3.5 rounded-default border border-outline-variant bg-white text-on-surface font-body text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          autoComplete="email"
                        />
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-body text-sm text-red-600"
                        >
                          {error}
                        </motion.p>
                      )}
                      <button
                        type="submit"
                        disabled={searching}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary font-body text-label-caps uppercase tracking-widest rounded-default hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {searching ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Searching...
                          </span>
                        ) : (
                          <>
                            <Search size={14} />
                            Find Reservation
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : reservation ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 font-body text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                </div>

                {/* Progress tracker centerpiece */}
                <div className="mb-10 md:mb-14">
                  <ReservationProgressTracker status={reservation.status} />
                </div>

                <div className="space-y-5 max-w-3xl">
                  <ReservationOverviewCard reservation={reservation} />
                  <ReservationStatusCard status={reservation.status} />

                  {hasPaymentAction && reservation.amountDue && reservation.paymentDeadline && (
                    <PaymentCard amountDue={reservation.amountDue} deadline={reservation.paymentDeadline} />
                  )}

                  {!isTerminal && <BeforeCheckInSection />}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
