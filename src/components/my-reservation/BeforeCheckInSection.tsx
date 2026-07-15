import { motion } from "framer-motion"
import { Clock, MapPin, Shield, Phone, HelpCircle, Sun } from "lucide-react"

export function BeforeCheckInSection() {
  const items = [
    {
      icon: Clock,
      label: "Check-in / Check-out",
      value: "2:00 PM — 12:00 PM (22-hour stay)",
    },
    {
      icon: Shield,
      label: "House Rules",
      value: "Quiet hours 10PM–7AM. No smoking indoors. Maximum guest capacity applies.",
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
      value: "Available 24/7 — details provided upon confirmation.",
    },
    {
      icon: Sun,
      label: "What to Bring",
      value: "Swimwear, insect repellent, toiletries, and food for your stay.",
    },
    {
      icon: HelpCircle,
      label: "Guest Guide",
      value: "A detailed guest guide will be sent 3 days before check-in.",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3 className="font-display text-headline-md text-on-surface mb-6">Before You Arrive</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.3 }}
              className="p-5 bg-surface-container-low rounded-default"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Icon size={15} className="text-primary/60" />
                <span className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px]">
                  {item.label}
                </span>
              </div>
              <p className="font-body text-body-md text-on-surface">{item.value}</p>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-body text-sm font-medium text-primary hover:text-primary-hover mt-1 transition-colors"
                >
                  {item.linkLabel} →
                </a>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
