-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Notifications & Push
-- ──────────────────────────────────────────────
-- Migration 20260916000002
-- Implements admin dashboard notifications and
-- browser push notification infrastructure:
--
--   admin_notifications  persistent notification records
--   push_subscriptions   browser push subscription storage
--   admin_user_id()      helper for per-admin RLS scoping
--   Realtime publication for live dashboard updates
-- ──────────────────────────────────────────────

-- ── 1. Helper: resolve current admin's admin_users.id ──
CREATE OR REPLACE FUNCTION public.admin_user_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.admin_users
  WHERE auth_user_id = auth.uid()
    AND is_active = true
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.admin_user_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_user_id() TO authenticated;

-- ── 2. Admin Notifications ─────────────────────
CREATE TABLE public.admin_notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for dashboard queries (admin user, unread first, newest first)
CREATE INDEX idx_admin_notifications_admin_created
  ON public.admin_notifications (admin_user_id, is_read, created_at DESC);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can read their own notifications
CREATE POLICY "Admins read own notifications"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND admin_user_id = public.admin_user_id()
  );

-- Admins can mark their own notifications as read
CREATE POLICY "Admins update own notifications"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    AND admin_user_id = public.admin_user_id()
  )
  WITH CHECK (
    is_admin()
    AND admin_user_id = public.admin_user_id()
  );

-- ── 3. Push Subscriptions ─────────────────────
CREATE TABLE public.push_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  endpoint      TEXT NOT NULL,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  user_agent    TEXT NOT NULL DEFAULT '',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (admin_user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_active
  ON public.push_subscriptions (admin_user_id, is_active)
  WHERE is_active = true;

-- updated_at maintenance
CREATE TRIGGER trg_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admins can manage their own subscriptions
CREATE POLICY "Admins manage own subscriptions"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (
    is_admin()
    AND admin_user_id = public.admin_user_id()
  )
  WITH CHECK (
    is_admin()
    AND admin_user_id = public.admin_user_id()
  );

-- ── 4. Realtime ────────────────────────────────
-- Add admin_notifications to the Realtime publication
-- so frontend can subscribe via Postgres Changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- ──────────────────────────────────────────────
-- Reversible (run in reverse order):
-- ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_notifications;
-- DROP POLICY IF EXISTS "Admins manage own subscriptions" ON public.push_subscriptions;
-- ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
-- DROP TRIGGER IF EXISTS trg_push_subscriptions_updated_at ON public.push_subscriptions;
-- DROP INDEX IF EXISTS idx_push_subscriptions_active;
-- DROP TABLE IF EXISTS public.push_subscriptions;
-- DROP POLICY IF EXISTS "Admins update own notifications" ON public.admin_notifications;
-- DROP POLICY IF EXISTS "Admins read own notifications" ON public.admin_notifications;
-- ALTER TABLE public.admin_notifications DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_admin_notifications_admin_created;
-- DROP TABLE IF EXISTS public.admin_notifications;
-- DROP FUNCTION IF EXISTS public.admin_user_id();
-- ──────────────────────────────────────────────
