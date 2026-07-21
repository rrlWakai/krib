export type ReservationStatus =
  | 'pending'
  | 'approved'
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'expired';

export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export type VillaStatus = 'active' | 'maintenance' | 'inactive';

export type DiscountStatus = 'active' | 'inactive' | 'expired';

export type CalendarBlockType = 'reservation' | 'blocked' | 'maintenance';

export type MessagePlatform = 'facebook' | 'instagram' | 'direct';

export type DiscountType = 'percentage' | 'fixed';

export interface Guests {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  villaId: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guests: Guests;
  status: ReservationStatus;
  baseRate: number;
  partyFee: number;
  discount: number;
  totalAmount: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  paymentDeadline: string;
  createdAt: string;
  message: string;
  specialRequests: string;
  approvalDate: string | null;
  paymentDate: string | null;
  confirmationNumber: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalStays: number;
  totalSpending: number;
  lastVisit: string;
  reservations: string[];
  createdAt: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  guestName: string;
  villaName: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  reference: string;
  createdAt: string;
  verifiedAt: string | null;
  notes: string;
}

export interface Villa {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseRate: number;
  maxGuests: number;
  amenities: string[];
  status: VillaStatus;
  image: string;
  gallery: string[];
  capacity: number;
}

export interface Discount {
  id: string;
  code: string;
  description: string;
  type: DiscountType;
  amount: number;
  villaId: string;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
  usageCount: number;
  maxUsage: number;
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

export interface Message {
  id: string;
  platform: MessagePlatform;
  guestName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  reservationId: string | null;
  messages: ChatMessage[];
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  reservations: number;
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

export interface BusinessInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
}

export interface ContactDetails {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  website: string;
}

export interface NotificationSettings {
  emailOnReservation: boolean;
  emailOnPayment: boolean;
  emailOnCancellation: boolean;
  smsOnReservation: boolean;
  smsOnPayment: boolean;
  dailyReport: boolean;
}

export interface Settings {
  businessInfo: BusinessInfo;
  contactDetails: ContactDetails;
  notifications: NotificationSettings;
}

export interface DashboardStats {
  totalReservations: number;
  pendingReservations: number;
  todayCheckins: number;
  todayCheckouts: number;
  totalRevenue: number;
  pendingPayments: number;
  occupancyRate: number;
  confirmedUpcoming: number;
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}
