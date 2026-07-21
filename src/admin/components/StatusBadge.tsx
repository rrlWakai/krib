import { cn } from '../../lib/cn'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
  pulse?: boolean
}

const statusColorMap: Record<string, { bg: string; text: string; dot: string; active: boolean }> = {
  pending:                    { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', dot: 'bg-[#f59e0b]', active: true },
  awaiting_confirmation:      { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', dot: 'bg-[#f59e0b]', active: true },
  approved:                   { bg: 'bg-primary-container', text: 'text-on-primary-container', dot: 'bg-primary', active: true },
  awaiting_payment:           { bg: 'bg-primary-container', text: 'text-on-primary-container', dot: 'bg-primary', active: true },
  payment_submitted:          { bg: 'bg-[#f3e8ff]', text: 'text-[#6b21a8]', dot: 'bg-[#9333ea]', active: true },
  confirmed:                  { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', dot: 'bg-tertiary', active: false },
  completed:                  { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', dot: 'bg-tertiary', active: false },
  verified:                   { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', dot: 'bg-tertiary', active: false },
  cancelled:                  { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', dot: 'bg-outline', active: false },
  declined:                   { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error', active: false },
  expired:                    { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', dot: 'bg-outline', active: false },
  rejected:                   { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error', active: false },
}

const sizeMap = {
  sm: 'px-2 py-0.5 text-[11px] gap-1.5',
  md: 'px-3 py-1 text-body-sm gap-2',
}

const dotSizeMap = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
}

function formatLabel(status: string) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function StatusBadge({ status, size = 'md', pulse = false }: StatusBadgeProps) {
  const colors = statusColorMap[status] ?? {
    bg: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    dot: 'bg-outline',
    active: false,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-body font-medium leading-none',
        colors.bg,
        colors.text,
        sizeMap[size]
      )}
    >
      <span className="relative flex shrink-0 items-center justify-center">
        <span
          className={cn(
            'rounded-full',
            colors.dot,
            dotSizeMap[size]
          )}
        />
        {(pulse || colors.active) && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-40',
              colors.dot
            )}
          />
        )}
      </span>
      {formatLabel(status)}
    </span>
  )
}
