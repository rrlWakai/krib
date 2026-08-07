import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import { computeReports } from '../services/api'
import type { ReportData } from '../services/api'

const maxOccupancy = 100

export default function Reports() {
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
        <PageHeader title="Reports" subtitle="Business insights and analytics" />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Reports" subtitle="Something went wrong." />
        <ErrorBlock message={error} onRetry={reservationsQuery.refetch} />
      </motion.div>
    )
  }

  const reports: ReportData = computeReports(
    reservationsQuery.data ?? [],
    villasQuery.data ?? [],
    guestsQuery.data ?? [],
  )

  const { reservationTrends, occupancyData, villaPopularity, guestStats, statusDistribution } = reports
  const avgOccupancy = reports.avgOccupancy
  const totalBookings = reports.totalBookings
  const totalGuests = reports.totalGuests
  const maxTrend = Math.max(1, ...reservationTrends.map((d) => d.total))
  const maxStatus = Math.max(1, ...statusDistribution.map((d) => d.count))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Reports" subtitle="Business insights and analytics" />

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="border-b border-[#ECECEC] pb-4">
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Average Occupancy</p>
          <p className="mt-1 font-display text-[26px] leading-[32px] font-medium tracking-tight text-[#0A1F44]">
            {avgOccupancy.toFixed(1)}%
          </p>
          <p className="mt-0.5 font-body text-[12px] text-[#757575]">Across both villas</p>
        </div>
        <div className="border-b border-[#ECECEC] pb-4">
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Total Bookings</p>
          <p className="mt-1 font-display text-[26px] leading-[32px] font-medium tracking-tight text-[#0A1F44]">
            {totalBookings}
          </p>
          <p className="mt-0.5 font-body text-[12px] text-[#757575]">{reservationTrends.length} months tracked</p>
        </div>
        <div className="border-b border-[#ECECEC] pb-4">
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Total Guests</p>
          <p className="mt-1 font-display text-[26px] leading-[32px] font-medium tracking-tight text-[#0A1F44]">
            {totalGuests}
          </p>
          <p className="mt-0.5 font-body text-[12px] text-[#757575]">Unique guests served</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-[17px] font-medium text-[#0A1F44]">Reservation Trends</h2>
              <p className="mt-1 font-body text-[12px] text-[#757575]">Monthly reservation activity</p>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-[#f0f2f7] px-3 py-1.5">
              <TrendingUp size={13} className="text-[#0A1F44]" />
              <span className="font-body text-[12px] font-medium text-[#0A1F44]">Last {reservationTrends.length} months</span>
            </div>
          </div>
          <div className="flex h-[180px] items-end gap-2 sm:h-[200px] sm:gap-3">
            {reservationTrends.map((d, i) => {
              const height = (d.total / maxTrend) * 180
              return (
                <div key={d.month} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
                      className="w-full max-w-[24px] rounded-t-sm bg-[#0A1F44] sm:max-w-[32px]"
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0A1F44] px-2 py-1 font-body text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {d.total}
                    </div>
                  </div>
                  <span className="font-body text-[9px] text-[#757575] sm:text-[10px]">{d.month.slice(0, 3)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-[17px] font-medium text-[#0A1F44]">Occupancy Rate</h2>
              <p className="mt-1 font-body text-[12px] text-[#757575]">Monthly occupancy across both villas</p>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-[#f0f2f7] px-3 py-1.5">
              <span className="font-body text-[12px] font-medium text-[#0A1F44]">{avgOccupancy.toFixed(0)}% avg</span>
            </div>
          </div>
          <div className="relative h-[180px] sm:h-[200px]">
            <div className="absolute inset-x-0 top-0 flex h-full flex-col justify-between">
              {[100, 75, 50, 25, 0].map((tick) => (
                <div key={tick} className="flex items-center gap-2">
                  <span className="w-7 text-right font-body text-[9px] text-[#757575]">{tick}%</span>
                  <div className="h-px flex-1 bg-[#ECECEC]" />
                </div>
              ))}
            </div>
            <div className="absolute inset-y-0 left-9 right-0 flex items-end">
              <svg viewBox={`0 0 ${Math.max(1, occupancyData.length) * 60} ${maxOccupancy}`} className="h-[140px] w-full sm:h-[160px]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A1F44" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0A1F44" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={`M ${occupancyData.map((d, i) => `${i * 60 + 30},${maxOccupancy - d.rate}`).join(' L ')} L ${(occupancyData.length - 1) * 60 + 30},${maxOccupancy} L 30,${maxOccupancy} Z`}
                  fill="url(#occGrad)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                />
                <motion.polyline
                  points={occupancyData.map((d, i) => `${i * 60 + 30},${maxOccupancy - d.rate}`).join(' ')}
                  fill="none" stroke="#0A1F44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                />
                {occupancyData.map((d, i) => (
                  <motion.circle key={d.month} cx={i * 60 + 30} cy={maxOccupancy - d.rate} r="3.5"
                    fill="white" stroke="#0A1F44" strokeWidth="2"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.06, duration: 0.2 }} />
                ))}
              </svg>
            </div>
            <div className="absolute inset-x-9 bottom-0 flex justify-between">
              {occupancyData.map((d) => (
                <span key={d.month} className="font-body text-[9px] text-[#757575]">{d.month.slice(0, 3)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Villa Popularity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {villaPopularity.map((villa, i) => {
            const share = villaPopularity.reduce((s, v) => s + v.totalBookings, 0)
            const sharePct = share > 0 ? (villa.totalBookings / share) * 100 : 0
            return (
              <div key={villa.villaName} className="border border-[#ECECEC] rounded-lg bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-[18px] font-medium text-[#0A1F44]">{villa.villaName}</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f2f7]">
                    <span className="font-body text-[12px] font-bold text-[#0A1F44]">{i + 1}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Bookings</p>
                    <p className="mt-0.5 font-display text-[22px] font-medium text-[#0A1F44]">{villa.totalBookings}</p>
                  </div>
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Avg Stay</p>
                    <p className="mt-0.5 font-display text-[22px] font-medium text-[#0A1F44]">{villa.averageStay}</p>
                  </div>
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">Revenue</p>
                    <p className="mt-0.5 font-display text-[18px] font-medium text-[#0A1F44]">
                      {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(villa.totalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-body text-[11px] text-[#757575]">Booking share</span>
                    <span className="font-body text-[11px] font-medium text-[#0A1F44]">{sharePct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#ECECEC]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sharePct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      className="h-full rounded-full bg-[#0A1F44]"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Guest Statistics</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {guestStats.map((stat) => (
            <div key={stat.label} className="border-b border-[#ECECEC] pb-3">
              <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">{stat.label}</p>
              <p className="mt-1 font-display text-[22px] font-medium text-[#0A1F44]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Reservation Status Distribution</h2>
        <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="flex flex-col gap-2.5">
            {statusDistribution.map((item, i) => {
              const percentage = (item.count / maxStatus) * 100
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="w-28 font-body text-[13px] capitalize text-[#0A1F44]">{item.status}</span>
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#ECECEC]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                  <span className="w-6 text-right font-body text-[13px] font-medium text-[#0A1F44]">{item.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
