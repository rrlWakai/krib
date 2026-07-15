import { cn } from '../../lib/cn'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        'font-body text-label-caps text-secondary mb-4 tracking-[0.2em]',
        className
      )}
    >
      {children}
    </p>
  )
}
