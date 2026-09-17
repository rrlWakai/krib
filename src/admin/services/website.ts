import { getSupabaseClient } from '../../lib/supabase/client'
import { invalidateAdminCache } from '../hooks/useAdminQuery'
import type { Json } from '../../lib/supabase/types'
import {
  normalizeAvatarExtension,
  isSupportedAvatarFile,
} from '../../lib/supabase/helpers'
import type {
  AdminWebsitePage,
  AdminVillaMarketing,
  AdminGalleryImage,
} from '../types'

export interface ServiceError {
  code: string
  message: string
}

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: ServiceError }

export const CMS_QUERY_KEYS = [
  'website-pages',
  'website-villas-marketing',
  'website-gallery',
] as const

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function fail(error: { code?: string; message?: string }): ServiceResult<never> {
  return {
    data: null,
    error: { code: error.code ?? 'DB', message: error.message ?? 'Request failed' },
  }
}

function invalidateCms() {
  for (const key of CMS_QUERY_KEYS) invalidateAdminCache(key)
}

// ──────────────────────────────────────────────
// Fetch
// ──────────────────────────────────────────────

export async function fetchWebsitePagesAdmin(): Promise<AdminWebsitePage[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('website_pages')
    .select('*')
    .order('slug', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AdminWebsitePage[]
}

export async function fetchVillaMarketingAdmin(): Promise<AdminVillaMarketing[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('villa_marketing')
    .select('*, villa:villas(id, slug, name)')
    .order('updated_at', { ascending: true })
    .returns<AdminWebsiteRawVillaMarketing[]>()
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    ...row,
    villa: (row.villa ?? null) as AdminVillaMarketing['villa'],
  })) as unknown as AdminVillaMarketing[]
}

interface AdminWebsiteRawVillaMarketing {
  id: string
  villa_id: string
  draft_content: Record<string, unknown>
  published_content: Record<string, unknown>
  is_published: boolean
  published_at: string | null
  published_by: string | null
  updated_at: string
  created_at?: string
  villa: {
    id: string
    slug: string
    name: string
  } | null
}

export async function fetchGalleryAdmin(): Promise<AdminGalleryImage[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*, villa:villas(id, slug, name)')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AdminGalleryImage[]
}

export interface AdminVillaOption {
  id: string
  slug: string
  name: string
}

export async function fetchAdminVillas(): Promise<AdminVillaOption[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('villas')
    .select('id, slug, name')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AdminVillaOption[]
}

// ──────────────────────────────────────────────
// Audit trail
// ──────────────────────────────────────────────

export async function logAudit(
  action: string,
  entity: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const supabase = getSupabaseClient()
  const { data: authData } = await supabase.auth.getUser()
  await supabase.from('audit_logs').insert({
    action,
    entity,
    entity_id: entityId,
    metadata: metadata as Json,
    actor: authData.user?.id ?? null,
  } as never)
}

// ──────────────────────────────────────────────
// Website pages — draft + publish
// ──────────────────────────────────────────────

export async function savePageDraft(
  id: string,
  payload: { title: string; draft_content: Record<string, unknown> },
): Promise<ServiceResult<AdminWebsitePage>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('website_pages')
    .update({
      title: payload.title,
      draft_content: payload.draft_content as Json,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) return fail(error)
  invalidateAdminCache('website-pages')
  return { data: data as unknown as AdminWebsitePage, error: null }
}

export async function publishPage(
  id: string,
  draftContent: Record<string, unknown>,
): Promise<ServiceResult<{ published_at: string | null }>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('website_pages')
    .update({
      published_content: draftContent as Json,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('published_at')
    .single()
  if (error) return fail(error)
  invalidateCms()
  return { data: { published_at: data?.published_at ?? null }, error: null }
}

export async function unpublishPage(
  id: string,
): Promise<ServiceResult<{ published_at: null }>> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('website_pages')
    .update({ is_published: false, published_at: null, published_by: null })
    .eq('id', id)
    .select('is_published')
    .single()
  if (error) return fail(error)
  invalidateCms()
  return { data: { published_at: null }, error: null }
}

// ──────────────────────────────────────────────
// Villa marketing — draft + publish
// ──────────────────────────────────────────────

export async function saveVillaMarketingDraft(
  id: string,
  draftContent: Record<string, unknown>,
): Promise<ServiceResult<AdminVillaMarketing>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('villa_marketing')
    .update({ draft_content: draftContent as Json })
    .eq('id', id)
    .select('*, villa:villas(id, slug, name)')
    .single()
  if (error) return fail(error)
  invalidateAdminCache('website-villas-marketing')
  return { data: data as unknown as AdminVillaMarketing, error: null }
}

export async function publishVillaMarketing(
  id: string,
  draftContent: Record<string, unknown>,
): Promise<ServiceResult<{ published_at: string | null }>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('villa_marketing')
    .update({
      published_content: draftContent as Json,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('published_at')
    .single()
  if (error) return fail(error)
  invalidateCms()
  return { data: { published_at: data?.published_at ?? null }, error: null }
}

export async function unpublishVillaMarketing(
  id: string,
): Promise<ServiceResult<{ published_at: null }>> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('villa_marketing')
    .update({ is_published: false, published_at: null, published_by: null })
    .eq('id', id)
    .select('is_published')
    .single()
  if (error) return fail(error)
  invalidateCms()
  return { data: { published_at: null }, error: null }
}

// ──────────────────────────────────────────────
// Gallery
// ──────────────────────────────────────────────

export async function getNextGallerySortOrder(villaId: string): Promise<number> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .select('sort_order')
    .eq('villa_id', villaId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data?.sort_order ?? -1) + 1
}

export async function uploadGalleryImage(
  villaId: string,
  file: File,
): Promise<ServiceResult<AdminGalleryImage>> {
  const supabase = getSupabaseClient()
  if (!isSupportedAvatarFile(file) || file.size > MAX_IMAGE_SIZE) {
    return fail({
      code: 'INVALID_FILE',
      message: 'Use a JPG, PNG, WebP, or AVIF image smaller than 5 MB.',
    })
  }

  const ext = normalizeAvatarExtension(file.type || file.name, 'jpg')
  const path = `villas/${villaId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('villa-gallery')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })
  if (uploadError) {
    return fail({ code: 'UPLOAD', message: uploadError.message })
  }

  let sortOrder: number
  try {
    sortOrder = await getNextGallerySortOrder(villaId)
  } catch ({ message }: any) {
    await supabase.storage.from('villa-gallery').remove([path])
    return fail({ code: 'DB', message })
  }

  const { data, error: insertError } = await supabase
    .from('gallery_images')
    .insert({
      villa_id: villaId,
      storage_path: path,
      alt_text: '',
      caption: '',
      file_name: file.name,
      sort_order: sortOrder,
      is_visible: true,
    })
    .select('*, villa:villas(id, slug, name)')
    .single()

  if (insertError) {
    await supabase.storage.from('villa-gallery').remove([path])
    return fail(insertError)
  }
  invalidateCms()
  return { data: data as unknown as AdminGalleryImage, error: null }
}

export async function updateGalleryImage(
  id: string,
  patch: {
    alt_text?: string
    caption?: string
    is_visible?: boolean
  },
): Promise<ServiceResult<AdminGalleryImage>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .update(patch)
    .eq('id', id)
    .select('*, villa:villas(id, slug, name)')
    .single()
  if (error) return fail(error)
  invalidateCms()
  return { data: data as unknown as AdminGalleryImage, error: null }
}

export async function replaceGalleryImage(
  id: string,
  file: File,
): Promise<ServiceResult<AdminGalleryImage>> {
  const supabase = getSupabaseClient()
  if (!isSupportedAvatarFile(file) || file.size > MAX_IMAGE_SIZE) {
    return fail({
      code: 'INVALID_FILE',
      message: 'Use a JPG, PNG, WebP, or AVIF image smaller than 5 MB.',
    })
  }

  const { data: existing, error: existingError } = await supabase
    .from('gallery_images')
    .select('id, villa_id, storage_path, file_name, alt_text, caption, sort_order, is_visible')
    .eq('id', id)
    .maybeSingle()
  if (existingError) return fail(existingError)
  if (!existing) return fail({ code: 'NOT_FOUND', message: 'Image not found.' })

  const ext = normalizeAvatarExtension(file.type || file.name, 'jpg')
  const path = `villas/${existing.villa_id}/replace-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('villa-gallery')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })
  if (uploadError) {
    return fail({ code: 'UPLOAD', message: uploadError.message })
  }

  const { data, error: updateError } = await supabase
    .from('gallery_images')
    .update({ storage_path: path, file_name: file.name })
    .eq('id', id)
    .select('*, villa:villas(id, slug, name)')
    .single()

  if (updateError) {
    await supabase.storage.from('villa-gallery').remove([path])
    return fail(updateError)
  }

  // Tolerant cleanup of the replaced object so a failed delete
  // never leaves the gallery entry pointing at a missing file.
  await supabase.storage.from('villa-gallery').remove([existing.storage_path])
  invalidateCms()
  return { data: data as unknown as AdminGalleryImage, error: null }
}

export async function deleteGalleryImage(
  id: string,
): Promise<ServiceResult<{ id: string }>> {
  const supabase = getSupabaseClient()

  const { data: existing, error: existingError } = await supabase
    .from('gallery_images')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()
  if (existingError) return fail(existingError)

  const { error: deleteError } = await supabase.from('gallery_images').delete().eq('id', id)
  if (deleteError) return fail(deleteError)

  if (existing?.storage_path) {
    await supabase.storage.from('villa-gallery').remove([existing.storage_path])
  }
  invalidateCms()
  return { data: { id }, error: null }
}

export async function reorderGalleryImages(
  villaId: string,
  orderedIds: string[],
): Promise<ServiceResult<{ count: number }>> {
  const supabase = getSupabaseClient()
  let count = 0
  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from('gallery_images')
      .update({ sort_order: index })
      .eq('id', orderedIds[index])
      .eq('villa_id', villaId)
    if (error) return fail(error)
    count += 1
  }
  invalidateCms()
  return { data: { count }, error: null }
}