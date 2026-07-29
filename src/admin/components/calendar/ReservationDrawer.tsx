import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  Ban,
  LogIn,
  LogOut,
} from 'lucide-react'
import type { Reservation, ReservationStatus } from '../../types'
import { StatusBadge } from '../StatusBadge'
import { formatCurrency } from '../../data/mockData'


interface ReservationDrawerProps {
  reservation: Reservation | null
  onClose: () => void
  onStatusChange: () => void
}

const STATUS_ACTIONS: {
  label: string
  icon: React.FC<{ size?: number; className?: string }>
  status: ReservationStatus
  variant: 'primary' | 'danger'
  showFor: ReservationStatus[]
}[] = [
  {
    label: 'Approve',
    icon: CheckCircle2,
    status: 'approved',
    variant: 'primary',
    showFor: ['pending'],
  },
  {
    label: 'Mark Checked In',
    icon: LogIn,
    status: 'confirmed',
    variant: 'primary',
    showFor: ['approved'],
  },
  {
    label: 'Mark Checked Out',
    icon: LogOut,
    status: 'completed',
    variant: 'primary',
    showFor: ['confirmed'],
  },
  {
    label: 'Cancel',
    icon: Ban,
    status: 'cancelled',
    variant: 'danger',
    showFor: ['pending', 'approved', 'awaiting_payment'],
  },
]

export default function ReservationDrawer({
  reservation,
  onClose,
  onStatusChange,
}: ReservationDrawerProps) {
  const [updating, setUpdating] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!reservation) return null

  const handleAction = (status: ReservationStatus) => {
    setUpdating(true)
    setFeedback(null)
    setTimeout(() => {
      setUpdating(false)
      setFeedback(
        `${reservation.guestName}'s reservation has been ${status}.`,
      )
      setTimeout(() => {
        setFeedback(null)
        onStatusChange()
      }, 1500)
    }, 400)
  }

  const checkInDate = new Date(reservation.checkIn + 'T00:00:00')
  const checkOutDate = new Date(reservation.checkOut + 'T00:00:00')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 bg-black/10"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        data-lenis-prevent
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[420px] overflow-y-auto border-l border-[#ECECEC] bg-white"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ECECEC] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7] font-body text-[13px] font-medium text-[#0A1F44]">
              {reservation.guestName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="font-body text-[14px] font-medium text-[#0A1F44]">
                {reservation.guestName}
              </p>
              <p className="font-body text-[11px] text-[#757575]">
                {reservation.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7]"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-[#ECECEC] bg-[#FAFAFA] px-4 py-3 font-body text-[13px] text-[#0A1F44]"
            >
              {feedback}
            </motion.div>
          )}

          <div className="mb-6">
            <StatusBadge status={reservation.status} size="md" pulse />
          </div>

          <div className="mb-6 space-y-1">
            <p className="font-body text-[13px] font-medium text-[#0A1F44]">
              {reservation.villaName}
            </p>
            <p className="font-body text-[13px] text-[#757575]">
              {checkInDate.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              {' – '}
              {checkOutDate.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <h4 className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              Guest Information
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Mail size={14} className="shrink-0 text-[#757575]" />
                <span className="font-body text-[13px] text-[#0A1F44]">{reservation.guestEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="shrink-0 text-[#757575]" />
                <span className="font-body text-[13px] text-[#0A1F44]">{reservation.guestPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users size={14} className="shrink-0 text-[#757575]" />
                <span className="font-body text-[13px] text-[#0A1F44]">
                  {reservation.guests.adults} Adult{reservation.guests.adults !== 1 ? 's' : ''}
                  {reservation.guests.children > 0 && `, ${reservation.guests.children} Child${reservation.guests.children !== 1 ? 'ren' : ''}`}
                  {reservation.guests.infants > 0 && `, ${reservation.guests.infants} Infant${reservation.guests.infants !== 1 ? 's' : ''}`}
                  {reservation.guests.pets > 0 && `, ${reservation.guests.pets} Pet${reservation.guests.pets !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <h4 className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              Payment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between font-body text-[13px] text-[#0A1F44]">
                <span>Total Amount</span>
                <span className="font-medium">{formatCurrency(reservation.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-body text-[13px] text-[#757575]">
                <span>Amount Due</span>
                <span>{formatCurrency(reservation.amountDue)}</span>
              </div>
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="mb-6 space-y-3">
              <h4 className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
                Special Requests
              </h4>
              <p className="font-body text-[13px] leading-relaxed text-[#0A1F44]">
                {reservation.specialRequests}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              SMS Activity
            </h4>
            <div className="flex items-center gap-3 rounded-lg border border-[#ECECEC] px-4 py-3">
              <div className="flex flex-col">
                <p className="font-body text-[13px] text-[#0A1F44]">
                  {reservation.status === 'pending'
                    ? 'Awaiting notification'
                    : reservation.status === 'completed'
                      ? 'Check-out SMS sent'
                      : reservation.status === 'cancelled'
                        ? 'Cancellation SMS sent'
                        : 'Confirmation SMS sent'}
                </p>
                <p className="font-body text-[11px] text-[#757575]">via iProg SMS</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2 border-t border-[#ECECEC] pt-6">
            {STATUS_ACTIONS.filter((a) =>
              a.showFor.includes(reservation.status),
            ).map((action) => (
              <button
                key={action.status}
                onClick={() => handleAction(action.status)}
                disabled={updating}
                className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-body text-[14px] font-medium transition-all ${
                  updating && 'opacity-50'
                } ${
                  action.variant === 'primary'
                    ? 'border border-[#0A1F44] text-[#0A1F44] hover:bg-[#f0f2f7]'
                    : 'border border-[#757575] text-[#757575] hover:bg-[#FAFAFA]'
                }`}
              >
                <action.icon size={16} />
                {updating ? 'Updating...' : action.label}
              </button>
            ))}
            {['cancelled', 'declined', 'expired'].includes(reservation.status) && (
              <div className="rounded-lg bg-[#FAFAFA] px-4 py-3 text-center font-body text-[13px] text-[#757575]">
                This reservation has been{' '}
                {reservation.status === 'cancelled'
                  ? 'cancelled'
                  : reservation.status === 'declined'
                    ? 'declined'
                    : 'expired'}
                .
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
