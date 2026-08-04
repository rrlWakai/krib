# Database Migrations

## Convention

- Migrations are created using `supabase migration new <name>` which
  generates `YYYYMMDDHHMMSS_<name>.sql`
- All SQL is idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- Timezone is set to `Asia/Manila`

## RLS Requirement

Every table must enable Row Level Security in the **same migration** that
creates it. Never a migration that creates a table without RLS, even in a
dev branch.

```sql
CREATE TABLE example (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

ALTER TABLE example ENABLE ROW LEVEL SECURITY;  -- same migration
```

## Current Migrations

| File | Description |
|---|---|
| `20260730000001_extensions.sql` | pgcrypto, btree_gist, citext extensions; timezone |
| `20260730000002_storage.sql` | Storage buckets (villa-gallery, system) |

## Commands

```bash
# Create a new migration
supabase migration new add_reservations

# Apply pending migrations
supabase db push

# Reset local DB and re-apply all migrations
supabase db reset

# Diff local DB against migrations
supabase db diff
```

All three commands (`db push`, `db reset`, `db diff`) must run clean before
a phase is considered complete.
