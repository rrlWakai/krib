-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Website Manager (CMS)
-- ──────────────────────────────────────────────
-- Migration 20260917000001
-- Structured content management for the public
-- website.
--
--   1. website_pages      — per-page marketing copy
--      (home / about / location). Draft → publish.
--   2. villa_marketing    — per-villa marketing copy
--      (tagline, description, story, quick highlights).
--      Draft → publish. Operational fields (price,
--      capacity, amenities) stay in villas table.
--   3. gallery_images     — extended with visibility,
--      caption, and original file name columns.
--   4. Storage policies   — villa-gallery bucket object
--      policies (public read, admin write) so uploads
--      made from the Control Center are authorized.
--   5. audit_logs actor   — default actor to auth.uid()
--      for browser (RLS) writes; server writes always
--      supply the actor explicitly.
--
-- Public site reads PUBLISHED content only. When a row
-- is unpublished (or missing), the public site falls
-- back to its static built-in copy — so applying this
-- migration never changes the rendered website.
-- ──────────────────────────────────────────────

-- ──────────────────────────────────────────────
-- 1. gallery_images — extend columns
-- ──────────────────────────────────────────────

ALTER TABLE gallery_images
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS caption    TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_name  TEXT    NOT NULL DEFAULT '';

-- ──────────────────────────────────────────────
-- 2. website_pages — page-level content
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS website_pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL DEFAULT '',
  draft_content    JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMPTZ,
  published_by     UUID,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_website_pages_updated_at ON website_pages;
CREATE TRIGGER trg_website_pages_updated_at
  BEFORE UPDATE ON website_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────
-- 3. villa_marketing — per-villa marketing copy
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS villa_marketing (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id         UUID NOT NULL UNIQUE REFERENCES villas(id) ON DELETE CASCADE,
  draft_content    JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMPTZ,
  published_by     UUID,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_villa_marketing_updated_at ON villa_marketing;
CREATE TRIGGER trg_villa_marketing_updated_at
  BEFORE UPDATE ON villa_marketing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────
-- 4. RLS
-- ──────────────────────────────────────────────

ALTER TABLE website_pages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE villa_marketing ENABLE ROW LEVEL SECURITY;

-- Public: SELECT only PUBLISHED rows (unpublished rows are
-- invisible, so the public site keeps its static copy).
DROP POLICY IF EXISTS "Public can read published website pages" ON website_pages;
CREATE POLICY "Public can read published website pages"
  ON website_pages FOR SELECT
  TO public
  USING (is_published = true);

DROP POLICY IF EXISTS "Public can read published villa marketing" ON villa_marketing;
CREATE POLICY "Public can read published villa marketing"
  ON villa_marketing FOR SELECT
  TO public
  USING (is_published = true);

-- Admin: full access (same pattern as existing tables).
DROP POLICY IF EXISTS "Admin full access to website_pages" ON website_pages;
CREATE POLICY "Admin full access to website_pages"
  ON website_pages FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin full access to villa_marketing" ON villa_marketing;
CREATE POLICY "Admin full access to villa_marketing"
  ON villa_marketing FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ──────────────────────────────────────────────
-- 5. Storage policies — villa-gallery bucket
-- ──────────────────────────────────────────────
-- The bucket already exists (public=true). Object-level
-- policies are required for the storage API (upload,
-- list, remove) used by the Control Center media manager.
-- The same bucket is also used for admin avatars
-- (admin-avatars/{user}/...), so the write policies are
-- gated on is_admin() without a folder restriction.
-- NOTE: verify in the Supabase dashboard that no
-- conflicting hand-created storage policies already exist.

DROP POLICY IF EXISTS "Public read villa-gallery" ON storage.objects;
CREATE POLICY "Public read villa-gallery"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'villa-gallery');

DROP POLICY IF EXISTS "Admin upload villa-gallery" ON storage.objects;
CREATE POLICY "Admin upload villa-gallery"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'villa-gallery' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update villa-gallery" ON storage.objects;
CREATE POLICY "Admin update villa-gallery"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'villa-gallery' AND public.is_admin())
  WITH CHECK (bucket_id = 'villa-gallery' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete villa-gallery" ON storage.objects;
CREATE POLICY "Admin delete villa-gallery"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'villa-gallery' AND public.is_admin());

-- ──────────────────────────────────────────────
-- 6. audit_logs — browser-write actor default
-- ──────────────────────────────────────────────
-- Control Center actions are recorded from the browser
-- (RLS is_admin() grants write access). Existing rows and
-- server-side edge functions always set actor explicitly,
-- so this only fills the value for RLS-based writes.
CREATE OR REPLACE FUNCTION audit_log_actor_default()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.actor IS NULL THEN
    NEW.actor := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_actor_default ON audit_logs;
CREATE TRIGGER trg_audit_logs_actor_default
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_actor_default();

-- ──────────────────────────────────────────────
-- 7. Seed draft content (matches today's copy)
-- ──────────────────────────────────────────────
-- Only DRAFT content is seeded so the editors open
-- pre-filled and the public site remains unchanged
-- until an admin explicitly publishes.

INSERT INTO website_pages (slug, title, draft_content)
VALUES
  ('home', 'Home', jsonb_build_object(
    'hero',
    jsonb_build_object(
      'subtitle', 'BEVERLY PLACE, PAMPANGA',
      'title', 'Weekends Were Made for This.',
      'description',
        'Tucked away in the quiet beauty of Beverly Place, KRiB offers two private villas where families gather, celebrations come to life, and every moment feels like home.'
    ),
    'about',
    jsonb_build_object(
      'label', 'OUR STORY',
      'title', 'Created for the moments that matter.',
      'paragraphs',
        jsonb_build_array(
          'KRiB Beverly Place began as a vision to create a space where families could escape the noise of daily life and reconnect with what matters most — each other.',
          'Tucked away in the peaceful hills of Pampanga, KRiB is not simply a place to sleep. It is a place to gather, to celebrate, to slow down, and to create traditions worth repeating.',
          'Every detail — from the layout of the living spaces to the placement of the pool — was designed with one thing in mind: bringing people together.'
        )
    ),
    'cta',
    jsonb_build_object(
      'eyebrow', 'Your Perfect Villa Awaits',
      'title', 'Ready to Find Your Perfect Villa?',
      'description',
        'Whether you are planning a peaceful family getaway or a memorable celebration with loved ones, explore KRiB 1 and KRiB 2 to discover the stay that is right for you.',
      'buttonLabel', 'Explore Villas'
    )
  )),
  ('about', 'About', jsonb_build_object(
    'heroTitle', 'Our Story',
    'heroDescription',
      'KRiB Beverly Place was born from a simple belief — that the best moments in life happen when we are together.',
    'sections',
      jsonb_build_array(
        jsonb_build_object(
          'title', 'The Beginning',
          'paragraphs',
            jsonb_build_array(
              'It started with a drive through the quiet hills of Pampanga. The road curved through lush greenery, past rice fields and bamboo groves, until it opened up to a view that stopped us in our tracks. A valley cradled by mountains, where the air was cooler and the world felt miles away.',
              'That view became the foundation of KRiB Beverly Place — not just a destination, but a feeling. A place where families could gather without distraction, where celebrations could unfold naturally, and where the simple act of being together would feel extraordinary.'
            )
        ),
        jsonb_build_object(
          'title', 'The Vision',
          'paragraphs',
            jsonb_build_array(
              'We wanted to create something different from the sterile hotels and impersonal rentals that dominate the travel industry. A space that felt like a home — because that is what it is. A home we are sharing with you.',
              'Every villa was designed with intention. The layout encourages conversation. The kitchens invite shared meals. The pools are positioned to catch the afternoon sun. Nothing was placed without thought. Nothing was added without purpose.'
            )
        ),
        jsonb_build_object(
          'title', 'The Experience',
          'paragraphs',
            jsonb_build_array(
              'Today, KRiB Beverly Place welcomes families, friends, and groups who believe that the best memories are made together. Whether it is a birthday celebration, a family reunion, or simply a weekend away from the city, KRiB provides the setting for moments that last a lifetime.',
              'We are not a resort. We are not a hotel. We are a place where you can breathe, connect, and remember what matters most.'
            )
        )
      ),
    'quote',
      'We are not a resort. We are not a hotel. We are a place where you can breathe, connect, and remember what matters most.'
  )),
  ('location', 'Location', jsonb_build_object(
    'heroTitle', 'Find Us',
    'heroDescription',
      'Tucked away in the quiet hills of Pampanga, KRiB Beverly Place is close enough for a spontaneous weekend escape, yet feels like a world away.',
    'address', 'Beverly Place, Pampanga, Philippines',
    'directions',
      jsonb_build_array(
        jsonb_build_object(
          'from', 'Manila',
          'via', 'NLEX',
          'travelTime', '~2 hours',
          'description',
            'Take NLEX northbound to the Clark exit. Follow the signs to Angeles City, then take the road to Beverly Place.'
        ),
        jsonb_build_object(
          'from', 'Clark International Airport',
          'via', 'Clark-Tarlac Road',
          'travelTime', '~20 minutes',
          'description',
            'From the airport, head north on Clark-Tarlac Road. Beverly Place is a short drive from the Clark Freeport Zone.'
        )
      )
  ))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO villa_marketing (villa_id, draft_content)
SELECT
  krib.id,
  jsonb_build_object(
    'tagline', krib.tagline,
    'description', krib.description,
    'story', krib.story,
    'quickHighlights', krib.quickHighlights
  )
FROM (
  SELECT
    id,
    'The Original Family Retreat' AS tagline,
    'A warm and inviting home designed for families who value quality time. KRiB 1 wraps you in comfort from the moment you step inside, with spaces that encourage connection, laughter, and slowing down.' AS description,
    'KRiB 1 was born from a simple idea — that the best weekends are spent with the people who matter most. Every corner of this home was designed to bring families closer, from the open living area where stories are shared to the private garden where memories take root.' AS story,
    jsonb_build_array(
      'Family Friendly',
      'Private Villa',
      'Perfect for Celebrations',
      'Golf Community'
    ) AS quickHighlights
  FROM villas WHERE slug = 'krib-1'
) krib
ON CONFLICT (villa_id) DO NOTHING;

INSERT INTO villa_marketing (villa_id, draft_content)
SELECT
  krib.id,
  jsonb_build_object(
    'tagline', krib.tagline,
    'description', krib.description,
    'story', krib.story,
    'quickHighlights', krib.quickHighlights
  )
FROM (
  SELECT
    id,
    'The Signature Villa' AS tagline,
    'A spacious haven where celebrations come to life. KRiB 2 offers room to gather, room to celebrate, and room to create traditions that last a lifetime. Designed for those who believe every special occasion deserves a beautiful setting.' AS description,
    'KRiB 2 was created for the moments that matter most — birthdays, reunions, and milestones that deserve to be celebrated in style. With expansive indoor and outdoor spaces, it was designed to host life''s biggest celebrations while still offering quiet corners for intimate conversations.' AS story,
    jsonb_build_array(
      'Family Friendly',
      'Private Villa',
      'Perfect for Celebrations',
      'Golf Community'
    ) AS quickHighlights
  FROM villas WHERE slug = 'krib-2'
) krib
ON CONFLICT (villa_id) DO NOTHING;

-- ──────────────────────────────────────────────
-- Reversible (run in reverse order):
-- DELETE FROM villa_marketing;
-- DELETE FROM website_pages WHERE slug IN ('home','about','location');
-- DROP TRIGGER IF EXISTS trg_audit_logs_actor_default ON audit_logs;
-- DROP FUNCTION IF EXISTS audit_log_actor_default();
-- DROP POLICY IF EXISTS "Admin delete villa-gallery" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin update villa-gallery" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin upload villa-gallery" ON storage.objects;
-- DROP POLICY IF EXISTS "Public read villa-gallery" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin full access to villa_marketing" ON villa_marketing;
-- DROP POLICY IF EXISTS "Admin full access to website_pages" ON website_pages;
-- DROP POLICY IF EXISTS "Public can read published villa marketing" ON villa_marketing;
-- DROP POLICY IF EXISTS "Public can read published website pages" ON website_pages;
-- ALTER TABLE villa_marketing DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE website_pages  DISABLE ROW LEVEL SECURITY;
-- DROP TRIGGER IF EXISTS trg_villa_marketing_updated_at ON villa_marketing;
-- DROP TRIGGER IF EXISTS trg_website_pages_updated_at ON website_pages;
-- DROP TABLE IF EXISTS villa_marketing;
-- DROP TABLE IF EXISTS website_pages;
-- ALTER TABLE gallery_images
--   DROP COLUMN IF EXISTS file_name,
--   DROP COLUMN IF EXISTS caption,
--   DROP COLUMN IF EXISTS is_visible;
-- ──────────────────────────────────────────────