import type { WorkflowNode } from "@/types/workflow";
import type { ExecutionGraph, ExecutionState } from "./execution-types";

export function resolveExecutionInputs(
  node: WorkflowNode,
  graph: ExecutionGraph,
  executionState: ExecutionState
) {
  const incomingEdges = graph.incomingByNode[node.id] ?? [];
  const resolved: Record<string, unknown> = {};

  for (const edge of incomingEdges) {
    const handleId = edge.targetHandle || "default";
    const sourceOutputs = executionState.outputsByNodeId[edge.source] ?? {};
    const value = sourceOutputs[edge.sourceHandle || "default"];

    if (handleId === "images") {
      const prev = Array.isArray(resolved[handleId]) ? (resolved[handleId] as unknown[]) : [];
      resolved[handleId] =
        value == null
          ? prev
          : Array.isArray(value)
          ? [...prev, ...value]
          : [...prev, value];
    } else {
      resolved[handleId] = value;
    }
  }

  return resolved;
}