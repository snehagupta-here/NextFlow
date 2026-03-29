"use client";

import { useMemo } from "react";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

export function useConnectedInputHandles(nodeId: string) {
  const edges = useWorkflowEditorStore((state) => state.edges);

  return useMemo(() => {
    const connected = new Set<string>();

    for (const edge of edges) {
      if (edge.target === nodeId && edge.targetHandle) {
        connected.add(edge.targetHandle);
      }
    }

    return connected;
  }, [edges, nodeId]);
}