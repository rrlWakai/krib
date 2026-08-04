-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Add Documents Bucket
-- ──────────────────────────────────────────────
-- Migration 20260730000003: Adds the `documents`
-- private storage bucket for admin-uploaded
-- reference files, exported reports, etc.
-- ──────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY['application/pdf', 'application/json', 'text/csv', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;
