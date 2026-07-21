import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  CreditCard,
  Tag,
  Building2,
  Image,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { NAV_ITEMS } from '../data/mockData'

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  CreditCard,
  Tag,
  Building2,
  Image,
  MessageSquare,
  BarChart3,
  Settings,
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const sidebarWidth = collapsed ? 72 : 240

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-outline-variant bg-white"
    >
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-outline-variant px-5">
        {collapsed ? (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary font-display text-body-md font-semibold">
            K
          </div>
        ) : (
          <div className="flex flex-col leading-none">
            <span className="font-display text-headline-sm font-medium text-on-surface">
              KRiB
            </span>
            <span className="font-body text-body-sm text-on-surface-variant">
              Control Center
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            const isDashboard = item.path === '/admin'

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={isDashboard}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-body text-body-md transition-all duration-200',
                      isActive
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                      collapsed && 'justify-center px-0'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} className={cn('shrink-0', isActive && 'text-on-primary')} />
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Toggle */}
      <div className="border-t border-outline-variant px-3 py-3">
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 font-body text-body-md text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? (
            <ChevronRight size={20} className="shrink-0" />
          ) : (
            <>
              <ChevronLeft size={20} className="shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
