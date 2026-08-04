-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Villas & Amenities
-- ──────────────────────────────────────────────
-- Migration 20260731000002
-- Creates the villas and villa_amenities tables.
-- Villas are the core product entity.
-- ──────────────────────────────────────────────

-- ── Villas ────────────────────────────────────
CREATE TABLE villas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  base_price  NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  max_guests  INTEGER NOT NULL CHECK (max_guests > 0),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Villa Amenities ──────────────────────────
CREATE TABLE villa_amenities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id   UUID NOT NULL REFERENCES villas(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ──────────────────────────────────────────────
-- Reversible (run in reverse order):
-- DROP TABLE IF EXISTS villa_amenities;
-- DROP TABLE IF EXISTS villas;
-- ──────────────────────────────────────────────
