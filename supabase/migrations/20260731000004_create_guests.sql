-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Guests
-- ──────────────────────────────────────────────
-- Migration 20260731000004
-- Guests are unauthenticated individuals who
-- submit reservation requests. Email uses CITEXT
-- for case-insensitive uniqueness.
-- ──────────────────────────────────────────────

CREATE TABLE guests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  email      CITEXT NOT NULL UNIQUE,
  phone      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- Reversible:
-- DROP TABLE IF EXISTS guests;
-- ──────────────────────────────────────────────
