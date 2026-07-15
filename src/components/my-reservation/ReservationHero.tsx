import { motion } from "framer-motion"
import { CalendarDays } from "lucide-react"

export function ReservationHero() {
  return (
    <section className="relative pt-36 pb-20 md:pb-28 px-margin-desktop max-md:px-margin-mobile overflow-hidden">
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
            Everything about your upcoming stay in one place.
          </p>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <CalendarDays size={600} className="text-primary absolute -top-20 -right-20 rotate-12" />
      </div>
    </section>
  )
}
