import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function ReservationHero() {
  return (
    <section className="relative pt-36 pb-16 md:pb-20 px-margin-desktop max-md:px-margin-mobile overflow-hidden">
      <div className="max-w-container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-primary/40" />
            <span className="font-body text-label-caps text-primary uppercase tracking-[0.2em]">
              Guest Portal
            </span>
          </div>
          <h1 className="font-display text-display-md max-md:text-display-md-mobile text-on-surface mb-5 leading-tight">
            My Reservation
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
            Check the latest status of your reservation and stay updated throughout the approval process.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 mt-8"
        >
          <Shield size={14} className="text-tertiary" />
          <span className="font-body text-sm text-on-surface-variant/70">
            Your reservation information is private and securely stored.
          </span>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none overflow-hidden opacity-[0.025]">
        <svg viewBox="0 0 200 200" className="text-primary absolute -top-10 -right-10 w-[500px] h-[500px] rotate-12">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
    </section>
  )
}
