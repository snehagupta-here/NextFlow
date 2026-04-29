# Development

## Prerequisites

- Node.js 20+ (project uses `@types/node@^20`)
- A Postgres database (local, Docker, Neon, etc.)
- Accounts/keys for Clerk, Trigger.dev, Transloadit, and Gemini

## Install

```bash
npm install
```

## Environment

- Copy `.env.example` → `.env`
- Fill in values (see `docs/ENVIRONMENT.md`)

## Database (Prisma)

This project uses Prisma with Postgres (`prisma/schema.prisma`).

- Apply migrations:

```bash
npx prisma migrate dev
```

- Prisma Studio (optional):

```bash
npx prisma studio
```

## Run the app

```bash
npm run dev
```

Routes of interest:

- `/nodes` — landing/projects shelf (`src/components/landing/WorkflowLandingPage.tsx`)
- `/nodes/new` — create a new workflow (auth required)
- `/nodes/[workflowId]` — workflow editor (auth required)

## Lint / Build

```bash
npm run lint
npm run build
npm run start
```

## Notes on background tasks

Workflow nodes like “Crop Image”, “Extract Frame”, and “Run Any LLM” trigger background jobs via Trigger.dev.

- Next route handlers trigger runs using `@trigger.dev/sdk/v3` (`tasks.trigger`, `runs.retrieve`).
- Task implementations live in `src/trigger`.

If you don’t have Trigger.dev configured, you can still use the editor UI and run “local only” nodes (e.g. Text) but task-backed nodes will fail until env + Trigger are set up.
