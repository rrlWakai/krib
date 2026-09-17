import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { updateGalleryImage } from '../../services/website'
import { resolveStorageUrl } from '../../../services/api/website'
import type { AdminGalleryImage } from '../../types'
import { PrimaryButton, GhostButton } from './fields'

export function GalleryEditModal({
  image,
  onClose,
  onSaved,
}: {
  image: AdminGalleryImage | null
  onClose: () => void
  onSaved: (patch: { alt_text: string; caption: string; is_visible: boolean }) => void
}) {
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [visibility, setVisibility] = useState<boolean>(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (image) {
      setAltText(image.alt_text ?? '')
      setCaption(image.caption ?? '')
      setVisibility(image.is_visible)
      setError(null)
      setSaving(false)
    }
  }, [image])

  useEffect(() => {
    if (!image) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [image, onClose])

  if (!image) return null

  const url = resolveStorageUrl(image.storage_path)

  async function handleSave() {
    if (!image) return
    setSaving(true)
    setError(null)
    const { error } = await updateGalleryImage(image.id, {
      alt_text: altText,
      caption,
      is_visible: visibility,
    })
    setSaving(false)
    if (error) {
      console.warn('Gallery image update failed:', error)
      setError('This photo could not be updated. Please try again.')
      return
    }
    onSaved({ alt_text: altText, caption, is_visible: visibility })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:items-center md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-edit-title"
          className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#ECECEC] px-5 py-4">
            <h2 id="gallery-edit-title" className="font-display text-[17px] font-medium text-[#0A1F44]">
              Edit Photo
            </h2>
            <button
              onClick={onClose}
              aria-label="Close edit photo"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#ECECEC] bg-[#f0f2f7]">
              {url ? (
                <img src={url} alt={`Preview of ${image.file_name || 'photo'}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-body text-[12px] text-[#757575]">
                  File unavailable
                </div>
              )}
            </div>

            <fieldset className="space-y-1.5">
              <label
                htmlFor="gallery-edit-villa"
                className="block font-body text-[12px] font-medium text-[#0A1F44]"
              >
                Villa
              </label>
              <select
                id="gallery-edit-villa"
                value={image.villa?.name ?? ''}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-[#ECECEC] bg-[#FAFAFA] px-3.5 py-2.5 font-body text-[13px] text-[#757575] outline-none disabled:opacity-100"
              >
                <option>{image.villa?.name ?? 'Unknown villa'}</option>
              </select>
              <p className="font-body text-[11px] text-[#757575]">
                A photo's villa is chosen when it's uploaded and can't be changed here.
              </p>
            </fieldset>

            <label className="block">
              <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">
                Alt Text
              </span>
              <input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the photo for accessibility"
                className="w-full rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">
                Caption
              </span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Optional caption shown near the photo"
                className="w-full resize-y rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]"
              />
            </label>

            <fieldset>
              <legend className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">
                Visibility
              </legend>
              <div className="flex gap-4">
                {(
                  [
                    { value: true, label: 'Visible', hint: 'Shown on the website' },
                    { value: false, label: 'Hidden', hint: 'Kept in the gallery, not displayed' },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.label}
                    className="flex cursor-pointer items-center gap-2 font-body text-[13px] text-[#0A1F44]"
                  >
                    <input
                      type="radio"
                      name="gallery-visibility"
                      checked={visibility === option.value}
                      onChange={() => setVisibility(option.value)}
                      className="accent-[#0A1F44]"
                    />
                    <span>
                      {option.label}
                      <span className="block text-[11px] text-[#757575]">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-[12px] text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#ECECEC] px-5 py-4">
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
            </PrimaryButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}