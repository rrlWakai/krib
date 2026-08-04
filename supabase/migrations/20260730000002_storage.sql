-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Storage Buckets
-- ──────────────────────────────────────────────
-- Migration 20260730000002: Storage
-- Creates Supabase Storage buckets with
-- public/private access split.
-- ──────────────────────────────────────────────

-- villa-gallery: Public read, admin write
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'villa-gallery',
  'villa-gallery',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- system: Private, admin-only
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'system',
  'system',
  false,
  10485760,
  ARRAY['application/pdf', 'application/json', 'text/csv', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;
