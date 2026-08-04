-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Indexes
-- ──────────────────────────────────────────────
-- Migration 20260731000009
-- Performance indexes for reservation lookup,
-- calendar queries, admin filtering, and
-- foreign-key joins.
-- ──────────────────────────────────────────────

-- ── Reservations ──────────────────────────────
CREATE INDEX idx_reservations_villa_id         ON reservations(villa_id);
CREATE INDEX idx_reservations_status           ON reservations(status);
CREATE INDEX idx_reservations_stay_range       ON reservations USING GIST(stay_range);
CREATE INDEX idx_reservations_guest_id         ON reservations(guest_id);
CREATE INDEX idx_reservations_reference_code   ON reservations(reference_code);
CREATE INDEX idx_reservations_check_in         ON reservations(check_in);

-- ── Guests ────────────────────────────────────
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_phone ON guests(phone);

-- ── Villas ────────────────────────────────────
CREATE INDEX idx_villas_slug      ON villas(slug);
CREATE INDEX idx_villas_is_active ON villas(is_active);

-- ── Villa Amenities ──────────────────────────
CREATE INDEX idx_villa_amenities_villa_id   ON villa_amenities(villa_id);
CREATE INDEX idx_villa_amenities_sort_order ON villa_amenities(villa_id, sort_order);

-- ── Gallery ──────────────────────────────────
CREATE INDEX idx_gallery_images_villa_id    ON gallery_images(villa_id);
CREATE INDEX idx_gallery_images_sort_order  ON gallery_images(villa_id, sort_order);

-- ── SMS Logs ─────────────────────────────────
CREATE INDEX idx_sms_logs_reservation_id ON sms_logs(reservation_id);
CREATE INDEX idx_sms_logs_status         ON sms_logs(status);
CREATE INDEX idx_sms_logs_created_at     ON sms_logs(created_at);

-- ── Audit Logs ───────────────────────────────
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action    ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ──────────────────────────────────────────────
-- Reversible (run in reverse order):
-- DROP INDEX IF EXISTS idx_audit_logs_created_at;
-- DROP INDEX IF EXISTS idx_audit_logs_action;
-- DROP INDEX IF EXISTS idx_audit_logs_entity_id;
-- DROP INDEX IF EXISTS idx_sms_logs_created_at;
-- DROP INDEX IF EXISTS idx_sms_logs_status;
-- DROP INDEX IF EXISTS idx_sms_logs_reservation_id;
-- DROP INDEX IF EXISTS idx_gallery_images_sort_order;
-- DROP INDEX IF EXISTS idx_gallery_images_villa_id;
-- DROP INDEX IF EXISTS idx_villa_amenities_sort_order;
-- DROP INDEX IF EXISTS idx_villa_amenities_villa_id;
-- DROP INDEX IF EXISTS idx_villas_is_active;
-- DROP INDEX IF EXISTS idx_villas_slug;
-- DROP INDEX IF EXISTS idx_guests_phone;
-- DROP INDEX IF EXISTS idx_guests_email;
-- DROP INDEX IF EXISTS idx_reservations_check_in;
-- DROP INDEX IF EXISTS idx_reservations_reference_code;
-- DROP INDEX IF EXISTS idx_reservations_guest_id;
-- DROP INDEX IF EXISTS idx_reservations_stay_range;
-- DROP INDEX IF EXISTS idx_reservations_status;
-- DROP INDEX IF EXISTS idx_reservations_villa_id;
-- ──────────────────────────────────────────────
