import { RefreshCw } from 'lucide-react'

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C9A227] border-t-transparent" />
    </div>
  )
}

export function ErrorBlock({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
      <p className="font-body text-[14px] font-medium text-red-600">Failed to load data</p>
      <p className="mt-1 font-body text-[13px] text-red-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 font-body text-[12px] font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <RefreshCw size={13} /> Retry
        </button>
      )}
    </div>
  )
}
