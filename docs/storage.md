# Storage

## Buckets

| Bucket | Access | File Size Limit | MIME Types | Purpose |
|---|---|---|---|---|
| `villa-gallery` | Public read, admin write | 5 MB | JPEG, PNG, WebP, AVIF | Villa and amenity photos on the public site |
| `system` | Private, admin-only | 10 MB | PDF, JSON, CSV, JPEG, PNG | Internal assets (exported reports, reference files) |

## Bucket Creation

Buckets are created via migration `20260730000002_storage.sql`, not through
the Supabase dashboard. This ensures the setup is reproducible.

## Access Policies

Policies are enforced at the Storage layer:

- `villa-gallery`: Public SELECT for all; INSERT/UPDATE/DELETE restricted to authenticated admins
- `system`: All operations restricted to authenticated admins

Policies will be added in Phase 4 alongside the auth schema.

## Client Usage

```typescript
import { getSupabaseClient } from '../lib/supabase/client'
import { getPublicUrl, STORAGE_BUCKETS } from '../lib/supabase/helpers'

const supabase = getSupabaseClient()
const url = getPublicUrl(supabase, 'VILLA_GALLERY', 'villa-1/1234567890.jpg')
```

## No General-Purpose Buckets

Only `villa-gallery` and `system` exist. Do not add speculative buckets
(e.g., "documents") without a concrete use case.
