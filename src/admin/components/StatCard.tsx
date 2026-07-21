import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/cn'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
}

const accentMap = {
  blue: 'bg-primary-container text-primary',
  green: 'bg-tertiary-container text-tertiary',
  amber: 'bg-[#fef3c7] text-[#b45309]',
  red: 'bg-error-container text-error',
  purple: 'bg-[#f3e8ff] text-[#7c3aed]',
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = 'blue',
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between rounded-[16px] bg-white p-5 shadow-card"
    >
      <div className="flex flex-col gap-1">
        <span className="font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
          {title}
        </span>
        <span className="font-display text-headline-md font-medium text-on-surface">
          {value}
        </span>
        {subtitle && (
          <span className="font-body text-body-sm text-on-surface-variant">
            {subtitle}
          </span>
        )}
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            {trend.isPositive ? (
              <TrendingUp size={14} className="text-tertiary" />
            ) : (
              <TrendingDown size={14} className="text-error" />
            )}
            <span
              className={cn(
                'font-body text-body-sm font-medium',
                trend.isPositive ? 'text-tertiary' : 'text-error'
              )}
            >
              {trend.value}%
            </span>
          </div>
        )}
      </div>
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
          accentMap[accent]
        )}
      >
        {icon}
      </div>
    </motion.div>
  )
}
