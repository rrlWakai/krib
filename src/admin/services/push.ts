import { getSupabaseClient } from '../../lib/supabase/client'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export async function getPushPermissionState(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return Notification.requestPermission()
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  })
  await navigator.serviceWorker.ready
  return registration
}

export async function getExistingSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  return registration.pushManager.getSubscription()
}

export async function createPushSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription> {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key not configured')
  }
  const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  })
}

export async function saveSubscriptionToServer(
  subscription: PushSubscription,
  adminUserId: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  const keys = subscription.getKey('p256dh')
  const authSecret = subscription.getKey('auth')

  if (!keys || !authSecret) {
    throw new Error('Invalid push subscription keys')
  }

  const p256dh = uint8ArrayToBase64Url(new Uint8Array(keys))
  const auth = uint8ArrayToBase64Url(new Uint8Array(authSecret))

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        admin_user_id: adminUserId,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        user_agent: navigator.userAgent,
        is_active: true,
      },
      { onConflict: 'admin_user_id,endpoint' },
    )

  if (error) throw new Error(error.message)
}

export async function removeSubscriptionFromServer(
  endpoint: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('push_subscriptions')
    .update({ is_active: false })
    .eq('endpoint', endpoint)

  if (error) throw new Error(error.message)
}

export async function unsubscribePush(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await removeSubscriptionFromServer(subscription.endpoint)
    await subscription.unsubscribe()
  }
}

export async function subscribePush(
  registration: ServiceWorkerRegistration,
  adminUserId: string,
): Promise<PushSubscription> {
  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    return existing
  }
  const subscription = await createPushSubscription(registration)
  await saveSubscriptionToServer(subscription, adminUserId)
  return subscription
}
