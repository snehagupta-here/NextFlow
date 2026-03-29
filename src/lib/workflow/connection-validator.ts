import type { Connection, Edge } from "@xyflow/react";
import { getOutgoers } from "@xyflow/react";
import type { WorkflowNode } from "@/types/workflow";
import { getHandleSpec } from "./connection-types";

function wouldCreateCycle(
  connection: Connection,
  nodes: WorkflowNode[],
  edges: Edge[]
) {
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!sourceNode || !targetNode) return false;
  if (sourceNode.id === targetNode.id) return true;

  const visited = new Set<string>();

  const hasPathToSource = (node: WorkflowNode): boolean => {
    if (visited.has(node.id)) return false;
    visited.add(node.id);

    const outgoers = getOutgoers(node, nodes, edges);

    for (const outgoer of outgoers) {
      if (outgoer.id === connection.source) return true;
      if (hasPathToSource(outgoer as WorkflowNode)) return true;
    }

    return false;
  };

  return hasPathToSource(targetNode as WorkflowNode);
}

export function isValidWorkflowConnection(
  connection: Connection,
  nodes: WorkflowNode[],
  edges: Edge[]
) {
  if (!connection.source || !connection.target) return false;
  if (connection.sourceHandle == null || connection.targetHandle == null) {
    return false;
  }
  if (connection.source === connection.target) return false;

  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  const sourceSpec = getHandleSpec(sourceNode.type, connection.sourceHandle);
  const targetSpec = getHandleSpec(targetNode.type, connection.targetHandle);

  if (!sourceSpec || !targetSpec) return false;
  if (sourceSpec.direction !== "source") return false;
  if (targetSpec.direction !== "target") return false;

  if (sourceSpec.valueType !== targetSpec.valueType) {
    return false;
  }

  if (!targetSpec.multiple) {
    const alreadyConnected = edges.some(
      (edge) =>
        edge.target === connection.target &&
        edge.targetHandle === connection.targetHandle
    );

    if (alreadyConnected) return false;
  }

  if (wouldCreateCycle(connection, nodes, edges)) {
    return false;
  }

  return true;
}