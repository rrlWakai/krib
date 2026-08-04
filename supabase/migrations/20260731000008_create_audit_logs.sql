-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Audit Logs
-- ──────────────────────────────────────────────
-- Migration 20260731000008
-- Immutable audit trail for every admin action.
-- actor is the auth.uid() of the admin who
-- performed the action.
-- ──────────────────────────────────────────────

CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor      UUID NOT NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  UUID NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- Reversible:
-- DROP TABLE IF EXISTS audit_logs;
-- ──────────────────────────────────────────────
