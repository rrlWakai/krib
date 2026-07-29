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
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { formatCurrency } from '../data/mockData'
import type { Reservation, ReservationStatus } from '../types'
import { cn } from '../../lib/cn'

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

const TIMELINE_STEPS: { key: ReservationStatus; label: string }[] = [
  { key: 'pending', label: 'Reservation Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'confirmed', label: 'Confirmed' },
]

function getStatusIndex(status: ReservationStatus): number {
  const order: ReservationStatus[] = ['pending', 'approved', 'confirmed', 'completed']
  return order.indexOf(status)
}

export default function ReservationDetail() {
  const { id: _id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const reservation = null as Reservation | null

  if (!reservation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-24"
      >
        <h2 className="font-display text-[22px] font-medium text-[#0A1F44]">Reservation not found</h2>
        <p className="font-body text-[14px] text-[#757575]">The reservation doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/admin/reservations')}
          className="mt-2 rounded-lg border border-[#0A1F44] px-6 py-2 font-body text-[13px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]"
        >
          Back to Reservations
        </button>
      </motion.div>
    )
  }

  const res = reservation
  const nights = getNightCount(res.checkIn, res.checkOut)
  const statusIdx = getStatusIndex(res.status)
  const isCancelledOrRejected = ['cancelled', 'declined', 'expired'].includes(res.status)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={`Reservation ${res.id}`}
        breadcrumbs={[
          { label: 'Reservations', path: '/admin/reservations' },
          { label: res.id },
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
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guestName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                  <Mail size={14} className="text-[#0A1F44]" />
                </div>
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Email</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guestEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
                  <Phone size={14} className="text-[#0A1F44]" />
                </div>
                <div>
                  <p className="font-body text-[11px] text-[#757575]">Phone</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.guestPhone}</p>
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
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{res.villaName}</p>
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
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{formatDate(res.checkIn)}</p>
                  <p className="font-body text-[12px] text-[#757575]">2:00 PM</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-body text-[11px] text-[#757575]">Check-out</p>
                  <p className="font-body text-[14px] font-medium text-[#0A1F44]">{formatDate(res.checkOut)}</p>
                  <p className="font-body text-[12px] text-[#757575]">11:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
            <h3 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Guest Count</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Adults', count: res.guests.adults },
                { label: 'Children', count: res.guests.children },
                { label: 'Infants', count: res.guests.infants },
                { label: 'Pets', count: res.guests.pets },
              ].map((g) => (
                <div key={g.label} className="border border-[#ECECEC] rounded-lg p-3 text-center">
                  <p className="font-display text-[22px] font-medium text-[#0A1F44]">{g.count}</p>
                  <p className="font-body text-[11px] text-[#757575]">{g.label}</p>
                </div>
              ))}
            </div>
          </div>

          {res.specialRequests && (
            <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
              <h3 className="mb-3 font-display text-[17px] font-medium text-[#0A1F44]">Special Requests</h3>
              <p className="rounded-lg bg-[#FAFAFA] p-4 font-body text-[13px] leading-relaxed text-[#0A1F44]">
                {res.specialRequests}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="lg:sticky lg:top-6 flex flex-col gap-5">
            <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
              <h3 className="mb-5 font-display text-[17px] font-medium text-[#0A1F44]">Status Timeline</h3>
              <div className="flex flex-col">
                {TIMELINE_STEPS.map((step, i) => {
                  const stepIdx = getStatusIndex(step.key)
                  const isCompleted = !isCancelledOrRejected && stepIdx < statusIdx
                  const isCurrent = !isCancelledOrRejected && stepIdx === statusIdx && res.status !== 'completed'
                  const isFuture = isCancelledOrRejected || stepIdx > statusIdx

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                          isCompleted && 'border-[#0A1F44] bg-[#0A1F44] text-white',
                          isCurrent && 'border-[#C9A227] bg-[#C9A227] text-white',
                          isFuture && 'border-[#ECECEC] bg-white text-[#757575]'
                        )}>
                          {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div className={cn('my-1 h-5 w-px', isCompleted ? 'bg-[#0A1F44]' : 'bg-[#ECECEC]')} />
                        )}
                      </div>
                      <div className="flex flex-col pb-3">
                        <span className={cn(
                          'font-body text-[13px]',
                          isCurrent ? 'font-medium text-[#0A1F44]' : isCompleted ? 'text-[#0A1F44]' : 'text-[#757575]'
                        )}>
                          {step.label}
                        </span>
                        {isCompleted && <span className="font-body text-[11px] text-[#757575]">Done</span>}
                        {isCurrent && <span className="font-body text-[11px] text-[#C9A227]">Current</span>}
                      </div>
                    </div>
                  )
                })}
                {isCancelledOrRejected && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#757575] bg-[#757575] text-white">
                        <Clock size={12} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body text-[13px] font-medium text-[#757575]">
                        {res.status === 'cancelled' ? 'Cancelled' : res.status === 'declined' ? 'Declined' : 'Expired'}
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
                  <span className="font-body text-[13px] text-[#757575]">Base Rate ({nights} night{nights !== 1 ? 's' : ''})</span>
                  <span className="font-body text-[13px] text-[#0A1F44]">{formatCurrency(res.baseRate)}</span>
                </div>
                {res.partyFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[13px] text-[#757575]">Party Fee</span>
                    <span className="font-body text-[13px] text-[#0A1F44]">{formatCurrency(res.partyFee)}</span>
                  </div>
                )}
                {res.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[13px] text-[#757575]">Discount</span>
                    <span className="font-body text-[13px] text-[#0A1F44]">-{formatCurrency(res.discount)}</span>
                  </div>
                )}
                <div className="border-t border-[#ECECEC] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[14px] font-medium text-[#0A1F44]">Total</span>
                    <span className="font-display text-[17px] font-medium text-[#0A1F44]">{formatCurrency(res.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {!isCancelledOrRejected && res.status !== 'completed' && (
              <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
                <h3 className="mb-4 font-display text-[17px] font-medium text-[#0A1F44]">Actions</h3>
                <div className="flex flex-col gap-2">
                  {res.status === 'pending' && (
                    <>
                      <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#0A1F44] px-4 py-2.5 font-body text-[13px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]">
                        <CheckCircle2 size={16} /> Approve
                      </button>
                      <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#757575] px-4 py-2.5 font-body text-[13px] font-medium text-[#757575] transition-colors hover:bg-[#FAFAFA]">
                        Decline
                      </button>
                    </>
                  )}
                  <button className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#757575] px-4 py-2.5 font-body text-[13px] font-medium text-[#757575] transition-colors hover:bg-[#FAFAFA]">
                    Send SMS Notification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
