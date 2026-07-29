import type {
  NavItem,
  ReservationStatus,
} from '../types';

export const RESERVATION_STATUSES: ReservationStatus[] = [
  'pending',
  'approved',
  'awaiting_payment',
  'payment_submitted',
  'confirmed',
  'completed',
  'cancelled',
  'declined',
  'expired',
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Control Center', icon: 'LayoutDashboard', path: '/admin' },
  { label: 'Reservations', icon: 'CalendarCheck', path: '/admin/reservations' },
  { label: 'Calendar', icon: 'Calendar', path: '/admin/calendar' },
  { label: 'Villas', icon: 'Building2', path: '/admin/villas' },
  { label: 'Guests', icon: 'Users', path: '/admin/guests' },
  { label: 'Discounts', icon: 'Tag', path: '/admin/discounts' },
  { label: 'SMS Activity', icon: 'MessageSquare', path: '/admin/sms-activity' },
  { label: 'Settings', icon: 'Settings', path: '/admin/settings' },
];


export function getReservationStatusLabel(status: ReservationStatus): string {
  const labels: Record<ReservationStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    awaiting_payment: 'Awaiting Payment',
    payment_submitted: 'Payment Submitted',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    declined: 'Declined',
    expired: 'Expired',
  };
  return labels[status];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isToday(dateStr: string): boolean {
  const target = new Date(dateStr);
  const today = new Date();
  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  );
}
