import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import { useAuth } from '../../hooks/auth/useAuth'
import { formatCurrency, getDaysUntil } from '../data/constants'
import { estimateReservationValue, computeDashboard } from '../services/api'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function timeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { admin } = useAuth()

  const reservationsQuery = useAdminQuery('reservations', async () => {
    const { fetchAllReservations } = await import('../services/api')
    return fetchAllReservations()
  })

  const villasQuery = useAdminQuery('villas', async () => {
    const { fetchVillas } = await import('../services/api')
    return fetchVillas()
  })

  const guestsQuery = useAdminQuery('guests', async () => {
    const { fetchGuests } = await import('../services/api')
    return fetchGuests()
  })

  const loading = reservationsQuery.loading || villasQuery.loading || guestsQuery.loading
  const error = reservationsQuery.error ?? villasQuery.error ?? guestsQuery.error

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title={timeGreeting()}
          subtitle={new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title={timeGreeting()}
          subtitle={new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        />
        <ErrorBlock message={error} onRetry={reservationsQuery.refetch} />
      </motion.div>
    )
  }

  const reservations = reservationsQuery.data ?? []
  const villas = villasQuery.data ?? []
  const guests = guestsQuery.data ?? []
  const dashboard = computeDashboard(reservations, villas, guests)

  const firstName = admin?.full_name?.split(' ')[0] ?? 'Admin'
  const { stats, recentReservations, todayCheckins, todayCheckouts, upcomingArrivals } = dashboard

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={`${timeGreeting()}, ${firstName}`}
        subtitle={`${new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}
      />

      <div className="mb-10 grid grid-cols-2 gap-x-10 gap-y-7 sm:grid-cols-4">
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
            Pending Reservations
          </p>
          <p className="mt-1 font-display text-[32px] leading-[38px] font-medium tracking-tight text-[#0A1F44]">
            {stats.pendingReservations}
          </p>
        </div>
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
            Today's Check-ins
          </p>
          <p className="mt-1 font-display text-[32px] leading-[38px] font-medium tracking-tight text-[#0A1F44]">
            {stats.todayCheckins}
          </p>
        </div>
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
            Today's Check-outs
          </p>
          <p className="mt-1 font-display text-[32px] leading-[38px] font-medium tracking-tight text-[#0A1F44]">
            {stats.todayCheckouts}
          </p>
        </div>
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
            Occupancy
          </p>
          <p className="mt-1 font-display text-[32px] leading-[38px] font-medium tracking-tight text-[#0A1F44]">
            {stats.occupancyRate}%
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-display text-[18px] leading-[26px] font-medium text-[#0A1F44]">
          Today's Activity
        </h2>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {todayCheckins.length > 0 && (
          <div className="border border-[#ECECEC] rounded-lg p-4">
            <p className="mb-3 font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              Check-ins Today
            </p>
            {todayCheckins.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/admin/reservations/${r.id}`)}
                className="flex cursor-pointer items-center justify-between py-2 transition-colors hover:text-[#C9A227]"
              >
                <div>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{r.guest?.full_name}</p>
                  <p className="font-body text-[12px] text-[#757575]">{r.villa?.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {todayCheckouts.length > 0 && (
          <div className="border border-[#ECECEC] rounded-lg p-4">
            <p className="mb-3 font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              Check-outs Today
            </p>
            {todayCheckouts.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/admin/reservations/${r.id}`)}
                className="flex cursor-pointer items-center justify-between py-2 transition-colors hover:text-[#C9A227]"
              >
                <div>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{r.guest?.full_name}</p>
                  <p className="font-body text-[12px] text-[#757575]">{r.villa?.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {todayCheckins.length === 0 && todayCheckouts.length === 0 && (
          <div className="border border-[#ECECEC] rounded-lg p-5">
            <p className="font-body text-[14px] text-[#757575]">No activity scheduled for today.</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h2 className="font-display text-[18px] leading-[26px] font-medium text-[#0A1F44]">
          Recent Reservations
        </h2>
      </div>

      <div className="mb-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ECECEC]">
                <th className="pb-3 pr-4 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">
                  Guest
                </th>
                <th className="pb-3 pr-4 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium hidden sm:table-cell">
                  Villa
                </th>
                <th className="pb-3 pr-4 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium hidden lg:table-cell">
                  Dates
                </th>
                <th className="pb-3 pr-4 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">
                  Status
                </th>
                <th className="pb-3 text-right font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((res) => (
                <tr
                  key={res.id}
                  onClick={() => navigate(`/admin/reservations/${res.id}`)}
                  className="cursor-pointer border-b border-[#ECECEC]/50 transition-colors hover:bg-[#f0f2f7]/50"
                >
                  <td className="py-3.5 pr-4">
                    <span className="font-body text-[14px] text-[#0A1F44]">{res.guest?.full_name}</span>
                  </td>
                  <td className="py-3.5 pr-4 hidden sm:table-cell">
                    <span className="font-body text-[13px] text-[#757575]">{res.villa?.name}</span>
                  </td>
                  <td className="py-3.5 pr-4 hidden lg:table-cell">
                    <span className="font-body text-[13px] text-[#757575]">
                      {formatDate(res.arrival_datetime)} – {formatDate(res.checkout_datetime)}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={res.status} size="sm" />
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="font-body text-[14px] font-medium text-[#0A1F44]">
                      {formatCurrency(estimateReservationValue(res))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => navigate('/admin/reservations')}
          className="mt-4 flex items-center gap-1 font-body text-[13px] text-[#757575] transition-colors hover:text-[#0A1F44]"
        >
          View all reservations <ArrowRight size={14} />
        </button>
      </div>

      <div className="mb-4">
        <h2 className="font-display text-[18px] leading-[26px] font-medium text-[#0A1F44]">
          Upcoming
        </h2>
      </div>

      {upcomingArrivals.length === 0 ? (
        <div className="border border-[#ECECEC] rounded-lg p-6">
          <p className="font-body text-[14px] text-[#757575]">No upcoming reservations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {upcomingArrivals.map((res) => {
            const daysUntil = getDaysUntil(res.arrival_datetime)
            return (
              <div
                key={res.id}
                onClick={() => navigate(`/admin/reservations/${res.id}`)}
                className="cursor-pointer border border-[#ECECEC] rounded-lg p-4 transition-all hover:border-[#0A1F44]/20"
              >
                <div className="mb-3">
                  <StatusBadge status={res.status} size="sm" />
                </div>
                <p className="mb-0.5 font-body text-[14px] font-medium text-[#0A1F44]">
                  {res.guest?.full_name}
                </p>
                <p className="mb-2 font-body text-[12px] text-[#757575]">
                  {res.villa?.name}
                </p>
                <p className="font-body text-[12px] text-[#757575]">
                  {formatFullDate(res.arrival_datetime)}
                </p>
                <p className="mb-3 font-body text-[12px] text-[#757575]">
                  → {formatFullDate(res.checkout_datetime)}
                </p>
                <div className="flex items-center justify-between border-t border-[#ECECEC] pt-3">
                  <span className="font-body text-[14px] font-medium text-[#0A1F44]">
                    {formatCurrency(estimateReservationValue(res))}
                  </span>
                  <span className="font-body text-[11px] text-[#757575]">
                    {daysUntil === 0
                      ? 'Today'
                      : daysUntil === 1
                        ? 'Tomorrow'
                        : `In ${daysUntil}d`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
