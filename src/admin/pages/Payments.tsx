import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import {
  payments,
  formatCurrency,
} from '../data/mockData'
import type { PaymentStatus } from '../types'
import { cn } from '../../lib/cn'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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

const PAYMENT_STATUSES: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Payments() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matches =
          p.guestName.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.villaName.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [statusFilter, searchQuery])

  const totalCollected = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter((p) => p.status === 'pending' || p.status === 'submitted')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalRejected = payments
    .filter((p) => p.status === 'rejected')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader title="Payments" subtitle="Track and manage all payments" />
      </motion.div>

      <motion.div
        variants={item}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          icon={<CheckCircle2 size={22} />}
          accent="green"
        />
        <StatCard
          title="Pending"
          value={formatCurrency(totalPending)}
          icon={<Clock size={22} />}
          accent="amber"
        />
        <StatCard
          title="Rejected"
          value={formatCurrency(totalRejected)}
          icon={<AlertCircle size={22} />}
          accent="red"
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
            placeholder="Search by guest, ID, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
            className="appearance-none rounded-[12px] border border-outline-variant bg-surface-container-low py-2.5 pl-9 pr-8 font-body text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
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
                <th className="px-6 py-3.5 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Amount
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Method
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Date
                </th>
                <th className="px-6 py-3.5 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high">
                        <CreditCard size={24} className="text-on-surface-variant" />
                      </div>
                      <p className="font-body text-body-md text-on-surface-variant">
                        No payments match your filters
                      </p>
                      <button
                        onClick={() => {
                          setStatusFilter('all')
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
                filtered.map((pay, i) => (
                  <tr
                    key={pay.id}
                    className={cn(
                      'border-b border-outline-variant/50 transition-colors hover:bg-surface-container-low',
                      i % 2 === 1 && 'bg-surface-container-low/50'
                    )}
                  >
                    <td className="px-6 py-3.5 font-body text-body-sm font-medium text-primary">
                      {pay.id}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {pay.guestName}
                        </span>
                        <button
                          onClick={() =>
                            navigate(`/admin/reservations/${pay.reservationId}`)
                          }
                          className="text-left font-body text-body-sm text-on-surface-variant transition-colors hover:text-primary"
                        >
                          {pay.reservationId}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-body text-body-md text-on-surface">
                      {pay.villaName}
                    </td>
                    <td className="px-6 py-3.5 text-right font-body text-body-md font-medium text-on-surface">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-body text-body-sm text-on-surface-variant">
                        {pay.method || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={pay.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 font-body text-body-sm text-on-surface-variant">
                      {formatDate(pay.createdAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {pay.status === 'submitted' && (
                        <button
                          className="inline-flex items-center gap-1.5 rounded-[12px] bg-tertiary px-3 py-1.5 font-body text-body-sm font-medium text-white transition-colors hover:bg-tertiary/90"
                        >
                          <CheckCircle2 size={14} /> Verify
                        </button>
                      )}
                      {pay.status === 'pending' && (
                        <span className="font-body text-body-sm text-on-surface-variant">
                          Awaiting
                        </span>
                      )}
                      {pay.status === 'verified' && (
                        <span className="font-body text-body-sm text-tertiary">
                          Verified
                        </span>
                      )}
                      {pay.status === 'rejected' && (
                        <span className="font-body text-body-sm text-error">
                          Rejected
                        </span>
                      )}
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
