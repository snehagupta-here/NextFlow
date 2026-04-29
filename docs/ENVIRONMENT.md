# Environment & Services

`galaxy.ai` relies on a few external services. This doc explains what each env var is used for and where it shows up in the code.

## Required env vars

### Clerk (Auth)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Used by:

- `src/app/layout.tsx` (`ClerkProvider`)
- Route handlers that require auth: most of `src/app/api/**/route.ts` use `auth()` from `@clerk/nextjs/server`

### Database (Postgres)

- `DATABASE_URL`

Used by:

- Prisma datasource in `prisma/schema.prisma`
- Prisma runtime via `src/lib/prisma.ts`
- Prisma CLI via `prisma.config.ts`

### Trigger.dev (Background jobs)

- `TRIGGER_PROJECT_REF` (required by `trigger.config.ts`)
- `TRIGGER_SECRET_KEY`
- `TRIGGER_API_URL` (optional; defaults to Trigger.dev cloud)

Used by:

- `trigger.config.ts` (project ref)
- Next API routes that trigger/poll runs:
  - `src/app/api/workflow/*/route.ts`
  - `src/app/api/workflow/*/status/route.ts`

### Transloadit (Uploads + hosting)

- `TRANSLOADIT_AUTH_KEY`
- `TRANSLOADIT_AUTH_SECRET`
- `TRANSLOADIT_TEMPLATE_ID`

Used by:

- `src/app/api/transloadit/sign/route.ts` (signing uploads)
- Client nodes:
  - `src/components/workflow/nodes/upload-image/UploadImageNode.tsx`
  - `src/components/workflow/nodes/upload-video/UploadVideoNode.tsx`
- Trigger tasks that upload produced files:
  - `src/trigger/crop-image.ts`
  - `src/trigger/extract-frame.ts`

### Google Gemini (LLM)

- `GEMINI_API_KEY`

Used by:

- `src/lib/gemini/list-models.ts` (lists models for UI selector)
- `src/trigger/run-any-llm.ts` (runs `@google/genai`)

## Optional env vars

### ffmpeg / ffprobe paths

- `FFMPEG_PATH`
- `FFPROBE_PATH`

Used by:

- `src/trigger/crop-image.ts`
- `src/trigger/extract-frame.ts`

If the Trigger runtime doesn’t have these binaries on `PATH`, set absolute paths (or ensure the build/runtime provides ffmpeg).

## Environment hygiene

- `.env*` is ignored by git via `.gitignore`.
- Prefer committing `.env.example` (no secrets) and keeping real values only in local env / deployment secret managers.
