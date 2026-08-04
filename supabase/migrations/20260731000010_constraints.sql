-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Constraints
-- ──────────────────────────────────────────────
-- Migration 20260731000010
-- Double-booking prevention via GiST exclusion
-- constraint on overlapping stay ranges.
-- Only pending and approved reservations block
-- dates; cancelled/declined immediately free them.
-- ──────────────────────────────────────────────

-- ── Double-booking prevention ─────────────────
-- Prevents overlapping stays for the same villa
-- when the existing reservation is pending or
-- approved. Cancelled and declined reservations
-- are excluded from the check.
ALTER TABLE reservations
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING GIST (
    villa_id WITH =,
    stay_range WITH &&
  ) WHERE (status IN ('pending', 'approved'));

-- ──────────────────────────────────────────────
-- All other CHECK constraints are inlined in
-- CREATE TABLE statements (migrations 02–05) and
-- are enforced at the column level.
-- ──────────────────────────────────────────────

-- ──────────────────────────────────────────────
-- Reversible:
-- ALTER TABLE reservations DROP CONSTRAINT IF EXISTS no_overlapping_bookings;
-- ──────────────────────────────────────────────
