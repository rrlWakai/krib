import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, CalendarDays, ChevronRight } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import {
  reservations,
  formatCurrency,
  RESERVATION_STATUSES,
  getReservationStatusLabel,
} from '../data/mockData'
import type { ReservationStatus } from '../types'
import { cn } from '../../lib/cn'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
}

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

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (villaFilter !== 'all' && r.villaId !== villaFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matches =
          r.guestName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.confirmationNumber.toLowerCase().includes(q) ||
          r.guestEmail.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [statusFilter, villaFilter, searchQuery])

  const activeCount = filtered.length
  const totalRevenue = filtered.reduce((sum, r) => sum + r.totalAmount, 0)

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title="Reservations"
          subtitle="Manage all guest reservations"
          action={
            <div className="flex items-center gap-2">
              <span className="font-body text-body-sm text-on-surface-variant">
                {activeCount} reservation{activeCount !== 1 ? 's' : ''} •{' '}
                {formatCurrency(totalRevenue)} total
              </span>
            </div>
          }
        />
      </motion.div>

      <motion.div
        variants={item}
        className="mb-6 flex flex-col gap-4 rounded-[16px] bg-white p-4 shadow-card sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
              className="appearance-none rounded-[12px] border border-outline-variant bg-surface-container-low py-2.5 pl-9 pr-8 font-body text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              {RESERVATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getReservationStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <CalendarDays
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <select
              value={villaFilter}
              onChange={(e) => setVillaFilter(e.target.value)}
              className="appearance-none rounded-[12px] border border-outline-variant bg-surface-container-low py-2.5 pl-9 pr-8 font-body text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Villas</option>
              <option value="krib-1">KRiB 1</option>
              <option value="krib-2">KRiB 2</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="overflow-hidden rounded-[16px] bg-white shadow-card"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  ID
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Guest
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Villa
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Dates
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Amount
                </th>
                <th className="px-6 py-3.5 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high">
                        <CalendarDays size={24} className="text-on-surface-variant" />
                      </div>
                      <p className="font-body text-body-md text-on-surface-variant">
                        No reservations match your filters
                      </p>
                      <button
                        onClick={() => {
                          setStatusFilter('all')
                          setVillaFilter('all')
                          setSearchQuery('')
                        }}
                        className="font-body text-body-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((res, i) => (
                  <tr
                    key={res.id}
                    onClick={() => navigate(`/admin/reservations/${res.id}`)}
                    className={cn(
                      'cursor-pointer border-b border-outline-variant/50 transition-colors hover:bg-surface-container-low',
                      i % 2 === 1 && 'bg-surface-container-low/50'
                    )}
                  >
                    <td className="px-6 py-3.5 font-body text-body-sm font-medium text-primary">
                      {res.id}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {res.guestName}
                        </span>
                        <span className="font-body text-body-sm text-on-surface-variant">
                          {res.guestEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-body text-body-md text-on-surface">
                      {res.villaName}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-body-sm text-on-surface">
                          {formatShortDate(res.checkIn)} – {formatShortDate(res.checkOut)}
                        </span>
                        <span className="font-body text-body-sm text-on-surface-variant">
                          {formatDate(res.checkIn)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={res.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 text-right font-body text-body-md font-medium text-on-surface">
                      {formatCurrency(res.totalAmount)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <ChevronRight
                        size={18}
                        className="ml-auto text-on-surface-variant"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
