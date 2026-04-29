# Contributing

## Setup

Follow `docs/DEVELOPMENT.md` to get the app running locally.

## Repo conventions

- TypeScript + React (App Router) code lives under `src/`
- Workflow engine code lives under `src/lib/workflow/`
- Background job definitions live under `src/trigger/`
- API route handlers live under `src/app/api/**/route.ts`
- Prefer small, focused PRs (one feature/fix per PR)

## Secrets

- Never commit real `.env` values.
- Use `.env.example` for documentation-only placeholders.

## Adding a workflow node

Use the checklist in `docs/WORKFLOWS.md` (“Adding a new node type”).
