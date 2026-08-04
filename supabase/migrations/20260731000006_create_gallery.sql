-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Gallery Images
-- ──────────────────────────────────────────────
-- Migration 20260731000006
-- Stores references to villa gallery images that
-- have been uploaded to the storage bucket.
-- No versioning — one row per storage object.
-- ──────────────────────────────────────────────

CREATE TABLE gallery_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id     UUID NOT NULL REFERENCES villas(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text     TEXT NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- Reversible:
-- DROP TABLE IF EXISTS gallery_images;
-- ──────────────────────────────────────────────
