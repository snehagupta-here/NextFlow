import type { WorkflowNode, AddNodePayload } from "@/types/workflow";
import { DEFAULT_NODE_POSITION, NODE_DEFAULTS } from "./constants";

const createNodeId = (type: string) =>
  `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export function createWorkflowNode(payload: AddNodePayload): WorkflowNode {
  const baseData = NODE_DEFAULTS[payload.type];

  return {
    id: createNodeId(payload.type),
    type: payload.type,
    position: payload.position ?? {
      x: DEFAULT_NODE_POSITION.x + Math.random() * 120,
      y: DEFAULT_NODE_POSITION.y + Math.random() * 120,
    },
    data: {
      ...baseData,
      ...(payload.data ?? {}),
    },
  };
}