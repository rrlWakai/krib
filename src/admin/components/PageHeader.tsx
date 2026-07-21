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
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 font-body text-body-xs text-on-surface-variant sm:text-body-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="text-outline" />}
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="transition-colors duration-200 hover:text-primary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-on-surface">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-title-md text-on-surface sm:text-headline-md">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-body-sm text-on-surface-variant sm:text-body-md">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
