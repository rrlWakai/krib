import { useLocation, Link } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import { NAV_ITEMS } from '../data/constants'
import { cn } from '../../lib/cn'
import { useAuth } from '../../hooks/auth/useAuth'

interface WorkspaceHeaderProps {
  onToggleSidebar: () => void
  isMobile: boolean
}

export function WorkspaceHeader({ onToggleSidebar, isMobile }: WorkspaceHeaderProps) {
  const location = useLocation()
  const { user, admin } = useAuth()

  const currentPage = NAV_ITEMS.find(
    (item) =>
      item.path === location.pathname ||
      (item.path !== '/admin' && location.pathname.startsWith(item.path)),
  )

  const pageTitle = currentPage?.label ?? 'Control Center'

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const displayName = admin?.full_name ?? user?.email ?? 'Admin'

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b border-[#ECECEC]',
        isMobile
          ? 'fixed left-0 right-0 top-0 z-30 bg-white/95 px-4 backdrop-blur-sm'
          : 'sticky top-0 z-10 bg-white/80 px-6 backdrop-blur-sm',
      )}
    >
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex items-center gap-2 font-body text-[13px]">
          <Link
            to="/admin"
            className="text-[#757575] transition-colors hover:text-[#0A1F44]"
          >
            Control Center
          </Link>
          <span className="text-[#ECECEC]">/</span>
          <span className="font-medium text-[#0A1F44]">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isMobile && (
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]"
            />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-40 rounded-lg border border-[#ECECEC] bg-transparent pl-9 pr-3 font-body text-[12px] text-[#0A1F44] outline-none placeholder:text-[#757575] focus:border-[#0A1F44]"
            />
          </div>
        )}
        <span className="hidden font-body text-[12px] text-[#757575] sm:block">
          {dateStr}
        </span>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] hover:text-[#0A1F44]">
          <Bell size={16} />
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A1F44] font-body text-[12px] font-medium leading-none text-white"
          title={displayName}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
