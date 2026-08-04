# Database

## Extensions

| Extension | Purpose |
|---|---|
| `pgcrypto` | UUID generation (`gen_random_uuid()`), hashing functions |
| `btree_gist` | GiST index support for exclusion constraints (e.g., overlapping date ranges) |
| `citext` | Case-insensitive text columns (email, slugs) |

## Timezone

Set to `Asia/Manila` at the database level via `ALTER DATABASE postgres SET timezone`.

## Migration Convention

All future tables must ship with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
in the **same migration** that creates them. Never create a table without
RLS, even in a dev branch.

## Current State

This phase creates only foundational infrastructure:

- Extensions and timezone (migration 01)
- Storage buckets (migration 02)

No business tables exist yet. Phase 4 will add reservations, villas, guests,
and related tables with the following conventions:

- Primary keys: `uuid` with `gen_random_uuid()` default
- Timestamps: `created_at`, `updated_at` with `now()` default
- Exclusion constraints for overlapping date ranges via `btree_gist`
- RLS enabled in the same migration as table creation
