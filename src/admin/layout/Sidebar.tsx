import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  Tag,
  Building2,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { NAV_ITEMS } from '../data/constants'
import { useAuth } from '../../hooks/auth/useAuth'

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  Tag,
  Building2,
  MessageSquare,
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
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-[#ECECEC]',
          collapsed ? 'justify-center px-3' : 'px-6'
        )}
      >
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center font-display text-[17px] font-semibold text-[#0A1F44]">
            K
          </div>
        ) : (
          <div className="flex flex-col leading-none">
            <span className="font-display text-[18px] font-semibold text-[#0A1F44]">
              KRiB
            </span>
            <span className="font-body text-[11px] text-[#757575]">
              Control Center
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="flex flex-col gap-0.5">
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
                      'relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-[14px] transition-all duration-200',
                      isActive
                        ? 'text-[#0A1F44] font-medium'
                        : 'text-[#757575] hover:text-[#0A1F44] hover:bg-[#f0f2f7]',
                      collapsed && 'justify-center px-0'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <motion.span
                          layoutId="sidebar-indicator"
                          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#C9A227]"
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                      <Icon
                        size={18}
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive ? 'text-[#C9A227]' : 'text-[#757575]'
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-[#ECECEC] px-3 py-3">
        {!collapsed && user && (
          <div className="mb-2 truncate px-3 font-body text-[12px] text-[#757575]">
            {user.email}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-[14px] text-[#757575] transition-all duration-200 hover:text-red-600 hover:bg-red-50',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!isMobile && (
          <button
            onClick={onToggle}
            className={cn(
              'mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-[14px] text-[#757575] transition-all duration-200 hover:text-[#0A1F44] hover:bg-[#f0f2f7]',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
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
              transition={{ duration: 0.18 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-[#ECECEC] bg-white"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7]"
                aria-label="Close sidebar"
              >
                <X size={18} />
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
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-[#ECECEC] bg-white lg:flex"
    >
      <SidebarContent
        collapsed={collapsed}
        onToggle={onToggle}
        isMobile={isMobile}
      />
    </motion.aside>
  )
}
