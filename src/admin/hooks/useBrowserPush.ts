import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/auth/useAuth'
import {
  isPushSupported,
  getPushPermissionState,
  requestPushPermission,
  registerServiceWorker,
  getExistingSubscription,
  subscribePush,
  unsubscribePush,
} from '../services/push'

export type PushStatus =
  | 'unsupported'
  | 'idle'
  | 'granted'
  | 'denied'
  | 'enabled'

interface BrowserPushState {
  supported: boolean
  status: PushStatus
  subscribing: boolean
  unsubscribing: boolean
  error: string | null
  enable: () => Promise<void>
  disable: () => Promise<void>
}

export function useBrowserPush(): BrowserPushState {
  const { admin } = useAuth()
  const [supported, setSupported] = useState(true)
  const [status, setStatus] = useState<PushStatus>('idle')
  const [subscribing, setSubscribing] = useState(false)
  const [unsubscribing, setUnsubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshStatus = useCallback(async () => {
    if (!isPushSupported()) {
      setSupported(false)
      setStatus('unsupported')
      return
    }
    setSupported(true)
    const permission = await getPushPermissionState()
    if (permission === 'granted') {
      const registration = await registerServiceWorker()
      const sub = await getExistingSubscription(registration)
      setStatus(sub ? 'enabled' : 'granted')
    } else if (permission === 'denied') {
      setStatus('denied')
    } else {
      setStatus('idle')
    }
  }, [])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  const enable = useCallback(async () => {
    if (!supported || !admin) return
    setError(null)
    setSubscribing(true)
    try {
      const permission = await requestPushPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'idle')
        return
      }
      const registration = await registerServiceWorker()
      await subscribePush(registration, admin.id)
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable notifications')
      await refreshStatus()
    } finally {
      setSubscribing(false)
    }
  }, [admin, supported, refreshStatus])

  const disable = useCallback(async () => {
    if (!supported) return
    setError(null)
    setUnsubscribing(true)
    try {
      const registration = await registerServiceWorker()
      await unsubscribePush(registration)
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable notifications')
    } finally {
      setUnsubscribing(false)
    }
  }, [supported, refreshStatus])

  return {
    supported,
    status,
    subscribing,
    unsubscribing,
    error,
    enable,
    disable,
  }
}