import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import type { SmsLog } from '../types'
import { cn } from '../../lib/cn'

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function redactError(text: string) {
  return text
    .replace(/apikey=([^&\s]+)/gi, 'apikey=[REDACTED]')
    .replace(/[0-9a-f]{32,}/gi, '[REDACTED]')
}

type StatusFilter = 'all' | SmsLog['status']

const PAGE_SIZE = 15

export default function AdminSmsActivity() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const smsQuery = useAdminQuery('sms-logs', async () => {
    const { fetchSmsLogs } = await import('../services/api')
    return fetchSmsLogs()
  })

  const counts = useMemo(() => {
    const logs = smsQuery.data ?? []
    return {
      all: logs.length,
      queued: logs.filter((l) => l.status === 'queued').length,
      sent: logs.filter((l) => l.status === 'sent').length,
      failed: logs.filter((l) => l.status === 'failed').length,
    }
  }, [smsQuery.data])

  const filtered = useMemo(() => {
    let logs = smsQuery.data ?? []
    if (statusFilter !== 'all') logs = logs.filter((log) => log.status === statusFilter)
    const term = search.trim().toLowerCase()
    if (term) {
      logs = logs.filter((log) => {
        const haystack = [
          log.recipient,
          log.message,
          log.reservation?.reference_code ?? '',
          log.reservation?.guest.full_name ?? '',
          log.direction,
        ].join(' ').toLowerCase()
        return haystack.includes(term)
      })
    }
    return logs
  }, [smsQuery.data, statusFilter, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function changePage(next: number) {
    setPage(Math.min(Math.max(1, next), pageCount))
  }

  if (smsQuery.loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="SMS Activity" subtitle="View and manage SMS communications with guests" />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (smsQuery.error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="SMS Activity" subtitle="Something went wrong." />
        <ErrorBlock message={smsQuery.error} onRetry={smsQuery.refetch} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="SMS Activity"
        subtitle="View and manage SMS communications with guests"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'queued', 'sent', 'failed'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={cn(
                  'rounded-md px-3 py-1.5 font-body text-[12px] capitalize transition-colors',
                  statusFilter === s
                    ? 'bg-[#0A1F44] text-white'
                    : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#f0f2f7]',
                )}
              >
                {s} {s === 'all' ? `(${counts.all})` : `(${counts[s]})`}
              </button>
            ))}
          </div>
        }
      />

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search recipient, message, reservation code…"
          className="w-full max-w-md rounded-lg border border-[#ECECEC] bg-white py-2 pl-9 pr-3 font-body text-[12px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#ECECEC] py-20">
          <MessageSquare size={40} className="mb-4 text-[#ECECEC]" />
          <p className="font-body text-[14px] text-[#757575]">
            {smsQuery.data?.length === 0 ? 'No SMS activity yet.' : 'No messages match this filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {visible.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-[#ECECEC] bg-white p-4"
              >
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[12px] font-medium text-[#0A1F44]">
                      To {log.recipient}
                    </span>
                    {log.reservation && (
                      <span className="font-body text-[11px] text-[#757575]">
                        · {log.reservation.reference_code} · {log.reservation.guest.full_name}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={log.status} size="sm" />
                </div>
                <p className="mb-2 font-body text-[13px] leading-relaxed text-[#0A1F44]">
                  {log.message}
                </p>
                {log.status === 'failed' && log.error_message && (
                  <p className="mb-2 rounded-md bg-red-50 px-2.5 py-1.5 font-body text-[11px] leading-snug text-red-600">
                    {redactError(log.error_message)}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-body text-[11px] uppercase tracking-wide text-[#757575]">
                    {log.direction.replace('_', ' ')}
                  </span>
                  <span className="font-body text-[11px] text-[#757575]">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="font-body text-[12px] text-[#757575]">
                {filtered.length} messages · Page {safePage} of {pageCount}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => changePage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="rounded-lg border border-[#ECECEC] bg-white px-3 py-1.5 font-body text-[12px] text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => changePage(safePage + 1)}
                  disabled={safePage >= pageCount}
                  className="rounded-lg border border-[#ECECEC] bg-white px-3 py-1.5 font-body text-[12px] text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
