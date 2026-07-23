import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  FileText,
  ArrowLeft,
  XCircle,
  Ban,
  MessageSquare,
  Eye,
  Info,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import {
  reservations,
  formatCurrency,
} from '../data/mockData'
import type { ReservationStatus } from '../types'
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getNightCount(checkIn: string, checkOut: string) {
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

const TIMELINE_STEPS: { key: ReservationStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'pending', label: 'Reservation Submitted', icon: <Clock size={16} /> },
  { key: 'approved', label: 'Approved', icon: <CheckCircle2 size={16} /> },
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 size={16} /> },
]

function getStatusIndex(status: ReservationStatus): number {
  const order: ReservationStatus[] = [
    'pending',
    'approved',
    'confirmed',
    'completed',
  ]
  return order.indexOf(status)
}

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const reservation = reservations.find((r) => r.id === id)

  if (!reservation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-24"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
          <AlertCircle size={32} className="text-on-surface-variant" />
        </div>
        <h2 className="font-display text-headline-sm md:text-headline-md text-on-surface">
          Reservation not found
        </h2>
        <p className="px-4 text-center font-body text-body-sm md:text-body-md text-on-surface-variant">
          The reservation you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/admin/reservations')}
          className="mt-2 rounded-[12px] bg-primary px-6 py-2.5 font-body text-body-md font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          Back to Reservations
        </button>
      </motion.div>
    )
  }

  const res = reservation
  const nights = getNightCount(res.checkIn, res.checkOut)
  const statusIdx = getStatusIndex(res.status)
  const isCancelledOrRejected = res.status === 'cancelled' || res.status === 'declined' || res.status === 'expired'

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title={`Reservation ${res.id}`}
          breadcrumbs={[
            { label: 'Reservations', path: '/admin/reservations' },
            { label: res.id },
          ]}
          action={
            <button
              onClick={() => navigate('/admin/reservations')}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-[12px] border border-outline-variant px-4 py-2 font-body text-body-md text-on-surface transition-colors hover:bg-surface-container-low sm:justify-start"
            >
              <ArrowLeft size={16} /> Back
            </button>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-3">
          <motion.div
            variants={item}
            className="rounded-[16px] bg-white p-4 shadow-card sm:p-6"
          >
            <h3 className="mb-4 font-display text-title-sm md:text-title-md font-medium text-on-surface">
              Guest Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                  <User size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-body-sm text-on-surface-variant">Name</span>
                  <span className="font-body text-body-md font-medium text-on-surface">
                    {res.guestName}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                  <Mail size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-body-sm text-on-surface-variant">Email</span>
                  <span className="font-body text-body-md font-medium text-on-surface">
                    {res.guestEmail}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                  <Phone size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-body-sm text-on-surface-variant">Phone</span>
                  <span className="font-body text-body-md font-medium text-on-surface">
                    {res.guestPhone}
                  </span>
                </div>
              </div>
              {res.confirmationNumber && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body text-body-sm text-on-surface-variant">
                      Confirmation #
                    </span>
                    <span className="font-body text-body-md font-medium text-on-surface">
                      {res.confirmationNumber}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="rounded-[16px] bg-white p-4 shadow-card sm:p-6"
          >
            <h3 className="mb-4 font-display text-title-sm md:text-title-md font-medium text-on-surface">
              Reservation Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                  <CalendarDays size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-body-sm text-on-surface-variant">Villa</span>
                  <span className="font-body text-body-md font-medium text-on-surface">
                    {res.villaName}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                  <CalendarDays size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-body-sm text-on-surface-variant">Duration</span>
                  <span className="font-body text-body-md font-medium text-on-surface">
                    {nights} night{nights !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] bg-surface-container-low p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <span className="font-body text-body-sm text-on-surface-variant">Check-in</span>
                  <span className="font-body text-body-md font-medium text-on-surface">
                    {formatDate(res.checkIn)}
                  </span>
                  <span className="font-body text-body-sm text-on-surface-variant">
                    2:00 PM
                  </span>
                </div>
                <div className="flex flex-col sm:text-right">
                  <span className="font-body text-body-sm text-on-surface-variant">Check-out</span>
                  <span className="font-body text-body-md font-medium text-on-surface">
                    {formatDate(res.checkOut)}
                  </span>
                  <span className="font-body text-body-sm text-on-surface-variant">
                    11:00 AM
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="rounded-[16px] bg-white p-4 shadow-card sm:p-6"
          >
            <h3 className="mb-4 font-display text-title-sm md:text-title-md font-medium text-on-surface">
              Guest Count
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Adults', count: res.guests.adults },
                { label: 'Children', count: res.guests.children },
                { label: 'Infants', count: res.guests.infants },
                { label: 'Pets', count: res.guests.pets },
              ].map((g) => (
                <div
                  key={g.label}
                  className="flex flex-col items-center gap-1 rounded-[12px] bg-surface-container-low p-3 sm:p-4"
                >
                  <span className="font-display text-headline-sm md:text-headline-md font-medium text-on-surface">
                    {g.count}
                  </span>
                  <span className="font-body text-body-sm text-on-surface-variant">
                    {g.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {(res.specialRequests || res.message) && (
            <motion.div
              variants={item}
              className="rounded-[16px] bg-white p-4 shadow-card sm:p-6"
            >
              <h3 className="mb-4 font-display text-title-sm md:text-title-md font-medium text-on-surface">
                Message & Special Requests
              </h3>
              {res.message && (
                <div className="mb-4">
                  <span className="mb-1 block font-body text-body-sm text-on-surface-variant">
                    Guest Message
                  </span>
                  <p className="rounded-[12px] bg-surface-container-low p-4 font-body text-body-md text-on-surface">
                    "{res.message}"
                  </p>
                </div>
              )}
              {res.specialRequests && (
                <div>
                  <span className="mb-1 block font-body text-body-sm text-on-surface-variant">
                    Special Requests
                  </span>
                  <p className="rounded-[12px] bg-surface-container-low p-4 font-body text-body-md text-on-surface">
                    {res.specialRequests}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-2">
          <motion.div
            variants={item}
            className="flex flex-col gap-4 sm:gap-6 lg:sticky lg:top-6"
          >
            <div className="rounded-[16px] bg-white p-4 shadow-card sm:p-6">
              <h3 className="mb-5 font-display text-title-sm md:text-title-md font-medium text-on-surface">
                Status Timeline
              </h3>
              <div className="flex flex-col">
                {TIMELINE_STEPS.map((step, i) => {
                  const stepIdx = getStatusIndex(step.key)
                  const isCompleted = !isCancelledOrRejected && stepIdx < statusIdx
                  const isCurrent =
                    !isCancelledOrRejected &&
                    stepIdx === statusIdx &&
                    res.status !== 'completed'
                  const isFuture = isCancelledOrRejected || stepIdx > statusIdx

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                            isCompleted && 'border-tertiary bg-tertiary text-white',
                            isCurrent && 'border-primary bg-primary text-white',
                            isFuture && 'border-outline-variant bg-white text-on-surface-variant'
                          )}
                        >
                          {isCompleted ? <CheckCircle2 size={16} /> : step.icon}
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div
                            className={cn(
                              'my-1 h-6 w-0.5',
                              isCompleted ? 'bg-tertiary' : 'bg-outline-variant'
                            )}
                          />
                        )}
                      </div>
                      <div className="flex flex-col pb-4">
                        <span
                          className={cn(
                            'font-body text-body-md',
                            isCurrent
                              ? 'font-medium text-on-surface'
                              : isCompleted
                              ? 'text-on-surface'
                              : 'text-on-surface-variant'
                          )}
                        >
                          {step.label}
                        </span>
                        {isCompleted && (
                          <span className="font-body text-body-sm text-on-surface-variant">
                            Done
                          </span>
                        )}
                        {isCurrent && (
                          <span className="font-body text-body-sm text-primary">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {isCancelledOrRejected && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-error bg-error text-white">
                        {res.status === 'cancelled' ? (
                          <Ban size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body text-body-md font-medium text-error">
                        {res.status === 'cancelled'
                          ? 'Cancelled'
                          : res.status === 'declined'
                          ? 'Declined'
                          : 'Expired'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[16px] bg-white p-4 shadow-card sm:p-6">
              <h3 className="mb-4 font-display text-title-sm md:text-title-md font-medium text-on-surface">
                Price Summary
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-body-md text-on-surface-variant">
                    Base Rate ({nights} night{nights !== 1 ? 's' : ''})
                  </span>
                  <span className="font-body text-body-md text-on-surface">
                    {formatCurrency(res.baseRate)}
                  </span>
                </div>
                {res.partyFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-body-md text-on-surface-variant">
                      Party Fee
                    </span>
                    <span className="font-body text-body-md text-on-surface">
                      {formatCurrency(res.partyFee)}
                    </span>
                  </div>
                )}
                {res.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-body-md text-tertiary">
                      Discount
                    </span>
                    <span className="font-body text-body-md text-tertiary">
                      -{formatCurrency(res.discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-outline-variant pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-body-md font-medium text-on-surface">
                      Total Amount
                    </span>
                    <span className="font-display text-title-sm md:text-title-md font-medium text-on-surface">
                      {formatCurrency(res.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!isCancelledOrRejected && res.status !== 'completed' && (
              <div className="rounded-[16px] bg-white p-4 shadow-card sm:p-6">
                <h3 className="mb-4 font-display text-title-sm md:text-title-md font-medium text-on-surface">
                  Actions
                </h3>
                <div className="flex flex-col gap-3">
                  {res.status === 'pending' && (
                    <>
                      <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-tertiary px-4 py-3 font-body text-body-md font-medium text-white transition-colors hover:bg-tertiary/90">
                        <CheckCircle2 size={18} /> Approve Reservation
                      </button>
                      <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-error px-4 py-3 font-body text-body-md font-medium text-error transition-colors hover:bg-error/5">
                        <XCircle size={18} /> Reject Reservation
                      </button>
                    </>
                  )}
                  <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-outline-variant px-4 py-3 font-body text-body-md font-medium text-on-surface transition-colors hover:bg-surface-container-low">
                    <Send size={18} /> Send SMS Notification
                  </button>
                  <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-outline-variant px-4 py-3 font-body text-body-md font-medium text-on-surface transition-colors hover:bg-surface-container-low">
                    <MessageSquare size={18} /> Contact Guest
                  </button>
                  <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-outline-variant px-4 py-3 font-body text-body-md font-medium text-on-surface transition-colors hover:bg-surface-container-low">
                    <Eye size={18} /> View Guest Profile
                  </button>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-surface-container-low p-3">
                  <Info size={16} className="mt-0.5 shrink-0 text-on-surface-variant" />
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Online payment integration will be available in a future release.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
