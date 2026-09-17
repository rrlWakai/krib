import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '../../lib/supabase/client'
import { useAuth } from '../../hooks/auth/useAuth'
import {
  fetchNotifications,
  markNotificationRead as apiMarkRead,
  markAllNotificationsRead as apiMarkAllRead,
} from '../services/notifications'
import type { AdminNotification } from '../types/notifications'

const POLL_INTERVAL = 30_000

export function useNotifications() {
  const { admin } = useAuth()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const mountedRef = useRef(true)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const loadNotifications = useCallback(async () => {
    if (!admin) return
    try {
      const data = await fetchNotifications()
      if (!mountedRef.current) return
      setNotifications(data)
      seenIds.current = new Set(data.map((n) => n.id))
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [admin])

  useEffect(() => {
    mountedRef.current = true
    if (!admin) {
      setLoading(false)
      return
    }

    loadNotifications()

    return () => {
      mountedRef.current = false
    }
  }, [admin, loadNotifications])

  // Realtime subscription
  useEffect(() => {
    if (!admin) return

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(`admin-notifications:${admin.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `admin_user_id=eq.${admin.id}`,
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification
          if (seenIds.current.has(newNotification.id)) return
          seenIds.current.add(newNotification.id)
          setNotifications((prev) => [newNotification, ...prev])
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [admin])

  // Periodic polling (fallback for missed realtime events)
  useEffect(() => {
    if (!admin) return
    const interval = setInterval(loadNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [admin, loadNotifications])

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await apiMarkRead(id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark as read')
      }
    },
    [],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await apiMarkAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: loadNotifications,
  }
}
