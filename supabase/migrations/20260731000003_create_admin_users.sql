-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Admin Users
-- ──────────────────────────────────────────────
-- Migration 20260731000003
-- Maps Supabase Auth users to application-level
-- admin roles (owner / staff).
-- auth_user_id references auth.users(id) but no
-- FK is created (cross-schema dependency).
-- ──────────────────────────────────────────────

CREATE TABLE admin_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE,
  full_name    TEXT NOT NULL,
  role         admin_role NOT NULL DEFAULT 'staff',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- Reversible:
-- DROP TABLE IF EXISTS admin_users;
-- ──────────────────────────────────────────────
