import type { WorkflowEdge, WorkflowNode } from "@/types/workflow";
import type { ExecutionGraph, ExecutionMode } from "./execution-types";

function buildAdjacency(nodeIds: Set<string>, edges: WorkflowEdge[]) {
  const incomingByNode: Record<string, WorkflowEdge[]> = {};
  const outgoingByNode: Record<string, WorkflowEdge[]> = {};
  const inDegree: Record<string, number> = {};

  for (const id of nodeIds) {
    incomingByNode[id] = [];
    outgoingByNode[id] = [];
    inDegree[id] = 0;
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;

    outgoingByNode[edge.source].push(edge);
    incomingByNode[edge.target].push(edge);
    inDegree[edge.target] += 1;
  }

  return { incomingByNode, outgoingByNode, inDegree };
}

function collectAncestors(
  targetIds: string[],
  edges: WorkflowEdge[]
): Set<string> {
  const result = new Set<string>(targetIds);
  const stack = [...targetIds];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const incoming = edges.filter((edge) => edge.target === current);

    for (const edge of incoming) {
      if (!result.has(edge.source)) {
        result.add(edge.source);
        stack.push(edge.source);
      }
    }
  }

  return result;
}

function resolveTargetNodeIds(
  mode: ExecutionMode,
  nodes: WorkflowNode[]
): string[] {
  if (mode.type === "single") return [mode.nodeId];
  if (mode.type === "selected") return mode.nodeIds;
  return nodes.map((node) => node.id);
}

export function buildExecutionGraph(
  mode: ExecutionMode,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ExecutionGraph {
  const targetIds = resolveTargetNodeIds(mode, nodes);
  const subgraphNodeIds = collectAncestors(targetIds, edges);

  const filteredNodes = nodes.filter((node) => subgraphNodeIds.has(node.id));
  const filteredEdges = edges.filter(
    (edge) => subgraphNodeIds.has(edge.source) && subgraphNodeIds.has(edge.target)
  );

  const nodeMap = new Map(filteredNodes.map((node) => [node.id, node]));
  const { incomingByNode, outgoingByNode, inDegree } = buildAdjacency(
    subgraphNodeIds,
    filteredEdges
  );

  return {
    nodeMap,
    edges: filteredEdges,
    nodeIds: Array.from(subgraphNodeIds),
    incomingByNode,
    outgoingByNode,
    inDegree,
  };
}

export function assertDag(graph: ExecutionGraph) {
  const inDegree = { ...graph.inDegree };
  const queue = [...graph.nodeIds.filter((id) => inDegree[id] === 0)];
  let visited = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    visited += 1;

    for (const edge of graph.outgoingByNode[current]) {
      inDegree[edge.target] -= 1;
      if (inDegree[edge.target] === 0) {
        queue.push(edge.target);
      }
    }
  }

  if (visited !== graph.nodeIds.length) {
    throw new Error("Workflow contains a cycle. Only DAG workflows are allowed.");
  }
}