import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useNotificationSound } from '../hooks/useNotificationSound'
import { NotificationPanel } from './NotificationsPanel'
import { cn } from '../../lib/cn'

export function NotificationBell() {
  const { playNewReservationSound } = useNotificationSound()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    onNewNotification: (notification) => {
      if (notification.type === 'new_reservation') playNewReservationSound()
    },
  })
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          open
            ? 'bg-[#f0f2f7] text-[#0A1F44]'
            : 'text-[#757575] hover:bg-[#f0f2f7] hover:text-[#0A1F44]',
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C9A227] px-1 font-body text-[9px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
