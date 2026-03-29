import { MarkerType, type Connection, type Edge } from "@xyflow/react";
import type { ThemeMode } from "@/types/workflow";

export function createWorkflowEdge(
  connection: Connection,
  theme: ThemeMode
): Edge {
  const isDark = theme === "dark";

  return {
    ...connection,
    id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: isDark ? "#71717a" : "#52525b",
    },
    style: {
      stroke: isDark ? "#71717a" : "#52525b",
      strokeWidth: 2,
    },
  };
}