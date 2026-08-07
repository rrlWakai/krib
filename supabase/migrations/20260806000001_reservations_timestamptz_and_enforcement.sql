-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Phase 2: Reservation
-- TIMESTAMPTZ + enforcement layer
-- ──────────────────────────────────────────────
-- Migration 20260806000001
-- Implements locked decisions B3, B4, B5, B6, B11:
--
--   B3  check_in/check_out DATE   → arrival_datetime / checkout_datetime TIMESTAMPTZ
--       stay_range daterange      → tstzrange, GiST exclusion re-applied
--   B4  privacy_accepted required (in addition to terms_accepted)
--   B5  status transitions enforced in PostgreSQL
--   B6  guest_count ≤ villas.max_guests enforced in PostgreSQL
--   B11 reference_code server-generated only (always-overwriting trigger)
--       + format CHECK 'KRB-XXXXXXXX'
-- ──────────────────────────────────────────────

-- ── B3: TIMESTAMPTZ arrival/checkout ─────────
-- Drop dependents before altering columns.
DROP INDEX IF EXISTS idx_reservations_check_in;
DROP INDEX IF EXISTS idx_reservations_stay_range;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS no_overlapping_bookings;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS check_out_after_check_in;

ALTER TABLE reservations
  DROP COLUMN IF EXISTS stay_range,
  DROP COLUMN IF EXISTS check_in,
  DROP COLUMN IF EXISTS check_out;

ALTER TABLE reservations
  ADD COLUMN arrival_datetime  TIMESTAMPTZ NOT NULL,
  ADD COLUMN checkout_datetime TIMESTAMPTZ NOT NULL,
  ADD COLUMN stay_range tstzrange GENERATED ALWAYS AS
    (tstzrange(arrival_datetime, checkout_datetime, '[)')) STORED;

ALTER TABLE reservations
  ADD CONSTRAINT checkout_after_arrival CHECK (checkout_datetime > arrival_datetime);

CREATE INDEX idx_reservations_arrival_datetime ON reservations(arrival_datetime);
CREATE INDEX idx_reservations_stay_range ON reservations USING GIST(stay_range);

-- Double-booking prevention (same predicate as baseline).
ALTER TABLE reservations
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING GIST (
    villa_id WITH =,
    stay_range WITH &&
  ) WHERE (status IN ('pending', 'approved'));

-- ── B4: Privacy consent ──────────────────────
ALTER TABLE reservations
  ADD COLUMN privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD CONSTRAINT privacy_must_be_accepted CHECK (privacy_accepted = true);

-- ── B5: Status transition enforcement ────────
CREATE OR REPLACE FUNCTION enforce_reservation_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  allowed TEXT[];
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE OLD.status
    WHEN 'pending'  THEN ARRAY['approved', 'declined', 'cancelled']
    WHEN 'approved' THEN ARRAY['completed', 'cancelled']
    ELSE ARRAY[]::TEXT[]
  END;

  IF NOT (NEW.status = ANY (allowed)) THEN
    RAISE EXCEPTION 'Invalid reservation status transition: % -> %',
      OLD.status, NEW.status;
  END IF;

  IF NEW.status = 'approved'   AND NEW.approved_at   IS NULL THEN NEW.approved_at   := now(); END IF;
  IF NEW.status = 'declined'   AND NEW.declined_at   IS NULL THEN NEW.declined_at   := now(); END IF;
  IF NEW.status = 'cancelled'  AND NEW.cancelled_at  IS NULL THEN NEW.cancelled_at  := now(); END IF;
  IF NEW.status = 'completed'  AND NEW.completed_at  IS NULL THEN NEW.completed_at  := now(); END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_status_transition ON reservations;
CREATE TRIGGER trg_reservations_status_transition
  BEFORE UPDATE OF status ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_reservation_status_transition();

-- ── B6: Capacity enforcement ─────────────────
CREATE OR REPLACE FUNCTION enforce_reservation_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  capacity INTEGER;
BEGIN
  SELECT max_guests INTO capacity FROM villas WHERE id = NEW.villa_id;
  IF capacity IS NULL THEN
    RAISE EXCEPTION 'Villa does not exist';
  END IF;
  IF NEW.guest_count > capacity THEN
    RAISE EXCEPTION 'Guest count (%) exceeds villa capacity (%)',
      NEW.guest_count, capacity;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_capacity ON reservations;
CREATE TRIGGER trg_reservations_capacity
  BEFORE INSERT OR UPDATE OF villa_id, guest_count ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_reservation_capacity();

-- ── B11: Server-only reference codes ─────────
DROP TRIGGER IF EXISTS trg_reservations_reference_code ON reservations;
CREATE TRIGGER trg_reservations_reference_code
  BEFORE INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION generate_reference_code();

ALTER TABLE reservations
  ADD CONSTRAINT reference_code_format CHECK (reference_code ~ '^KRB-[A-Z0-9]{7}$');

-- ──────────────────────────────────────────────
-- Reversible (reverse order):
-- ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reference_code_format;
-- DROP TRIGGER IF EXISTS trg_reservations_reference_code ON reservations;
-- DROP TRIGGER IF EXISTS trg_reservations_capacity ON reservations;
-- DROP FUNCTION IF EXISTS enforce_reservation_capacity();
-- DROP TRIGGER IF EXISTS trg_reservations_status_transition ON reservations;
-- DROP FUNCTION IF EXISTS enforce_reservation_status_transition();
-- ALTER TABLE reservations DROP CONSTRAINT IF EXISTS privacy_must_be_accepted;
-- ALTER TABLE reservations DROP COLUMN IF EXISTS privacy_accepted;
-- ALTER TABLE reservations DROP CONSTRAINT IF EXISTS no_overlapping_bookings;
-- DROP INDEX IF EXISTS idx_reservations_stay_range;
-- DROP INDEX IF EXISTS idx_reservations_arrival_datetime;
-- ALTER TABLE reservations DROP CONSTRAINT IF EXISTS checkout_after_arrival;
-- ALTER TABLE reservations
--   DROP COLUMN IF EXISTS stay_range,
--   DROP COLUMN IF EXISTS checkout_datetime,
--   DROP COLUMN IF EXISTS arrival_datetime;
-- ──────────────────────────────────────────────
