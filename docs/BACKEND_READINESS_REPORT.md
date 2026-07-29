# KRiB Beverly Place — Backend Readiness Report

**Date:** July 29, 2026  
**Scope:** Supabase (PostgreSQL, Auth, Storage) — no payment integration  
**Reservation Flow:** Manual approval → SMS notification → down payment (manual/external)  
**SMS Provider:** iProg SMS (no email)  
**Frontend:** React 19 + Vite + Tailwind CSS v4 + TypeScript 5.8  
**Status:** Architecture blueprint — ready for implementation

---

## 1. Project Overview

KRiB Beverly Place is a villa rental property (2 villas: KRiB 1 and KRiB 2) in Pampanga, Philippines. The frontend is fully built with mock data. This report defines the complete backend architecture required to replace mock data with a live Supabase backend.

### Business Rules
- 21-hour stay duration (check-in 2:00 PM → check-out 11:00 AM)
- KRiB 1: max 20 guests, base rate ₱25,000
- KRiB 2: max 30 guests, base rate ₱30,000
- No guest accounts — reservations use only personal info (name, email, phone)
- No online payment — manual approval, then guest submits down payment externally
- Party fee: ₱5,000 toggle (applies to celebrations/events)
- Pets: allowed up to 10 per booking, >2 pets triggers staff notification
- Reservations are exclusive — one group per villa per date

---

## 2. Frontend Audit

### Routes (Public)
| Path | Page | Description |
|------|------|-------------|
| `/` | HomePage | Hero, villas, experiences, CTA |
| `/krib-1` | VillaDetailPage | KRiB 1 details, booking flow |
| `/krib-2` | VillaDetailPage | KRiB 2 details, booking flow |
| `/gallery` | GalleryPage | Public gallery |
| `/location` | LocationPage | Map, directions |
| `/my-reservation` | MyReservationPage | Guest lookup portal |
| `/*` | NotFoundPage | 404 |

### Routes (Admin)
| Path | Page | Description |
|------|------|-------------|
| `/admin` | Dashboard | Stats, activity, recent reservations |
| `/admin/reservations` | Reservations | Table with search/filter |
| `/admin/reservations/:id` | ReservationDetail | Single reservation view |
| `/admin/calendar` | Calendar | Month/week/day views |
| `/admin/guests` | Guests | Guest directory with drawer |
| `/admin/villas` | Villas | Villa management cards |
| `/admin/discounts` | Discounts | Promo code management |
| `/admin/reports` | Reports | Route exists, removed from sidebar nav |
| `/admin/gallery` | Gallery | Placeholder page |
| `/admin/sms-activity` | SmsActivity | Placeholder page |
| `/admin/settings` | Settings | Business info, contact, notifications |

### API Consumers (Components)
- **BookingExperience.tsx** (multi-step modal): Submits reservation data to `localStorage` currently
- **StickyReservationCard.tsx**: Sidebar booking card, reads villa info
- **StickyBookingBar.tsx**: Mobile bottom booking bar
- **ReservationModal.tsx**: Legacy v2 booking modal
- **GuestSelector.tsx**: Guest count picker (used by all three above)
- **MyReservationPage.tsx**: Looks up reservations by ID + email (currently mocked)
- **AvailabilityCalendar.tsx**: Shows per-day availability (currently mocked)
- **Admin pages**: All read from `mockData.ts` in-memory mutable array

---

## 3. Business Flow Audit

### Reservation Lifecycle (9 states)
```
pending → approved → awaiting_payment → payment_submitted → confirmed → completed
  ↓         ↓                                                    ↓
declined  cancelled                                            cancelled
```

| # | Status | Trigger | Action Required |
|---|--------|---------|-----------------|
| 1 | `pending` | Guest submits reservation | Admin reviews |
| 2 | `approved` | Admin approves | SMS to guest with payment instructions |
| 3 | `awaiting_payment` | Approval sent | Guest submits down payment (50%) |
| 4 | `payment_submitted` | Guest notifies payment | Admin verifies payment |
| 5 | `confirmed` | Admin confirms payment | System sends confirmation SMS |
| 6 | `completed` | Stay completed | Auto-transition at checkout time |
| 7 | `cancelled` | Guest or admin cancels | SMS notification if applicable |
| 8 | `declined` | Admin declines dates | SMS notification |
| 9 | `expired` | Payment deadline passed | Auto-transition via cron/trigger |

### Key Business Rules
- **Party fee**: ₱5,000 optional add-on; toggled in booking flow
- **Payment deadline**: 7 days from approval, or 3 days before check-in (whichever is earlier)
- **Pets >2**: Staff notification flag
- **Max occupancy**: adults + children ≤ villa maxGuests; infants and pets don't count
- **One reservation per villa per date**: No double-booking
- **Down payment**: 50% of total amount (hardcoded convention in mock data: `amountDue = totalAmount / 2`)

---

## 4. Database Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VILLAS                                       │
├─────────────────────────────────────────────────────────────────────┤
│ id (UUID PK)                                                        │
│ name (TEXT)                    KRiB 1 / KRiB 2                      │
│ slug (TEXT UNIQUE)             krib-1 / krib-2                      │
│ description (TEXT)                                                  │
│ base_rate (INTEGER)            Amount in PHP centavos (2500000)     │
│ max_guests (INTEGER)           20 / 30                               │
│ capacity (INTEGER)                                                  │
│ bedrooms (JSONB)               [{name, capacity}]                   │
│ amenities (TEXT[])             ['Pool','BBQ Area',...]              │
│ status (villa_status)          active / maintenance / inactive      │
│ image (TEXT)                   Primary image URL                    │
│ gallery (TEXT[])               Array of image URLs                  │
│ created_at (TIMESTAMPTZ)                                            │
│ updated_at (TIMESTAMPTZ)                                            │
│ party_fee (INTEGER)            500000 (centavos)                    │
│ check_in_time (TIME)           14:00                                │
│ check_out_time (TIME)          11:00                                │
│ stay_hours (INTEGER)           21                                   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ 1
                       │
              ┌────────┴────────┐
              │                 │ *
              │                 │
         ┌────┴─────────────────┴──┐
         │     RESERVATIONS          │
         ├──────────────────────────┤
         │ id (UUID PK)             │
         │ guest_name (TEXT)        │
         │ guest_email (TEXT)       │
         │ guest_phone (TEXT)       │
         │ villa_id (UUID FK)       │
         │ check_in (DATE)          │
         │ check_out (DATE)         │
         │ guests (JSONB)           │  {adults,children,infants,pets}
         │ status (res_status)      │
         │ base_rate (INTEGER)      │  centavos
         │ party_fee (INTEGER)      │  centavos, 0 if not applied
         │ discount (INTEGER)       │  centavos
         │ total_amount (INTEGER)   │  centavos
         │ amount_due (INTEGER)     │  centavos
         │ payment_status (pay_stat)│
         │ payment_deadline (DATE)  │
         │ confirmation_number (TEXT)│
         │ special_requests (TEXT)  │
         │ message (TEXT)           │
         │ approval_date (TIMESTAMPTZ)│
         │ payment_date (TIMESTAMPTZ)│
         │ cancelled_at (TIMESTAMPTZ)│
         │ pets_over_2 (BOOLEAN)    │  staff notification flag
         │ created_at (TIMESTAMPTZ) │
         │ updated_at (TIMESTAMPTZ) │
         └────────┬─────────────────┘
                  │
                  │ *
                  │
         ┌────────┴─────────────────┐
         │   GUESTS (optional)      │
         ├──────────────────────────┤
         │ id (UUID PK)             │
         │ name (TEXT)              │
         │ email (TEXT)             │
         │ phone (TEXT)             │
         │ total_stays (INTEGER)    │  computed/materialized
         │ total_spending (INTEGER) │  computed/materialized
         │ last_visit (DATE)        │  computed/materialized
         │ created_at (TIMESTAMPTZ) │
         │ updated_at (TIMESTAMPTZ) │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │   DISCOUNTS               │
         ├──────────────────────────┤
         │ id (UUID PK)             │
         │ code (TEXT UNIQUE)       │
         │ description (TEXT)       │
         │ type (discount_type)     │  percentage / fixed
         │ amount (INTEGER)         │  percent or centavos
         │ villa_id (TEXT)          │  'all' or specific villa_id
         │ start_date (DATE)        │
         │ end_date (DATE)          │
         │ status (disc_status)     │  active / inactive / expired
         │ usage_count (INTEGER)    │
         │ max_usage (INTEGER)      │
         │ created_at (TIMESTAMPTZ) │
         │ updated_at (TIMESTAMPTZ) │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │   AVAILABILITY            │
         ├──────────────────────────┤
         │ id (UUID PK)             │
         │ villa_id (UUID FK)       │
         │ date (DATE)              │
         │ status (avail_status)    │  available / limited / booked / blocked
         │ price (INTEGER)          │  override price in centavos (nullable)
         │ note (TEXT)              │  admin note (maintenance, etc.)
         │ UNIQUE(villa_id, date)   │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │   SMS_LOG                 │
         ├──────────────────────────┤
         │ id (UUID PK)             │
         │ reservation_id (UUID FK) │
         │ recipient (TEXT)         │  phone number
         │ message (TEXT)           │
         │ template (TEXT)          │  template identifier
         │ status (sms_status)      │  sent / failed / delivered
         │ provider_response (JSONB)│  raw iProg response
         │ sent_at (TIMESTAMPTZ)    │
         │ delivered_at (TIMESTAMPTZ)│
         └──────────────────────────┘

         ┌──────────────────────────┐
         │   SETTINGS (Singleton)    │
         ├──────────────────────────┤
         │ id (INTEGER PK)          │  always 1
         │ business_name (TEXT)     │
         │ tagline (TEXT)           │
         │ address (TEXT)           │
         │ city (TEXT)              │
         │ province (TEXT)          │
         │ zip_code (TEXT)          │
         │ phone (TEXT)             │
         │ email (TEXT)             │
         │ facebook (TEXT)          │
         │ instagram (TEXT)         │
         │ website (TEXT)           │
         │ sms_api_key (TEXT)       │  encrypted
         │ sms_sender_id (TEXT)     │
         │ notifications (JSONB)    │  {email_on_reservation, sms_on_reservation, ...}
         │ updated_at (TIMESTAMPTZ) │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │   PROFILES (Admin Auth)   │
         ├──────────────────────────┤
         │ id (UUID PK, FK→auth.users)│
         │ full_name (TEXT)         │
         │ avatar_url (TEXT)        │
         │ role (TEXT)              │  'admin' | 'super_admin'
         │ created_at (TIMESTAMPTZ) │
         │ updated_at (TIMESTAMPTZ) │
         └──────────────────────────┘
```

---

## 5. Table Definitions (PostgreSQL / Supabase)

### Enum Types

```sql
CREATE TYPE reservation_status AS ENUM (
  'pending', 'approved', 'awaiting_payment', 'payment_submitted',
  'confirmed', 'completed', 'cancelled', 'declined', 'expired'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'submitted', 'verified', 'rejected'
);

CREATE TYPE villa_status AS ENUM (
  'active', 'maintenance', 'inactive'
);

CREATE TYPE discount_status AS ENUM (
  'active', 'inactive', 'expired'
);

CREATE TYPE discount_type AS ENUM (
  'percentage', 'fixed'
);

CREATE TYPE availability_status AS ENUM (
  'available', 'limited', 'booked', 'blocked'
);

CREATE TYPE sms_status AS ENUM (
  'queued', 'sent', 'delivered', 'failed'
);
```

### Tables

```sql
CREATE TABLE villas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL DEFAULT '',
  base_rate     INTEGER NOT NULL,  -- in centavos (e.g., 2500000 = ₱25,000)
  max_guests    INTEGER NOT NULL,
  capacity      INTEGER NOT NULL DEFAULT 0,
  bedrooms      JSONB DEFAULT '[]'::jsonb,
  amenities     TEXT[] DEFAULT '{}',
  status        villa_status NOT NULL DEFAULT 'active',
  image         TEXT NOT NULL DEFAULT '',
  gallery       TEXT[] DEFAULT '{}',
  party_fee     INTEGER NOT NULL DEFAULT 500000,
  check_in_time TIME NOT NULL DEFAULT '14:00:00',
  check_out_time TIME NOT NULL DEFAULT '11:00:00',
  stay_hours    INTEGER NOT NULL DEFAULT 21,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reservations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name          TEXT NOT NULL,
  guest_email         TEXT NOT NULL,
  guest_phone         TEXT NOT NULL,
  villa_id            UUID NOT NULL REFERENCES villas(id) ON DELETE RESTRICT,
  check_in            DATE NOT NULL,
  check_out           DATE NOT NULL,
  guests              JSONB NOT NULL DEFAULT '{"adults":2,"children":0,"infants":0,"pets":0}'::jsonb,
  status              reservation_status NOT NULL DEFAULT 'pending',
  base_rate           INTEGER NOT NULL DEFAULT 0,
  party_fee           INTEGER NOT NULL DEFAULT 0,
  discount            INTEGER NOT NULL DEFAULT 0,
  total_amount        INTEGER NOT NULL DEFAULT 0,
  amount_due          INTEGER NOT NULL DEFAULT 0,
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  payment_deadline    DATE,
  confirmation_number TEXT,
  special_requests    TEXT NOT NULL DEFAULT '',
  message             TEXT NOT NULL DEFAULT '',
  approval_date       TIMESTAMPTZ,
  payment_date        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  pets_over_2         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for reservation queries
CREATE INDEX idx_reservations_villa_id ON reservations(villa_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_check_in ON reservations(check_in);
CREATE INDEX idx_reservations_check_out ON reservations(check_out);
CREATE INDEX idx_reservations_guest_email ON reservations(guest_email);
CREATE INDEX idx_reservations_guest_phone ON reservations(guest_phone);
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);

-- Prevent double-booking: no overlapping reservations for same villa
-- (excluding cancelled/declined/expired)
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE INDEX idx_reservations_no_overlap
  ON reservations(villa_id, check_in, check_out)
  WHERE status NOT IN ('cancelled', 'declined', 'expired');

CREATE TABLE guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  total_stays     INTEGER NOT NULL DEFAULT 0,
  total_spending  INTEGER NOT NULL DEFAULT 0,
  last_visit      DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_phone ON guests(phone);

CREATE TABLE discounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL DEFAULT '',
  type          discount_type NOT NULL DEFAULT 'fixed',
  amount        INTEGER NOT NULL DEFAULT 0,
  villa_id      TEXT NOT NULL DEFAULT 'all',
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        discount_status NOT NULL DEFAULT 'active',
  usage_count   INTEGER NOT NULL DEFAULT 0,
  max_usage     INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE availability (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id  UUID NOT NULL REFERENCES villas(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  status    availability_status NOT NULL DEFAULT 'available',
  price     INTEGER,  -- override price in centavos (nullable)
  note      TEXT NOT NULL DEFAULT '',
  UNIQUE(villa_id, date)
);

CREATE INDEX idx_availability_villa_date ON availability(villa_id, date);

CREATE TABLE sms_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id    UUID REFERENCES reservations(id) ON DELETE SET NULL,
  recipient         TEXT NOT NULL,
  message           TEXT NOT NULL,
  template          TEXT NOT NULL DEFAULT '',
  status            sms_status NOT NULL DEFAULT 'queued',
  provider_response JSONB DEFAULT '{}'::jsonb,
  sent_at           TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sms_log_reservation ON sms_log(reservation_id);
CREATE INDEX idx_sms_log_created ON sms_log(created_at DESC);

CREATE TABLE settings (
  id              INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton
  business_name   TEXT NOT NULL DEFAULT 'KRiB Beverly Place',
  tagline         TEXT NOT NULL DEFAULT '',
  address         TEXT NOT NULL DEFAULT '',
  city            TEXT NOT NULL DEFAULT '',
  province        TEXT NOT NULL DEFAULT '',
  zip_code        TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  facebook        TEXT NOT NULL DEFAULT '',
  instagram       TEXT NOT NULL DEFAULT '',
  website         TEXT NOT NULL DEFAULT '',
  sms_api_key     TEXT NOT NULL DEFAULT '',  -- encrypted at application level
  sms_sender_id   TEXT NOT NULL DEFAULT '',
  notifications   JSONB NOT NULL DEFAULT '{
    "sms_on_reservation": true,
    "sms_on_approval": true,
    "sms_on_confirmation": true,
    "sms_on_cancellation": true,
    "daily_report": false
  }'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed villas
INSERT INTO villas (id, name, slug, description, base_rate, max_guests, capacity, party_fee)
VALUES
  (gen_random_uuid(), 'KRiB 1', 'krib-1', 'A warm and inviting home designed for families...', 2500000, 20, 20, 500000),
  (gen_random_uuid(), 'KRiB 2', 'krib-2', 'A spacious haven where celebrations come to life...', 3000000, 30, 30, 500000);

-- Seed default settings
INSERT INTO settings (id) VALUES (1);
```

### Row-Level Security (RLS) Policies

```sql
-- Admin profiles table
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE villas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL security;

-- Public: can read villas, availability, discounts (active only)
CREATE POLICY "Public can read active villas" ON villas FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read availability" ON availability FOR SELECT USING (true);
CREATE POLICY "Public can read active discounts" ON discounts FOR SELECT USING (status = 'active');

-- Public: can INSERT reservations (guest booking)
CREATE POLICY "Anyone can create reservation" ON reservations
  FOR INSERT WITH CHECK (true);

-- Public: can SELECT own reservation (by email match)
CREATE POLICY "Guest can read own reservation" ON reservations
  FOR SELECT USING (guest_email = current_setting('app.guest_email', true));

-- Admin: full CRUD on all tables (authenticated)
CREATE POLICY "Admin full access" ON villas FOR ALL USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Admin full access" ON reservations FOR ALL USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Admin full access" ON guests FOR ALL USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Admin full access" ON discounts FOR ALL USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Admin full access" ON availability FOR ALL USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Admin full access" ON sms_log FOR ALL USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Admin full access" ON settings FOR ALL USING (
  auth.role() = 'authenticated'
);
```

---

## 6. API Specifications (Supabase REST / Edge Functions)

### Public Endpoints (no auth)

| Method | Path | Purpose | Source |
|--------|------|---------|--------|
| GET | `/rest/v1/villas?status=eq.active` | List active villas | `data.ts` → `villas` |
| GET | `/rest/v1/villas?slug=eq.{slug}` | Single villa details | `VillaDetailPage` |
| GET | `/rest/v1/availability?villa_id=eq.{id}` | Villa availability | `AvailabilityCalendar` |
| GET | `/rest/v1/discounts?status=eq.active` | Active promo codes | `Discounts` page validation |
| POST | `/rest/v1/reservations` | Create reservation | `BookingExperience` submit |
| GET | `/rest/v1/reservations?guest_email=eq.{email}` | Lookup own reservations | `MyReservationPage` |
| GET | `/rest/v1/reservations?id=eq.{id}&guest_email=eq.{email}` | Single reservation lookup | `MyReservationPage` |

### Admin Endpoints (JWT auth required)

| Method | Path | Purpose | Source |
|--------|------|---------|--------|
| GET | `/rest/v1/reservations?order=created_at.desc` | All reservations | `Reservations.tsx` |
| GET | `/rest/v1/reservations?id=eq.{id}` | Reservation detail | `ReservationDetail.tsx` |
| PATCH | `/rest/v1/reservations?id=eq.{id}` | Update status / data | Status transitions |
| GET | `/rest/v1/villas` | All villas (incl. inactive) | `Villas.tsx`, filters |
| PATCH | `/rest/v1/villas?id=eq.{id}` | Update villa | `Villas.tsx` |
| GET | `/rest/v1/guests` | All guests | `Guests.tsx` |
| POST | `/rest/v1/guests` | Create guest record | Auto on reservation |
| GET | `/rest/v1/discounts` | All discounts | `Discounts.tsx` |
| POST/PATCH | `/rest/v1/discounts` | CRUD discounts | `Discounts.tsx` |
| GET | `/rest/v1/settings?id=eq.1` | Business settings | `Settings.tsx` |
| PATCH | `/rest/v1/settings?id=eq.1` | Update settings | `Settings.tsx` |
| GET | `/rest/v1/sms_log?order=created_at.desc` | SMS history | `SmsActivity.tsx` |
| GET | `/rest/v1/availability` | All availability | `Calendar.tsx` |
| POST/PATCH | `/rest/v1/availability` | Block dates | `Calendar.tsx` |

### Edge Functions (Supabase Functions)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `approve-reservation` | Admin PATCH → `approved` | Set approval_date, generate confirmation number, compute payment_deadline, send SMS |
| `decline-reservation` | Admin PATCH → `declined` | Send decline SMS |
| `confirm-payment` | Admin PATCH → `confirmed` | Set payment_date, send confirmation SMS |
| `cancel-reservation` | Admin PATCH → `cancelled` | Set cancelled_at, send cancellation SMS |
| `check-expired` | cron (daily) | Auto-expire reservations past payment_deadline |
| `auto-complete` | cron (daily) | Auto-transition confirmed → completed for past check_out |
| `send-sms` | Internal | Wrapper for iProg SMS API call |
| `lookup-reservation` | Public | Lookup by ID + email (returns status, dates) |
| `dashboard-stats` | Admin | Aggregated dashboard statistics |

---

## 7. Authentication Flow

### Admin Authentication (Supabase Auth)
1. Admin navigates to `/admin` — if not authenticated, redirect to Supabase-hosted Auth UI
2. Admin signs in with email/password (Supabase Auth)
3. JWT token stored in `localStorage` by Supabase client library
4. RLS policies enforce authenticated access on all admin tables
5. Session refresh handled automatically by `@supabase/supabase-js`

### Guest "Authentication" (No accounts)
- Guests do NOT create accounts
- Reservations are looked up via ID + email pair
- Guest identity is their `guest_email` field
- For SMS notification, `guest_phone` is used as the recipient

### Auth Configuration
- **Provider:** Email/Password only (no social logins needed)
- **Session length:** 7 days (default)
- **Admin user creation:** Manual via Supabase dashboard or CLI (`supabase seed`)
- **No sign-up page** — admin accounts created server-side only

---

## 8. Authorization Matrix

| Action | Guest (public) | Admin (authenticated) |
|--------|---------------|----------------------|
| View villas | ✅ (active only) | ✅ (all) |
| View availability | ✅ | ✅ |
| Create reservation | ✅ | ✅ |
| View own reservation | ✅ (by email) | ✅ (all) |
| Update own reservation | ❌ | ✅ |
| Cancel own reservation | ❌ (contact admin) | ✅ |
| View all reservations | ❌ | ✅ |
| Update reservation status | ❌ | ✅ |
| Manage villas | ❌ | ✅ |
| Manage guests | ❌ | ✅ |
| Manage discounts | ❌ | ✅ |
| View SMS log | ❌ | ✅ |
| Update settings | ❌ | ✅ |
| Block dates | ❌ | ✅ |
| View dashboard stats | ❌ | ✅ |

---

## 9. Validation Rules

### Reservation Creation Validation (Application + Database)

```typescript
// Frontend validation (BookingExperience.tsx - Step 3)
fullName: required, non-empty
email: required, valid email format (/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
phone: required, valid PH format (/^[\d\s+\-()]{7,20}$/)
agreed: must be true (house rules agreement)
selectedDate: required (Step 1)
```

### Business Rules (Database constraints + application)

```typescript
// Guest limits
adults >= 1
adults + children <= villa.maxGuests
pets <= 10
infants: no limit (don't count toward occupancy)

// Date rules
checkIn >= today
checkOut = checkIn + 21 hours (frontend computes)
no overlapping active reservation for same villa

// Pricing
totalAmount = baseRate + partyFee - discount
amountDue = totalAmount / 2 (50% down payment convention)
paymentDeadline = min(approvalDate + 7 days, checkIn - 3 days)

// Discount validation
discount.code must exist in discounts table
discount.status = 'active'
discount.start_date <= today <= discount.end_date
discount.usage_count < discount.max_usage
if discount.villa_id != 'all', must match reservation.villa_id
```

### Database-Level Validation

```sql
-- CHECK constraint example for guests JSONB
ALTER TABLE reservations ADD CONSTRAINT guests_structure CHECK (
  guests ? 'adults' AND guests ? 'children' AND
  guests ? 'infants' AND guests ? 'pets'
);

-- Ensure check_out > check_in
ALTER TABLE reservations ADD CONSTRAINT date_order CHECK (check_out > check_in);
```

---

## 10. SMS Architecture (iProg SMS)

### Templates

| Template ID | Trigger | Variables | Content |
|-------------|---------|-----------|---------|
| `reservation_received` | Guest submits | `{name, villa, date}` | "Hi {name}, we received your reservation for {villa} on {date}. We'll review and get back to you soon." |
| `reservation_approved` | Admin approves | `{name, villa, date, amount, deadline}` | "Great news {name}! Your reservation for {villa} on {date} is approved. Please pay {amount} by {deadline} to confirm." |
| `reservation_declined` | Admin declines | `{name, villa, date}` | "Hi {name}, unfortunately your requested dates for {villa} are not available. We'd love to host you another time." |
| `payment_verified` | Payment confirmed | `{name, villa, date, confirmation}` | "You're all set {name}! Your {villa} reservation for {date} is confirmed. Code: {confirmation}. See you soon!" |
| `reservation_cancelled` | Cancellation | `{name, villa, date}` | "Hi {name}, your reservation for {villa} on {date} has been cancelled. Contact us if you have questions." |
| `payment_reminder` | 2 days before deadline | `{name, amount, deadline}` | "Reminder: Your down payment of {amount} for KRiB is due by {deadline}. Pay on time to secure your dates." |

### SMS Flow

```
1. Guest submits reservation
   → INSERT reservations (status: pending)
   → NOT triggered yet (waiting approval)

2. Admin approves
   → UPDATE status → 'approved'
   → Edge Function: send "reservation_approved" SMS
   → INSERT sms_log

3. Admin confirms payment
   → UPDATE status → 'confirmed'
   → Edge Function: send "payment_verified" SMS
   → INSERT sms_log

4. Admin declines
   → UPDATE status → 'declined'
   → Edge Function: send "reservation_declined" SMS
   → INSERT sms_log

5. Admin cancels
   → UPDATE status → 'cancelled'
   → Edge Function: send "reservation_cancelled" SMS (if guest-facing)
   → INSERT sms_log

6. Cron: daily check
   → SELECT reservations WHERE payment_deadline = tomorrow AND status = 'awaiting_payment'
   → send "payment_reminder" SMS
```

### iProg SMS Integration

```typescript
// Edge Function: send-sms
interface SmsPayload {
  recipient: string;   // PH mobile number
  message: string;
}

// POST to iProg SMS API
const response = await fetch('https://gateway.iprog.com/sms/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${smsApiKey}`,
  },
  body: JSON.stringify({
    sender_id: smsSenderId,
    recipient: payload.recipient,
    message: payload.message,
  }),
});
```

---

## 11. Security Recommendations

### API Security
- All Supabase requests use HTTPS
- RLS policies enforce row-level access on every table
- Supabase JWT tokens expire and auto-refresh
- Rate limiting on POST `/reservations` (max 5 per email per day)
- CORS restrict to production domain only

### Sensitive Data
- `sms_api_key` in `settings` table encrypted at application level
- Guest emails and phone numbers accessible only via authenticated admin endpoints
- No guest passwords — no password storage needed

### Validation
- Input sanitization on all user-submitted text (message, special_requests)
- Phone numbers validated for PH format (+63 prefix)
- Email format validation on both client and server

### Admin Access
- Only manually created admin accounts (no public sign-up)
- Session timeout for admin dashboard
- Audit trail via `sms_log` and reservation `updated_at`

---

## 12. Performance Recommendations

### Indexes
- `reservations(villa_id, check_in, check_out)` — overlap detection
- `reservations(status, check_in)` — dashboard queries
- `reservations(guest_email)` — guest lookup
- `availability(villa_id, date)` — calendar queries
- `sms_log(created_at DESC)` — SMS activity timeline

### Query Patterns
- Dashboard stats: aggregate queries on `reservations` with status + date filters
- Calendar: query `reservations` and `availability` for date range
- Guest list: full scan with search (use `ILIKE` on name/email/phone)
- Reservation lookup by ID+email: index scan on `id` + `guest_email`

### Caching Strategy
- **Villa data:** Cache in application (changes rarely) — SWR/React Query with `staleTime: 10min`
- **Availability:** Cache per villa/month with `staleTime: 1min`
- **Admin reservations:** No cache (live data)
- **Settings:** Cache in application with `staleTime: 5min`

### Supabase-Specific
- Use `.maybeSingle()` instead of `.single()` where row may not exist
- Use `select(*, count)` for paginated responses
- Enable Realtime on `reservations` table for live admin updates (optional)

---

## 13. Data Migration Plan

### Phase 1: Schema
1. Create enums in Supabase
2. Create all tables with RLS
3. Create indexes
4. Seed `villas` (2 rows) and `settings` (1 row)

### Phase 2: Auth
5. Create admin user via Supabase dashboard
6. Insert profile row for admin user
7. Set up Supabase Auth UI for admin login

### Phase 3: Client Integration
8. Install `@supabase/supabase-js` in frontend
9. Create `src/lib/supabase.ts` client
10. Replace `mockData.ts` imports with Supabase queries

### Phase 4: Public Pages
11. `data.ts` → Supabase queries for villas
12. `AvailabilityCalendar.tsx` → Supabase `availability` table
13. `BookingExperience.tsx` submit → Supabase INSERT
14. `MyReservationPage.tsx` → Supabase SELECT by ID + email

### Phase 5: Admin Pages
15. Create `src/admin/lib/supabase-admin.ts` (authenticated client)
16. Replace mock data in all admin pages
17. Admin login page / Supabase Auth integration

### Phase 6: SMS
18. Create Edge Function `send-sms` with iProg integration
19. Create Edge Functions for each status transition
20. Set up daily cron for expiry and reminder checks

---

## 14. Supabase Client Layer

### Public Client (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Guest reservation lookup helper
export async function lookupReservation(id: string, email: string) {
  const { data } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .eq('guest_email', email)
    .maybeSingle()
  return data
}
```

### Admin Client (`src/lib/supabase-admin.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

// Service role client for admin operations (or use anon + RLS with auth)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

**Note:** Prefer anon key + RLS authentication for admin pages (admin logs in, JWT handles RLS). Only use service key for Edge Functions and server-side operations.

---

## 15. Dashboard Statistics Query

```typescript
// Edge Function or direct query for dashboard-stats
async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]

  const { data: stats } = await supabase.rpc('get_dashboard_stats')

  return {
    totalReservations: stats.total_reservations,
    pendingReservations: stats.pending_reservations,
    todayCheckins: stats.today_checkins,
    todayCheckouts: stats.today_checkouts,
    occupancyRate: stats.occupancy_rate,
    confirmedUpcoming: stats.confirmed_upcoming,
    recentlyApproved: stats.recently_approved,
    totalGuests: stats.total_guests,
  }
}
```

```sql
-- PostgreSQL function for dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'total_reservations', (SELECT count(*) FROM reservations),
    'pending_reservations', (SELECT count(*) FROM reservations WHERE status = 'pending'),
    'today_checkins', (SELECT count(*) FROM reservations WHERE check_in = CURRENT_DATE AND status IN ('approved', 'awaiting_payment', 'payment_submitted', 'confirmed')),
    'today_checkouts', (SELECT count(*) FROM reservations WHERE check_out = CURRENT_DATE AND status IN ('confirmed', 'completed')),
    'occupancy_rate', (SELECT CASE WHEN count(*) > 0 THEN round((count(*) FILTER (WHERE status IN ('confirmed', 'completed'))::numeric / count(*) * 100), 0) ELSE 0 END FROM reservations WHERE check_in <= CURRENT_DATE AND check_out >= CURRENT_DATE),
    'confirmed_upcoming', (SELECT count(*) FROM reservations WHERE check_in > CURRENT_DATE AND status IN ('confirmed', 'approved')),
    'recently_approved', (SELECT count(*) FROM reservations WHERE approval_date >= CURRENT_DATE - INTERVAL '7 days'),
    'total_guests', (SELECT count(*) FROM guests)
  );
$$;
```

---

## 16. Occupancy & Calendar Logic

```sql
-- Get occupancy for a date range
CREATE OR REPLACE FUNCTION get_occupancy(start_date DATE, end_date DATE)
RETURNS TABLE (
  date DATE,
  occupied_krib1 INTEGER,
  occupied_krib2 INTEGER,
  total_guests INTEGER
)
LANGUAGE sql
STABLE
AS $$
  WITH date_series AS (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::DATE AS d
  ),
  active_reservations AS (
    SELECT * FROM reservations
    WHERE status NOT IN ('cancelled', 'declined', 'expired')
  )
  SELECT
    d.d,
    COUNT(DISTINCT r1.id) FILTER (WHERE r1.villa_id = (SELECT id FROM villas WHERE slug = 'krib-1')),
    COUNT(DISTINCT r2.id) FILTER (WHERE r2.villa_id = (SELECT id FROM villas WHERE slug = 'krib-2')),
    COALESCE(SUM((r1.guests->>'adults')::int + (r1.guests->>'children')::int), 0)
  FROM date_series d
  LEFT JOIN active_reservations r1 ON r1.check_in <= d.d AND r1.check_out > d.d
  GROUP BY d.d
  ORDER BY d.d;
$$;
```

---

## 17. File-by-File Data Migration Map

| File | Current Data Source | Target Supabase Table | Notes |
|------|-------------------|----------------------|-------|
| `src/lib/data.ts` | Static arrays | `villas` | Replace `villas` array with Supabase query |
| `src/lib/reservationData.ts` | `mockReservations` + localStorage | `reservations` | Replace all lookup functions |
| `src/lib/images.ts` | Static imports (Unchanged) | — | Images stay as static assets |
| `src/admin/data/mockData.ts` | All mock arrays | All tables | Entire file replaced |
| `src/admin/services/calendarService.ts` | In-memory array | `reservations` | Replace with Supabase queries |
| `src/components/ui/BookingExperience.tsx` | localStorage | `reservations` INSERT | Submit to Supabase |
| `src/components/ui/MyReservationPage.tsx` | `lookupReservation` (mock) | `reservations` SELECT | Replace lookup function |
| `src/components/ui/AvailabilityCalendar.tsx` | `generateMockAvailability()` | `availability` | Replace mock generator |
| All admin pages | `mockData.ts` imports | Direct Supabase queries | One-by-one replacement |

---

## 18. Environment Variables

```env
# Public (Vite prefix)
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Admin (Vite prefix, used only in admin context)
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...

# SMS Provider (server-side only)
IPROG_SMS_API_URL=https://gateway.iprog.com/sms/send
IPROG_SMS_API_KEY=
IPROG_SMS_SENDER_ID=KRiB
```

---

## 19. Generate Reservation ID / Confirmation Number

```sql
-- Current frontend format: KRIB-YYYYMMDD-XXXXXX (6 alphanumeric chars)
-- Example: KRIB-20260715-8F3XK2

CREATE OR REPLACE FUNCTION generate_confirmation_number()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 'KRIB-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' ||
    upper(substr(md5(random()::text), 1, 6));
$$;

-- Usage in Edge Function on approval:
-- UPDATE reservations SET confirmation_number = generate_confirmation_number()
-- WHERE id = target_id AND status = 'approved';
```

---

## 20. Implementation Order (Recommended)

### Week 1: Foundation
1. Set up Supabase project
2. Create all tables, enums, indexes, RLS policies
3. Seed villas and settings data
4. Set up Supabase Auth (admin user)
5. Create `src/lib/supabase.ts` and `src/lib/supabase-admin.ts`

### Week 2: Public Site Integration
6. Replace villa data in `data.ts` with Supabase queries
7. Replace availability calendar with `availability` table
8. Wire BookingExperience submit to Supabase INSERT
9. Wire MyReservationPage lookup to Supabase SELECT
10. Remove `generateMockAvailability()` from `data.ts`

### Week 3: Admin Integration
11. Create admin login flow with Supabase Auth UI
12. Replace Reservations page (list + detail)
13. Replace Calendar page
14. Replace Guests page
15. Replace Villas page

### Week 4: Remaining Admin + SMS
16. Replace Discounts page
17. Replace Settings page
18. Create Edge Functions for status transitions
19. Integrate iProg SMS (send-sms function + SMS templates)
20. Set up cron jobs (expiry check, payment reminders, auto-complete)
21. Remove all mock data files and services
22. Create SMS Activity page (read from `sms_log`)

### Week 5: Polish & Testing
23. Test full reservation lifecycle end-to-end
24. Test all 9 reservation status transitions
25. Test SMS delivery
26. Test RLS policies (public vs admin access)
27. Build verification (`npx tsc --noEmit` + `npx vite build`)
28. Deploy

---

**End of Report.** This document serves as the authoritative blueprint for the KRiB Beverly Place backend implementation. All architectural decisions, schema designs, API contracts, and business rules are captured above.
