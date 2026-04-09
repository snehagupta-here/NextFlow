import { MarkerType, type Connection, type Edge } from "@xyflow/react";
import type { ThemeMode } from "@/types/workflow";

export function createWorkflowEdge(
  connection: Connection,
  theme: ThemeMode
): Edge {
  void theme;
  const stroke = "#4e387e";

  return {
    ...connection,
    id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: stroke,
    },
    style: {
      stroke,
      strokeWidth: 2.2,
    },
  };
}
