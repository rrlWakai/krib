# KRiB Beverly Place — Database Schema

**Date:** 2026-07-31 | **Engine:** PostgreSQL 17 (Supabase) | **Timezone:** Asia/Manila

---

## Entity-Relationship Diagram

```
┌─────────────────────┐       ┌──────────────────────────┐
│       villas        │       │     villa_amenities       │
├─────────────────────┤       ├──────────────────────────┤
│ id (PK)             │◄──────│ villa_id (FK)            │
│ name                │ 1:N   │ label                    │
│ slug (UQ)           │       │ icon                     │
│ description         │       │ sort_order               │
│ base_price          │       └──────────────────────────┘
│ max_guests          │
│ is_active           │       ┌──────────────────────────┐
│ created_at          │       │     gallery_images        │
│ updated_at          │       ├──────────────────────────┤
└─────────────────────┘       │ villa_id (FK)            │
        │                     │ storage_path             │
        │ 1:N                 │ alt_text                 │
        ▼                     │ sort_order               │
┌─────────────────────┐       │ created_at               │
│    reservations     │       └──────────────────────────┘
├─────────────────────┤
│ id (PK)             │       ┌──────────────────────────┐
│ reference_code (UQ) │       │        guests             │
│ villa_id (FK)       │       ├──────────────────────────┤
│ guest_id (FK)       │       │ full_name                │
│ check_in            │       │ email (CITEXT, UQ)       │
│ check_out           │       │ phone                    │
│ guest_count         │       │ created_at               │
│ status (ENUM)       │       └──────────────────────────┘
│ special_requests    │
│ terms_accepted      │       ┌──────────────────────────┐
│ stay_range (GEN)    │       │       sms_logs            │
│ created_at          │       ├──────────────────────────┤
│ updated_at          │       │ reservation_id (FK)      │
│ approved_at         │       │ recipient                │
│ approved_by (FK)    │       │ message                  │
│ declined_at         │       │ direction (ENUM)         │
│ declined_by (FK)    │       │ status (ENUM)            │
│ cancelled_at        │       │ provider_message_id      │
│ cancelled_by (FK)   │       │ error_message            │
│ completed_at        │       │ created_at               │
└─────────────────────┘       └──────────────────────────┘
        │
        ▼
┌─────────────────────┐       ┌──────────────────────────┐
│    admin_users      │       │      audit_logs           │
├─────────────────────┤       ├──────────────────────────┤
│ auth_user_id (UQ)   │       │ actor                    │
│ full_name           │       │ action                   │
│ role (ENUM)         │       │ entity                   │
│ is_active           │       │ entity_id                │
│ created_at          │       │ metadata (JSONB)         │
└─────────────────────┘       │ created_at               │
                              └──────────────────────────┘
```

---

## Tables

### 1. `villas`

Core product entity. Each row represents bookable villa.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `name` | `TEXT` | `NOT NULL` | Display name of the villa |
| `slug` | `TEXT` | `NOT NULL` `UNIQUE` | URL-friendly identifier (e.g. `sunset-villa`) |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | Rich text description |
| `base_price` | `NUMERIC(10,2)` | `NOT NULL` `CHECK (base_price >= 0)` | Price per night in PHP |
| `max_guests` | `INTEGER` | `NOT NULL` `CHECK (max_guests > 0)` | Maximum occupancy |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | Soft-delete / visibility toggle |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row last-update timestamp |

**Relationships:** 1:N with `villa_amenities`, `gallery_images`, `reservations`

---

### 2. `villa_amenities`

Amenities associated with a specific villa.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `villa_id` | `UUID` | `NOT NULL` `FK → villas(id) ON DELETE CASCADE` | Parent villa |
| `label` | `TEXT` | `NOT NULL` | Display label (e.g. "WiFi", "Pool") |
| `icon` | `TEXT` | `NOT NULL DEFAULT ''` | Icon identifier for UI rendering |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` | Display ordering |

**Indexes:** `(villa_id, sort_order)`

---

### 3. `admin_users`

Maps Supabase Auth users (`auth.users`) to application-level admin roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `auth_user_id` | `UUID` | `NOT NULL` `UNIQUE` | Supabase Auth user ID (no FK — cross-schema) |
| `full_name` | `TEXT` | `NOT NULL` | Display name |
| `role` | `admin_role` | `NOT NULL DEFAULT 'staff'` | `owner` or `staff` |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | Admin account toggle |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row creation timestamp |

**Relationships:** Referenced by `reservations.(approved_by | declined_by | cancelled_by)`

---

### 4. `guests`

Guests who submit reservation requests. Not authenticated users — stored separately for audit and CRM.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `full_name` | `TEXT` | `NOT NULL` | Guest's full name |
| `email` | `CITEXT` | `NOT NULL` `UNIQUE` | Case-insensitive unique email |
| `phone` | `TEXT` | `NOT NULL DEFAULT ''` | Contact phone number |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row creation timestamp |

**Relationships:** 1:N with `reservations`

**Indexes:** `email`, `phone`

---

### 5. `reservations`

Core booking table. Uses a generated `daterange` column and GiST exclusion constraint for double-booking prevention.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `reference_code` | `TEXT` | `NOT NULL` `UNIQUE` | Human-readable booking code (auto-generated: `KRB-XXXXXXX`) |
| `villa_id` | `UUID` | `NOT NULL` `FK → villas(id)` | Booked villa |
| `guest_id` | `UUID` | `NOT NULL` `FK → guests(id)` | Booking guest |
| `check_in` | `DATE` | `NOT NULL` | Arrival date |
| `check_out` | `DATE` | `NOT NULL` | Departure date |
| `guest_count` | `INTEGER` | `NOT NULL` `CHECK (guest_count > 0)` | Number of guests staying |
| `status` | `reservation_status` | `NOT NULL DEFAULT 'pending'` | Booking lifecycle status |
| `special_requests` | `TEXT` | `NOT NULL DEFAULT ''` | Guest special requests |
| `terms_accepted` | `BOOLEAN` | `NOT NULL DEFAULT false` `CHECK (terms_accepted = true)` | Terms acceptance |
| `stay_range` | `daterange` | `GENERATED ALWAYS AS (daterange(check_in, check_out)) STORED` | Auto-computed date range for exclusion |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row last-update timestamp |
| `approved_at` | `TIMESTAMPTZ` | `NULL` | Approval timestamp |
| `approved_by` | `UUID` | `NULL` `FK → admin_users(id)` | Approving admin |
| `declined_at` | `TIMESTAMPTZ` | `NULL` | Decline timestamp |
| `declined_by` | `UUID` | `NULL` `FK → admin_users(id)` | Declining admin |
| `cancelled_at` | `TIMESTAMPTZ` | `NULL` | Cancellation timestamp |
| `cancelled_by` | `UUID` | `NULL` `FK → admin_users(id)` | Cancelling admin |
| `completed_at` | `TIMESTAMPTZ` | `NULL` | Completion timestamp |

**CHECK constraints:**
- `check_out > check_in`
- `guest_count > 0`
- `terms_accepted = true`

**Exclusion constraint (double-booking):**
- `EXCLUDE USING GIST (villa_id WITH =, stay_range WITH &&) WHERE (status IN ('pending', 'approved'))`
- Prevents overlapping stays for same villa when existing booking is active
- Cancelled/declined bookings never block dates

**Indexes:** `villa_id`, `status`, `stay_range` (GiST), `guest_id`, `reference_code`, `check_in`

---

### 6. `gallery_images`

References to images in the `villa-gallery` storage bucket. No versioning — one row per storage object.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `villa_id` | `UUID` | `NOT NULL` `FK → villas(id) ON DELETE CASCADE` | Parent villa |
| `storage_path` | `TEXT` | `NOT NULL` | Path in Supabase Storage bucket |
| `alt_text` | `TEXT` | `NOT NULL DEFAULT ''` | Accessibility alt text |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` | Display ordering |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row creation timestamp |

**Indexes:** `(villa_id, sort_order)`

---

### 7. `sms_logs`

Immutable audit trail for every outbound SMS.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `reservation_id` | `UUID` | `NOT NULL` `FK → reservations(id)` | Related reservation |
| `recipient` | `TEXT` | `NOT NULL` | SMS destination number |
| `message` | `TEXT` | `NOT NULL` | SMS body content |
| `direction` | `sms_direction` | `NOT NULL` | `outbound_auto` or `outbound_manual` |
| `status` | `sms_status` | `NOT NULL DEFAULT 'queued'` | `queued`, `sent`, or `failed` |
| `provider_message_id` | `TEXT` | `NOT NULL DEFAULT ''` | SMS provider reference ID |
| `error_message` | `TEXT` | `NOT NULL DEFAULT ''` | Error details (if failed) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row creation timestamp |

**Indexes:** `reservation_id`, `status`, `created_at`

---

### 8. `audit_logs`

Immutable log of every admin action for security and compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK` `DEFAULT gen_random_uuid()` | Auto-generated unique identifier |
| `actor` | `UUID` | `NOT NULL` | `auth.uid()` of the admin who performed the action |
| `action` | `TEXT` | `NOT NULL` | Action name (e.g. `reservation.approve`) |
| `entity` | `TEXT` | `NOT NULL` | Entity type (e.g. `reservations`) |
| `entity_id` | `UUID` | `NOT NULL` | ID of the affected row |
| `metadata` | `JSONB` | `NOT NULL DEFAULT '{}'` | Arbitrary structured context |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Row creation timestamp |

**Indexes:** `entity_id`, `action`, `created_at`

---

## Enums

| Enum | Values | Used By |
|------|--------|---------|
| `reservation_status` | `pending`, `approved`, `declined`, `cancelled`, `completed` | `reservations.status` |
| `admin_role` | `owner`, `staff` | `admin_users.role` |
| `sms_status` | `queued`, `sent`, `failed` | `sms_logs.status` |
| `sms_direction` | `outbound_auto`, `outbound_manual` | `sms_logs.direction` |

---

## Triggers

### `update_updated_at_column`

- **Function:** `update_updated_at_column()`
- **Fires:** `BEFORE UPDATE` on `villas`, `reservations`
- **Action:** Sets `updated_at = now()` on every row update

### `generate_reference_code`

- **Function:** `generate_reference_code()`
- **Fires:** `BEFORE INSERT` on `reservations` (only when `reference_code` is NULL or empty)
- **Action:** Generates `KRB-XXXXXXX` format code using `md5(gen_random_uuid())`

### `is_admin` (helper function)

- **Function:** `is_admin()` — `STABLE SECURITY DEFINER`
- **Returns:** `BOOLEAN`
- **Logic:** Returns `true` if `auth.uid()` exists in `admin_users` with `is_active = true`
- **Used by:** All admin RLS policies

---

## Row-Level Security

Policies are applied in two tiers:

### Public Policies

| Table | Policy | Action | Condition |
|-------|--------|--------|-----------|
| `villas` | `Public can view active villas` | `SELECT` | `is_active = true` |
| `villa_amenities` | `Public can view villa amenities` | `SELECT` | Always |
| `gallery_images` | `Public can view gallery images` | `SELECT` | Always |

### Admin Policies (all remaining tables)

All tables have an `Admin full access to {table}` policy:

| Clause | Rule |
|--------|------|
| `FOR ALL` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `TO authenticated` | Supabase authenticated users only |
| `USING` | `is_admin()` = true |
| `WITH CHECK` | `is_admin()` = true |

### Tables with RLS enabled

`villas`, `villa_amenities`, `gallery_images`, `guests`, `admin_users`, `reservations`, `sms_logs`, `audit_logs`

### Default deny

- Anonymous users cannot access `guests`, `admin_users`, `reservations`, `sms_logs`, `audit_logs`
- Authenticated non-admin users cannot access any table in write mode
- Unauthenticated (anonymous) users cannot write to any table

---

## Migration Order

```
  # | File                                        | Description
  --+---------------------------------------------+-----------------------------------
  1 | 20260730000001_extensions.sql                | pgcrypto, btree_gist, citext
  2 | 20260730000002_storage.sql                   | storage buckets (villa-gallery, system)
  3 | 20260730000003_bucket_documents.sql          | storage bucket (documents)
  4 | 20260731000001_create_enum_types.sql         | reservation_status, admin_role, sms_status, sms_direction
  5 | 20260731000002_create_villas.sql             | villas, villa_amenities
  6 | 20260731000003_create_admin_users.sql        | admin_users
  7 | 20260731000004_create_guests.sql             | guests
  8 | 20260731000005_create_reservations.sql       | reservations (core table + stay_range)
  9 | 20260731000006_create_gallery.sql            | gallery_images
 10 | 20260731000007_create_sms_logs.sql           | sms_logs
 11 | 20260731000008_create_audit_logs.sql         | audit_logs
 12 | 20260731000009_indexes.sql                   | performance indexes
 13 | 20260731000010_constraints.sql               | double-booking exclusion constraint
 14 | 20260731000011_triggers.sql                  | updated_at, reference_code, is_admin
 15 | 20260731000012_rls.sql                       | row-level security policies
```

---

## Double-Booking Prevention

The `no_overlapping_bookings` exclusion constraint uses `btree_gist`:

```sql
ALTER TABLE reservations
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING GIST (
    villa_id WITH =,
    stay_range WITH &&
  ) WHERE (status IN ('pending', 'approved'));
```

**How it works:**

1. `stay_range` is a generated `daterange` column computed as `[check_in, check_out)` (inclusive of check-in, exclusive of check-out)
2. `villa_id WITH =` ensures the exclusion only applies per villa
3. `stay_range WITH &&` checks for overlapping ranges (PostgreSQL GiST overlap operator)
4. `WHERE (status IN ('pending', 'approved'))` means only active bookings participate — cancelled and declined are excluded
5. When a booking is cancelled, the row no longer matches the `WHERE` clause, so the same dates immediately become available

---

## Performance Notes

- **GiST index** on `stay_range` enables fast overlap queries for calendar availability
- **B-tree indexes** on foreign keys accelerate JOINs from Edge Functions
- **Composite index** `(villa_id, sort_order)` on `villa_amenities` and `gallery_images` covers admin sort-and-filter queries
- **Index on `check_in`** supports date-range lookups
- **Index on `status`** supports admin dashboard filtering
- **Index on `email`** and `phone` on `guests` supports CRM-style lookup

---

## TypeScript Types

Generated types are in `src/types/generated/database.ts`. Application-specific types:

```typescript
import type { Tables, TablesInsert } from '../generated/database'

type Reservation = Tables<'reservations'>
type ReservationInsert = Omit<TablesInsert<'reservations'>, 'reference_code'>
```

Re-exported from `src/types/app/reservation.ts` and `src/types/app/index.ts`.

---

## Regenerating Types

After any schema change:

```bash
supabase gen types typescript > src/types/generated/database.ts
npm run build          # verify compilation
```
