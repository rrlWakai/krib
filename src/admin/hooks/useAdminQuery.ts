import { useCallback, useEffect, useRef, useState } from 'react'

interface CacheEntry {
  data: unknown
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<unknown>>()

const DEFAULT_TTL = 60_000

export function invalidateAdminCache(...keys: string[]) {
  for (const key of keys) {
    cache.delete(key)
  }
}

export function invalidateAdminCachePrefix(prefix: string) {
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
  setData: (updater: (prev: T | null) => T) => void
}

export function useAdminQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options?: { ttlMs?: number; enabled?: boolean },
): QueryState<T> {
  const { ttlMs = DEFAULT_TTL, enabled = true } = options ?? {}
  const [data, setData] = useState<T | null>(() => (key ? getCached<T>(key) : null))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(
    (force: boolean) => {
      if (!key || !enabled) return
      if (!force) {
        const cached = getCached<T>(key)
        if (cached !== null) {
          setData(cached)
          setError(null)
          return
        }
      }

      setLoading(true)
      setError(null)

      const pending = (inFlight.get(key) as Promise<T> | undefined) ?? fetcherRef.current()
      if (!inFlight.has(key)) inFlight.set(key, pending)

      pending
        .then((result) => {
          cache.set(key, { data: result, expiresAt: Date.now() + ttlMs })
          setData(result)
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to load data'
          setError(message)
        })
        .finally(() => {
          inFlight.delete(key)
          setLoading(false)
        })
    },
    [key, enabled, ttlMs],
  )

  useEffect(() => {
    run(false)
  }, [run])

  const refetch = useCallback(() => run(true), [run])

  const setDataCallback = useCallback(
    (updater: (prev: T | null) => T) => {
      setData((prev) => {
        const next = updater(prev)
        if (key) cache.set(key, { data: next, expiresAt: Date.now() + ttlMs })
        return next
      })
    },
    [key, ttlMs],
  )

  return { data, loading, error, refetch, setData: setDataCallback }
}

export interface MutationResult<A, R> {
  mutate: (args: A) => Promise<{ data: R | null; error: { code: string; message: string } | null }>
  loading: boolean
  error: string | null
}

export function useAdminMutation<A, R>(
  mutateFn: (args: A) => Promise<{ data: R | null; error: { code: string; message: string } | null }>,
): MutationResult<A, R> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mutateRef = useRef(mutateFn)
  mutateRef.current = mutateFn

  const mutate = useCallback(async (args: A) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutateRef.current(args)
      if (result.error) {
        setError(result.error.message)
      }
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setError(message)
      return { data: null, error: { code: 'UNKNOWN', message } }
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}
