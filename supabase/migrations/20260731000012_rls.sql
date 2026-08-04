-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Row-Level Security
-- ──────────────────────────────────────────────
-- Migration 20260731000012
-- Enables RLS on every application table and
-- defines granular policies:
--
--   Public  → SELECT on active villas & gallery
--   Admin   → ALL on every table (via is_admin())
--   Others  → no access (default deny)
-- ──────────────────────────────────────────────

-- ── Enable RLS on all tables ──────────────────
ALTER TABLE villas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE villa_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- PUBLIC POLICIES (read-only)
-- ──────────────────────────────────────────────

CREATE POLICY "Public can view active villas"
  ON villas FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can view villa amenities"
  ON villa_amenities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view gallery images"
  ON gallery_images FOR SELECT
  TO public
  USING (true);

-- ──────────────────────────────────────────────
-- ADMIN POLICIES (full access)
-- ──────────────────────────────────────────────

CREATE POLICY "Admin full access to villas"
  ON villas FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access to villa_amenities"
  ON villa_amenities FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access to gallery_images"
  ON gallery_images FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access to guests"
  ON guests FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access to admin_users"
  ON admin_users FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access to reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access to sms_logs"
  ON sms_logs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access to audit_logs"
  ON audit_logs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ──────────────────────────────────────────────
-- Reversible (run in reverse order):
-- DROP POLICY IF EXISTS "Admin full access to audit_logs" ON audit_logs;
-- DROP POLICY IF EXISTS "Admin full access to sms_logs" ON sms_logs;
-- DROP POLICY IF EXISTS "Admin full access to reservations" ON reservations;
-- DROP POLICY IF EXISTS "Admin full access to admin_users" ON admin_users;
-- DROP POLICY IF EXISTS "Admin full access to guests" ON guests;
-- DROP POLICY IF EXISTS "Admin full access to gallery_images" ON gallery_images;
-- DROP POLICY IF EXISTS "Admin full access to villa_amenities" ON villa_amenities;
-- DROP POLICY IF EXISTS "Admin full access to villas" ON villas;
-- DROP POLICY IF EXISTS "Public can view gallery images" ON gallery_images;
-- DROP POLICY IF EXISTS "Public can view villa amenities" ON villa_amenities;
-- DROP POLICY IF EXISTS "Public can view active villas" ON villas;
-- ALTER TABLE audit_logs     DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sms_logs       DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE reservations   DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_users    DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE guests         DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE villa_amenities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE villas         DISABLE ROW LEVEL SECURITY;
-- ──────────────────────────────────────────────
