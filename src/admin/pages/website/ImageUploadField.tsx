import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { isSupportedAvatarFile } from '../../../lib/supabase/helpers'
import { uploadSiteImage, MAX_IMAGE_SIZE } from '../../services/website'
import { Field } from './fields'
import { cn } from '../../../lib/cn'

const ACCEPT = 'image/jpeg, image/png, image/webp, image/avif'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  folder?: string
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'site',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const hasImage = value.trim() !== ''

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function validateFile(file: File): string | null {
    if (!isSupportedAvatarFile(file)) {
      return 'Use a JPG, PNG, WebP, or AVIF image.'
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Image must be smaller than 5 MB.'
    }
    return null
  }

  async function handleFile(file: File | null) {
    if (!file) return
    const invalid = validateFile(file)
    if (invalid) {
      setError(invalid)
      return
    }
    setError(null)
    setFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    await handleUpload()
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (!dropped) return
    handleFile(dropped)
  }

  async function handleUpload() {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const { data, error: serviceError } = await uploadSiteImage(file, folder)
      setUploading(false)
      setFile(null)
      setPreviewUrl(null)
      if (serviceError || !data) {
        setError(serviceError?.message ?? 'Upload failed. Please try again.')
        return
      }
      onChange(data.url)
    } catch {
      setUploading(false)
      setError('Upload failed. Please try again.')
    }
  }

  function handleRemove() {
    setError(null)
    setFile(null)
    setPreviewUrl(null)
    onChange('')
  }

  return (
    <label className="block space-y-3">
      <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">
        {label}
      </span>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center gap-2 rounded-lg border px-4 py-3 transition-colors',
          dragging ? 'border-[#0A1F44] bg-[#FAFAFA]' : 'border-[#ECECEC] bg-[#f0f2f7]',
        )}
      >
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#ECECEC]">
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="block h-full w-full flex items-center justify-center font-body text-[12px] text-[#757575]">
              No image
            </span>
          )}
          {dragging && (
            <span className="absolute inset-0 flex items-center justify-center rounded-lg border border-[#0A1F44]/40 bg-[#0A1F44]/5 font-body text-[12px] text-[#0A1F44]">
              Drop image here
            </span>
          )}
          {uploading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
            >
              <svg
                className="h-6 w-6 text-[#0A1F44]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </motion.div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          aria-label={label}
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg border border-[#ECECEC] px-3 font-body text-[11px] font-medium text-[#0A1F44] transition-colors disabled:opacity-50 hover:!bg-[#f0f2f7]"
          >
            {hasImage ? 'Replace image' : 'Upload image'}
          </button>
          {hasImage && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              aria-label="Remove image"
              className="flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg border border-[#ECECEC] px-3 font-body text-[11px] font-medium text-[#757575] transition-colors disabled:opacity-50 hover:bg-[#f0f2f7] hover:text-red-600"
            >
              Remove
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-[12px] text-red-700">
            {error}
          </p>
        )}
      </div>
      <Field
        label="Or paste an image URL"
        value={value}
        onChange={onChange}
        placeholder="Paste a public image URL"
      />
    </label>
  )
}
