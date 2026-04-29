# Project Documentation

This folder contains the living documentation for `galaxy.ai`.

## Start Here

- `docs/DEVELOPMENT.md` — running locally, common commands
- `docs/ENVIRONMENT.md` — required environment variables and third‑party services
- `docs/ARCHITECTURE.md` — high-level architecture and code map
- `docs/API.md` — API routes (`src/app/api/**/route.ts`)
- `docs/WORKFLOWS.md` — workflow nodes + execution model
- `docs/TROUBLESHOOTING.md` — common failure modes and fixes
- `docs/DATA_MODEL.md` — Prisma models and meaning
- `CONTRIBUTING.md` — contribution guidelines

## Where Things Live

- Routes (UI): `src/app/**/page.tsx`
- Route handlers (API): `src/app/api/**/route.ts`
- Components: `src/components/**`
- Hooks + state: `src/hooks/**`, `src/stores/**`
- Workflow engine: `src/lib/workflow/**`
- Background tasks: `src/trigger/**`
- Database schema: `prisma/schema.prisma`
