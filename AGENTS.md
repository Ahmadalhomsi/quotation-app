# Project rules (quotation-app)

## Database migrations — ALWAYS through `prisma migrate dev`

Never create or apply database migrations by hand in this project.

- Do NOT hand-write files under `prisma/migrations/*/migration.sql`.
- Do NOT run raw SQL (`ALTER TABLE`, `INSERT INTO "_prisma_migrations"`, etc.) against the database — including via `psql` inside the production container.
- Do NOT add `prisma migrate deploy` steps to the Dockerfile / deploy pipeline. This was tried and deliberately rolled back (commit 817fe58, reverted) — migrations are applied at development time, not at container start.

Every schema change must be made with:

```bash
pnpm prisma:migrate   # prisma migrate dev
```

so the migration is generated AND applied to the actual database, keeping `_prisma_migrations` consistent. If no database is reachable when a schema change is needed (no `DATABASE_URL`), stop and ask the user how they want to apply it — do not improvise with manual SQL.

**Why:** the Coolify deployment pipeline does NOT run migrations — it only builds the image and starts it. A migration that exists only as a file gets shipped inside the image, the new Prisma client queries columns that don't exist in the database, and every `/api/products` and `/api/quotations` call returns HTTP 500 (Prisma error P2022) until someone applies the SQL by hand on the server. This happened on 2026-11-09 with `is_yearly_payment` and took the site down.
