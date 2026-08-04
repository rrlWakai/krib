-- ──────────────────────────────────────────────
-- KRiB Beverly Place — Database Setup
-- ──────────────────────────────────────────────
-- Migration 00000: Foundation
-- Enables required extensions and sets baseline
-- configuration for all subsequent migrations.
-- ──────────────────────────────────────────────

-- Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS citext;

-- UUID generation (available via gen_random_uuid() from pgcrypto)
-- CITEXT enables case-insensitive text columns (email, slugs, etc.)

-- Timezone
ALTER DATABASE postgres SET timezone TO 'Asia/Manila';

-- ──────────────────────────────────────────────
-- Migration Naming Convention
-- ──────────────────────────────────────────────
-- Format: YYYYMMDD_HHMMSS_description.sql
-- Example: 20260730_120000_create_profiles.sql
--
-- Always use idempotent syntax (IF NOT EXISTS)
-- to allow safe re-runs.
--
-- All application tables will be created in
-- subsequent migrations.
-- ──────────────────────────────────────────────
