-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Phase 5: Reservation
-- integrity enforcement (INSERT-side)
-- ──────────────────────────────────────────────
-- Migration 20260807000001
-- Closes lifecycle gaps so PostgreSQL remains the
-- single source of truth (locked rules):
--
--   G1  New reservations ALWAYS start as 'pending'
--       (the transition trigger only guarded UPDATEs)
--   G2  arrival_datetime MUST be in the future at INSERT
--   G3  checkout_datetime is ALWAYS arrival + 21 hours,
--       computed by the database, never trusted from input
--   G4  index reservations(created_at DESC) for admin list/dash
--   G5  composite index for the availability predicate
--       (villa_id, status, arrival_datetime)
-- ──────────────────────────────────────────────

-- ── G1 + G2: INSERT-side invariant guard ──────
CREATE OR REPLACE FUNCTION enforce_reservation_insert_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- New reservations must always start as 'pending'.
  IF NEW.status IS NULL OR NEW.status <> 'pending' THEN
    IF NEW.status IS DISTINCT FROM 'pending' THEN
      RAISE EXCEPTION 'New reservations must start as pending';
    END IF;
    NEW.status := 'pending';
  END IF;

  -- Arrival must be in the future at creation time.
  IF NEW.arrival_datetime <= now() THEN
    RAISE EXCEPTION 'arrival_datetime must be in the future';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_insert_rules ON reservations;
CREATE TRIGGER trg_reservations_insert_rules
  BEFORE INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_reservation_insert_rules();

-- ── G3: 21-hour checkout enforced by the DB ───
-- checkout is always arrival + 21h; any client-supplied
-- value is overwritten so the backend contract holds
-- at the database layer, not only in edge functions.
CREATE OR REPLACE FUNCTION enforce_reservation_stay_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.checkout_datetime := NEW.arrival_datetime + interval '21 hours';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_stay_duration ON reservations;
CREATE TRIGGER trg_reservations_stay_duration
  BEFORE INSERT OR UPDATE OF arrival_datetime ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_reservation_stay_duration();

-- ── G4 + G5: query indexes ────────────────────
CREATE INDEX IF NOT EXISTS idx_reservations_created_at
  ON reservations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reservations_villa_status_arrival
  ON reservations(villa_id, status, arrival_datetime);

-- ──────────────────────────────────────────────
-- Reversible (reverse order):
-- DROP INDEX IF EXISTS idx_reservations_villa_status_arrival;
-- DROP INDEX IF EXISTS idx_reservations_created_at;
-- DROP TRIGGER IF EXISTS trg_reservations_stay_duration ON reservations;
-- DROP FUNCTION IF EXISTS enforce_reservation_stay_duration();
-- DROP TRIGGER IF EXISTS trg_reservations_insert_rules ON reservations;
-- DROP FUNCTION IF EXISTS enforce_reservation_insert_rules();
-- ──────────────────────────────────────────────
