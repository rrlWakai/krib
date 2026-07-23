import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  Tag,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { NAV_ITEMS } from '../data/mockData'

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  Tag,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onClose?: () => void
  isMobile: boolean
  isOpen: boolean
}

function SidebarContent({
  collapsed,
  onToggle,
  isMobile,
}: {
  collapsed: boolean
  onToggle: () => void
  isMobile: boolean
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-outline-variant',
          collapsed ? 'justify-center px-3' : 'px-5'
        )}
      >
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-body-md font-semibold text-on-primary">
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
                  onClick={isMobile ? onToggle : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-[12px] px-3 py-3 font-body text-body-md transition-all duration-200',
                      isActive
                        ? 'bg-primary font-semibold text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                      collapsed && 'justify-center px-0'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={20}
                        className={cn(
                          'shrink-0',
                          isActive && 'text-on-primary'
                        )}
                      />
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

      {/* Collapse toggle (desktop/laptop only) */}
      {!isMobile && (
        <div className="border-t border-outline-variant px-3 py-3">
          <button
            onClick={onToggle}
            className={cn(
              'flex w-full items-center gap-3 rounded-[12px] px-3 py-3 font-body text-body-md text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface',
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
      )}
    </div>
  )
}

export function Sidebar({
  collapsed,
  onToggle,
  onClose,
  isMobile,
  isOpen,
}: SidebarProps) {
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-outline-variant bg-white shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high lg:hidden"
              >
                <X size={20} />
              </button>
              <SidebarContent
                collapsed={false}
                onToggle={onClose ?? onToggle}
                isMobile={isMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-outline-variant bg-white lg:flex"
    >
      <SidebarContent
        collapsed={collapsed}
        onToggle={onToggle}
        isMobile={isMobile}
      />
    </motion.aside>
  )
}
