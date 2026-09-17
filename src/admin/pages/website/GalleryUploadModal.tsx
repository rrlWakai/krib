import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UploadCloud, ImagePlus, RotateCw, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { uploadGalleryImage } from '../../services/website'
import type { AdminVillaOption } from '../../services/website'
import { isSupportedAvatarFile } from '../../../lib/supabase/helpers'
import { PrimaryButton, GhostButton } from './fields'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'
const FORMATS_LABEL = 'JPG, PNG, WEBP, or AVIF'
const MAX_MB = '5 MB'

type Status = 'ready' | 'uploading' | 'uploaded' | 'failed'

interface QueueItem {
  key: string
  file: File
  url: string
  status: Status
  message?: string
}

function friendlyMessage(kind: 'type' | 'size' | 'upload', detail?: string): string {
  if (kind === 'type') return `This image type isn't supported. Use ${FORMATS_LABEL}.`
  if (kind === 'size') return `This image is too large. Max file size is ${MAX_MB}.`
  void detail
  return 'This photo could not be uploaded. Please try again.'
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

export function GalleryUploadModal({
  open,
  villas,
  defaultVillaId,
  onClose,
  onUploaded,
}: {
  open: boolean
  villas: AdminVillaOption[]
  defaultVillaId?: string | null
  onClose: () => void
  onUploaded: (uploadedCount: number) => void
}) {
  const [villaId, setVillaId] = useState(defaultVillaId ?? '')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progressText, setProgressText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setVillaId(defaultVillaId ?? '')
      setQueue([])
      setUploading(false)
      setProgressText('')
    }
  }, [open, defaultVillaId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !uploading) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, uploading, onClose])

  useEffect(() => {
    if (!open) {
      queue.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [open, queue])

  const selectedVilla = useMemo(
    () => villas.find((v) => v.id === villaId) ?? null,
    [villas, villaId],
  )

  const readyCount = queue.filter((i) => i.status === 'ready').length
  const failedItems = queue.filter((i) => i.status === 'failed')
  const uploadedCount = queue.filter((i) => i.status === 'uploaded').length
  const finished = queue.length > 0 && !queue.some((i) => i.status === 'ready' || i.status === 'uploading')
  const allSucceeded = finished && failedItems.length === 0
  const overallPercent =
    queue.length === 0 ? 0 : Math.round(((uploadedCount + failedItems.length) / queue.length) * 100)

  function addFiles(files: FileList | File[] | null) {
    if (!files || uploading) return
    const incoming = Array.from(files)
    setQueue((prev) => {
      const next = [...prev]
      for (const file of incoming) {
        let status: Status = 'ready'
        let message: string | undefined
        if (!isSupportedAvatarFile(file)) {
          status = 'failed'
          message = friendlyMessage('type')
        } else if (file.size > MAX_IMAGE_SIZE) {
          status = 'failed'
          message = friendlyMessage('size')
        }
        next.push({
          key: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          url: URL.createObjectURL(file),
          status,
          message,
        })
      }
      return next
    })
  }

  function removeItem(key: string) {
    if (uploading) return
    setQueue((prev) => {
      const removed = prev.find((i) => i.key === key)
      const next = prev.filter((i) => i.key !== key)
      if (removed) URL.revokeObjectURL(removed.url)
      return next
    })
  }

  function retryFailed() {
    setQueue((prev) =>
      prev.map((item) =>
        item.status === 'failed' ? { ...item, status: 'ready', message: undefined } : item,
      ),
    )
  }

  async function runUpload() {
    if (uploading || readyCount === 0 || !villaId) return
    const items = queue.filter((i) => i.status === 'ready')
    setUploading(true)
    setQueue((prev) =>
      prev.filter((i) => i.status !== 'ready').concat(items.map((i) => ({ ...i, status: 'uploading' as Status }))),
    )
    setProgressText(`Uploading 0 of ${items.length} photos… please keep this window open.`)

    let done = 0
    let failed = 0
    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      const result = await uploadGalleryImage(villaId, item.file)
      done += 1
      if (result.error) {
        failed += 1
        console.warn('Gallery upload failed:', result.error)
        setQueue((prev) =>
          prev.map((i) =>
            i.key === item.key
              ? { ...i, status: 'failed' as Status, message: friendlyMessage('upload') }
              : i,
          ),
        )
      } else {
        setQueue((prev) =>
          prev.map((i) => (i.key === item.key ? { ...i, status: 'uploaded' as Status } : i)),
        )
      }
      setProgressText(`Uploading ${Math.min(done, items.length)} of ${items.length} photos… please keep this window open.`)
    }

    setUploading(false)
    const newUploaded = done - failed
    if (newUploaded > 0) {
      onUploaded(newUploaded)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:items-center md:p-8"
        onClick={uploading ? undefined : onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-upload-title"
          className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#ECECEC] px-5 py-4">
            <div>
              <h2 id="gallery-upload-title" className="font-display text-[17px] font-medium text-[#0A1F44]">
                Upload Photos
              </h2>
              <p className="font-body text-[12px] text-[#757575]">
                Add photos to a villa gallery. They go live only after you save the order and publish.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={uploading}
              aria-label="Close upload"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {villas.length === 0 ? (
              <p className="rounded-lg border border-[#ECECEC] bg-[#FAFAFA] px-4 py-6 text-center font-body text-[13px] text-[#757575]">
                No villas are available. Add a villa before uploading photos.
              </p>
            ) : (
              <>
                <fieldset className="space-y-1.5">
                  <label
                    htmlFor="gallery-upload-villa"
                    className="block font-body text-[12px] font-medium text-[#0A1F44]"
                  >
                    Choose Villa
                  </label>
                  <select
                    id="gallery-upload-villa"
                    value={villaId}
                    onChange={(e) => setVillaId(e.target.value)}
                    disabled={uploading}
                    className="w-full rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44] disabled:opacity-50"
                  >
                    <option value="" disabled>
                      Select a villa…
                    </option>
                    {villas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </fieldset>

                {!(queue.length > 0) && !uploading && (
                  <UploadDropzone
                    dragOver={dragOver}
                    onDragOver={(over) => setDragOver(over)}
                    onFiles={addFiles}
                    onPick={() => inputRef.current?.click()}
                  />
                )}

                {queue.length > 0 && (
                  <UploadQueue
                    items={queue}
                    uploading={uploading}
                    onAddMore={() => inputRef.current?.click()}
                    onRemove={removeItem}
                    selectedVillaName={selectedVilla?.name ?? ''}
                  />
                )}
              </>
            )}

            {uploading && (
              <div className="rounded-lg border border-[#0A1F44]/15 bg-[#0f172a] px-4 py-4 text-white">
                <p className="mb-2 font-body text-[13px]" role="status">
                  {progressText}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-300"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>
            )}

            {finished && !uploading && queue.some((i) => i.status === 'uploaded') && (
              <div className="space-y-4 border-t border-[#ECECEC] pt-4" role="status">
                {allSucceeded ? (
                  <p className="font-body text-[14px] font-medium text-[#2F6B3B]">
                    ✓ {uploadedCount} photo{uploadedCount === 1 ? '' : 's'} uploaded successfully.
                  </p>
                ) : (
                  <>
                    <div className="rounded-lg border border-[#ECECEC] px-4 py-3 font-body text-[13px]">
                      <p className="font-medium text-[#2F6B3B]">✓ {uploadedCount} photo{uploadedCount === 1 ? '' : 's'} uploaded</p>
                      <p className="mt-0.5 font-medium text-amber-600">
                        ⚠ {failedItems.length} photo{failedItems.length === 1 ? '' : 's'} failed
                      </p>
                    </div>
                    <p className="font-body text-[12px] text-[#757575]">
                      The photos that failed are still listed below. Fix or remove them, then try again.
                    </p>
                  </>
                )}
              </div>
            )}

            {finished && !uploading && queue.length > 0 && queue.some((i) => i.status !== 'uploaded') && (
              <p className="font-body text-[12px] text-[#757575]">
                Failed photos were not uploaded and are safe to remove.
              </p>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            aria-label="Choose photos to upload"
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ECECEC] px-5 py-4">
            {villas.length > 0 && readyCount > 0 && (
              <p className="font-body text-[12px] text-[#757575]">
                {readyCount} photo{readyCount === 1 ? '' : 's'} ready for {selectedVilla?.name ?? 'this villa'}
              </p>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {finished && !uploading && failedItems.length > 0 && (
                <GhostButton onClick={retryFailed}>
                  <RotateCw size={13} /> Retry Failed
                </GhostButton>
              )}
              {!uploading && (
                <GhostButton onClick={onClose} disabled={villas.length === 0}>
                  {finished ? 'Done' : 'Cancel'}
                </GhostButton>
              )}
              <PrimaryButton
                onClick={() => void runUpload()}
                disabled={!villaId || readyCount === 0 || uploading || villas.length === 0}
              >
                <UploadCloud size={14} />
                {uploading
                  ? 'Uploading…'
                  : `Upload ${readyCount} Photo${readyCount === 1 ? '' : 's'}`}
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function UploadDropzone({
  dragOver,
  onDragOver,
  onFiles,
  onPick,
}: {
  dragOver: boolean
  onDragOver: (over: boolean) => void
  onFiles: (files: FileList | File[]) => void
  onPick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Choose photos to upload (click, tap, or drag and drop)"
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPick()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(true)
      }}
      onDragLeave={() => onDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        onDragOver(false)
        onFiles(e.dataTransfer.files)
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
        dragOver ? 'border-[#0A1F44] bg-[#f0f2f7]' : 'border-[#C9A227]/60 bg-[#FAFAFA] hover:border-[#C9A227]'
      }`}
    >
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <UploadCloud size={22} className="text-[#0A1F44]" />
      </span>
      <p className="font-body text-[15px] font-medium text-[#0A1F44]">
        Drag &amp; drop photos here
      </p>
      <p className="mb-4 font-body text-[12px] text-[#757575]">or</p>
      <span className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[#0A1F44] px-5 font-body text-[13px] font-medium text-white">
        <ImagePlus size={15} /> Choose Photos
      </span>
      <p className="mt-4 font-body text-[11px] text-[#757575]">
        {FORMATS_LABEL} · Max file size: {MAX_MB}
      </p>
    </div>
  )
}

function UploadQueue({
  items,
  uploading,
  onAddMore,
  onRemove,
  selectedVillaName,
}: {
  items: QueueItem[]
  uploading: boolean
  onAddMore: () => void
  onRemove: (key: string) => void
  selectedVillaName: string
}) {
  const activeCount = items.filter((i) => i.status !== 'uploaded').length
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
<p className="font-body text-[13px] font-medium text-[#0A1F44]">
        {selectedVillaName ? `${selectedVillaName} · ` : ''}
        {activeCount > 0
          ? `${activeCount} photo${activeCount === 1 ? '' : 's'} selected`
          : 'All photos uploaded'}
      </p>
        {!uploading && (
          <GhostButton onClick={onAddMore}>
            <ImagePlus size={13} /> Add More Photos
          </GhostButton>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.key}
            className="overflow-hidden rounded-lg border border-[#ECECEC] bg-white"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[#f0f2f7]">
              <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(item.key)}
                disabled={uploading}
                aria-label={`Remove ${item.file.name} from the upload list`}
                title="Remove from upload list"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-red-600 disabled:opacity-40"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="space-y-1 p-2">
              <p className="truncate font-body text-[11px] font-medium text-[#0A1F44]">
                {item.file.name}
              </p>
              <p className="font-body text-[10px] text-[#757575]">{formatBytes(item.file.size)}</p>
              <ItemStatus item={item} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ItemStatus({ item }: { item: QueueItem }) {
  if (item.status === 'ready') {
    return <p className="font-body text-[11px] font-medium text-[#2F6B3B]">✓ Ready</p>
  }
  if (item.status === 'uploading') {
    return (
      <div className="space-y-0.5">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#ECECEC]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#0A1F44]" />
        </div>
        <p className="font-body text-[11px] text-[#0A1F44]">Uploading…</p>
      </div>
    )
  }
  if (item.status === 'uploaded') {
    return (
      <p className="flex items-center gap-1 font-body text-[11px] font-medium text-[#2F6B3B]">
        <CheckCircle2 size={11} /> Uploaded
      </p>
    )
  }
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1 font-body text-[11px] font-medium text-red-600" role="alert">
        <AlertCircle size={11} /> {item.message ?? 'Upload failed'}
      </p>
      <p className="font-body text-[10px] text-[#757575]">Not uploaded — safe to remove and try again.</p>
    </div>
  )
}