-- ──────────────────────────────────────────────
-- KRiB Beverly Place — SMS Logs
-- ──────────────────────────────────────────────
-- Migration 20260731000007
-- Records every outbound SMS for auditability
-- and delivery tracking.
-- ──────────────────────────────────────────────

CREATE TABLE sms_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id     UUID NOT NULL REFERENCES reservations(id),
  recipient          TEXT NOT NULL,
  message            TEXT NOT NULL,
  direction          sms_direction NOT NULL,
  status             sms_status NOT NULL DEFAULT 'queued',
  provider_message_id TEXT NOT NULL DEFAULT '',
  error_message      TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- Reversible:
-- DROP TABLE IF EXISTS sms_logs;
-- ──────────────────────────────────────────────
