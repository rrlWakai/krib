import { motion } from "framer-motion"
import { Clock, MapPin, Shield, Phone, HelpCircle, Sun, ExternalLink } from "lucide-react"

const GUIDE_ITEMS = [
  {
    icon: Clock,
    label: "Check-in / Check-out",
    value: "2:00 PM — 12:00 PM",
    detail: "Your stay is a full 22-hour experience.",
  },
  {
    icon: Shield,
    label: "House Rules",
    value: "Quiet hours 10 PM — 7 AM",
    detail: "No smoking indoors. Maximum guest capacity applies.",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Beverly Place, Pampanga",
    link: "https://maps.app.goo.gl/1aYuBqXnG147AgWW6",
    linkLabel: "View on Map",
  },
  {
    icon: Phone,
    label: "Emergency Contact",
    value: "Available 24/7",
    detail: "Details provided upon confirmation.",
  },
  {
    icon: Sun,
    label: "What to Bring",
    value: "Swimwear, toiletries, and food",
    detail: "Insect repellent recommended for outdoor areas.",
  },
  {
    icon: HelpCircle,
    label: "Guest Guide",
    value: "Sent 3 days before check-in",
    detail: "A detailed guide with everything you need to know.",
  },
]

export function BeforeCheckInSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="w-6 h-px bg-primary/30" />
        <h3 className="font-display text-headline-sm max-md:text-headline-sm-mobile text-on-surface">
          Before You Arrive
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GUIDE_ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.3 }}
              className="group p-5 rounded-[16px] bg-surface-container-low/60 hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                  <Icon size={14} className="text-primary/60" />
                </div>
                <span className="font-body text-[10px] text-on-surface-variant/50 uppercase tracking-[0.1em] font-medium">
                  {item.label}
                </span>
              </div>

              <p className="font-body text-sm text-on-surface font-medium mb-1">
                {item.value}
              </p>

              {item.detail && (
                <p className="font-body text-xs text-on-surface-variant/50 leading-relaxed">
                  {item.detail}
                </p>
              )}

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-primary hover:text-primary-hover mt-2 transition-colors"
                >
                  {item.linkLabel}
                  <ExternalLink size={10} className="opacity-40" />
                </a>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
