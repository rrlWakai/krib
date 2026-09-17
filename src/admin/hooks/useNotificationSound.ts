import { useCallback, useEffect, useState } from 'react'

const SOUND_URL = '/sounds/new-reservation.mp3'
const STORAGE_KEY = 'krib_notification_sound_enabled'

let soundEnabled: boolean | null = null
const listeners = new Set<(enabled: boolean) => void>()

let audioElement: HTMLAudioElement | null = null

function readStoredPreference(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'true') return true
    if (raw === 'false') return false
    return true
  } catch {
    return true
  }
}

function getPreference(): boolean {
  if (soundEnabled === null) soundEnabled = readStoredPreference()
  return soundEnabled
}

function persistPreference(value: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
  } catch {
    // Storage unavailable/blocked — keep the in-memory preference only.
  }
}

function setPreference(value: boolean): void {
  soundEnabled = value
  persistPreference(value)
  listeners.forEach((listener) => listener(value))
}

function subscribePreference(listener: (enabled: boolean) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!audioElement) {
    try {
      const audio = new Audio(SOUND_URL)
      audio.preload = 'auto'
      audioElement = audio
    } catch {
      audioElement = null
    }
  }
  return audioElement
}

function playSound(): void {
  const audio = getAudioElement()
  if (!audio) return
  try {
    audio.currentTime = 0
    const playback = audio.play()
    if (playback && typeof playback.catch === 'function') playback.catch(() => {})
  } catch {
    // Autoplay policy or unsupported audio — fail silently.
  }
}

export function useNotificationSound() {
  const [enabled, setEnabledState] = useState<boolean>(getPreference)

  useEffect(() => subscribePreference(setEnabledState), [])

  const setSoundEnabled = useCallback((value: boolean) => {
    setPreference(value)
  }, [])

  const testSound = useCallback(() => {
    playSound()
  }, [])

  const playNewReservationSound = useCallback(() => {
    if (getPreference()) playSound()
  }, [])

  return {
    enabled,
    setSoundEnabled,
    testSound,
    playNewReservationSound,
  }
}