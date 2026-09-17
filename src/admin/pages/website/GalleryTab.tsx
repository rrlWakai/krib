import { useEffect, useMemo, useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { CheckCircle2, GripVertical, ImagePlus, XCircle } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../../components/AdminState'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useAdminQuery } from '../../hooks/useAdminQuery'
import {
  fetchGalleryAdmin,
  fetchAdminVillas,
  updateGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  logAudit,
} from '../../services/website'
import type { AdminVillaOption } from '../../services/website'
import { resolveStorageUrl } from '../../../services/api/website'
import type { AdminGalleryImage } from '../../types'
import { PrimaryButton, SmallButton } from './fields'
import { GalleryUploadModal } from './GalleryUploadModal'
import { GalleryEditModal } from './GalleryEditModal'
import { GalleryReplaceModal } from './GalleryReplaceModal'

interface Notice {
  kind: 'success' | 'error'
  message: string
}

function GalleryImageCard({
  image,
  onEdit,
  onReplace,
  onToggleVisibility,
  onDeleteRequest,
}: {
  image: AdminGalleryImage
  onEdit: (image: AdminGalleryImage) => void
  onReplace: (image: AdminGalleryImage) => void
  onToggleVisibility: (image: AdminGalleryImage) => void
  onDeleteRequest: (image: AdminGalleryImage) => void
}) {
  const url = resolveStorageUrl(image.storage_path)
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
        {!image.is_visible && (
          <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 font-body text-[10px] font-medium text-white">
            Hidden
          </div>
        )}
        <span
          title="Drag to reorder"
          aria-label="Drag to reorder"
          className="absolute right-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-full bg-white/90 text-[#0A1F44] shadow-sm active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <p className="truncate font-body text-[11px] font-medium text-[#0A1F44]">
          {image.file_name || 'Untitled image'}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5">
          <SmallButton onClick={() => onEdit(image)}>Edit</SmallButton>
          <SmallButton onClick={() => onReplace(image)}>Replace</SmallButton>
          <SmallButton onClick={() => onToggleVisibility(image)}>
            {image.is_visible ? 'Hide' : 'Show'}
          </SmallButton>
          <SmallButton onClick={() => onDeleteRequest(image)}>Delete</SmallButton>
        </div>
      </div>
    </Reorder.Item>
  )
}

export function GalleryTab() {
  const query = useAdminQuery('website-gallery', fetchGalleryAdmin)
  const villasQuery = useAdminQuery('website-villas-options', fetchAdminVillas)
  const [images, setImages] = useState<AdminGalleryImage[]>([])
  const [villas, setVillas] = useState<AdminVillaOption[]>([])
  const [notice, setNotice] = useState<Notice | null>(null)
  const [noticeKey, setNoticeKey] = useState(0)
  const [filterVillaId, setFilterVillaId] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadDefaultVilla, setUploadDefaultVilla] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<AdminGalleryImage | null>(null)
  const [replacingImage, setReplacingImage] = useState<AdminGalleryImage | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminGalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (query.data) setImages(query.data)
  }, [query.data])

  useEffect(() => {
    if (villasQuery.data) setVillas(villasQuery.data)
  }, [villasQuery.data])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(timer)
  }, [notice, noticeKey])

  function showNotice(kind: Notice['kind'], message: string) {
    setNoticeKey((k) => k + 1)
    setNotice({ kind, message })
  }

  const villaLookup = useMemo(() => {
    const map = new Map<string, AdminVillaOption>()
    for (const v of villas) map.set(v.id, v)
    return map
  }, [villas])

  const visibleVillas = useMemo(
    () => (filterVillaId ? villas.filter((v) => v.id === filterVillaId) : villas),
    [villas, filterVillaId],
  )

  const imagesByVilla = useMemo(() => {
    const map = new Map<string, AdminGalleryImage[]>()
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
    for (const img of sorted) {
      const list = map.get(img.villa_id) ?? []
      list.push(img)
      map.set(img.villa_id, list)
    }
    return map
  }, [images])

  function openUpload(defaultVillaId: string | null = null) {
    setUploadDefaultVilla(defaultVillaId)
    setUploadOpen(true)
  }

  async function handleToggleVisibility(image: AdminGalleryImage) {
    const next = !image.is_visible
    setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, is_visible: next } : i)))
    const { error } = await updateGalleryImage(image.id, { is_visible: next })
    if (error) {
      console.warn('Gallery visibility update failed:', error)
      showNotice('error', 'This photo could not be updated. Please try again.')
      void query.refetch()
      return
    }
    void logAudit('gallery.update', 'gallery_image', image.id, {
      villa_id: image.villa_id,
      changed: ['is_visible'],
    })
    showNotice('success', next ? 'Photo is now visible on the website.' : 'Photo is now hidden.')
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const { error } = await deleteGalleryImage(pendingDelete.id)
    setDeleting(false)
    if (error) {
      console.warn('Gallery image delete failed:', error)
      showNotice('error', 'This photo could not be deleted. Please try again.')
      setPendingDelete(null)
      return
    }
    void logAudit('gallery.delete', 'gallery_image', pendingDelete.id, {
      villa_id: pendingDelete.villa_id,
    })
    setImages((prev) => prev.filter((i) => i.id !== pendingDelete.id))
    setPendingDelete(null)
    showNotice('success', 'Photo deleted successfully.')
  }

  function handleReorder(villaId: string, next: AdminGalleryImage[]) {
    const reordered = next.map((img, index) => ({ ...img, sort_order: index }))
    setImages((prev) => {
      const others = prev.filter((i) => i.villa_id !== villaId)
      return [...others, ...reordered]
    })
    void reorderGalleryImages(villaId, reordered.map((img) => img.id)).then((result) => {
      if (result.error) {
        console.warn('Gallery reorder failed:', result.error)
        showNotice('error', 'Order could not be saved. Please try again.')
        void query.refetch()
        return
      }
      void logAudit('gallery.reorder', 'gallery_image', villaId, { villa_id: villaId })
      showNotice('success', 'Order saved.')
    })
  }

  function handleUploaded(count: number) {
    showNotice('success', `${count} photo${count === 1 ? '' : 's'} uploaded successfully.`)
    void query.refetch()
    void villasQuery.refetch()
  }

  if (query.loading && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Gallery" subtitle="Manage the photos displayed on the KRiB website." />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (query.error && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Gallery" subtitle="Manage the photos displayed on the KRiB website." />
        <ErrorBlock message={query.error} onRetry={query.refetch} />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Gallery" subtitle="Manage the photos displayed on the KRiB website." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={() => openUpload(null)}>
          <ImagePlus size={15} /> Upload Photos
        </PrimaryButton>
        <label className="flex items-center gap-2 font-body text-[12px] font-medium text-[#0A1F44]">
          <span className="whitespace-nowrap">Villa</span>
          <select
            value={filterVillaId}
            onChange={(e) => setFilterVillaId(e.target.value)}
            aria-label="Filter gallery by villa"
            className="rounded-lg border border-[#ECECEC] bg-white px-3 py-2 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]"
          >
            <option value="">All Villas</option>
            {villas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <p className="font-body text-[12px] text-[#757575]">
          {images.length} photo{images.length === 1 ? '' : 's'} in the gallery
        </p>
      </div>

      {notice && (
        <div
          key={noticeKey}
          role="status"
          className={`mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 font-body text-[13px] ${
            notice.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.kind === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {notice.message}
        </div>
      )}

      {villasQuery.loading && !villasQuery.data ? (
        <LoadingBlock />
      ) : (
        <div className="flex flex-col gap-6">
          {visibleVillas.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#ECECEC] bg-white py-12 text-center">
              <p className="mb-4 font-body text-[13px] text-[#757575]">
                No villas are available yet. Add villas before uploading photos.
              </p>
              <PrimaryButton onClick={() => openUpload(null)}>
                <ImagePlus size={14} /> Upload Photos
              </PrimaryButton>
            </div>
          )}

          {visibleVillas.map((villa) => {
            const villaImages = imagesByVilla.get(villa.id) ?? []
            return (
              <section key={villa.id} className="rounded-lg border border-[#ECECEC] bg-white p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-body text-[15px] font-semibold text-[#0A1F44]">{villa.name}</h2>
                    <p className="font-body text-[11px] text-[#757575]">
                      {villaImages.length} Photo{villaImages.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                {villaImages.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#ECECEC] py-10 text-center">
                    <p className="font-body text-[13px] font-medium text-[#0A1F44]">
                      No photos uploaded yet.
                    </p>
                    <p className="font-body text-[12px] text-[#757575]">
                      Add photos to display them in the {villa.name} gallery.
                    </p>
                    <PrimaryButton onClick={() => openUpload(villa.id)}>
                      <ImagePlus size={14} /> Upload Photos
                    </PrimaryButton>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="x"
                    values={villaImages.map((i) => i.id)}
                    onReorder={(ids) => {
                      const ordered = ids
                        .map((id) => villaImages.find((i) => i.id === id))
                        .filter((i): i is AdminGalleryImage => Boolean(i))
                      handleReorder(villa.id, ordered)
                    }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {villaImages.map((image) => (
                      <GalleryImageCard
                        key={image.id}
                        image={image}
                        onEdit={setEditingImage}
                        onReplace={setReplacingImage}
                        onToggleVisibility={() => void handleToggleVisibility(image)}
                        onDeleteRequest={setPendingDelete}
                      />
                    ))}
                  </Reorder.Group>
                )}
                {villaImages.length > 0 && (
                  <p className="mt-3 font-body text-[11px] text-[#757575]">
                    Grip icon on each photo lets you drag to reorder. Order is saved automatically.
                  </p>
                )}
              </section>
            )
          })}
        </div>
      )}

      <GalleryUploadModal
        open={uploadOpen}
        villas={villas}
        defaultVillaId={uploadDefaultVilla}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleUploaded}
      />

      <GalleryEditModal
        image={editingImage}
        onClose={() => setEditingImage(null)}
        onSaved={(patch) => {
          if (editingImage) {
            setImages((prev) =>
              prev.map((i) => (i.id === editingImage.id ? { ...i, ...patch } : i)),
            )
            void logAudit('gallery.update', 'gallery_image', editingImage.id, {
              villa_id: editingImage.villa_id,
              changed: Object.keys(patch),
            })
          }
          setEditingImage(null)
          showNotice('success', 'Photo updated.')
        }}
      />

      <GalleryReplaceModal
        image={replacingImage}
        villa={replacingImage ? villaLookup.get(replacingImage.villa_id) ?? null : null}
        onClose={() => setReplacingImage(null)}
        onReplaced={() => {
          if (replacingImage) {
            void logAudit('gallery.replace', 'gallery_image', replacingImage.id, {
              villa_id: replacingImage.villa_id,
            })
          }
          showNotice('success', 'Photo replaced successfully.')
          void query.refetch()
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Photo?"
        message="This photo will be removed from the KRiB website. This cannot be undone."
        confirmLabel="Delete Photo"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </motion.div>
  )
}