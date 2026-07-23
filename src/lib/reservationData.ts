import { getVillaImageByName } from './images'

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
  guestName?: string
  villaId: string
  villaName: string
  maxGuests: number
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
  baseRate?: number
  partyFee?: number
  totalAmount?: number
  amountDue?: number
  paymentDeadline?: string
  approvalDate?: string
  confirmationNumber?: string
  message?: string
}

export function getVillaImage(villaName: string): string {
  return getVillaImageByName(villaName)
}

export function generateReservationId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `KRIB-${date}-${code}`
}

const mockReservations: Reservation[] = [
  {
    id: 'KRIB-20260715-8F3XK2',
    email: 'maria@example.com',
    guestName: 'Maria Santos',
    villaId: 'krib-2',
    villaName: 'KRiB 2',
    maxGuests: 30,
    checkIn: '2026-08-10',
    checkOut: '2026-08-11',
    guests: { adults: 4, children: 2, infants: 0, pets: 0 },
    createdAt: '2026-07-15',
    status: 'awaiting_confirmation',
    baseRate: 30000,
    partyFee: 0,
    totalAmount: 30000,
    message: 'Celebrating our anniversary',
  },
  {
    id: 'KRIB-20260720-A7BC91',
    email: 'carlos@example.com',
    guestName: 'Carlos Reyes',
    villaId: 'krib-1',
    villaName: 'KRiB 1',
    maxGuests: 20,
    checkIn: '2026-08-05',
    checkOut: '2026-08-06',
    guests: { adults: 2, children: 1, infants: 1, pets: 0 },
    createdAt: '2026-07-20',
    status: 'awaiting_payment',
    baseRate: 25000,
    partyFee: 5000,
    totalAmount: 30000,
    amountDue: 15000,
    paymentDeadline: '2026-07-27',
    approvalDate: '2026-07-22',
  },
  {
    id: 'KRIB-20260725-D2E4F8',
    email: 'ana@example.com',
    guestName: 'Ana Cruz',
    villaId: 'krib-2',
    villaName: 'KRiB 2',
    maxGuests: 30,
    checkIn: '2026-09-01',
    checkOut: '2026-09-02',
    guests: { adults: 6, children: 3, infants: 0, pets: 1 },
    createdAt: '2026-07-25',
    status: 'confirmed',
    baseRate: 30000,
    partyFee: 5000,
    totalAmount: 35000,
    amountDue: 17500,
    paymentDeadline: '2026-07-30',
    approvalDate: '2026-07-26',
    confirmationNumber: 'KRIB-CONF-2026-0901',
  },
  {
    id: 'KRIB-20260601-GH5J32',
    email: 'juan@example.com',
    guestName: 'Juan Dela Cruz',
    villaId: 'krib-1',
    villaName: 'KRiB 1',
    maxGuests: 20,
    checkIn: '2026-06-15',
    checkOut: '2026-06-16',
    guests: { adults: 3, children: 0, infants: 0, pets: 0 },
    createdAt: '2026-06-01',
    status: 'completed',
    baseRate: 25000,
    partyFee: 0,
    totalAmount: 25000,
    confirmationNumber: 'KRIB-CONF-2026-0615',
  },
  {
    id: 'KRIB-20260710-KL9M45',
    email: 'sample@example.com',
    guestName: 'Sample Guest',
    villaId: 'krib-2',
    villaName: 'KRiB 2',
    maxGuests: 30,
    checkIn: '2026-08-20',
    checkOut: '2026-08-21',
    guests: { adults: 8, children: 4, infants: 2, pets: 0 },
    createdAt: '2026-07-10',
    status: 'declined',
    baseRate: 30000,
    partyFee: 0,
    totalAmount: 30000,
  },
  {
    id: 'KRIB-20260705-NP7Q63',
    email: 'test@example.com',
    guestName: 'Test User',
    villaId: 'krib-1',
    villaName: 'KRiB 1',
    maxGuests: 20,
    checkIn: '2026-07-25',
    checkOut: '2026-07-26',
    guests: { adults: 5, children: 2, infants: 0, pets: 1 },
    createdAt: '2026-07-05',
    status: 'expired',
    baseRate: 25000,
    partyFee: 0,
    totalAmount: 25000,
    amountDue: 12500,
    paymentDeadline: '2026-07-12',
  },
]

export function lookupReservation(id: string, email: string): Promise<Reservation | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = mockReservations.find(
        (r) => r.id.toLowerCase() === id.trim().toLowerCase()
          && r.email.toLowerCase() === email.trim().toLowerCase(),
      )
      resolve(result ?? null)
    }, 1200)
  })
}

export function lookupByCode(code: string): Promise<Reservation | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = mockReservations.find(
        (r) => r.id.toLowerCase() === code.trim().toLowerCase(),
      )
      resolve(result ?? null)
    }, 1000)
  })
}

export function lookupByEmail(email: string): Promise<Reservation[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = mockReservations.filter(
        (r) => r.email.toLowerCase() === email.trim().toLowerCase(),
      )
      resolve(results)
    }, 1000)
  })
}

export function formatPrice(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH')
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
      label: 'Approved',
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

export const TIMELINE_STEPS: { key: string; label: string; emotionalLabel: string }[] = [
  { key: 'submitted', label: 'Reservation Received', emotionalLabel: 'We received your reservation' },
  { key: 'reviewing', label: 'Under Review', emotionalLabel: 'Our team is reviewing your request' },
  { key: 'approved', label: 'Approved', emotionalLabel: 'Great news — your dates are available!' },
  { key: 'awaiting_payment', label: 'Down Payment', emotionalLabel: 'Secure your stay with a down payment' },
  { key: 'payment_verified', label: 'Payment Verified', emotionalLabel: 'Your payment has been received' },
  { key: 'confirmed', label: 'Confirmed', emotionalLabel: 'You\'re all set for your stay' },
  { key: 'completed', label: 'Stay Completed', emotionalLabel: 'Thank you for choosing KRiB' },
]

const STATUS_TO_STEP: Record<string, number> = {
  awaiting_confirmation: 1,
  awaiting_payment: 3,
  confirmed: 5,
  completed: 6,
}

export function getTimelineCurrentStep(status: ReservationStatus): number {
  return STATUS_TO_STEP[status] ?? -1
}

export function getStatusContext(status: ReservationStatus): { heading: string; body: string; emotion: string } {
  const map: Record<ReservationStatus, { heading: string; body: string; emotion: string }> = {
    awaiting_confirmation: {
      heading: 'We\'re reviewing your reservation.',
      body: 'Our team is carefully reviewing your reservation request. We typically respond within a few hours during business hours. You\'ll receive an update soon.',
      emotion: 'calm',
    },
    awaiting_payment: {
      heading: 'Great news! Your reservation has been approved.',
      body: 'We\'re excited to welcome you to KRiB Beverly Place. Complete your down payment below to secure your preferred dates.',
      emotion: 'celebrate',
    },
    confirmed: {
      heading: 'Your reservation is confirmed!',
      body: 'Everything is set for your upcoming stay. We can\'t wait to welcome you. A detailed guest guide will be sent 3 days before your check-in date.',
      emotion: 'excited',
    },
    completed: {
      heading: 'Thank you for staying with us.',
      body: 'It was a pleasure hosting you at KRiB Beverly Place. We hope you made wonderful memories. We look forward to welcoming you again.',
      emotion: 'grateful',
    },
    cancelled: {
      heading: 'This reservation has been cancelled.',
      body: 'If you have any questions about this cancellation, please don\'t hesitate to reach out to us.',
      emotion: 'neutral',
    },
    declined: {
      heading: 'We couldn\'t accommodate your dates.',
      body: 'Unfortunately, your requested dates aren\'t available. We\'d love to host you another time — browse our other available dates or reach out for help.',
      emotion: 'empathy',
    },
    expired: {
      heading: 'This reservation has expired.',
      body: 'The payment window for this reservation has passed. Please contact us if you\'d like to explore new dates.',
      emotion: 'empathy',
    },
  }
  return map[status]
}

export function getTimelineStepForStatus(status: ReservationStatus): number {
  return STATUS_TO_STEP[status] ?? -1
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-PH', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatGuests(g: { adults: number; children: number; infants: number; pets: number }): string {
  const parts: string[] = []
  if (g.adults) parts.push(`${g.adults} ${g.adults === 1 ? 'Adult' : 'Adults'}`)
  if (g.children) parts.push(`${g.children} ${g.children === 1 ? 'Child' : 'Children'}`)
  if (g.infants) parts.push(`${g.infants} ${g.infants === 1 ? 'Infant' : 'Infants'}`)
  if (g.pets) parts.push(`${g.pets} ${g.pets === 1 ? 'Pet' : 'Pets'}`)
  return parts.join(', ')
}

export function formatGuestCount(g: { adults: number; children: number; infants: number; pets: number }): string {
  const total = g.adults + g.children
  return `${total} ${total === 1 ? 'Guest' : 'Guests'}`
}

export function getStayDuration(checkIn: string, checkOut: string): string {
  const start = new Date(checkIn + 'T12:00:00')
  const end = new Date(checkOut + 'T12:00:00')
  const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
  if (hours === 21) return '21-Hour Stay'
  return `${hours}-Hour Stay`
}
