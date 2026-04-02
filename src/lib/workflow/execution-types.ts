import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

export type ExecutionMode =
  | { type: "single"; nodeId: string; force?: boolean }
  | { type: "selected"; nodeIds: string[]; force?: boolean }
  | { type: "all"; force?: boolean };

export type NodeExecutionOutputs = Record<string, unknown>;

export type ExecutionStatus =
  | "idle"
  | "queued"
  | "running"
  | "success"
  | "error"
  | "skipped";

export type ExecutionState = {
  outputsByNodeId: Record<string, NodeExecutionOutputs>;
  statusByNodeId: Record<string, ExecutionStatus>;
  errorByNodeId: Record<string, string | undefined>;
};

export type ExecutionGraph = {
  nodeMap: Map<string, WorkflowNode>;
  edges: WorkflowEdge[];
  nodeIds: string[];
  incomingByNode: Record<string, WorkflowEdge[]>;
  outgoingByNode: Record<string, WorkflowEdge[]>;
  inDegree: Record<string, number>;
};

export type NodeExecutionContext = {
  node: WorkflowNode;
  resolvedInputs: Record<string, unknown>;
};

export type NodeExecutionResult = {
  outputs?: NodeExecutionOutputs;
  uiPatch?: Record<string, unknown>;
};

export type ExecuteNodeFn = (
  ctx: NodeExecutionContext
) => Promise<NodeExecutionResult>;