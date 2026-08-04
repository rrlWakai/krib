import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const STORAGE_BUCKETS = {
  VILLA_GALLERY: 'villa-gallery',
  DOCUMENTS: 'documents',
  SYSTEM: 'system',
} as const

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

export function buildStoragePath(entity: string, fileName: string): string {
  const timestamp = Date.now()
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg'
  return `${entity}/${timestamp}.${ext}`
}
