import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Eye, EyeOff, ImagePlus, RefreshCw, Replace, Trash2, UploadCloud } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../../components/AdminState'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useAdminQuery } from '../../hooks/useAdminQuery'
import {
  fetchGalleryAdmin,
  uploadGalleryImage,
  updateGalleryImage,
  replaceGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  logAudit,
} from '../../services/website'
import { resolveStorageUrl } from '../../../services/api/website'
import type { AdminGalleryImage } from '../../types'
import { Field, TextAreaField, PrimaryButton } from './fields'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

function GalleryImageCard({
  image,
  onPatched,
  onDeleteRequest,
}: {
  image: AdminGalleryImage
  onPatched: (patch: Partial<Pick<AdminGalleryImage, 'alt_text' | 'caption' | 'is_visible'>>) => void
  onDeleteRequest: (image: AdminGalleryImage) => void
}) {
  const replaceRef = useRef<HTMLInputElement>(null)
  const [replacing, setReplacing] = useState(false)
  const url = resolveStorageUrl(image.storage_path)

  async function handleReplace(file: File | null | undefined) {
    if (!file) return
    setReplacing(true)
    const { error } = await replaceGalleryImage(image.id, file)
    setReplacing(false)
    if (error) return
    void logAudit('gallery.replace', 'gallery_image', image.id, { villa_id: image.villa_id })
  }

  return (
    <Reorder.Item
      value={image.id}
      className="flex flex-col overflow-hidden rounded-lg border border-[#ECECEC] bg-white"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0f2f7]">
        {url ? (
          <img
            src={url}
            alt={image.alt_text || image.file_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-body text-[11px] text-[#757575]">
            Missing file
          </div>
        )}
        <button
          type="button"
          onClick={() => onPatched({ is_visible: !image.is_visible })}
          aria-label={image.is_visible ? 'Hide image' : 'Show image'}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0A1F44] shadow-sm transition-colors hover:bg-white"
        >
          {image.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => replaceRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A1F44]/90 text-white shadow-sm transition-colors hover:bg-[#0A1F44]"
            aria-label="Replace image"
            title="Replace image"
          >
            {replacing ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Replace size={13} />
            )}
          </button>
          <button
            type="button"
            onClick={() => onDeleteRequest(image)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-white shadow-sm transition-colors hover:bg-red-600"
            aria-label="Delete image"
            title="Delete image"
          >
            <Trash2 size={13} />
          </button>
        </div>
        <input
          ref={replaceRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            void handleReplace(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <p className="truncate font-body text-[11px] font-medium text-[#0A1F44]">
          {image.file_name || 'Untitled image'}
        </p>
        <Field
          label="Alt text"
          value={image.alt_text}
          onChange={(v) => onPatched({ alt_text: v })}
        />
        <TextAreaField
          label="Caption"
          value={image.caption}
          onChange={(v) => onPatched({ caption: v })}
          rows={2}
        />
      </div>
    </Reorder.Item>
  )
}

export function GalleryTab() {
  const query = useAdminQuery('website-gallery', fetchGalleryAdmin)
  const [images, setImages] = useState<AdminGalleryImage[]>([])
  const [pendingDelete, setPendingDelete] = useState<AdminGalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [uploadingVillaId, setUploadingVillaId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query.data) setImages(query.data)
  }, [query.data])

  useEffect(() => {
    if (query.error) setError(query.error)
  }, [query.error])

  const grouped = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; images: AdminGalleryImage[] }>()
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
    for (const img of sorted) {
      const key = img.villa_id
      const existing = map.get(key)
      if (existing) {
        existing.images.push(img)
      } else {
        map.set(key, {
          slug: img.villa?.slug ?? 'villa',
          name: img.villa?.name ?? 'Villa',
          images: [img],
        })
      }
    }
    return Array.from(map.values())
  }, [images])

  async function handleUpload(villaId: string, file: File | null | undefined) {
    if (!file) return
    setUploadingVillaId(villaId)
    setError(null)
    const { error } = await uploadGalleryImage(villaId, file)
    setUploadingVillaId(null)
    if (error) {
      setError(error.message)
      return
    }
    void logAudit('gallery.upload', 'gallery_image', villaId, { villa_id: villaId })
    void query.refetch()
  }

  async function handlePatched(image: AdminGalleryImage, patch: Partial<Pick<AdminGalleryImage, 'alt_text' | 'caption' | 'is_visible'>>) {
    setError(null)
    setImages((prev) =>
      prev.map((i) => (i.id === image.id ? { ...i, ...patch } : i)),
    )
    const { error } = await updateGalleryImage(image.id, patch)
    if (error) {
      setError(error.message)
      void query.refetch()
      return
    }
    void logAudit('gallery.update', 'gallery_image', image.id, {
      villa_id: image.villa_id,
      changed: Object.keys(patch),
    })
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const { error } = await deleteGalleryImage(pendingDelete.id)
    setDeleting(false)
    if (error) {
      setError(error.message)
      setPendingDelete(null)
      return
    }
    void logAudit('gallery.delete', 'gallery_image', pendingDelete.id, {
      villa_id: pendingDelete.villa_id,
    })
    setImages((prev) => prev.filter((i) => i.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  function handleReorder(villaId: string, next: AdminGalleryImage[]) {
    const reordered = next.map((img, index) => ({ ...img, sort_order: index }))
    setImages((prev) => {
      const others = prev.filter((i) => i.villa_id !== villaId)
      return [...others, ...reordered]
    })
    void reorderGalleryImages(villaId, reordered.map((img) => img.id)).then((result) => {
      if (!result.error) {
        void logAudit('gallery.reorder', 'gallery_image', villaId, { villa_id: villaId })
      }
    })
  }

  if (query.loading && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Gallery" subtitle="Photos shown on each villa page" />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (query.error && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Gallery" subtitle="Photos shown on each villa page" />
        <ErrorBlock message={query.error} onRetry={query.refetch} />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Gallery"
        subtitle="Publish villa photos, set their order, captions, and visibility. Hidden images stay unpublished. Drag to reorder — visible images replace the stock photos on the public villa page."
      />

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {grouped.map((group) => {
          const groupOrder = group.images
          return (
            <section key={group.slug} className="rounded-lg border border-[#ECECEC] bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-body text-[15px] font-semibold text-[#0A1F44]">
                    {group.name}
                  </h2>
                  <p className="font-body text-[11px] text-[#757575]">
                    {group.images.length} image{group.images.length === 1 ? '' : 's'}
                  </p>
                </div>
                <PrimaryButton
                  onClick={() => uploadRef.current?.click()}
                  disabled={uploadingVillaId === group.images[0]?.villa_id}
                >
                  {uploadingVillaId === group.images[0]?.villa_id ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <ImagePlus size={13} />
                  )}
                  {uploadingVillaId === group.images[0]?.villa_id ? 'Uploading…' : 'Upload image'}
                </PrimaryButton>
                <input
                  ref={uploadRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => {
                    void handleUpload(group.images[0]?.villa_id, e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </div>

              {groupOrder.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#ECECEC] py-10 text-center">
                  <UploadCloud size={22} className="text-[#757575]" />
                  <p className="font-body text-[12px] text-[#757575]">
                    No CMS photos yet. Upload the first image to start replacing the stock photos.
                  </p>
                </div>
              ) : (
                <Reorder.Group
                  axis="x"
                  values={groupOrder.map((i) => i.id)}
                  onReorder={(ids) => {
                    const ordered = ids
                      .map((id) => groupOrder.find((i) => i.id === id))
                      .filter((i): i is AdminGalleryImage => Boolean(i))
                    handleReorder(group.images[0]?.villa_id, ordered)
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {groupOrder.map((image) => (
                    <GalleryImageCard
                      key={image.id}
                      image={image}
                      onPatched={(patch) => void handlePatched(image, patch)}
                      onDeleteRequest={setPendingDelete}
                    />
                  ))}
                </Reorder.Group>
              )}
              <p className="mt-3 font-body text-[11px] text-[#757575]">
                Drag image cards to change their order on the public page.
              </p>
            </section>
          )
        })}

        {grouped.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#ECECEC] bg-white py-12 text-center">
            <p className="font-body text-[13px] text-[#757575]">
              No villa galleries yet. Upload the first photo to get started.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`${pendingDelete?.file_name || 'Delete image'}?`}
        message="This permanently removes the image from storage and the website. This cannot be undone."
        confirmLabel="Delete image"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </motion.div>
  )
}