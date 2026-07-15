import { motion } from 'framer-motion'
import { Waves, Snowflake, Tv, Music, Wifi, UtensilsCrossed, Gamepad2, ShowerHead } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const signatureAmenities: { icon: LucideIcon; label: string }[] = [
  { icon: Waves, label: 'Private Swimming Pool' },
  { icon: Snowflake, label: 'Fully Air-conditioned' },
  { icon: Tv, label: 'Smart TV with Netflix' },
  { icon: Music, label: 'Unlimited Videoke' },
  { icon: Wifi, label: 'Unlimited WiFi' },
  { icon: UtensilsCrossed, label: 'Complete Kitchen' },
  { icon: Gamepad2, label: 'Board Games' },
  { icon: ShowerHead, label: 'Outdoor Shower' },
]

export function Amenities() {
  return (
    <section className="relative overflow-hidden bg-white py-section-gap">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,71,171,0.02),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(79,145,184,0.015),transparent_50%)] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
        {/* Editorial section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-20"
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="w-8 h-px bg-primary/40" />
            <span className="font-body text-label-caps text-primary uppercase tracking-[0.28em] text-sm font-medium">
              Featured Amenities
            </span>
          </div>
          <h2 className="font-display text-display-md max-md:text-display-md-mobile text-on-surface mb-5 leading-tight max-w-3xl">
            Designed for comfort, built for connection.
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Every villa is thoughtfully equipped so you can focus on what
            matters — spending time with the people you love.
          </p>
        </motion.div>

        {/* Editorial amenities grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
          {signatureAmenities.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "flex items-center gap-5 py-5 md:py-6",
                  i < signatureAmenities.length - 2 ? "border-b border-outline-variant/40" : "",
                  i === signatureAmenities.length - 2 && signatureAmenities.length % 2 === 0
                    ? "md:border-b-0 border-b border-outline-variant/40"
                    : "",
                )}
              >
                <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/40 text-on-surface-variant/70">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <span className="font-body text-body-md text-on-surface font-medium">
                  {item.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
