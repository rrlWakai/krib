import { useRef, useEffect } from 'react'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { AdminNotification } from '../types/notifications'
import { cn } from '../../lib/cn'

interface NotificationPanelProps {
  notifications: AdminNotification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClose: () => void
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationPanelProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  function handleNotificationClick(notification: AdminNotification) {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
    onClose()
    if (notification.reservation_id) {
      navigate(`/admin/reservations/${notification.reservation_id}`)
    } else {
      navigate('/admin/reservations')
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 w-[380px] max-h-[480px] rounded-lg border border-[#ECECEC] bg-white shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-[#ECECEC] px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-[14px] font-medium text-[#0A1F44]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C9A227] px-1.5 font-body text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 rounded px-2 py-1 font-body text-[11px] text-[#757575] transition-colors hover:bg-[#f0f2f7] hover:text-[#0A1F44]"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-[#757575] transition-colors hover:bg-[#f0f2f7]"
            aria-label="Close notifications"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <Bell size={20} className="text-[#ECECEC]" />
            <p className="font-body text-[13px] text-[#757575]">
              No notifications yet
            </p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FAFAFA]',
                    !notification.is_read && 'bg-[#FEFBF3]',
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {!notification.is_read ? (
                      <span className="block h-2 w-2 rounded-full bg-[#C9A227]" />
                    ) : (
                      <span className="block h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[13px] font-medium text-[#0A1F44] truncate">
                      {notification.title}
                    </p>
                    <p className="font-body text-[12px] text-[#757575] line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="font-body text-[11px] text-[#B0B0B0] mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
