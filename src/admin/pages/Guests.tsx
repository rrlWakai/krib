import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Mail,
  Phone,
  CalendarDays,
  User,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { guests, reservations, formatCurrency } from '../data/mockData'
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

function formatCurrencyShort(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
}

export default function Guests() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!searchQuery) return guests
    const q = searchQuery.toLowerCase()
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q)
    )
  }, [searchQuery])

  const selectedGuest = selectedGuestId
    ? guests.find((g) => g.id === selectedGuestId)
    : null

  const selectedGuestReservations = selectedGuest
    ? reservations.filter((r) => selectedGuest.reservations.includes(r.id))
    : []

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader title="Guests" subtitle="Your guest directory" />
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search guests by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-outline-variant bg-white py-2.5 pl-10 pr-4 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/60 shadow-card transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="hidden md:block overflow-hidden rounded-[16px] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Name
                </th>
                <th className="hidden lg:table-cell px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Phone
                </th>
                <th className="px-6 py-3.5 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Total Stays
                </th>
                <th className="px-6 py-3.5 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Total Spending
                </th>
                <th className="hidden lg:table-cell px-6 py-3.5 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Last Visit
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high">
                        <User size={24} className="text-on-surface-variant" />
                      </div>
                      <p className="font-body text-body-md text-on-surface-variant">
                        No guests found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((guest, i) => (
                  <tr
                    key={guest.id}
                    onClick={() => setSelectedGuestId(guest.id)}
                    className={cn(
                      'cursor-pointer border-b border-outline-variant/50 transition-colors hover:bg-surface-container-low',
                      i % 2 === 1 && 'bg-surface-container-low/50'
                    )}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container font-body text-body-sm font-medium text-primary">
                          {getInitials(guest.name)}
                        </div>
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {guest.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3.5 font-body text-body-md text-on-surface-variant">
                      {guest.email}
                    </td>
                    <td className="px-6 py-3.5 font-body text-body-md text-on-surface-variant">
                      {guest.phone}
                    </td>
                    <td className="px-6 py-3.5 text-right font-body text-body-md font-medium text-on-surface">
                      {guest.totalStays}
                    </td>
                    <td className="px-6 py-3.5 text-right font-body text-body-md font-medium text-on-surface">
                      {formatCurrencyShort(guest.totalSpending)}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3.5 text-right font-body text-body-sm text-on-surface-variant">
                      {formatDate(guest.lastVisit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={item} className="md:hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high">
              <User size={24} className="text-on-surface-variant" />
            </div>
            <p className="font-body text-body-md text-on-surface-variant">
              No guests found
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((guest) => (
              <div
                key={guest.id}
                onClick={() => setSelectedGuestId(guest.id)}
                className="rounded-[12px] border border-outline-variant/50 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container font-body text-body-sm font-medium text-primary">
                    {getInitials(guest.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-on-surface">{guest.name}</p>
                    <p className="truncate text-sm text-on-surface-variant">{guest.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">{guest.totalStays} stays</span>
                  <span className="font-medium">{formatCurrencyShort(guest.totalSpending)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedGuest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedGuestId(null)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 top-0 z-50 w-full overflow-y-auto bg-white shadow-2xl md:inset-x-auto md:right-0 md:max-w-md rounded-t-[20px] md:rounded-none"
            >
              <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-on-surface-variant/30 md:hidden" />
              <div className="flex flex-col p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-title-lg font-medium text-on-surface">
                    Guest Profile
                  </h2>
                  <button
                    onClick={() => setSelectedGuestId(null)}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface-container-low md:h-10 md:w-10"
                  >
                    <X size={20} className="text-on-surface" />
                  </button>
                </div>

                <div className="mb-6 flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container font-display text-headline-md font-medium text-primary">
                    {getInitials(selectedGuest.name)}
                  </div>
                  <h3 className="font-display text-title-lg font-medium text-on-surface">
                    {selectedGuest.name}
                  </h3>
                </div>

                <div className="mb-6 rounded-[12px] bg-surface-container-low p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="shrink-0 text-primary" />
                      <span className="font-body text-body-md text-on-surface">
                        {selectedGuest.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="shrink-0 text-primary" />
                      <span className="font-body text-body-md text-on-surface">
                        {selectedGuest.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays size={18} className="shrink-0 text-primary" />
                      <span className="font-body text-body-md text-on-surface">
                        Guest since {formatDate(selectedGuest.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 rounded-[12px] bg-surface-container-low p-4">
                  <h4 className="mb-3 font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                    Spending Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="font-body text-body-sm text-on-surface-variant">
                        Total Stays
                      </span>
                      <span className="font-display text-headline-md font-medium text-on-surface">
                        {selectedGuest.totalStays}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body text-body-sm text-on-surface-variant">
                        Total Spending
                      </span>
                      <span className="font-display text-headline-md font-medium text-on-surface">
                        {formatCurrency(selectedGuest.totalSpending)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                    Reservation History
                  </h4>
                  {selectedGuestReservations.length === 0 ? (
                    <p className="font-body text-body-md text-on-surface-variant">
                      No reservations found
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedGuestReservations.map((res) => (
                        <div
                          key={res.id}
                          className="rounded-[12px] border border-outline-variant/50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-body text-body-sm font-medium text-primary">
                              {res.id}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 font-body text-[11px] font-medium',
                                res.status === 'confirmed'
                                  ? 'bg-tertiary-container text-on-tertiary-container'
                                  : res.status === 'completed'
                                  ? 'bg-surface-container-high text-on-surface-variant'
                                  : res.status === 'cancelled' || res.status === 'declined'
                                  ? 'bg-error-container text-on-error-container'
                                  : 'bg-primary-container text-on-primary-container'
                              )}
                            >
                              {res.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </div>
                          <p className="mb-1 font-body text-body-md font-medium text-on-surface">
                            {res.villaName}
                          </p>
                          <p className="font-body text-body-sm text-on-surface-variant">
                            {formatDate(res.checkIn)} – {formatDate(res.checkOut)}
                          </p>
                          <p className="mt-1 font-body text-body-sm font-medium text-on-surface">
                            {formatCurrency(res.totalAmount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
