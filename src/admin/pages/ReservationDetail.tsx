import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowLeft,
  XCircle,
  Send,
  AlertTriangle,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery, useAdminMutation } from '../hooks/useAdminQuery'
import { formatCurrency } from '../data/constants'
import { estimateReservationValue, reservationNights } from '../services/api'
import type { ReservationStatus } from '../types'
import { cn } from '../../lib/cn'
import { KRIB1_STANDARD_CAPACITY } from '../../lib/bookingTime'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const TERMINAL_STATUSES: ReservationStatus[] = ['declined', 'cancelled']

function getStatusIndex(status: ReservationStatus): number {
  const order: ReservationStatus[] = ['pending', 'approved', 'completed']
  return order.indexOf(status)
}

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const reservationQuery = useAdminQuery(
    id ? `reservation:${id}` : null,
    async () => {
      const { fetchReservationById } = await import('../services/api')
      return fetchReservationById(id as string)
    },
    { enabled: !!id },
  )

  const approveMutation = useAdminMutation(async (reservationId: string) => {
    const { approveReservation } = await import('../services/mutations')
    return approveReservation(reservationId)
  })

  const declineMutation = useAdminMutation(async (reservationId: string) => {
    const { declineReservation } = await import('../services/mutations')
    return declineReservation(reservationId, '')
  })

  const cancelMutation = useAdminMutation(async (reservationId: string) => {
    const { cancelReservation } = await import('../services/mutations')
    return cancelReservation(reservationId)
  })

  const completeMutation = useAdminMutation(async (reservationId: string) => {
    const { completeReservation } = await import('../services/mutations')
    return completeReservation(reservationId)
  })

  const smsMutation = useAdminMutation(async (reservationId: string) => {
    const { sendReservationSms } = await import('../services/mutations')
    return sendReservationSms(reservationId, { type: 'confirmation' })
  })

  if (reservationQuery.loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title="Reservation"
          breadcrumbs={[{ label: 'Reservations', path: '/admin/reservations' }, { label: 'Loading…' }]}
        />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (reservationQuery.error || !reservationQuery.data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-24"
      >
        <h2 className="font-display text-[22px] font-medium text-[#0A1F44]">Reservation not found</h2>
        <p className="font-body text-[14px] text-[#757575]">
          {reservationQuery.error ?? "The reservation doesn't exist or has been removed."}
        </p>
        {reservationQuery.error && (
          <ErrorBlock message={reservationQuery.error} onRetry={reservationQuery.refetch} />
        )}
        <button
          onClick={() => navigate('/admin/reservations')}
          className="mt-2 rounded-lg border border-[#0A1F44] px-6 py-2 font-body text-[13px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]"
        >
          Back to Reservations
        </button>
      </motion.div>
    )
  }

  const res = reservationQuery.data
  const nights = reservationNights(res)
  const statusIdx = getStatusIndex(res.status)
  const isTerminal = TERMINAL_STATUSES.includes(res.status)
  const actionError = approveMutation.error ?? declineMutation.error ?? cancelMutation.error ?? completeMutation.error ?? smsMutation.error

  function afterMutation() {
    reservationQuery.refetch()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={`Reservation ${res.reference_code}`}
        breadcrumbs={[
          { label: 'Reservations', path: '/admin/reservations' },
          { label: res.reference_code },
        ]}
        action={
          <button
            onClick={() => navigate('/admin/reservations')}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#ECECEC] px-4 py-2 font-body text-[13px] text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]"
          >
            <ArrowLeft size={15} /> Back
          </button>
        }
      />

      <div className="mb-5">
        <StatusBadge status={res.status} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-3">
          <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
            <h3 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Guest Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                  <User size={14} className="text-[#0A1F44]" />
                </div>
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Name</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guest.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                  <Mail size={14} className="text-[#0A1F44]" />
                </div>
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Email</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guest.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                  <Phone size={14} className="text-[#0A1F44]" />
                </div>
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Phone</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guest.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
            <h3 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Reservation Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                  <CalendarDays size={14} className="text-[#0A1F44]" />
                </div>
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Villa</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.villa.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                  <CalendarDays size={14} className="text-[#0A1F44]" />
                </div>
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Duration</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{nights} night{nights !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 border border-[#ECECEC] rounded-lg p-4 bg-[#FAFAFA]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Check-in</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{formatDate(res.arrival_datetime)}</p>
                  <p className="font-body text-[12px] text-[#757575]">{formatTime(res.arrival_datetime)}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-body text-[11px] text-[#757575]">Check-out</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{formatDate(res.checkout_datetime)}</p>
                  <p className="font-body text-[12px] text-[#757575]">{formatTime(res.checkout_datetime)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
            <h3 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Guest Count</h3>
            {res.villa.slug === 'krib-1' && res.guest_count > KRIB1_STANDARD_CAPACITY && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200/60 p-3">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-[12px] text-amber-800 font-medium">
                    Over-capacity request: {res.guest_count} guests exceeds {KRIB1_STANDARD_CAPACITY} standard
                  </p>
                  <p className="font-body text-[11px] text-amber-700/80 mt-0.5">
                    Requires admin approval. {res.guest_count - KRIB1_STANDARD_CAPACITY} additional guest{res.guest_count - KRIB1_STANDARD_CAPACITY !== 1 ? 's' : ''} × ₱200 = ₱{((res.guest_count - KRIB1_STANDARD_CAPACITY) * 200).toLocaleString('en-PH')}
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Guests', count: res.guest_count },
                ...(res.villa.slug === 'krib-1'
                  ? [
                      { label: 'Standard Capacity', count: KRIB1_STANDARD_CAPACITY },
                      { label: 'Max Capacity', count: 60 },
                    ]
                  : [{ label: 'Max Capacity', count: res.villa.max_guests }]),
              ].map((g) => (
                <div key={g.label} className="border border-[#ECECEC] rounded-lg p-3 text-center">
                  <p className="font-display text-[22px] font-medium text-[#0A1F44]">{g.count}</p>
                  <p className="font-body text-[11px] text-[#757575]">{g.label}</p>
                </div>
              ))}
            </div>
          </div>

          {res.special_requests && (
            <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
              <h3 className="mb-3 font-display text-[17px] font-medium text-[#0A1F44]">Special Requests</h3>
              <p className="rounded-lg bg-[#FAFAFA] p-4 font-body text-[13px] leading-relaxed text-[#0A1F44]">
                {res.special_requests}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="lg:sticky lg:top-6 flex flex-col gap-5">
            <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
              <h3 className="mb-5 font-display text-[17px] font-medium text-[#0A1F44]">Status Timeline</h3>
              <div className="flex flex-col">
                {(['pending', 'approved', 'completed'] as ReservationStatus[]).map((step, i) => {
                  const stepIdx = getStatusIndex(step)
                  const isCompleted = !isTerminal && stepIdx < statusIdx
                  const isCurrent = !isTerminal && stepIdx === statusIdx && res.status !== 'completed'
                  const isFuture = isTerminal || stepIdx > statusIdx

                  return (
                    <div key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                          isCompleted && 'border-[#0A1F44] bg-[#0A1F44] text-white',
                          isCurrent && 'border-[#C9A227] bg-[#C9A227] text-white',
                          isFuture && 'border-[#ECECEC] bg-white text-[#757575]'
                        )}>
                          {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        </div>
                        {i < 2 && (
                          <div className={cn('my-1 h-5 w-px', isCompleted ? 'bg-[#0A1F44]' : 'bg-[#ECECEC]')} />
                        )}
                      </div>
                      <div className="flex flex-col pb-3">
                        <span className={cn(
                          'font-body text-[13px]',
                          isCurrent ? 'font-medium text-[#0A1F44]' : isCompleted ? 'text-[#0A1F44]' : 'text-[#757575]'
                        )}>
                          {step === 'pending' ? 'Reservation Submitted' : step === 'approved' ? 'Approved' : 'Completed'}
                        </span>
                        {isCompleted && <span className="font-body text-[11px] text-[#757575]">Done</span>}
                        {isCurrent && <span className="font-body text-[11px] text-[#C9A227]">Current</span>}
                      </div>
                    </div>
                  )
                })}
                {isTerminal && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#757575] bg-[#757575] text-white">
                        <XCircle size={12} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body text-[13px] font-medium text-[#757575]">
                        {res.status === 'cancelled' ? 'Cancelled' : 'Declined'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
              <h3 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Price Summary</h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[13px] text-[#757575]">
                    Base Rate ({nights} night{nights !== 1 ? 's' : ''})
                  </span>
                  <span className="font-body text-[13px] text-[#0A1F44]">
                    {formatCurrency(Number(res.villa.base_price))}
                  </span>
                </div>

                {res.additional_guest_fee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[13px] text-[#757575]">
                      Additional Guests ({res.guest_count - KRIB1_STANDARD_CAPACITY} × ₱200)
                    </span>
                    <span className="font-body text-[13px] text-[#0A1F44]">
                      {formatCurrency(res.additional_guest_fee)}
                    </span>
                  </div>
                )}

                {res.is_party && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[13px] text-[#757575]">
                      Party / Event Fee
                    </span>
                    <span className="font-body text-[13px] text-[#0A1F44]">
                      {formatCurrency(res.party_fee)}
                    </span>
                  </div>
                )}

                <div className="border-t border-[#ECECEC] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[14px] font-medium text-[#0A1F44]">Total</span>
                    <span className="font-display text-[17px] font-medium text-[#0A1F44]">{formatCurrency(res.total_amount || estimateReservationValue(res))}</span>
                  </div>
                </div>
              </div>
            </div>

            {!isTerminal && res.status !== 'completed' && (
              <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
                <h3 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Actions</h3>
                {actionError && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 font-body text-[12px] text-red-600">{actionError}</p>
                )}
                <div className="flex flex-col gap-2">
                  {res.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveMutation.mutate(res.id).then(afterMutation)}
                        disabled={approveMutation.loading}
                        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#0A1F44] px-4 py-2.5 font-body text-[13px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        {approveMutation.loading ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => declineMutation.mutate(res.id).then(afterMutation)}
                        disabled={declineMutation.loading}
                        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#757575] px-4 py-2.5 font-body text-[13px] font-medium text-[#757575] transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        {declineMutation.loading ? 'Declining…' : 'Decline'}
                      </button>
                    </>
                  )}
                  {(res.status === 'approved' || res.status === 'pending') && (
                    <button
                      onClick={() => cancelMutation.mutate(res.id).then(afterMutation)}
                      disabled={cancelMutation.loading}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#757575] px-4 py-2.5 font-body text-[13px] font-medium text-[#757575] transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                  {res.status === 'approved' && (
                    <button
                      onClick={() => completeMutation.mutate(res.id).then(afterMutation)}
                      disabled={completeMutation.loading}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#C9A227] px-4 py-2.5 font-body text-[13px] font-medium text-[#0A1F44] transition-colors hover:bg-[#FBF7EA] disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      {completeMutation.loading ? 'Completing…' : 'Mark Completed'}
                    </button>
                  )}
                  {res.status === 'approved' && (
                    <button
                      onClick={() => smsMutation.mutate(res.id).then(afterMutation)}
                      disabled={smsMutation.loading}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#757575] px-4 py-2.5 font-body text-[13px] font-medium text-[#757575] transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
                    >
                      <Send size={16} />
                      {smsMutation.loading ? 'Sending…' : 'Send Confirmation SMS'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
