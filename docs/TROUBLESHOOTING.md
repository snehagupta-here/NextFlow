# Troubleshooting

## “Authentication required.”

Most API endpoints require Clerk auth (they call `auth()` in the route handler). Make sure:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- You’re signed in (use `/sign-in`)

## Prisma errors / cannot connect to database

- Confirm `DATABASE_URL` points to a reachable Postgres instance
- Run migrations: `npx prisma migrate dev`
- If you changed the schema, regenerate Prisma client: `npx prisma generate`

## Upload nodes fail (Transloadit)

Symptoms:

- “Missing Transloadit environment variables.”
- Upload requests to `https://api2.transloadit.com/assemblies` fail

Checks:

- Set `TRANSLOADIT_AUTH_KEY`, `TRANSLOADIT_AUTH_SECRET`, `TRANSLOADIT_TEMPLATE_ID`
- Verify the Transloadit Template ID is valid and configured to return results URLs

## Crop/Extract nodes fail (ffmpeg)

Trigger tasks use `fluent-ffmpeg` and optionally read:

- `FFMPEG_PATH`
- `FFPROBE_PATH`

If your Trigger runtime doesn’t have ffmpeg installed, you must provide it via the Trigger build/runtime (or set explicit paths if available in the environment).

## LLM node fails / empty output

The Trigger task (`src/trigger/run-any-llm.ts`) will fail if:

- `GEMINI_API_KEY` is missing
- the user message is empty
- an image URL is invalid or cannot be fetched
- Gemini returns an empty `text` response

Also note the model list shown in the UI is filtered and some models are intentionally disabled in `src/lib/gemini/list-models.ts`.

## Trigger.dev status polling never completes

The UI polls `/api/workflow/*/status` endpoints which call `runs.retrieve(runId)`.

Checks:

- `TRIGGER_PROJECT_REF` is set (required by `trigger.config.ts`)
- `TRIGGER_SECRET_KEY` is set
- `TRIGGER_API_URL` is correct for your Trigger environment
- The task ids match:
  - `run-any-llm-task`
  - `crop-image-task`
  - `extract-frame-task`

If tasks aren’t deployed/running in Trigger, the status endpoints may return “Run not found” or never reach `COMPLETED`.
