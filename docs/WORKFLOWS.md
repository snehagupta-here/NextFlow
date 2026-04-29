# Workflows

Workflows are directed acyclic graphs (DAGs) of nodes connected by typed handles.

## Node types

Node types are defined in `src/types/workflow.ts`:

- `textNode` — produces text
- `uploadImageNode` — produces an image URL (via Transloadit)
- `uploadVideoNode` — produces a video URL (via Transloadit)
- `cropImageNode` — consumes an image URL; produces a cropped image URL (Trigger + ffmpeg)
- `extractFrameNode` — consumes a video URL; produces a frame image URL (Trigger + ffmpeg)
- `runAnyLlmNode` — consumes text (and optional images); produces text (Trigger + Gemini)

UI registrations:

- Node components registry: `src/lib/workflow/node-registry.ts`
- Default node data: `src/lib/workflow/constants.ts`
- Node/edge factories: `src/lib/workflow/node-factory.ts`, `src/lib/workflow/edge-factory.ts`

## Handles and connection validation

Each handle has:

- direction (`source` or `target`)
- value type (`text`, `image_url`, `video_url`)
- optional `multiple` fan-in (used by the LLM node’s `images` input)

Specs are in `src/lib/workflow/connection-types.ts`.

Connection rules enforced in `src/lib/workflow/connection-validator.ts`:

- no self edges
- handle directions must match (source → target)
- value types must match
- target handle can be single-connection unless `multiple: true`
- no cycles (prevents non-DAG graphs)

## Execution model

Execution is coordinated by `src/lib/workflow/workflow-executor.ts`:

- Builds a subgraph based on execution mode:
  - `all` — whole graph
  - `selected` — selected nodes + their ancestors
  - `single` — one node + its ancestors
- Asserts the subgraph is a DAG (`assertDag` in `execution-planner.ts`)
- Runs a topological execution loop with batches of ready nodes
- Tracks per-node status (`queued`, `running`, `success`, `error`, `skipped`)
- Supports “cached outputs” (if a node already has an output value stored in its `data`, it can be treated as `success` depending on the execution mode)

### Where node execution happens

Node executors live in `src/lib/workflow/node-executors.ts`.

- Local-only nodes (Text, Upload nodes) validate and return existing URLs/text.
- Task-backed nodes call Next API routes under `src/app/api/workflow/**` and poll status endpoints until completed/failed.

## Saving and run history

The editor UI saves workflow graphs to the DB:

- `POST /api/workflows` to create
- `PATCH /api/workflows/:id` to update

When running a workflow while signed in, the client records history:

- Creates a `WorkflowRun` row: `POST /api/workflows/:id/runs`
- Creates/updates `NodeRun` rows as nodes transition: `POST/PATCH /api/workflow-runs/:runId/node-runs/**`
- Finalizes the run: `PATCH /api/workflow-runs/:runId`

Implementation: `src/hooks/workflow/useWorkFlowExecution.ts`

## Adding a new node type (checklist)

1) Define the node type + data in `src/types/workflow.ts`
2) Add defaults in `src/lib/workflow/constants.ts`
3) Add a node component under `src/components/workflow/nodes/<your-node>/`
4) Register the node component in `src/lib/workflow/node-registry.ts`
5) Define handle specs in `src/lib/workflow/connection-types.ts`
6) Implement the executor in `src/lib/workflow/node-executors.ts`
7) If it needs background work:
   - add a Trigger task in `src/trigger`
   - add Next route handlers in `src/app/api/workflow/<your-task>/`
8) Update import/export sanitization if needed: `src/lib/workflow/serialization.ts`
