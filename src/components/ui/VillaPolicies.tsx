import { motion } from 'framer-motion'
import { fadeUp } from '../../lib/animations'
import { getIcon } from '../../lib/iconMap'
import type { VillaPolicy } from '../../types'

interface VillaPoliciesProps {
  policies: VillaPolicy[]
}

export function VillaPolicies({ policies }: VillaPoliciesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
      {policies.map((policy, i) => {
        const Icon = getIcon(policy.icon)
        return (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="flex items-start gap-5"
          >
            <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full border border-outline-variant/35 text-on-surface-variant/60 mt-0.5">
              <Icon size={20} strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <h4 className="font-body text-label-caps text-secondary uppercase tracking-widest text-xs mb-1.5">
                {policy.label}
              </h4>
              <p className="font-body text-body-lg font-medium text-on-surface leading-snug">
                {policy.value}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
