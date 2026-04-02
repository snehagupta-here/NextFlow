import { z } from "zod";

const nodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const flowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: nodePositionSchema,
  data: z.record(z.string(), z.any()).default({}),
});

const flowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  type: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const workflowIdParamSchema = z.object({
  workflowId: z.string().min(1, "workflowId is required"),
});

export const runIdParamSchema = z.object({
  runId: z.string().min(1, "runId is required"),
});

export const nodeRunParamsSchema = z.object({
  runId: z.string().min(1, "runId is required"),
  nodeRunId: z.string().min(1, "nodeRunId is required"),
});

export const workflowListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).optional(),
});

export const createWorkflowRunBodySchema = z.object({
  scope: z.enum(["FULL", "SELECTED", "SINGLE"]).default("FULL"),
  targetNodeIds: z.array(z.string().min(1)).default([]),
});

export const updateWorkflowRunBodySchema = z.object({
  status: z.enum(["RUNNING", "SUCCESS", "FAILED", "PARTIAL"]).optional(),
  finishedAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  errorMessage: z.string().nullable().optional(),
});

export const createNodeRunBodySchema = z.object({
  nodeId: z.string().min(1),
  nodeType: z.string().min(1),
  nodeLabel: z.string().nullable().optional(),
  status: z.enum(["QUEUED", "RUNNING", "SUCCESS", "FAILED", "SKIPPED"]),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  inputsUsed: z.unknown().optional(),
  outputsGenerated: z.unknown().optional(),
  errorMessage: z.string().nullable().optional(),
});

export const updateNodeRunBodySchema = z.object({
  status: z.enum(["QUEUED", "RUNNING", "SUCCESS", "FAILED", "SKIPPED"]).optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  inputsUsed: z.unknown().optional(),
  outputsGenerated: z.unknown().optional(),
  errorMessage: z.string().nullable().optional(),
});

export const createWorkflowBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
});

export const updateWorkflowBodySchema = createWorkflowBodySchema.partial().refine(
  (value) =>
    value.name !== undefined ||
    value.nodes !== undefined ||
    value.edges !== undefined,
  {
    message: "At least one field must be provided.",
    path: [],
  }
);

export const extractFrameBodySchema = z.object({
  videoUrl: z.url().trim(),
  timestamp: z.string().trim().min(1),
});

export const extractFrameStatusQuerySchema = z.object({
  runId: z.string().trim().min(1),
});

export const runAnyLlmBodySchema = z.object({
  model: z.string().trim().min(1),
  systemPrompt: z.string().optional().default(""),
  userMessage: z.string().trim().min(1, "userMessage is required"),
  imageUrls: z.array(z.url()).default([]),
});

export const runAnyLlmStatusQuerySchema = z.object({
  runId: z.string().trim().min(1),
});
