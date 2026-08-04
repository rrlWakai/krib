-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Reservations
-- ──────────────────────────────────────────────
-- Migration 20260731000005
-- Core reservation table with double-booking
-- prevention via generated daterange column.
-- The exclusion constraint is added separately
-- in migration 10.
-- ──────────────────────────────────────────────

CREATE TABLE reservations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code   TEXT NOT NULL UNIQUE,
  villa_id         UUID NOT NULL REFERENCES villas(id),
  guest_id         UUID NOT NULL REFERENCES guests(id),
  check_in         DATE NOT NULL,
  check_out        DATE NOT NULL,
  guest_count      INTEGER NOT NULL CHECK (guest_count > 0),
  status           reservation_status NOT NULL DEFAULT 'pending',
  special_requests TEXT NOT NULL DEFAULT '',
  terms_accepted   BOOLEAN NOT NULL DEFAULT false,
  stay_range       daterange GENERATED ALWAYS AS (daterange(check_in, check_out)) STORED,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  approved_at      TIMESTAMPTZ,
  approved_by      UUID REFERENCES admin_users(id),
  declined_at      TIMESTAMPTZ,
  declined_by      UUID REFERENCES admin_users(id),
  cancelled_at     TIMESTAMPTZ,
  cancelled_by     UUID REFERENCES admin_users(id),
  completed_at     TIMESTAMPTZ,

  CONSTRAINT check_out_after_check_in CHECK (check_out > check_in),
  CONSTRAINT terms_must_be_accepted  CHECK (terms_accepted = true)
);

-- ──────────────────────────────────────────────
-- Reversible:
-- DROP TABLE IF EXISTS reservations;
-- ──────────────────────────────────────────────
