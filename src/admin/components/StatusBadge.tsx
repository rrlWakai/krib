import { cn } from '../../lib/cn'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
  pulse?: boolean
}

const statusColorMap: Record<string, { dot: string; label: string }> = {
  pending:                { dot: 'bg-[#C9A227]', label: 'text-[#C9A227]' },
  awaiting_confirmation:  { dot: 'bg-[#C9A227]', label: 'text-[#C9A227]' },
  approved:               { dot: 'bg-[#0A1F44]', label: 'text-[#0A1F44]' },
  awaiting_payment:       { dot: 'bg-[#0A1F44]', label: 'text-[#0A1F44]' },
  payment_submitted:      { dot: 'bg-[#0A1F44]', label: 'text-[#0A1F44]' },
  confirmed:              { dot: 'bg-[#0A1F44]', label: 'text-[#0A1F44]' },
  completed:              { dot: 'bg-[#757575]', label: 'text-[#757575]' },
  verified:               { dot: 'bg-[#0A1F44]', label: 'text-[#0A1F44]' },
  cancelled:              { dot: 'bg-[#757575]', label: 'text-[#757575]' },
  declined:               { dot: 'bg-[#757575]', label: 'text-[#757575]' },
  expired:                { dot: 'bg-[#757575]', label: 'text-[#757575]' },
  rejected:               { dot: 'bg-[#757575]', label: 'text-[#757575]' },
  active:                 { dot: 'bg-[#0A1F44]', label: 'text-[#0A1F44]' },
  inactive:               { dot: 'bg-[#757575]', label: 'text-[#757575]' },
  maintenance:            { dot: 'bg-[#C9A227]', label: 'text-[#C9A227]' },
}

const dotSizeMap = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
}

const labelSizeMap = {
  sm: 'text-[11px]',
  md: 'text-[13px]',
}

function formatLabel(status: string) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function StatusBadge({ status, size = 'md', pulse = false }: StatusBadgeProps) {
  const colors = statusColorMap[status] ?? { dot: 'bg-[#757575]', label: 'text-[#757575]' }

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-body font-medium leading-none', colors.label, labelSizeMap[size], 'capitalize')}>
      <span className="relative flex shrink-0 items-center justify-center">
        <span className={cn('rounded-full', colors.dot, dotSizeMap[size])} />
        {pulse && (
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-40', colors.dot)} />
        )}
      </span>
      {formatLabel(status)}
    </span>
  )
}
