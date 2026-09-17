import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Replace, UploadCloud } from 'lucide-react'
import { replaceGalleryImage } from '../../services/website'
import { resolveStorageUrl } from '../../../services/api/website'
import { isSupportedAvatarFile } from '../../../lib/supabase/helpers'
import type { AdminGalleryImage } from '../../types'
import type { AdminVillaOption } from '../../services/website'
import { PrimaryButton, GhostButton } from './fields'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

export function GalleryReplaceModal({
  image,
  villa,
  onClose,
  onReplaced,
}: {
  image: AdminGalleryImage | null
  villa: AdminVillaOption | null
  onClose: () => void
  onReplaced: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (image) {
      setFile(null)
      setPreviewUrl('')
      setError(null)
      setReplacing(false)
      setDone(false)
    }
  }, [image])

  useEffect(() => {
    if (!image) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !replacing) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [image, onClose, replacing])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!image) return null

  const currentUrl = resolveStorageUrl(image.storage_path)

  function pick(f: FileList | File[] | null) {
    const next = f?.[0]
    if (!next) return
    if (!isSupportedAvatarFile(next)) {
      setError("This image type isn't supported. Use JPG, PNG, WEBP, or AVIF.")
      setPreviewUrl('')
      setFile(null)
      return
    }
    if (next.size > MAX_IMAGE_SIZE) {
      setError('This image is too large. Max file size is 5 MB.')
      setPreviewUrl('')
      setFile(null)
      return
    }
    setError(null)
    setFile(next)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(next))
  }

  async function handleReplace() {
    if (!image || !file || replacing) return
    setReplacing(true)
    setError(null)
    const { error } = await replaceGalleryImage(image.id, file)
    setReplacing(false)
    if (error) {
      console.warn('Gallery image replacement failed:', error)
      setError('This photo could not be replaced. Please try again.')
      return
    }
    setDone(true)
    onReplaced()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:items-center md:p-8"
        onClick={replacing ? undefined : onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-replace-title"
          className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#ECECEC] px-5 py-4">
            <h2 id="gallery-replace-title" className="font-display text-[17px] font-medium text-[#0A1F44]">
              Replace Photo
            </h2>
            <button
              onClick={onClose}
              disabled={replacing}
              aria-label="Close replace photo"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {done ? (
              <div className="space-y-4 py-6 text-center" role="status">
                <p className="font-body text-[15px] font-medium text-[#2F6B3B]">✓ Photo replaced successfully.</p>
                <p className="font-body text-[12px] text-[#757575]">
                  The new photo is now shown in the {villa?.name ?? 'villa'} gallery.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="mb-1.5 font-body text-[12px] font-medium text-[#0A1F44]">Current photo</p>
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#ECECEC] bg-[#f0f2f7]">
                    {currentUrl ? (
                      <img
                        src={currentUrl}
                        alt={`Current ${image.file_name || 'photo'}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-body text-[12px] text-[#757575]">
                        File unavailable
                      </div>
                    )}
                  </div>
                </div>

                {file ? (
                  <div className="space-y-2">
                    <p className="mb-1.5 font-body text-[12px] font-medium text-[#0A1F44]">New photo</p>
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#ECECEC] bg-[#f0f2f7]">
                      <img src={previewUrl} alt={`Preview of ${file.name}`} className="h-full w-full object-cover" />
                    </div>
                    <p className="truncate font-body text-[12px] text-[#0A1F44]">{file.name}</p>
                    <GhostButton onClick={() => inputRef.current?.click()}>Choose a Different Photo</GhostButton>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Choose a new photo to replace the current one"
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        inputRef.current?.click()
                      }
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                      error ? 'border-red-300 bg-red-50' : 'border-[#C9A227]/60 bg-[#FAFAFA] hover:border-[#C9A227]'
                    }`}
                  >
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <UploadCloud size={22} className="text-[#0A1F44]" />
                    </span>
                    <span className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[#0A1F44] px-5 font-body text-[13px] font-medium text-white">
                      Choose New Photo
                    </span>
                    <p className="mt-4 font-body text-[11px] text-[#757575]">JPG, PNG, WEBP, or AVIF · Max file size: 5 MB</p>
                  </div>
                )}

                {error && (
                  <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-[12px] text-red-700">
                    {error}
                  </p>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT}
                  aria-label="Choose a new photo"
                  className="sr-only"
                  onChange={(e) => {
                    pick(e.target.files)
                    e.target.value = ''
                  }}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#ECECEC] px-5 py-4">
            {done ? (
              <PrimaryButton onClick={onClose}>Done</PrimaryButton>
            ) : (
              <>
                <GhostButton onClick={onClose} disabled={replacing}>
                  Cancel
                </GhostButton>
                <PrimaryButton onClick={() => void handleReplace()} disabled={!file || replacing}>
                  <Replace size={14} /> {replacing ? 'Replacing…' : 'Replace Image'}
                </PrimaryButton>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}