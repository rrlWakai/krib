-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Enum Types
-- ──────────────────────────────────────────────
-- Migration 20260731000001
-- Creates all custom enum types used across the
-- reservation system schema.
-- ──────────────────────────────────────────────

-- ── Reservation lifecycle ────────────────────
DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM (
    'pending',
    'approved',
    'declined',
    'cancelled',
    'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Admin user roles ─────────────────────────
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM (
    'owner',
    'staff'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── SMS delivery status ──────────────────────
DO $$ BEGIN
  CREATE TYPE sms_status AS ENUM (
    'queued',
    'sent',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── SMS direction (auto vs manual) ───────────
DO $$ BEGIN
  CREATE TYPE sms_direction AS ENUM (
    'outbound_auto',
    'outbound_manual'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────
-- Reversible (run in reverse order):
-- DROP TYPE IF EXISTS sms_direction;
-- DROP TYPE IF EXISTS sms_status;
-- DROP TYPE IF EXISTS admin_role;
-- DROP TYPE IF EXISTS reservation_status;
-- ──────────────────────────────────────────────
