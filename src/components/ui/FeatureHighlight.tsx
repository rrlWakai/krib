import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { getIcon } from '../../lib/iconMap'

interface FeatureHighlightProps {
  icon: string
  label: string
  className?: string
}

export function FeatureHighlight({ icon, label, className }: FeatureHighlightProps) {
  const Icon = getIcon(icon)
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-center gap-3 bg-surface-container-high px-4 py-3 rounded-sm shadow-[0_1px_6px_rgba(0,0,0,0.03)]',
        className
      )}
    >
      <Icon size={18} className="text-on-surface-variant shrink-0" />
      <span className="font-body text-label-caps text-on-surface uppercase tracking-widest text-[11px]">
        {label}
      </span>
    </motion.div>
  )
}
