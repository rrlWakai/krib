import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  Ban,
  XCircle,
  Send,
  Trash2,
} from 'lucide-react'
import type { Reservation, ReservationStatus } from '../../types'
import { StatusBadge } from '../StatusBadge'
import { ConfirmDialog } from '../ConfirmDialog'
import { formatCurrency } from '../../data/constants'
import { useAdminMutation, invalidateAdminCache } from '../../hooks/useAdminQuery'
import { estimateReservationValue, reservationNights } from '../../services/api'
import { formatManilaDate, formatManilaTime } from '../../services/calendarTime'

interface ReservationDrawerProps {
  reservation: Reservation | null
  onClose: () => void
  onStatusChange: (updated?: Reservation) => void
}

interface DrawerAction {
  label: string
  icon: React.FC<{ size?: number; className?: string }>
  run: (r: Reservation) => Promise<{ data: unknown; error: unknown }>
  loadingLabel: string
  variant: 'primary' | 'danger'
  showFor: ReservationStatus[]
  syncs: boolean
}

function useDrawerMutations() {
  const approve = useAdminMutation(async (id: string) => {
    const { approveReservation } = await import('../../services/mutations')
    return approveReservation(id)
  })
  const decline = useAdminMutation(async (id: string) => {
    const { declineReservation } = await import('../../services/mutations')
    return declineReservation(id, '')
  })
  const cancel = useAdminMutation(async (id: string) => {
    const { cancelReservation } = await import('../../services/mutations')
    return cancelReservation(id)
  })
  const sms = useAdminMutation(async (id: string) => {
    const { sendReservationSms } = await import('../../services/mutations')
    return sendReservationSms(id, { type: 'confirmation' })
  })
  const deleteRes = useAdminMutation(async (id: string) => {
    const { deleteReservation } = await import('../../services/mutations')
    return deleteReservation(id)
  })
  return { approve, decline, cancel, sms, deleteRes }
}

export default function ReservationDrawer({
  reservation,
  onClose,
  onStatusChange,
}: ReservationDrawerProps) {
  const { approve, decline, cancel, sms, deleteRes } = useDrawerMutations()
  const updating = approve.loading || decline.loading || cancel.loading || sms.loading || deleteRes.loading
  const actionError = approve.error ?? decline.error ?? cancel.error ?? sms.error ?? deleteRes.error
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!reservation) return null

  const res = reservation

  const activeMutation =
    approve.loading ? approve
    : decline.loading ? decline
    : cancel.loading ? cancel
    : sms

  const STATUS_ACTIONS: DrawerAction[] = [
    {
      label: 'Approve',
      icon: CheckCircle2,
      run: (r) => approve.mutate(r.id),
      loadingLabel: 'Approving…',
      variant: 'primary',
      showFor: ['pending'],
      syncs: true,
    },
    {
      label: 'Decline',
      icon: XCircle,
      run: (r) => decline.mutate(r.id),
      loadingLabel: 'Declining…',
      variant: 'danger',
      showFor: ['pending'],
      syncs: true,
    },
    {
      label: 'Cancel',
      icon: Ban,
      run: (r) => cancel.mutate(r.id),
      loadingLabel: 'Cancelling…',
      variant: 'danger',
      showFor: ['pending', 'approved'],
      syncs: true,
    },
    {
      label: 'Send Confirmation SMS',
      icon: Send,
      run: (r) => sms.mutate(r.id),
      loadingLabel: 'Sending…',
      variant: 'primary',
      showFor: ['approved'],
      syncs: false,
    },
  ]

  const availableActions = STATUS_ACTIONS.filter((a) => a.showFor.includes(res.status))

  async function handleAction(action: DrawerAction) {
    const result = await action.run(res)
    if (action.syncs && result.data) {
      onStatusChange(result.data as Reservation)
    } else {
      onStatusChange()
    }
  }

  async function handleDeleteConfirm() {
    const result = await deleteRes.mutate(res.id)
    if (result.error) return
    setShowDeleteConfirm(false)
    invalidateAdminCache('reservations', 'audit-logs')
    onStatusChange()
  }

  const nights = reservationNights(res)

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
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[420px] overflow-y-auto border-l border-[#ECECEC] bg-white"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ECECEC] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7] font-body text-[13px] font-medium text-[#0A1F44]">
              {reservation.guest.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="font-body text-[14px] font-medium text-[#0A1F44]">
                {reservation.guest.full_name}
              </p>
              <p className="font-body text-[11px] text-[#757575]">
                {reservation.reference_code}
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
          {actionError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-[13px] text-red-600">
              {actionError}
            </div>
          )}

          <div className="mb-6">
            <StatusBadge status={reservation.status} size="md" pulse />
          </div>

          <div className="mb-6 space-y-1">
            <p className="font-body text-[13px] font-medium text-[#0A1F44]">
              {reservation.villa.name}
            </p>
            <p className="font-body text-[13px] text-[#757575]">
              {formatManilaDate(res.arrival_datetime)} · {formatManilaTime(res.arrival_datetime)}
              {' – '}
              {formatManilaDate(res.checkout_datetime)} · {formatManilaTime(res.checkout_datetime)}
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <h4 className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
              Guest Information
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Mail size={14} className="shrink-0 text-[#757575]" />
                <span className="font-body text-[13px] text-[#0A1F44]">{reservation.guest.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="shrink-0 text-[#757575]" />
                <span className="font-body text-[13px] text-[#0A1F44]">{reservation.guest.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users size={14} className="shrink-0 text-[#757575]" />
                <span className="font-body text-[13px] text-[#0A1F44]">
                  {reservation.guest_count} Guest{reservation.guest_count !== 1 ? 's' : ''}
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
                <span>Base Rate ({nights} night{nights !== 1 ? 's' : ''})</span>
                <span>{formatCurrency(Number(reservation.villa.base_price) * nights)}</span>
              </div>
              <div className="flex justify-between font-body text-[13px] text-[#0A1F44]">
                <span>Total Amount</span>
                <span className="font-medium">{formatCurrency(estimateReservationValue(reservation))}</span>
              </div>
            </div>
          </div>

          {reservation.special_requests && (
            <div className="mb-6 space-y-3">
              <h4 className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
                Special Requests
              </h4>
              <p className="font-body text-[13px] leading-relaxed text-[#0A1F44]">
                {reservation.special_requests}
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
                <p className="font-body text-[11px] text-[#757575]">via Semaphore SMS</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2 border-t border-[#ECECEC] pt-6">
            {availableActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleAction(action)}
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
                {updating ? (activeMutation === sms && sms.loading ? 'Sending…' : 'Updating…') : action.label}
              </button>
            ))}
            {(['cancelled', 'declined', 'completed'].includes(reservation.status)) && availableActions.length === 0 && (
              <div className="rounded-lg bg-[#FAFAFA] px-4 py-3 text-center font-body text-[13px] text-[#757575]">
                This reservation has been{' '}
                {reservation.status === 'cancelled'
                  ? 'cancelled'
                  : reservation.status === 'declined'
                    ? 'declined'
                    : 'completed'}
                .
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-red-100 pt-6">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={updating}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 font-body text-[14px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete Reservation
            </button>
          </div>
        </div>
      </motion.div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete reservation?"
        message="This will permanently delete this reservation and its associated guest record if it is no longer referenced. This action cannot be undone."
        confirmLabel="Delete Reservation"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleteRes.loading}
      />
    </AnimatePresence>
  )
}
