# Types

## Structure

```
src/types/
  generated/
    database.ts        Output of `supabase gen types typescript` — never hand-edited
  app/
    reservation.ts     Domain types composed from generated types via Pick/Omit
    index.ts           Re-exports
```

## Generation

```bash
npm run types:generate   # Regenerates src/types/generated/database.ts
npm run types:check-stale  # Regenerates and fails if diff is non-empty
```

## Git

`src/types/generated/**` is marked as `linguist-generated=true` in
`.gitattributes`, so diffs collapse by default in GitHub code review.

## CI

The CI build (`build:ci`) regenerates types and fails if the committed
generated file is stale. This prevents schema drift between the database
and frontend types.

## Rules

- Never edit `src/types/generated/` by hand
- Domain types in `src/types/app/` compose from generated types
- Do not duplicate generated type definitions in handwritten files
