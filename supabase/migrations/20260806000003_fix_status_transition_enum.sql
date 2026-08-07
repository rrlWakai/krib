-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Fix: status transition
-- enum vs text[] comparison
-- ──────────────────────────────────────────────
-- Migration 20260806000003
-- enforce_reservation_status_transition() compared
-- the reservation_status enum against a text[]
-- (NEW.status = ANY (allowed)), which raises
-- "operator does not exist: reservation_status =
-- text" (42883) on the first status UPDATE.
-- Fix: cast NEW.status to text before ANY.
-- ──────────────────────────────────────────────

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

  IF NOT (NEW.status::text = ANY (allowed)) THEN
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

-- Reversible: same function definition as migration
-- 20260806000001 (before the ::text cast).
