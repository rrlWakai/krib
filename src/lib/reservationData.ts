import { getVillaImageByName } from './images'

export type ReservationStatus =
  | 'pending'
  | 'approved'
  | 'completed'
  | 'declined'
  | 'cancelled'

export interface Reservation {
  id: string
  referenceCode?: string
  email: string
  guestName?: string
  villaId: string
  villaName: string
  maxGuests: number
  checkIn: string
  checkOut: string
  arrivalDatetime?: string
  checkoutDatetime?: string
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


export function formatPrice(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH')
}

export function getStatusDisplay(status: ReservationStatus): { label: string; color: string; bg: string; dot: string } {
  const map: Record<ReservationStatus, { label: string; color: string; bg: string; dot: string }> = {
    pending: {
      label: 'Pending',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200/60',
      dot: 'bg-amber-400',
    },
    approved: {
      label: 'Approved',
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
    declined: {
      label: 'Declined',
      color: 'text-red-800',
      bg: 'bg-red-50 border-red-200/60',
      dot: 'bg-[#C86A5A]',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-on-surface-variant',
      bg: 'bg-surface-container-low border-outline-variant/60',
      dot: 'bg-outline',
    },
  }
  return map[status]
}

export const TIMELINE_STEPS: { key: string; label: string; description: string }[] = [
  { key: 'submitted', label: 'Reservation Submitted', description: "We've successfully received your reservation request." },
  { key: 'reviewing', label: 'Under Review', description: 'Our team is reviewing your reservation and checking availability.' },
  { key: 'confirmed', label: 'Confirmed', description: 'Your reservation has been confirmed. An SMS containing your reservation details and check-in information has been sent.' },
]

const STATUS_TO_STEP: Record<string, number> = {
  pending: 1,
  approved: 3,
  completed: 3,
}

export function getTimelineCurrentStep(status: ReservationStatus): number {
  return STATUS_TO_STEP[status] ?? -1
}

export function getStatusContext(status: ReservationStatus): { heading: string; body: string; emotion: string } {
  const map: Record<ReservationStatus, { heading: string; body: string; emotion: string }> = {
    pending: {
      heading: 'We\'re reviewing your reservation.',
      body: 'Our team is carefully reviewing your reservation request and checking availability. We typically respond within a few hours during business hours.',
      emotion: 'calm',
    },
    approved: {
      heading: 'Your reservation is approved!',
      body: 'Everything is set for your upcoming stay. An SMS containing your reservation details and check-in information has been sent to your registered mobile number.',
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
  }
  return map[status]
}

export function getTimelineStepForStatus(status: ReservationStatus): number {
  return STATUS_TO_STEP[status] ?? -1
}

function toDate(dateStr: string): Date {
  return dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T12:00:00")
}

export function formatDate(dateStr: string): string {
  const d = toDate(dateStr)
  return d.toLocaleDateString("en-PH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateShort(dateStr: string): string {
  const d = toDate(dateStr)
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
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
  const start = toDate(checkIn)
  const end = toDate(checkOut)
  const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
  if (hours === 21) return '21-Hour Stay'
  return `${hours}-Hour Stay`
}
