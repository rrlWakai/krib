import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
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

type StatusFilter = 'all' | SmsLog['status']

export default function AdminSmsActivity() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const smsQuery = useAdminQuery('sms-logs', async () => {
    const { fetchSmsLogs } = await import('../services/api')
    return fetchSmsLogs()
  })

  const filtered = useMemo(() => {
    const logs = smsQuery.data ?? []
    if (statusFilter === 'all') return logs
    return logs.filter((log) => log.status === statusFilter)
  }, [smsQuery.data, statusFilter])

  const counts = useMemo(() => {
    const logs = smsQuery.data ?? []
    return {
      all: logs.length,
      queued: logs.filter((l) => l.status === 'queued').length,
      sent: logs.filter((l) => l.status === 'sent').length,
      failed: logs.filter((l) => l.status === 'failed').length,
    }
  }, [smsQuery.data])

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
          <div className="flex items-center gap-2">
            {(['all', 'queued', 'sent', 'failed'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#ECECEC] py-20">
          <MessageSquare size={40} className="mb-4 text-[#ECECEC]" />
          <p className="font-body text-[14px] text-[#757575]">
            {smsQuery.data?.length === 0 ? 'No SMS activity yet.' : 'No messages match this filter.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((log) => (
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
      )}
    </motion.div>
  )
}
