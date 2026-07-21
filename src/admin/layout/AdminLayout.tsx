import { Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useSidebarState } from '../hooks/useBreakpoint'

export function AdminLayout() {
  const {
    isMobile,
    collapsed,
    isOpen,
    sidebarWidth,
    toggle,
    close,
  } = useSidebarState()

  return (
    <div className="min-h-screen bg-[#f5f5f3]">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        onClose={close}
        isMobile={isMobile}
        isOpen={isOpen}
      />

      {/* Mobile top bar */}
      {isMobile && (
        <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-outline-variant bg-white/95 px-4 backdrop-blur-sm">
          <button
            onClick={toggle}
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <Menu size={22} />
          </button>
          <div className="ml-3 flex flex-col leading-none">
            <span className="font-display text-body-md font-semibold text-on-surface">
              KRiB
            </span>
            <span className="font-body text-body-xs text-on-surface-variant">
              Control Center
            </span>
          </div>
        </div>
      )}

      <main
        className="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          paddingTop: isMobile ? 56 : 0,
        }}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
