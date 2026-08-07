-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Seed Villas
-- ──────────────────────────────────────────────
-- Migration 20260806000002
-- Seeds the two production villas so the B6
-- capacity trigger can resolve max_guests.
-- Idempotent: no-op if the slugs already exist.
-- ──────────────────────────────────────────────

INSERT INTO villas (slug, name, description, base_price, max_guests, is_active)
VALUES
  ('krib-1', 'KRiB 1', 'The Original Family Retreat', 25000.00, 20, true),
  ('krib-2', 'KRiB 2', 'The Signature Villa',          30000.00, 30, true)
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────────
-- Reversible:
-- DELETE FROM villas WHERE slug IN ('krib-1', 'krib-2');
-- ──────────────────────────────────────────────
