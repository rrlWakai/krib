import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const STORAGE_BUCKETS = {
  VILLA_GALLERY: 'villa-gallery',
  DOCUMENTS: 'documents',
  SYSTEM: 'system',
} as const

export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const

export type StorageBucket = keyof typeof STORAGE_BUCKETS

export function getBucketName(bucket: StorageBucket): string {
  return STORAGE_BUCKETS[bucket]
}

export function getPublicUrl(
  supabase: SupabaseClient<Database>,
  bucket: StorageBucket,
  path: string,
): string {
  const { data } = supabase.storage.from(getBucketName(bucket)).getPublicUrl(path)
  return data.publicUrl
}

export function normalizeAvatarExtension(fileNameOrMime: string, fallback = 'jpg'): string {
  const normalized = fileNameOrMime.toLowerCase()
  if (normalized === 'image/png') return 'png'
  if (normalized === 'image/jpeg' || normalized === 'image/jpg' || normalized === 'image/jpe') return 'jpg'
  if (normalized === 'image/webp') return 'webp'
  if (normalized === 'image/avif') return 'avif'

  const extension = (fileNameOrMime.split('.').pop() ?? '').toLowerCase()
  if (extension === 'png' || extension === 'webp' || extension === 'avif') return extension
  if (extension === 'jpg' || extension === 'jpeg' || extension === 'jpe') return 'jpg'

  return fallback
}

export function isSupportedAvatarFile(file: Pick<File, 'type' | 'name'>): boolean {
  const mime = file.type?.toLowerCase() ?? ''
  if (AVATAR_MIME_TYPES.includes(mime as (typeof AVATAR_MIME_TYPES)[number])) return true

  const extension = (file.name.split('.').pop() ?? '').toLowerCase()
  return ['png', 'jpg', 'jpeg', 'jpe', 'webp', 'avif'].includes(extension)
}

export function getStorageObjectPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const match = parsed.pathname.match(/\/storage\/v1\/object\/(?:public\/)?[^/]+\/(.+)$/)
    if (!match) return null
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

export function isSupportedAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    const extension = pathname.split('.').pop() ?? ''
    return ['png', 'jpg', 'jpeg', 'webp', 'avif'].includes(extension)
  } catch {
    return false
  }
}

export function buildStoragePath(entity: string, fileName: string): string {
  const timestamp = Date.now()
  const ext = normalizeAvatarExtension(fileName, 'jpg')
  return `${entity}/${timestamp}.${ext}`
}
