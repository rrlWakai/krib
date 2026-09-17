export interface AdminNotification {
  id: string
  admin_user_id: string
  type: string
  title: string
  message: string
  reservation_id: string | null
  is_read: boolean
  created_at: string
}

export interface PushSubscriptionKeys {
  p256dh: string
  auth: string
}

export interface PushSubscriptionRecord {
  id: string
  admin_user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type NotificationType = 'new_reservation'
