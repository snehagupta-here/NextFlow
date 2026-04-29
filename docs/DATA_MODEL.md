# Data Model (Prisma)

Schema file: `prisma/schema.prisma`

## `Workflow`

User-owned workflow graph.

- `id` — cuid
- `userId` — Clerk user id
- `name` — display name
- `description` — optional
- `nodes` — JSON (React Flow nodes)
- `edges` — JSON (React Flow edges)
- `viewport` — JSON (optional UI viewport state)
- `createdAt`, `updatedAt`

## `WorkflowRun`

One execution attempt of a workflow.

- `id` — cuid
- `userId` — Clerk user id
- `workflowId` — parent workflow
- `scope` — `FULL | SELECTED | SINGLE`
- `status` — `RUNNING | SUCCESS | FAILED | PARTIAL`
- `targetNodeIds` — JSON list of node ids (optional)
- `startedAt`, `finishedAt`
- `durationMs`
- `errorMessage` — optional failure detail

## `NodeRun`

Per-node telemetry within a `WorkflowRun`.

- `id` — cuid
- `userId` — Clerk user id
- `workflowRunId` — parent run
- `nodeId` — React Flow node id
- `nodeType` — node type string (e.g. `runAnyLlmNode`)
- `nodeLabel` — optional label shown in UI
- `status` — `QUEUED | RUNNING | SUCCESS | FAILED | SKIPPED`
- `startedAt`, `finishedAt`
- `durationMs`
- `inputsUsed` — JSON snapshot of inputs for debugging
- `outputsGenerated` — JSON outputs (when available)
- `errorMessage` — optional failure detail

## Notes

- Workflows store `nodes` and `edges` as JSON; Prisma does not enforce a strict schema for those fields. Validation lives in `src/lib/api/workflow-schemas.ts` (for API persistence) and `src/lib/workflow/serialization.ts` (for import/export).
