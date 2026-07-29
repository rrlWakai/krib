import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  breadcrumbs?: { label: string; path?: string }[]
}

export function PageHeader({ title, subtitle, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8 sm:mb-10">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-1.5 font-body text-[12px] text-[#757575]">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-[#ECECEC]" />}
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="transition-colors duration-200 hover:text-[#0A1F44]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#0A1F44]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] leading-[36px] tracking-tight text-[#0A1F44] sm:text-[34px] sm:leading-[42px]">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-[14px] leading-[22px] text-[#757575]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
