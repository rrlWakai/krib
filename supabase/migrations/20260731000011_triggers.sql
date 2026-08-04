-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Triggers
-- ──────────────────────────────────────────────
-- Migration 20260731000011
-- Automatic maintenance: updated_at timestamps,
-- reference_code generation, and a reusable
-- is_admin helper for RLS policies.
-- ──────────────────────────────────────────────

-- ── 1. updated_at auto-maintenance ───────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_villas_updated_at
  BEFORE UPDATE ON villas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── 2. Reference code generation ─────────────
CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.reference_code := 'KRB-' || upper(substr(md5(gen_random_uuid()::text), 1, 7));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservations_reference_code
  BEFORE INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.reference_code IS NULL OR NEW.reference_code = '')
  EXECUTE FUNCTION generate_reference_code();

-- ── 3. Admin helper for RLS ──────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_users
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$;

-- ──────────────────────────────────────────────
-- Reversible (run in reverse order):
-- DROP FUNCTION IF EXISTS is_admin();
-- DROP TRIGGER IF EXISTS trg_reservations_reference_code ON reservations;
-- DROP FUNCTION IF EXISTS generate_reference_code();
-- DROP TRIGGER IF EXISTS trg_reservations_updated_at ON reservations;
-- DROP TRIGGER IF EXISTS trg_villas_updated_at ON villas;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- ──────────────────────────────────────────────
