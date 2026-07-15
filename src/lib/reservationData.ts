export type ReservationStatus =
  | 'awaiting_confirmation'
  | 'awaiting_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'expired'

export interface Reservation {
  id: string
  email: string
  villaName: string
  checkIn: string
  checkOut: string
  guests: {
    adults: number
    children: number
    infants: number
    pets: number
  }
  createdAt: string
  status: ReservationStatus
  amountDue?: number
  paymentDeadline?: string
}

const mockReservations: Reservation[] = [
  {
    id: 'KRIB-20260715-8F3XK2',
    email: 'maria@example.com',
    villaName: 'KRiB 2',
    checkIn: '2026-08-10',
    checkOut: '2026-08-11',
    guests: { adults: 4, children: 2, infants: 0, pets: 0 },
    createdAt: '2026-07-15',
    status: 'awaiting_confirmation',
  },
  {
    id: 'KRIB-20260720-A7BC91',
    email: 'carlos@example.com',
    villaName: 'KRiB 1',
    checkIn: '2026-08-05',
    checkOut: '2026-08-06',
    guests: { adults: 2, children: 1, infants: 1, pets: 0 },
    createdAt: '2026-07-20',
    status: 'awaiting_payment',
    amountDue: 1250000,
    paymentDeadline: '2026-07-27',
  },
  {
    id: 'KRIB-20260725-D2E4F8',
    email: 'ana@example.com',
    villaName: 'KRiB 2',
    checkIn: '2026-09-01',
    checkOut: '2026-09-02',
    guests: { adults: 6, children: 3, infants: 0, pets: 1 },
    createdAt: '2026-07-25',
    status: 'confirmed',
    amountDue: 1500000,
    paymentDeadline: '2026-07-30',
  },
  {
    id: 'KRIB-20260601-GH5J32',
    email: 'juan@example.com',
    villaName: 'KRiB 1',
    checkIn: '2026-06-15',
    checkOut: '2026-06-16',
    guests: { adults: 3, children: 0, infants: 0, pets: 0 },
    createdAt: '2026-06-01',
    status: 'completed',
  },
  {
    id: 'KRIB-20260710-KL9M45',
    email: 'sample@example.com',
    villaName: 'KRiB 2',
    checkIn: '2026-08-20',
    checkOut: '2026-08-21',
    guests: { adults: 8, children: 4, infants: 2, pets: 0 },
    createdAt: '2026-07-10',
    status: 'declined',
  },
  {
    id: 'KRIB-20260705-NP7Q63',
    email: 'test@example.com',
    villaName: 'KRiB 1',
    checkIn: '2026-07-25',
    checkOut: '2026-07-26',
    guests: { adults: 5, children: 2, infants: 0, pets: 1 },
    createdAt: '2026-07-05',
    status: 'expired',
    amountDue: 1250000,
    paymentDeadline: '2026-07-12',
  },
]

export function lookupReservation(id: string, email: string): Promise<Reservation | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = mockReservations.find(
        (r) => r.id.toLowerCase() === id.trim().toLowerCase()
          && r.email.toLowerCase() === email.trim().toLowerCase()
      )
      resolve(result ?? null)
    }, 1200)
  })
}

export function getStatusDisplay(status: ReservationStatus): { label: string; color: string; bg: string; dot: string } {
  const map: Record<ReservationStatus, { label: string; color: string; bg: string; dot: string }> = {
    awaiting_confirmation: {
      label: 'Awaiting Confirmation',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200/60',
      dot: 'bg-amber-400',
    },
    awaiting_payment: {
      label: 'Awaiting Payment',
      color: 'text-blue-800',
      bg: 'bg-blue-50 border-blue-200/60',
      dot: 'bg-[#4F91B8]',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'text-green-800',
      bg: 'bg-green-50 border-green-200/60',
      dot: 'bg-[#7FAE87]',
    },
    completed: {
      label: 'Completed',
      color: 'text-green-800',
      bg: 'bg-green-50 border-green-200/60',
      dot: 'bg-[#7FAE87]',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-on-surface-variant',
      bg: 'bg-surface-container-low border-outline-variant/60',
      dot: 'bg-outline',
    },
    declined: {
      label: 'Declined',
      color: 'text-red-800',
      bg: 'bg-red-50 border-red-200/60',
      dot: 'bg-[#C86A5A]',
    },
    expired: {
      label: 'Expired',
      color: 'text-red-800',
      bg: 'bg-red-50 border-red-200/60',
      dot: 'bg-[#C86A5A]',
    },
  }
  return map[status]
}

export const TIMELINE_STEPS: { key: ReservationStatus | 'submitted'; label: string }[] = [
  { key: 'submitted', label: 'Reservation Submitted' },
  { key: 'awaiting_confirmation', label: 'Awaiting Confirmation' },
  { key: 'awaiting_payment', label: 'Awaiting Payment' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
]
