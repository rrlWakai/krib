import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Mail, Phone, CalendarDays } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import { formatCurrency } from '../data/constants'
import { computeGuestProfiles, estimateReservationValue } from '../services/api'
import type { GuestProfile } from '../types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
}

export default function Guests() {
  const guestsQuery = useAdminQuery('guests', async () => {
    const { fetchGuests } = await import('../services/api')
    return fetchGuests()
  })

  const reservationsQuery = useAdminQuery('reservations', async () => {
    const { fetchAllReservations } = await import('../services/api')
    return fetchAllReservations()
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)

  const profiles: GuestProfile[] = useMemo(
    () => computeGuestProfiles(guestsQuery.data ?? [], reservationsQuery.data ?? []),
    [guestsQuery.data, reservationsQuery.data],
  )

  const filtered = useMemo(() => {
    if (!searchQuery) return profiles
    const q = searchQuery.toLowerCase()
    return profiles.filter(
      (g) =>
        g.full_name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q),
    )
  }, [profiles, searchQuery])

  const selectedGuest = selectedGuestId
    ? profiles.find((g) => g.id === selectedGuestId)
    : null

  if (guestsQuery.loading || reservationsQuery.loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Guests" subtitle="Loading guest directory..." />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (guestsQuery.error || reservationsQuery.error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Guests" subtitle="Something went wrong." />
        <ErrorBlock
          message={guestsQuery.error ?? reservationsQuery.error ?? 'Unknown error'}
          onRetry={guestsQuery.refetch}
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
      <PageHeader title="Guests" subtitle="Client directory" />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#ECECEC] bg-white py-2.5 pl-9 pr-4 font-body text-[13px] text-[#0A1F44] placeholder:text-[#757575] transition-colors focus:border-[#0A1F44] outline-none"
          />
        </div>
      </div>

      <div className="hidden md:block border border-[#ECECEC] rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ECECEC]">
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Name</th>
                <th className="hidden lg:table-cell px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Email</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Phone</th>
                <th className="px-5 py-3.5 text-right font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Stays</th>
                <th className="px-5 py-3.5 text-right font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Spending</th>
                <th className="hidden lg:table-cell px-5 py-3.5 text-right font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="font-body text-[14px] text-[#757575]">No guests found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr
                    key={guest.id}
                    onClick={() => setSelectedGuestId(guest.id)}
                    className="cursor-pointer border-b border-[#ECECEC]/50 transition-colors hover:bg-[#f0f2f7]/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7] font-body text-[12px] font-medium text-[#0A1F44]">
                          {getInitials(guest.full_name)}
                        </div>
                        <span className="font-body text-[14px] font-medium text-[#0A1F44]">{guest.full_name}</span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-5 py-3.5 font-body text-[13px] text-[#757575]">{guest.email}</td>
                    <td className="px-5 py-3.5 font-body text-[13px] text-[#757575]">{guest.phone}</td>
                    <td className="px-5 py-3.5 text-right font-body text-[14px] font-medium text-[#0A1F44]">{guest.totalStays}</td>
                    <td className="px-5 py-3.5 text-right font-body text-[14px] font-medium text-[#0A1F44]">{formatCurrency(guest.totalSpending)}</td>
                    <td className="hidden lg:table-cell px-5 py-3.5 text-right font-body text-[12px] text-[#757575]">
                      {guest.lastVisit ? formatDate(guest.lastVisit) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-body text-[14px] text-[#757575]">No guests found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((guest) => (
              <div
                key={guest.id}
                onClick={() => setSelectedGuestId(guest.id)}
                className="rounded-lg border border-[#ECECEC] bg-white p-4"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7] font-body text-[12px] font-medium text-[#0A1F44]">
                    {getInitials(guest.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-[14px] font-medium text-[#0A1F44]">{guest.full_name}</p>
                    <p className="truncate font-body text-[12px] text-[#757575]">{guest.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#757575]">{guest.totalStays} stays</span>
                  <span className="font-medium text-[#0A1F44]">{formatCurrency(guest.totalSpending)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedGuest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSelectedGuestId(null)}
              className="fixed inset-0 z-40 bg-black/10"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              data-lenis-prevent
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] overflow-y-auto border-l border-[#ECECEC] bg-white"
            >
              <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#ECECEC] md:hidden" />
              <div className="flex flex-col p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-[20px] font-medium text-[#0A1F44]">Guest Profile</h2>
                  <button onClick={() => setSelectedGuestId(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7]">
                    <X size={16} />
                  </button>
                </div>

                <div className="mb-6 flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f2f7] font-display text-[22px] font-medium text-[#0A1F44]">
                    {getInitials(selectedGuest.full_name)}
                  </div>
                  <h3 className="font-display text-[18px] font-medium text-[#0A1F44]">{selectedGuest.full_name}</h3>
                </div>

                <div className="mb-6 space-y-2.5 border-b border-[#ECECEC] pb-6">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="shrink-0 text-[#757575]" />
                    <span className="font-body text-[13px] text-[#0A1F44]">{selectedGuest.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="shrink-0 text-[#757575]" />
                    <span className="font-body text-[13px] text-[#0A1F44]">{selectedGuest.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={14} className="shrink-0 text-[#757575]" />
                    <span className="font-body text-[13px] text-[#0A1F44]">Guest since {formatDate(selectedGuest.created_at)}</span>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 border-b border-[#ECECEC] pb-6">
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Total Stays</p>
                    <p className="mt-1 font-display text-[24px] font-medium text-[#0A1F44]">{selectedGuest.totalStays}</p>
                  </div>
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Total Spending</p>
                    <p className="mt-1 font-display text-[24px] font-medium text-[#0A1F44]">{formatCurrency(selectedGuest.totalSpending)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Reservation History</h4>
                  {selectedGuest.allReservations.length === 0 ? (
                    <p className="font-body text-[13px] text-[#757575]">No reservations found</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedGuest.allReservations.map((res) => (
                        <div key={res.id} className="rounded-lg border border-[#ECECEC] p-4">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-body text-[11px] text-[#757575]">{res.reference_code}</span>
                            <StatusBadge status={res.status} size="sm" />
                          </div>
                          <p className="mb-1 font-body text-[13px] font-medium text-[#0A1F44]">{res.villa.name}</p>
                          <p className="font-body text-[12px] text-[#757575]">
                            {formatDate(res.arrival_datetime)} – {formatDate(res.checkout_datetime)}
                          </p>
                          <p className="mt-1 font-body text-[13px] font-medium text-[#0A1F44]">
                            {formatCurrency(estimateReservationValue(res))}
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
