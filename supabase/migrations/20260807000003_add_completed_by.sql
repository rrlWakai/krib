-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Phase 5: completed_by column
-- ──────────────────────────────────────────────
-- Migration 20260807000003
-- The lifecycle trigger stamps completed_at, but the
-- completing admin was never recorded. Add completed_by
-- so the Audit Logs and Reports can attribute the action.
-- ──────────────────────────────────────────────

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES admin_users(id);

-- ──────────────────────────────────────────────
-- Reversible:
-- ALTER TABLE reservations DROP COLUMN IF EXISTS completed_by;
-- ──────────────────────────────────────────────
