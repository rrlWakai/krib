import { motion } from "framer-motion"
import { SearchX, Mail, ExternalLink } from "lucide-react"

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-[24px] border border-outline-variant/40 bg-surface-container-low/50 p-10 max-md:p-8 text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6"
        >
          <SearchX size={24} className="text-on-surface-variant/40" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="font-display text-headline-sm max-md:text-headline-sm-mobile text-on-surface mb-3"
        >
          We couldn&apos;t find your reservation
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="font-body text-body-md text-on-surface-variant leading-relaxed mb-2 max-w-sm mx-auto"
        >
          {message || "Please check your Reservation Code or try the Email Lookup option."}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="font-body text-sm text-on-surface-variant/60 mb-8"
        >
          Reservation codes are case-sensitive and start with KRIB-.
        </motion.p>

        {/* Help links */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="pt-6 border-t border-outline-variant/30"
        >
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50 mb-4">
            Need help?
          </p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary-hover transition-colors"
            >
              <Mail size={13} />
              Facebook
              <ExternalLink size={10} className="opacity-40" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary-hover transition-colors"
            >
              <Mail size={13} />
              Instagram
              <ExternalLink size={10} className="opacity-40" />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
