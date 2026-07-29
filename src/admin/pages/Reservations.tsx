import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { formatCurrency, RESERVATION_STATUSES, getReservationStatusLabel } from '../data/mockData'
import type { ReservationStatus } from '../types'


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

export default function Reservations() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [villaFilter, setVillaFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered: any[] = []


  const activeCount = filtered.length
  const totalRevenue = filtered.reduce((sum, r) => sum + r.totalAmount, 0)

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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#ECECEC] bg-white py-2.5 pl-9 pr-4 font-body text-[13px] text-[#0A1F44] placeholder:text-[#757575] transition-colors focus:border-[#0A1F44] outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
          className="rounded-lg border border-[#ECECEC] bg-white px-3 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
        >
          <option value="all">All Status</option>
          {RESERVATION_STATUSES.map((s) => (
            <option key={s} value={s}>{getReservationStatusLabel(s)}</option>
          ))}
        </select>
        <select
          value={villaFilter}
          onChange={(e) => setVillaFilter(e.target.value)}
          className="rounded-lg border border-[#ECECEC] bg-white px-3 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
        >
          <option value="all">All Villas</option>
          <option value="krib-1">KRiB 1</option>
          <option value="krib-2">KRiB 2</option>
        </select>
      </div>

      <div className="md:hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-[#ECECEC] bg-white p-10">
            <p className="font-body text-[14px] text-[#757575]">No reservations match your filters</p>
            <button onClick={() => { setStatusFilter('all'); setVillaFilter('all'); setSearchQuery('') }} className="font-body text-[13px] text-[#0A1F44] underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((res) => (
              <div
                key={res.id}
                onClick={() => navigate(`/admin/reservations/${res.id}`)}
                className="rounded-lg border border-[#ECECEC] bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-body text-[11px] text-[#757575]">{res.id}</span>
                  <StatusBadge status={res.status} size="sm" />
                </div>
                <p className="font-body text-[15px] font-medium text-[#0A1F44]">{res.guestName}</p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex flex-col text-[12px] text-[#757575]">
                    <span>{res.villaName}</span>
                    <span>{formatShortDate(res.checkIn)} – {formatShortDate(res.checkOut)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[14px] font-medium text-[#0A1F44]">{formatCurrency(res.totalAmount)}</span>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="font-body text-[14px] text-[#757575]">No reservations match your filters</p>
                    <button onClick={() => { setStatusFilter('all'); setVillaFilter('all'); setSearchQuery('') }} className="mt-2 font-body text-[13px] text-[#0A1F44] underline">
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => navigate(`/admin/reservations/${res.id}`)}
                    className="cursor-pointer border-b border-[#ECECEC]/50 transition-colors hover:bg-[#f0f2f7]/50"
                  >
                    <td className="px-5 py-3.5 font-body text-[12px] text-[#757575]">{res.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guestName}</span>
                        <span className="font-body text-[11px] text-[#757575]">{res.guestEmail}</span>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-5 py-3.5 font-body text-[13px] text-[#0A1F44]">{res.villaName}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-[13px] text-[#0A1F44]">{formatShortDate(res.checkIn)} – {formatShortDate(res.checkOut)}</span>
                        <span className="font-body text-[11px] text-[#757575]">{formatDate(res.checkIn)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={res.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right font-body text-[14px] font-medium text-[#0A1F44]">{formatCurrency(res.totalAmount)}</td>
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
    </motion.div>
  )
}
