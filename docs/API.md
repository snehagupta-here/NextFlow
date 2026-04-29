# API

All API endpoints in this project are implemented as Next App Router route handlers under `src/app/api/**/route.ts`.

Most persistence routes are authenticated using Clerk (`auth()` from `@clerk/nextjs/server`). If the user is not signed in, they return `401`.

## Workflows

### `GET /api/workflows?limit=N`

List workflows for the current user, ordered by `updatedAt desc`.

Implementation: `src/app/api/workflows/route.ts`

### `POST /api/workflows`

Create a workflow.

Body schema: `createWorkflowBodySchema` in `src/lib/api/workflow-schemas.ts`

Implementation: `src/app/api/workflows/route.ts`

### `GET /api/workflows/:workflowId`

Fetch a workflow by id (scoped to the current user).

Implementation: `src/app/api/workflows/[workflowId]/route.ts`

### `PATCH /api/workflows/:workflowId`

Update `name`, `nodes`, and/or `edges` (scoped to the current user).

Implementation: `src/app/api/workflows/[workflowId]/route.ts`

## Workflow runs & node runs (history)

### `GET /api/workflows/:workflowId/runs`

Returns all runs for a workflow (most recent first), including `nodeRuns` ordered by `startedAt asc`.

Implementation: `src/app/api/workflows/[workflowId]/runs/route.ts`

### `POST /api/workflows/:workflowId/runs`

Creates a `WorkflowRun` row with `status=RUNNING` and `scope` in:

- `FULL`
- `SELECTED`
- `SINGLE`

Implementation: `src/app/api/workflows/[workflowId]/runs/route.ts`

### `PATCH /api/workflow-runs/:runId`

Updates an existing workflow run row with final status and timing metadata.

Implementation: `src/app/api/workflow-runs/[runId]/route.ts`

### `POST /api/workflow-runs/:runId/node-runs`

Creates a `NodeRun` row for a particular node execution.

Implementation: `src/app/api/workflow-runs/[runId]/node-runs/route.ts`

### `PATCH /api/workflow-runs/:runId/node-runs/:nodeRunId`

Updates an existing `NodeRun` row.

Implementation: `src/app/api/workflow-runs/[runId]/node-runs/[nodeRunId]/route.ts`

## Integrations

### `POST /api/transloadit/sign`

Returns a short-lived Transloadit signature and params for uploads.

Implementation: `src/app/api/transloadit/sign/route.ts`

### `GET /api/gemini/models`

Fetches Gemini model options by calling Google’s models endpoint and filtering/sorting results for the UI selector.

Implementation: `src/app/api/gemini/models/route.ts`, `src/lib/gemini/list-models.ts`

## Trigger-backed node execution

These endpoints trigger Trigger.dev jobs and expose a status endpoint used by the client to poll.

### Run Any LLM

- `POST /api/workflow/run-any-llm`
- `GET /api/workflow/run-any-llm/status?runId=...`

Implementation: `src/app/api/workflow/run-any-llm/**`

### Crop Image

- `POST /api/workflow/crop-image`
- `GET /api/workflow/crop-image/status?runId=...`

Implementation: `src/app/api/workflow/crop-image/**`

### Extract Frame

- `POST /api/workflow/extract-frame`
- `GET /api/workflow/extract-frame/status?runId=...`

Implementation: `src/app/api/workflow/extract-frame/**`
