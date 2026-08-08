-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Phase 5: Business settings
-- (single-row configuration module)
-- ──────────────────────────────────────────────
-- Migration 20260807000002
-- Implements Phase 5 Part 5: remove hardcoded
-- business configuration; store it in Supabase.
--
--   settings.id  always 1 (single row)
--   business     JSONB  business info + check-in/out + party fee
--   sms          JSONB  owner mobile + sender name
--   legal        JSONB  privacy policy + terms & conditions
--
-- RLS: public  → SELECT (public website reads live values)
--      admin   → ALL (Control Center edits them)
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settings (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  business   JSONB NOT NULL DEFAULT '{}'::jsonb,
  sms        JSONB NOT NULL DEFAULT '{}'::jsonb,
  legal      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at maintenance (reuses the shared trigger fn)
DROP TRIGGER IF EXISTS trg_settings_updated_at ON settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ───────────────────────────────────────
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read settings" ON settings;
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin full access to settings" ON settings;
CREATE POLICY "Admin full access to settings"
  ON settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Seed: current production configuration ────
INSERT INTO settings (id, business, sms, legal) VALUES (
  1,
  jsonb_build_object(
    'business_name', 'KRiB Beverly Place',
    'tagline', 'Two private villas in Beverly Place, Pampanga',
    'address', 'Beverly Place, Pampanga, Philippines',
    'phone', '+63 968-8700748',
    'email', 'hello@kribbeverlyplace.com',
    'facebook', 'https://www.facebook.com/KribBeverlyPlace',
    'instagram', 'https://www.instagram.com/krib_at_beverlyplace',
    'website', '',
    'check_in_time', '2:00 PM',
    'check_out_time', '11:00 AM',
    'party_fee', 5000,
    'map_url', 'https://maps.app.goo.gl/1aYuBqXnG147AgWW6'
  ),
  jsonb_build_object(
    'owner_mobile', '',
    'sender_name', 'KRiB'
  ),
  jsonb_build_object(
    'privacy_policy', E'## Privacy Notice\n\nWe collect personal information (name, email, phone number) solely for the purpose of processing and managing your reservation. This information is not shared with third parties and is stored securely.\n\nCCTV cameras are active in common areas of the property for security purposes. No cameras are present inside bedrooms or bathrooms.',
    'terms_conditions', E'## House Rules\n\nAll guests are expected to respect the property and the surrounding Beverly Place community. These rules ensure a comfortable stay for everyone.\n\n- Quiet hours are observed after 10:00 PM. Indoor conversations and low-volume music are acceptable.\n- Smoking is permitted in outdoor areas only. No smoking inside the villa.\n- Pool rules — No diving. Children must be supervised at all times.\n- Pets are not allowed inside the villa.\n- Children are welcome. Please supervise them around the pool and outdoor areas.\n\n## Reservation Policy\n\nAll reservations are requests and are subject to owner approval. Submitting a reservation does not guarantee availability. Our team will review your request and confirm availability before any payment is required.\n\nEach reservation is a 21-hour stay, starting at your selected arrival time.\n\n## Cancellation Policy\n\nPending reservation requests can be cancelled at any time at no cost. Approved reservations cancelled at least 7 days before the scheduled arrival are also free of charge.\n\nCancellations made within 7 days of arrival may be subject to a fee. No-shows will be treated as cancellations. We recommend coordinating with us if you need to reschedule — we will do our best to accommodate date changes.\n\n## Check-in / Check-out\n\n- Check-in: Your selected arrival time.\n- Check-out: 21 hours after your arrival.\n- Early check-in and late check-out may be arranged in advance, subject to availability on your booking date.\n\n## Guest Responsibilities\n\nGuests are responsible for the proper use and care of the property, furniture, appliances, and amenities during their stay. Any damage caused by negligence or misuse will be assessed and may result in additional charges.\n\nGuests must ensure that all visitors and participants comply with the house rules and community guidelines. The primary guest is responsible for the conduct of all members of their group.\n\n## Damage & Liability\n\nKRiB Beverly Place is not responsible for any loss, theft, or damage to personal belongings during your stay. Guests are advised to keep valuables secure.\n\nAny damage to the property, its contents, or amenities beyond normal wear and tear will be charged to the guest at replacement or repair cost. A security assessment may be conducted upon check-out.\n\n## Payment Process\n\nNo payment is required until your reservation has been approved. Submitting a reservation request does not obligate you to any payment.\n\nOnce your reservation is approved by our team, we will contact you with the final confirmation and any payment instructions. Approval by our team confirms your booking.'
  )
) ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────
-- Reversible (reverse order):
-- DELETE FROM settings WHERE id = 1;
-- DROP POLICY IF EXISTS "Admin full access to settings" ON settings;
-- DROP POLICY IF EXISTS "Public can read settings" ON settings;
-- ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
-- DROP TRIGGER IF EXISTS trg_settings_updated_at ON settings;
-- DROP TABLE IF EXISTS settings;
-- ──────────────────────────────────────────────
