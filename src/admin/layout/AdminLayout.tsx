import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { WorkspaceHeader } from './WorkspaceHeader'
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        onClose={close}
        isMobile={isMobile}
        isOpen={isOpen}
      />

      <main
        className="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
        }}
      >
        <WorkspaceHeader onToggleSidebar={toggle} isMobile={isMobile} />

        <div
          className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
          style={{ paddingTop: isMobile ? 56 : undefined }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
