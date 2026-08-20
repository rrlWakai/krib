-- ──────────────────────────────────────────────
-- KRiB Beverly Place — KRiB 1 Booking Rules
-- ──────────────────────────────────────────────
-- Migration 20260820000001
-- Implements KRiB 1 updated booking policy:
--
--   R1  Fixed 2:00 PM check-in (enforced in app layer)
--   R2  Standard capacity 20 guests
--   R3  Allow 21–60 guests with admin approval
--   R4  ₱200 per guest above 20
--   R5  ₱5,000 party fee, max 60 guests for parties
--   R6  Server-authoritative fee calculation
--   R7  Relax capacity trigger: KRiB 1 allows up to 60
-- ──────────────────────────────────────────────

-- ── New columns on reservations ──────────────
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS is_party BOOLEAN DEFAULT false;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS additional_guest_fee NUMERIC DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS party_fee NUMERIC DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;

-- ── R7: Relax capacity trigger ───────────────
-- KRiB 1 (slug 'krib-1') allows up to 60 guests (party max).
-- KRiB 2 retains its existing max_guests limit (30).
-- The trigger now checks villa-specific ceilings.
CREATE OR REPLACE FUNCTION enforce_reservation_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_guests INTEGER;
  v_slug TEXT;
  v_ceil INTEGER;
BEGIN
  SELECT max_guests, slug INTO v_max_guests, v_slug
    FROM villas WHERE id = NEW.villa_id;

  IF v_max_guests IS NULL THEN
    RAISE EXCEPTION 'Villa does not exist';
  END IF;

  -- KRiB 1 party ceiling is 60; other villas use max_guests as-is.
  IF v_slug = 'krib-1' THEN
    v_ceil := 60;
  ELSE
    v_ceil := v_max_guests;
  END IF;

  IF NEW.guest_count > v_ceil THEN
    RAISE EXCEPTION 'Guest count (%) exceeds maximum allowed (%) for this villa',
      NEW.guest_count, v_ceil;
  END IF;

  RETURN NEW;
END;
$$;

-- ── R6: Server-authoritative fee calculation ─
-- Computes additional_guest_fee, party_fee, and total_amount
-- on INSERT and UPDATE so the database is always the source of truth.
CREATE OR REPLACE FUNCTION compute_reservation_fees()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_slug TEXT;
  v_base_price NUMERIC;
  v_standard_capacity INTEGER;
  v_additional_guests INTEGER;
  v_additional_fee NUMERIC;
  v_party_fee NUMERIC;
BEGIN
  SELECT slug, base_price INTO v_slug, v_base_price
    FROM villas WHERE id = NEW.villa_id;

  IF v_slug IS NULL THEN
    RETURN NEW;
  END IF;

  -- KRiB 1 rules
  IF v_slug = 'krib-1' THEN
    v_standard_capacity := 20;
    v_additional_guests := GREATEST(NEW.guest_count - v_standard_capacity, 0);
    v_additional_fee := v_additional_guests * 200;

    IF NEW.is_party THEN
      v_party_fee := 5000;
    ELSE
      v_party_fee := 0;
    END IF;
  ELSE
    -- KRiB 2: no additional guest fees, keep existing party fee logic
    v_additional_fee := 0;
    IF NEW.is_party THEN
      v_party_fee := 5000;
    ELSE
      v_party_fee := 0;
    END IF;
  END IF;

  NEW.additional_guest_fee := v_additional_fee;
  NEW.party_fee := v_party_fee;
  NEW.total_amount := v_base_price + v_additional_fee + v_party_fee;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_reservation_fees ON reservations;
CREATE TRIGGER trg_compute_reservation_fees
  BEFORE INSERT OR UPDATE OF guest_count, is_party, villa_id ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION compute_reservation_fees();

-- ──────────────────────────────────────────────
-- Reversible (reverse order):
-- DROP TRIGGER IF EXISTS trg_compute_reservation_fees ON reservations;
-- DROP FUNCTION IF EXISTS compute_reservation_fees();
-- DROP FUNCTION IF EXISTS enforce_reservation_capacity();
-- ALTER TABLE reservations DROP COLUMN IF EXISTS total_amount;
-- ALTER TABLE reservations DROP COLUMN IF EXISTS party_fee;
-- ALTER TABLE reservations DROP COLUMN IF EXISTS additional_guest_fee;
-- ALTER TABLE reservations DROP COLUMN IF EXISTS is_party;
-- ──────────────────────────────────────────────
