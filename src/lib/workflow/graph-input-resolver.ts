import type { Edge } from "@xyflow/react";
import type { WorkflowNode } from "@/types/workflow";
import type {
  IncomingHandleGroup,
  NodeMap,
  ResolvedInputs,
} from "./handle-resolver.types";
import { resolveNodeOutput } from "./node-output-resolver";

function buildNodeMap(nodes: WorkflowNode[]): NodeMap {
  return new Map(nodes.map((node) => [node.id, node]));
}

function groupIncomingEdgesByHandle(
  edges: Edge[],
  nodeId: string
): IncomingHandleGroup {
  const incoming = edges.filter((edge) => edge.target === nodeId);

  return incoming.reduce<IncomingHandleGroup>((acc, edge) => {
    const handle = edge.targetHandle || "default";
    if (!acc[handle]) acc[handle] = [];
    acc[handle].push(edge);
    return acc;
  }, {});
}

function normalizeOutput(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

function normalizeOutputArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

export function resolveInputsForNode(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: Edge[]
): ResolvedInputs {
  const nodeMap = buildNodeMap(nodes);
  const groupedHandles = groupIncomingEdgesByHandle(edges, nodeId);

  const resolved: ResolvedInputs = {};

  for (const [handle, handleEdges] of Object.entries(groupedHandles)) {
    const values = handleEdges
      .map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        if (!sourceNode) return null;
        return resolveNodeOutput(sourceNode, edge.sourceHandle);
      })
      .filter((value) => value !== null && value !== undefined && value !== "");

    if (handle === "images") {
      resolved[handle] = values.flatMap((value) => normalizeOutputArray(value));
    } else if (values.length > 1) {
      resolved[handle] = values.map((value) => normalizeOutput(value));
    } else {
      resolved[handle] = normalizeOutput(values[0] ?? "");
    }
  }

  return resolved;
}