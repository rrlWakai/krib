import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus()
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !loading) onCancel()
      }
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [open, loading, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/30"
            onClick={loading ? undefined : onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-[400px] rounded-xl border border-[#ECECEC] bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <h3 className="font-display text-[17px] font-medium text-[#0A1F44]">{title}</h3>
              </div>
              <p className="mb-6 font-body text-[13px] leading-relaxed text-[#757575]">{message}</p>
              <div className="flex justify-end gap-2">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  disabled={loading}
                  className="rounded-lg border border-[#ECECEC] px-4 py-2 font-body text-[13px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 font-body text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting…' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
