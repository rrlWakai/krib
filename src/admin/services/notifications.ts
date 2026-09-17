import { getSupabaseClient } from '../../lib/supabase/client'
import type { AdminNotification } from '../types/notifications'

export async function fetchNotifications(): Promise<AdminNotification[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('id, admin_user_id, type, title, message, reservation_id, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data ?? []) as AdminNotification[]
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) throw new Error(error.message)
}
