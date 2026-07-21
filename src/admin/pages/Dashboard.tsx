import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  CreditCard,
  DollarSign,
  LogIn,
  LogOut,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import {
  reservations,
  dashboardStats,
  formatCurrency,
  isToday,
  getDaysUntil,
} from '../data/mockData'

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
  })
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const stats = dashboardStats

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const upcomingReservations = reservations
    .filter(
      (r) =>
        r.status !== 'cancelled' &&
        r.status !== 'declined' &&
        r.status !== 'completed' &&
        r.status !== 'expired'
    )
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 5)

  const todayCheckins = reservations.filter(
    (r) =>
      isToday(r.checkIn) &&
      (r.status === 'confirmed' || r.status === 'payment_submitted')
  )

  const todayCheckouts = reservations.filter(
    (r) => isToday(r.checkOut) && r.status === 'completed'
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader title="Dashboard" subtitle="Welcome back. Here's what's happening today." />
      </motion.div>

      <motion.div
        variants={item}
        className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4"
      >
        <StatCard
          title="Today's Check-ins"
          value={stats.todayCheckins}
          icon={<LogIn size={22} />}
          accent="blue"
        />
        <StatCard
          title="Pending Reservations"
          value={stats.pendingReservations}
          icon={<CalendarClock size={22} />}
          accent="amber"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={<CreditCard size={22} />}
          accent="red"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign size={22} />}
          accent="green"
        />
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-6 sm:mb-8 lg:grid-cols-2 xl:grid-cols-3">
        <motion.div
          variants={item}
          className="overflow-hidden rounded-[16px] bg-white shadow-card lg:col-span-2 xl:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="font-display text-title-sm sm:text-title-md font-medium text-on-surface">
              Recent Reservations
            </h2>
            <button
              onClick={() => navigate('/admin/reservations')}
              className="flex items-center gap-1 font-body text-body-sm text-primary transition-colors hover:text-primary/80"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-6 py-3 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                    Guest
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                    Villa
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((res, i) => (
                  <tr
                    key={res.id}
                    onClick={() => navigate(`/admin/reservations/${res.id}`)}
                    className={`cursor-pointer border-b border-outline-variant/50 transition-colors hover:bg-surface-container-low ${
                      i % 2 === 1 ? 'bg-surface-container-low/50' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {res.guestName}
                        </span>
                        <span className="font-body text-body-sm text-on-surface-variant">
                          {res.id}
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3.5 font-body text-body-md text-on-surface">
                      {res.villaName}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3.5 font-body text-body-sm text-on-surface-variant">
                      {formatDate(res.checkIn)} – {formatDate(res.checkOut)}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={res.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 text-right font-body text-body-md font-medium text-on-surface">
                      {formatCurrency(res.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3 p-4">
            {recentReservations.map((res) => (
              <div
                key={res.id}
                onClick={() => navigate(`/admin/reservations/${res.id}`)}
                className="cursor-pointer rounded-[12px] border border-outline-variant/50 p-4 transition-colors hover:bg-surface-container-low"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{res.guestName}</span>
                  <StatusBadge status={res.status} size="sm" />
                </div>
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>{res.villaName}</span>
                  <span>{formatCurrency(res.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-[16px] bg-white p-4 shadow-card sm:p-6"
        >
          <h2 className="mb-5 font-display text-title-sm sm:text-title-md font-medium text-on-surface">
            Today's Activity
          </h2>
          <div className="flex flex-col gap-5 sm:gap-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container">
                  <LogIn size={16} className="text-primary" />
                </div>
                <span className="font-body text-body-sm font-medium text-on-surface">
                  Check-ins
                </span>
                <span className="ml-auto font-body text-body-sm text-on-surface-variant">
                  {todayCheckins.length}
                </span>
              </div>
              {todayCheckins.length === 0 ? (
                <p className="pl-10 font-body text-body-sm text-on-surface-variant">
                  No check-ins today
                </p>
              ) : (
                <div className="flex flex-col gap-2 pl-10">
                  {todayCheckins.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-[12px] bg-surface-container-low px-4 py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {r.guestName}
                        </span>
                        <span className="font-body text-body-sm text-on-surface-variant">
                          {r.villaName}
                        </span>
                      </div>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        {r.checkIn}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant" />

            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fef3c7]">
                  <LogOut size={16} className="text-[#b45309]" />
                </div>
                <span className="font-body text-body-sm font-medium text-on-surface">
                  Check-outs
                </span>
                <span className="ml-auto font-body text-body-sm text-on-surface-variant">
                  {todayCheckouts.length}
                </span>
              </div>
              {todayCheckouts.length === 0 ? (
                <p className="pl-10 font-body text-body-sm text-on-surface-variant">
                  No check-outs today
                </p>
              ) : (
                <div className="flex flex-col gap-2 pl-10">
                  {todayCheckouts.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-[12px] bg-surface-container-low px-4 py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {r.guestName}
                        </span>
                        <span className="font-body text-body-sm text-on-surface-variant">
                          {r.villaName}
                        </span>
                      </div>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        {r.checkOut}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant" />

            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-container">
                  <Clock size={16} className="text-tertiary" />
                </div>
                <span className="font-body text-body-sm font-medium text-on-surface">
                  Occupancy Rate
                </span>
              </div>
              <div className="pl-10">
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-display text-headline-sm sm:text-headline-md font-medium text-on-surface">
                    {stats.occupancyRate}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-outline-variant">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.occupancyRate}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.4 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <div className="rounded-[16px] bg-white p-4 shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <h2 className="font-display text-title-sm sm:text-title-md font-medium text-on-surface">
              Upcoming Reservations
            </h2>
            <button
              onClick={() => navigate('/admin/reservations')}
              className="flex items-center gap-1 font-body text-body-sm text-primary transition-colors hover:text-primary/80"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          {upcomingReservations.length === 0 ? (
            <p className="py-8 text-center font-body text-body-md text-on-surface-variant">
              No upcoming reservations
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
              {upcomingReservations.map((res) => {
                const daysUntil = getDaysUntil(res.checkIn)
                return (
                  <motion.div
                    key={res.id}
                    whileHover={{ y: -2 }}
                    onClick={() => navigate(`/admin/reservations/${res.id}`)}
                    className="cursor-pointer rounded-[12px] border border-outline-variant/50 p-3.5 transition-colors hover:bg-surface-container-low sm:p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <StatusBadge status={res.status} size="sm" />
                    </div>
                    <h3 className="mb-1 font-body text-body-md font-medium text-on-surface">
                      {res.guestName}
                    </h3>
                    <p className="mb-2 font-body text-body-sm text-on-surface-variant">
                      {res.villaName}
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="font-body text-body-sm text-on-surface-variant">
                        {formatFullDate(res.checkIn)}
                      </span>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        → {formatFullDate(res.checkOut)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-body text-body-sm font-medium text-on-surface">
                        {formatCurrency(res.totalAmount)}
                      </span>
                      <span
                        className={`font-body text-body-sm font-medium ${
                          daysUntil <= 3 ? 'text-error' : 'text-on-surface-variant'
                        }`}
                      >
                        {daysUntil === 0
                          ? 'Today'
                          : daysUntil === 1
                          ? 'Tomorrow'
                          : `In ${daysUntil}d`}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
