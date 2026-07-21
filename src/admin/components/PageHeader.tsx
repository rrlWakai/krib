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
    <div className="mb-8 flex flex-col gap-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 font-body text-body-sm text-on-surface-variant">
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-headline-md text-on-surface">{title}</h1>
          {subtitle && (
            <p className="font-body text-body-md text-on-surface-variant">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
