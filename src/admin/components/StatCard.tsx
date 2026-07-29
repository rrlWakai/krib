interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="border-b border-[#ECECEC] pb-4">
      <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
        {title}
      </p>
      <p className="mt-1 font-display text-[26px] leading-[32px] font-medium tracking-tight text-[#0A1F44]">
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 font-body text-[12px] text-[#757575]">
          {subtitle}
        </p>
      )}
    </div>
  )
}
