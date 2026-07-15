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
  amountDue?: number
  paymentDeadline?: string
}

const VILLA_IMAGES: Record<string, string> = {
  'KRiB 1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB79-XUS_wZ_ISWK8KWvEbstMr4BMDuLiZdTd5-I3K27p59KgB4BNJ6VZm8TpsDGc9PFr0l5JqufCmViI3PVkFOv_tXSip6RZBLus7sKdfEh64FTB0E_I_x7g-I60OvC8qGW10s59zsqhMPr2XV9mlATb9POcqEh3FlTWuHuKtqTjb06ajMF-prbNHaFv6mcywzBUi5nEO5I3NWzhMAiqfIniB1cFr-XYENmmbJ42F3vb8GEbNYeXK2Z8Qozo2euOgivqgY94CT5kQU',
  'KRiB 2': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-dxTrEUzretQIKz4ayr0V4kXgz6kTk0w_dVssvNXb5a8wYwyhKFfVmpJr0pKbd8_no8utHitDUiDKVbwuYmA7U9BxryfL_exRaXqJB8ufueYxjmPw7wf0FE8P9jFeHQupg_kG73ua7BpOq-Mdgc5X0iRNxASebJe3SMinidZhpxVyJr7GLjTEBLI82IAyTdCe5wi2kmOJk3a5kc2xgSZuqCMnhPY1zZ3z9pnN9A8R9_4tBTxWIZejVCRT44DBTe3Zr620nYrPtz78',
}

export function getVillaImage(villaName: string): string {
  return VILLA_IMAGES[villaName] ?? VILLA_IMAGES['KRiB 1']
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
    villaId: 'krib-2',
    villaName: 'KRiB 2',
    maxGuests: 22,
    checkIn: '2026-08-10',
    checkOut: '2026-08-11',
    guests: { adults: 4, children: 2, infants: 0, pets: 0 },
    createdAt: '2026-07-15',
    status: 'awaiting_confirmation',
  },
  {
    id: 'KRIB-20260720-A7BC91',
    email: 'carlos@example.com',
    villaId: 'krib-1',
    villaName: 'KRiB 1',
    maxGuests: 20,
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
    villaId: 'krib-2',
    villaName: 'KRiB 2',
    maxGuests: 22,
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
    villaId: 'krib-1',
    villaName: 'KRiB 1',
    maxGuests: 20,
    checkIn: '2026-06-15',
    checkOut: '2026-06-16',
    guests: { adults: 3, children: 0, infants: 0, pets: 0 },
    createdAt: '2026-06-01',
    status: 'completed',
  },
  {
    id: 'KRIB-20260710-KL9M45',
    email: 'sample@example.com',
    villaId: 'krib-2',
    villaName: 'KRiB 2',
    maxGuests: 22,
    checkIn: '2026-08-20',
    checkOut: '2026-08-21',
    guests: { adults: 8, children: 4, infants: 2, pets: 0 },
    createdAt: '2026-07-10',
    status: 'declined',
  },
  {
    id: 'KRIB-20260705-NP7Q63',
    email: 'test@example.com',
    villaId: 'krib-1',
    villaName: 'KRiB 1',
    maxGuests: 20,
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

export const TIMELINE_STEPS: { key: string; label: string }[] = [
  { key: 'submitted', label: 'Reservation Submitted' },
  { key: 'awaiting_confirmation', label: 'Awaiting Confirmation' },
  { key: 'awaiting_payment', label: 'Awaiting Payment' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Enjoy Your Stay' },
]

export function getStatusContext(status: ReservationStatus): { heading: string; body: string } {
  const map: Record<ReservationStatus, { heading: string; body: string }> = {
    awaiting_confirmation: {
      heading: 'Awaiting Confirmation',
      body: 'Our team is currently reviewing your reservation. We typically respond within a few hours during regular business hours.',
    },
    awaiting_payment: {
      heading: 'Approved',
      body: 'Your reservation has been approved. Please complete your down payment to secure your booking.',
    },
    confirmed: {
      heading: 'Confirmed',
      body: "Your reservation has been confirmed. We're excited to welcome you to KRiB Beverly Place.",
    },
    completed: {
      heading: 'Completed',
      body: 'Thank you for staying with us. We hope to welcome you again soon.',
    },
    cancelled: {
      heading: 'Cancelled',
      body: 'This reservation has been cancelled.',
    },
    declined: {
      heading: 'Declined',
      body: "Unfortunately we couldn't accommodate your requested dates. Browse our other villas or contact us.",
    },
    expired: {
      heading: 'Expired',
      body: 'This reservation has expired. Please contact us if you need assistance.',
    },
  }
  return map[status]
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

export function formatGuests(g: { adults: number; children: number; infants: number; pets: number }): string {
  const parts: string[] = []
  if (g.adults) parts.push(`${g.adults} ${g.adults === 1 ? 'Adult' : 'Adults'}`)
  if (g.children) parts.push(`${g.children} ${g.children === 1 ? 'Child' : 'Children'}`)
  if (g.infants) parts.push(`${g.infants} ${g.infants === 1 ? 'Infant' : 'Infants'}`)
  if (g.pets) parts.push(`${g.pets} ${g.pets === 1 ? 'Pet' : 'Pets'}`)
  return parts.join(', ')
}
