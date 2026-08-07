import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, ChevronLeft } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import { formatCurrency, RESERVATION_STATUSES, getReservationStatusLabel } from '../data/constants'
import { estimateReservationValue } from '../services/api'
import type { ReservationStatus, Reservation } from '../types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
}

const PAGE_SIZE = 10

export default function Reservations() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [villaFilter, setVillaFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const reservationsQuery = useAdminQuery('reservations', async () => {
    const { fetchAllReservations } = await import('../services/api')
    return fetchAllReservations()
  })

  const villasQuery = useAdminQuery('villas', async () => {
    const { fetchVillas } = await import('../services/api')
    return fetchVillas()
  })

  const allReservations = reservationsQuery.data ?? []
  const villas = villasQuery.data ?? []

  const filtered: Reservation[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allReservations.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (villaFilter !== 'all' && r.villa?.slug !== villaFilter) return false
      if (q) {
        const haystack = [
          r.reference_code,
          r.guest?.full_name ?? '',
          r.guest?.email ?? '',
          r.villa?.name ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [allReservations, statusFilter, villaFilter, searchQuery])

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, r) => sum + estimateReservationValue(r), 0),
    [filtered],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const activeCount = filtered.length

  function clearFilters() {
    setStatusFilter('all')
    setVillaFilter('all')
    setSearchQuery('')
    setPage(1)
  }

  if (reservationsQuery.loading || villasQuery.loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Reservations" subtitle="Loading reservations..." />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (reservationsQuery.error || villasQuery.error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Reservations" subtitle="Something went wrong." />
        <ErrorBlock
          message={reservationsQuery.error ?? villasQuery.error ?? 'Unknown error'}
          onRetry={reservationsQuery.refetch}
        />
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
        title="Reservations"
        subtitle={`${activeCount} reservation${activeCount !== 1 ? 's' : ''} · ${formatCurrency(totalRevenue)} total`}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-[#ECECEC] bg-white py-2.5 pl-9 pr-4 font-body text-[13px] text-[#0A1F44] placeholder:text-[#757575] transition-colors focus:border-[#0A1F44] outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ReservationStatus | 'all')
            setPage(1)
          }}
          className="rounded-lg border border-[#ECECEC] bg-white px-3 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
        >
          <option value="all">All Status</option>
          {RESERVATION_STATUSES.map((s) => (
            <option key={s} value={s}>{getReservationStatusLabel(s)}</option>
          ))}
        </select>
        <select
          value={villaFilter}
          onChange={(e) => {
            setVillaFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-[#ECECEC] bg-white px-3 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
        >
          <option value="all">All Villas</option>
          {villas.map((v) => (
            <option key={v.id} value={v.slug}>{v.name}</option>
          ))}
        </select>
      </div>

      <div className="md:hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-[#ECECEC] bg-white p-10">
            <p className="font-body text-[14px] text-[#757575]">No reservations match your filters</p>
            <button onClick={clearFilters} className="font-body text-[13px] text-[#0A1F44] underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((res) => (
              <div
                key={res.id}
                onClick={() => navigate(`/admin/reservations/${res.id}`)}
                className="rounded-lg border border-[#ECECEC] bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-body text-[11px] text-[#757575]">{res.reference_code}</span>
                  <StatusBadge status={res.status} size="sm" />
                </div>
                <p className="font-body text-[15px] font-medium text-[#0A1F44]">{res.guest?.full_name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex flex-col text-[12px] text-[#757575]">
                    <span>{res.villa?.name}</span>
                    <span>{formatShortDate(res.arrival_datetime)} – {formatShortDate(res.checkout_datetime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[14px] font-medium text-[#0A1F44]">{formatCurrency(estimateReservationValue(res))}</span>
                    <ChevronRight size={14} className="text-[#757575]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:block border border-[#ECECEC] rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ECECEC]">
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">ID</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Guest</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium hidden xl:table-cell">Villa</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Dates</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Amount</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="font-body text-[14px] text-[#757575]">No reservations match your filters</p>
                    <button onClick={clearFilters} className="mt-2 font-body text-[13px] text-[#0A1F44] underline">
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                visible.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => navigate(`/admin/reservations/${res.id}`)}
                    className="cursor-pointer border-b border-[#ECECEC]/50 transition-colors hover:bg-[#f0f2f7]/50"
                  >
                    <td className="px-5 py-3.5 font-body text-[12px] text-[#757575]">{res.reference_code}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guest?.full_name}</span>
                        <span className="font-body text-[11px] text-[#757575]">{res.guest?.email}</span>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-5 py-3.5 font-body text-[13px] text-[#0A1F44]">{res.villa?.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-[13px] text-[#0A1F44]">{formatShortDate(res.arrival_datetime)} – {formatShortDate(res.checkout_datetime)}</span>
                        <span className="font-body text-[11px] text-[#757575]">{formatDate(res.arrival_datetime)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={res.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right font-body text-[14px] font-medium text-[#0A1F44]">{formatCurrency(estimateReservationValue(res))}</td>
                    <td className="px-5 py-3.5 text-right">
                      <ChevronRight size={14} className="ml-auto text-[#757575]" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <p className="font-body text-[12px] text-[#757575]">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ECECEC] bg-white text-[#757575] transition-colors hover:text-[#0A1F44] disabled:opacity-40 disabled:hover:text-[#757575]"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-body text-[12px] text-[#757575]">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ECECEC] bg-white text-[#757575] transition-colors hover:text-[#0A1F44] disabled:opacity-40 disabled:hover:text-[#757575]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
