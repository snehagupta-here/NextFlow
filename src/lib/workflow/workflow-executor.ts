import type { WorkflowNode } from "@/types/workflow";
import { buildExecutionGraph, assertDag } from "./execution-planner";
import { resolveExecutionInputs } from "./execution-input-resolver";
import { getNodeExecutor } from "./node-executors";
import { getExistingNodeOutputs } from "./existing-node-outputs";
import type {
  ExecutionMode,
  ExecutionState,
  ExecutionGraph,
} from "./execution-types";

type ExecutorCallbacks = {
  onNodeQueued?: (nodeId: string) => void;
  onNodeRunning?: (nodeId: string) => void;
  onNodeSuccess?: (
    nodeId: string,
    outputs: Record<string, unknown>,
    uiPatch?: Record<string, unknown>
  ) => void;
  onNodeError?: (nodeId: string, error: string) => void;
  onNodeSkipped?: (nodeId: string, reason: string) => void;
};

function buildInitialState(graph: ExecutionGraph): ExecutionState {
  const statusByNodeId: ExecutionState["statusByNodeId"] = {};
  const errorByNodeId: ExecutionState["errorByNodeId"] = {};
  const outputsByNodeId: ExecutionState["outputsByNodeId"] = {};

  for (const id of graph.nodeIds) {
    const node = graph.nodeMap.get(id)!;
    const existingOutputs = getExistingNodeOutputs(node);

    outputsByNodeId[id] = existingOutputs;
    statusByNodeId[id] =
      Object.keys(existingOutputs).length > 0 ? "success" : "idle";

    errorByNodeId[id] = undefined;
  }

  return {
    outputsByNodeId,
    statusByNodeId,
    errorByNodeId,
  };
}

function hasFailedDependency(
  nodeId: string,
  graph: ExecutionGraph,
  state: ExecutionState
) {
  const incoming = graph.incomingByNode[nodeId] ?? [];
  return incoming.some((edge) => {
    const depStatus = state.statusByNodeId[edge.source];
    return depStatus === "error" || depStatus === "skipped";
  });
}

function isTargetNode(mode: ExecutionMode, nodeId: string) {
  if (mode.type === "single") {
    return mode.nodeId === nodeId;
  }

  if (mode.type === "selected") {
    return mode.nodeIds.includes(nodeId);
  }

  if (mode.type === "all") {
    return true;
  }

  return false;
}

export async function executeWorkflow(
  mode: ExecutionMode,
  nodes: WorkflowNode[],
  edges: any[],
  callbacks: ExecutorCallbacks = {}
) {
  const graph = buildExecutionGraph(mode, nodes, edges);
  assertDag(graph);

  const state = buildInitialState(graph);
  const inDegree = { ...graph.inDegree };
  const active = new Set<Promise<void>>();

  const processNode = async (nodeId: string) => {
    const node = graph.nodeMap.get(nodeId)!;

    if (hasFailedDependency(nodeId, graph, state)) {
      state.statusByNodeId[nodeId] = "skipped";
      state.errorByNodeId[nodeId] = "Skipped because a dependency failed.";
      callbacks.onNodeSkipped?.(nodeId, "Skipped because a dependency failed.");
    } else {
      const existingOutputs = state.outputsByNodeId[nodeId] ?? {};
      const hasCachedOutput = Object.keys(existingOutputs).length > 0;
      const targetNode = isTargetNode(mode, nodeId);

      if (!targetNode && hasCachedOutput) {
        state.statusByNodeId[nodeId] = "success";
        callbacks.onNodeSuccess?.(nodeId, existingOutputs, undefined);
      } else {
        try {
          state.statusByNodeId[nodeId] = "running";
          callbacks.onNodeRunning?.(nodeId);

          const resolvedInputs = resolveExecutionInputs(node, graph, state);
          const executor = getNodeExecutor(node);
          const result = await executor({ node, resolvedInputs });

          state.outputsByNodeId[nodeId] = result.outputs ?? {};
          state.statusByNodeId[nodeId] = "success";
          state.errorByNodeId[nodeId] = undefined;

          callbacks.onNodeSuccess?.(
            nodeId,
            result.outputs ?? {},
            result.uiPatch
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Execution failed.";

          state.statusByNodeId[nodeId] = "error";
          state.errorByNodeId[nodeId] = message;

          callbacks.onNodeError?.(nodeId, message);
        }
      }
    }

    for (const edge of graph.outgoingByNode[nodeId] ?? []) {
      inDegree[edge.target] -= 1;
      if (inDegree[edge.target] === 0) {
        state.statusByNodeId[edge.target] = "queued";
        callbacks.onNodeQueued?.(edge.target);
        scheduleNode(edge.target);
      }
    }
  };

  const scheduleNode = (nodeId: string) => {
    const task = processNode(nodeId).finally(() => {
      active.delete(task);
    });
    active.add(task);
  };

  for (const id of graph.nodeIds.filter((nodeId) => inDegree[nodeId] === 0)) {
    state.statusByNodeId[id] = "queued";
    callbacks.onNodeQueued?.(id);
    scheduleNode(id);
  }

  while (active.size > 0) {
    await Promise.race(active);
  }

  return state;
}
