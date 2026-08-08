import type {
  NavItem,
  ReservationStatus,
} from '../types';

export const RESERVATION_STATUSES: ReservationStatus[] = [
  'pending',
  'approved',
  'completed',
  'declined',
  'cancelled',
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Control Center', icon: 'LayoutDashboard', path: '/admin' },
  { label: 'Reservations', icon: 'CalendarCheck', path: '/admin/reservations' },
  { label: 'Calendar', icon: 'Calendar', path: '/admin/calendar' },
  { label: 'Reports', icon: 'BarChart3', path: '/admin/reports' },
  { label: 'Villas', icon: 'Building2', path: '/admin/villas' },
  { label: 'Guests', icon: 'Users', path: '/admin/guests' },
  { label: 'SMS Activity', icon: 'MessageSquare', path: '/admin/sms-activity' },
  { label: 'Audit Logs', icon: 'ScrollText', path: '/admin/audit-logs' },
  { label: 'Settings', icon: 'Settings', path: '/admin/settings' },
];

export function getReservationStatusLabel(status: ReservationStatus): string {
  const labels: Record<ReservationStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    declined: 'Declined',
    cancelled: 'Cancelled',
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
