import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import type { AuditLog } from '../types'
import { cn } from '../../lib/cn'

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

const ACTION_STYLES: Record<string, string> = {
  create: 'bg-[#F0F2F7] text-[#0A1F44]',
  approve: 'bg-[#F0F7F1] text-[#2F6B3B]',
  decline: 'bg-red-50 text-red-700',
  cancel: 'bg-[#FAFAFA] text-[#757575]',
  complete: 'bg-[#C9A227]/10 text-[#8a6d00]',
  delete: 'bg-red-50 text-red-700',
  send_sms: 'bg-blue-50 text-blue-700',
}

function actorLabel(log: AuditLog): string {
  if (log.admin) return log.admin.full_name
  const name = log.metadata?.actor_name as string | undefined
  if (name) return `${name} (guest)`
  return log.metadata?.actor_email as string ?? 'System'
}

const PAGE_SIZE = 20

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [page, setPage] = useState(1)

  const query = useAdminQuery('audit-logs', async () => {
    const { fetchAuditLogs } = await import('../services/api')
    return fetchAuditLogs()
  })

  const actions = useMemo(() => {
    const set = new Set((query.data ?? []).map((l) => l.action))
    return ['all', ...Array.from(set)]
  }, [query.data])

  const filtered = useMemo(() => {
    let list = query.data ?? []
    if (actionFilter !== 'all') list = list.filter((l) => l.action === actionFilter)
    const term = search.trim().toLowerCase()
    if (term) {
      list = list.filter((l) => {
        const haystack = [
          actorLabel(l),
          l.entity,
          String(l.metadata?.reference_code ?? ''),
          String(l.metadata?.actor_email ?? ''),
          l.action,
        ].join(' ').toLowerCase()
        return haystack.includes(term)
      })
    }
    return list
  }, [query.data, actionFilter, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function changePage(next: number) {
    setPage(Math.min(Math.max(1, next), pageCount))
  }

  if (query.loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Audit Logs" subtitle="Immutable record of every action on the reservation system" />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (query.error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Audit Logs" subtitle="Something went wrong." />
        <ErrorBlock message={query.error} onRetry={query.refetch} />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable record of every action on the reservation system"
        action={
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search actor, code, entity…"
              className="w-64 rounded-lg border border-[#ECECEC] bg-white py-2 pl-9 pr-3 font-body text-[12px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]"
            />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => { setActionFilter(a); setPage(1) }}
            className={cn(
              'rounded-md px-3 py-1.5 font-body text-[12px] capitalize transition-colors',
              actionFilter === a
                ? 'bg-[#0A1F44] text-white'
                : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#f0f2f7]',
            )}
          >
            {a}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#ECECEC] py-20">
          <ScrollText size={40} className="mb-4 text-[#ECECEC]" />
          <p className="font-body text-[14px] text-[#757575]">
            {query.data?.length === 0 ? 'No audit activity yet.' : 'No entries match this filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {visible.map((log) => (
              <div key={log.id} className="rounded-lg border border-[#ECECEC] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 font-body text-[11px] font-medium capitalize',
                        ACTION_STYLES[log.action] ?? 'bg-[#F0F2F7] text-[#0A1F44]',
                      )}
                    >
                      {log.action}
                    </span>
                    <span className="font-body text-[12px] text-[#0A1F44]">
                      {actorLabel(log)}
                    </span>
                    {!!log.metadata?.reference_code && (
                      <span className="font-mono text-[11px] text-[#757575]">
                        · {String(log.metadata.reference_code)}
                      </span>
                    )}
                    <span className="font-body text-[11px] text-[#757575]">· {log.entity}</span>
                  </div>
                  <span className="font-body text-[11px] text-[#757575]">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
                {!!log.metadata?.reason && (
                  <p className="mt-2 rounded-lg bg-[#FAFAFA] px-3 py-2 font-body text-[12px] text-[#757575]">
                    Reason: {String(log.metadata.reason)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="font-body text-[12px] text-[#757575]">
                {filtered.length} entries · Page {safePage} of {pageCount}
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
