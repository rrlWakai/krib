export type ReservationStatus =
  | 'pending'
  | 'approved'
  | 'completed'
  | 'declined'
  | 'cancelled';

export type AdminRole = 'owner' | 'staff';

export type VillaStatus = 'active' | 'inactive';

export type SmsDirection = 'outbound_auto' | 'outbound_manual';

export type SmsStatus = 'queued' | 'sent' | 'failed';

export interface Guest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Villa {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  max_guests: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VillaAmenity {
  id: string;
  villa_id: string;
  label: string;
  icon: string;
  sort_order: number;
}

export interface GalleryImage {
  id: string;
  villa_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
}

export interface Reservation {
  id: string;
  reference_code: string;
  villa_id: string;
  guest_id: string;
  guest_count: number;
  status: ReservationStatus;
  special_requests: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  arrival_datetime: string;
  checkout_datetime: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
  declined_at: string | null;
  declined_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  completed_at: string | null;
  is_party: boolean;
  additional_guest_fee: number;
  party_fee: number;
  total_amount: number;
  guest: Guest;
  villa: Villa;
}

export interface SmsLog {
  id: string;
  reservation_id: string;
  recipient: string;
  message: string;
  direction: SmsDirection;
  status: SmsStatus;
  provider_message_id: string;
  error_message: string;
  created_at: string;
  reservation?: {
    reference_code: string;
    guest: Guest;
  } | null;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  admin?: {
    id: string;
    full_name: string;
  } | null;
}

export interface VillaAdmin extends Villa {
  amenities: VillaAmenity[];
  galleryCount: number;
  upcomingReservations: number;
  nextArrival: string | null;
  availableToday: boolean;
  occupancyNext30Days: number;
}

export interface GuestProfile extends Guest {
  totalStays: number;
  totalSpending: number;
  lastVisit: string | null;
  upcomingReservations: Reservation[];
  completedReservations: Reservation[];
  cancelledReservations: Reservation[];
  declinedReservations: Reservation[];
  allReservations: Reservation[];
}

export interface DashboardStats {
  totalReservations: number;
  pendingReservations: number;
  todayCheckins: number;
  todayCheckouts: number;
  occupancyRate: number;
  confirmedUpcoming: number;
  recentlyApproved: number;
  totalGuests: number;
}

export interface ReservationTrend {
  month: string;
  total: number;
  pending: number;
  approved: number;
  completed: number;
  declined: number;
  cancelled: number;
}

export interface OccupancyData {
  month: string;
  rate: number;
  krib1: number;
  krib2: number;
}

export interface VillaPopularity {
  villaName: string;
  totalBookings: number;
  totalRevenue: number;
  averageStay: number;
}

export interface GuestStat {
  label: string;
  value: number;
  total: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  color: string;
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}
