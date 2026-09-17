-- ──────────────────────────────────────────────
-- KRiB Beverly Place — KRiB 1 Pricing & Capacity Update
-- ──────────────────────────────────────────────
-- Migration 20260917000002
-- Implements updated pricing rules:
--   1. REMOVES 60-guest maximum completely (no hard limit)
--   2. Party fee (₱5,000) REPLACES additional guest fee when party is ON
--   3. Standard capacity 20 remains the threshold for additional guests (₱200 each)
-- ──────────────────────────────────────────────

-- ── 1. Update capacity enforcement: remove 60-guest ceiling ──
-- The original trigger enforced a ceiling of 60 for KRiB 1.
-- New rule: no maximum guest count. The standard capacity of 20
-- is the threshold for additional guest fees, not a booking limit.
DROP TRIGGER IF EXISTS trg_reservations_capacity ON reservations;
DROP FUNCTION IF EXISTS enforce_reservation_capacity();

CREATE OR REPLACE FUNCTION enforce_reservation_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_guests INTEGER;
  v_slug TEXT;
BEGIN
  SELECT max_guests, slug INTO v_max_guests, v_slug
    FROM villas WHERE id = NEW.villa_id;

  IF v_max_guests IS NULL THEN
    RAISE EXCEPTION 'Villa does not exist';
  END IF;

  -- No maximum guest count for any villa.
  -- The base capacity (max_guests) is used only for pricing threshold.
  -- We intentionally do NOT reject reservations exceeding max_guests.

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservations_capacity
  BEFORE INSERT OR UPDATE OF villa_id, guest_count ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_reservation_capacity();

-- ── 2. Update fee calculation: party fee REPLACES additional guest fee ──
-- When is_party = true, additional_guest_fee must be 0.
DROP TRIGGER IF EXISTS trg_compute_reservation_fees ON reservations;
DROP FUNCTION IF EXISTS compute_reservation_fees();

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

    -- Party fee REPLACES additional guest fee
    IF NEW.is_party THEN
      v_additional_fee := 0;
      v_party_fee := 5000;
    ELSE
      v_additional_fee := v_additional_guests * 200;
      v_party_fee := 0;
    END IF;
  ELSE
    -- KRiB 2: no additional guest fees
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

CREATE TRIGGER trg_compute_reservation_fees
  BEFORE INSERT OR UPDATE OF guest_count, is_party, villa_id ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION compute_reservation_fees();

-- ──────────────────────────────────────────────
-- Reversible (reverse order):
-- DROP TRIGGER IF EXISTS trg_compute_reservation_fees ON reservations;
-- DROP FUNCTION IF EXISTS compute_reservation_fees();
-- DROP TRIGGER IF EXISTS trg_reservations_capacity ON reservations;
-- DROP FUNCTION IF EXISTS enforce_reservation_capacity();
-- ──────────────────────────────────────────────