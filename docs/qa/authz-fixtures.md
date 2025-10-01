# Authz test fixtures

This guide explains how to load the sample users and demo content used to verify
role based permissions on notes, files, and URLs.

## Prerequisites

- Docker compose stack running (ensures Postgres, Mongo, Tika, etc.).
- `DATABASE_URL` exported, e.g.:

  ```bash
  export DATABASE_URL="postgresql://kb:kb@localhost:5432/kb?schema=public"
  ```

- Dependencies installed with `pnpm install` at the repo root.
- Database schema migrated:

  ```bash
  pnpm --filter web prisma migrate deploy
  ```

## Seeding the fixtures

Run the dedicated script from the monorepo root:

```bash
pnpm --filter web run seed:authz-fixtures
```

The script creates three users with seeded content:

- Admin: <admin@test.local> / Adm1n!234
- Editor: <editor@test.local> / Ed1tor!234
- Viewer: <viewer@test.local> / V1ewer!234

Each account owns a sandbox knowledge base populated with:

- one note (`Workflow onboarding`),
- one text file asset (`Guide Permissions`),
- one URL entry (`Documentation interne`).

You can re-run the script at any time; it updates the existing records with the
same emails instead of duplicating them.

## Next steps

1. Sign in with the desired role on <http://localhost:3001> once `pnpm --filter web dev` is running.
2. Use these fixtures to validate UI permissions (creation disables for Viewer,
   ingestion flows for Editor/Admin, admin-only user management APIs, etc.).
