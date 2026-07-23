import { motion } from 'framer-motion'
import {
  BedDouble,
  CalendarCheck,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import {
  occupancyData,
  villaPopularity,
  reservationTrends,
  guestStats,
  statusDistribution,
} from '../data/mockData'
import { cn } from '../../lib/cn'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const maxOccupancy = 100
const maxTrend = Math.max(...reservationTrends.map((d) => d.total))

export default function Reports() {
  const avgOccupancy =
    occupancyData.reduce((sum, d) => sum + d.rate, 0) / occupancyData.length
  const totalBookings = reservationTrends.reduce(
    (sum, d) => sum + d.total,
    0
  )

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Reports"
          subtitle="Business insights and analytics"
          breadcrumbs={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Reports' },
          ]}
        />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={fadeIn}>
          <StatCard
            title="Average Occupancy"
            value={`${avgOccupancy.toFixed(1)}%`}
            subtitle="Across both villas"
            icon={<BedDouble size={22} />}
            accent="blue"
            trend={{ value: 8.3, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={fadeIn}>
          <StatCard
            title="Total Bookings"
            value={totalBookings}
            subtitle={`${reservationTrends.length} months tracked`}
            icon={<CalendarCheck size={22} />}
            accent="purple"
            trend={{ value: 15, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={fadeIn}>
          <StatCard
            title="Total Guests"
            value={guestStats[0].value}
            subtitle="Unique guests served"
            icon={<Users size={22} />}
            accent="green"
            trend={{ value: 10, isPositive: true }}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          variants={fadeIn}
          className="rounded-[16px] bg-white p-4 shadow-card sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-title-sm text-on-surface sm:text-title-md">
                Reservation Trends
              </h2>
              <p className="mt-1 font-body text-body-sm text-on-surface-variant">
                Monthly reservation activity for 2026
              </p>
            </div>
            <div className="flex h-9 items-center gap-1.5 rounded-full bg-tertiary-container px-3">
              <TrendingUp size={14} className="text-tertiary" />
              <span className="font-body text-body-sm font-medium text-on-tertiary-container">
                +15%
              </span>
            </div>
          </div>

          <div className="flex h-[180px] items-end gap-2 sm:h-[220px] sm:gap-3">
            {reservationTrends.map((d, i) => {
              const height = (d.total / maxTrend) * 180
              return (
                <div
                  key={d.month}
                  className="group flex flex-1 flex-col items-center gap-2 overflow-hidden"
                >
                  <div className="relative w-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{
                        delay: 0.3 + i * 0.08,
                        duration: 0.5,
                        ease: 'easeOut' as const,
                      }}
                      className="mx-auto w-full max-w-[24px] rounded-t-[4px] bg-primary transition-all duration-200 group-hover:bg-primary/80 sm:max-w-[36px]"
                    />
                    <div className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap overflow-hidden rounded-[8px] bg-on-surface px-2 py-1 font-body text-body-xs text-on-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {d.total} reservations
                    </div>
                  </div>
                  <span className="font-body text-[10px] text-on-surface-variant sm:text-body-xs">
                    {d.month.slice(0, 3)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-body text-body-xs text-on-surface-variant">
                Total Reservations
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-body text-body-xs text-on-surface-variant">
                Total: {totalBookings}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="rounded-[16px] bg-white p-4 shadow-card sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-title-sm text-on-surface sm:text-title-md">
                Occupancy Rate
              </h2>
              <p className="mt-1 font-body text-body-sm text-on-surface-variant">
                Monthly occupancy across both villas
              </p>
            </div>
            <div className="flex h-9 items-center gap-1.5 rounded-full bg-primary-container px-3">
              <BarChart3 size={14} className="text-primary" />
              <span className="font-body text-body-sm font-medium text-on-primary-container">
                {avgOccupancy.toFixed(0)}% avg
              </span>
            </div>
          </div>

          <div className="relative h-[180px] overflow-hidden sm:h-[220px]">
            <div className="absolute inset-x-0 top-0 flex h-full flex-col justify-between">
              {[100, 75, 50, 25, 0].map((tick) => (
                <div
                  key={tick}
                  className="flex items-center gap-2"
                >
                  <span className="w-8 text-right font-body text-[10px] text-on-surface-variant">
                    {tick}%
                  </span>
                  <div className="h-px flex-1 bg-outline-variant/40" />
                </div>
              ))}
            </div>

            <div className="absolute inset-y-0 left-10 right-0 flex items-end overflow-hidden">
              <svg
                viewBox={`0 0 ${occupancyData.length * 60} ${maxOccupancy}`}
                className="h-[140px] w-full sm:h-[180px]"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(0,71,171)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="rgb(0,71,171)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <motion.path
                  d={`M ${occupancyData
                    .map(
                      (d, i) =>
                        `${i * 60 + 30},${maxOccupancy - d.rate}`
                    )
                    .join(' L ')} L ${
                    (occupancyData.length - 1) * 60 + 30
                  },${maxOccupancy} L 30,${maxOccupancy} Z`}
                  fill="url(#occupancyGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                />

                <motion.polyline
                  points={occupancyData
                    .map(
                      (d, i) =>
                        `${i * 60 + 30},${maxOccupancy - d.rate}`
                    )
                    .join(' ')}
                  fill="none"
                  stroke="rgb(0,71,171)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                />

                {occupancyData.map((d, i) => (
                  <motion.circle
                    key={d.month}
                    cx={i * 60 + 30}
                    cy={maxOccupancy - d.rate}
                    r="4"
                    fill="white"
                    stroke="rgb(0,71,171)"
                    strokeWidth="2.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                  />
                ))}
              </svg>
            </div>

            <div className="absolute inset-x-10 bottom-0 flex justify-between overflow-hidden">
              {occupancyData.map((d) => (
                <span
                  key={d.month}
                  className="font-body text-[10px] text-on-surface-variant sm:text-body-xs"
                >
                  {d.month.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-4 rounded-full bg-primary" />
              <span className="font-body text-body-xs text-on-surface-variant">
                Overall
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-4 rounded-full bg-primary/40" />
              <span className="font-body text-body-xs text-on-surface-variant">
                KRiB 1
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-4 rounded-full bg-tertiary" />
              <span className="font-body text-body-xs text-on-surface-variant">
                KRiB 2
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeIn} className="mt-8">
        <h2 className="mb-4 font-display text-title-sm text-on-surface sm:text-title-md">
          Villa Popularity
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {villaPopularity.map((villa, i) => (
            <motion.div
              key={villa.villaName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-[16px] bg-white p-4 shadow-card sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-headline-sm text-on-surface">
                  {villa.villaName}
                </h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container">
                  <span className="font-display text-title-sm font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="flex flex-col">
                  <div className="mb-1 flex items-center gap-1">
                    <Users size={12} className="text-on-surface-variant" />
                    <span className="font-body text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Bookings
                    </span>
                  </div>
                  <span className="font-display text-headline-sm font-medium text-on-surface">
                    {villa.totalBookings}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-on-surface-variant" />
                    <span className="font-body text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Avg Stay
                    </span>
                  </div>
                  <span className="font-display text-headline-sm font-medium text-on-surface">
                    {villa.averageStay} nights
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-body text-body-xs text-on-surface-variant">
                    Booking share
                  </span>
                  <span className="font-body text-body-xs font-medium text-on-surface">
                    {(
                      (villa.totalBookings /
                        villaPopularity.reduce(
                          (s, v) => s + v.totalBookings,
                          0
                        )) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (villa.totalBookings /
                          villaPopularity.reduce(
                            (s, v) => s + v.totalBookings,
                            0
                          )) *
                        100
                      }%`,
                    }}
                    transition={{ delay: 0.8 + i * 0.15, duration: 0.6 }}
                    className={cn(
                      'h-full rounded-full',
                      i === 0 ? 'bg-primary' : 'bg-tertiary'
                    )}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeIn} className="mt-8">
        <h2 className="mb-4 font-display text-title-sm text-on-surface sm:text-title-md">
          Guest Statistics
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {guestStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="rounded-[16px] bg-white p-4 shadow-card sm:p-5"
            >
              <span className="font-body text-body-sm text-on-surface-variant">
                {stat.label}
              </span>
              <div className="mt-1 font-display text-headline-sm font-medium text-on-surface">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeIn} className="mt-8">
        <h2 className="mb-4 font-display text-title-sm text-on-surface sm:text-title-md">
          Reservation Status Distribution
        </h2>
        <div className="rounded-[16px] bg-white p-4 shadow-card sm:p-6">
          <div className="flex flex-col gap-3">
            {statusDistribution.map((item, i) => {
              const percentage = (item.count / 15) * 100
              return (
                <motion.div
                  key={item.status}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="w-32 font-body text-body-sm text-on-surface">
                    {item.status}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 1.2 + i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right font-body text-body-sm font-medium text-on-surface">
                    {item.count}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
