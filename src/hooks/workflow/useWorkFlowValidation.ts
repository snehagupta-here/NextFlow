"use client";

import { useCallback } from "react";
import type { Connection, Edge } from "@xyflow/react";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { isValidWorkflowConnection } from "@/lib/workflow/connection-validator";
import type { WorkflowEdge } from "@/types/workflow";

function isConnectionLike(
  value: Connection | Edge | WorkflowEdge
): value is Connection {
  return "source" in value && "target" in value;
}

export function useWorkflowValidation() {
  const nodes = useWorkflowEditorStore((state) => state.nodes);
  const edges = useWorkflowEditorStore((state) => state.edges);

  const isValidConnection = useCallback(
    (connectionOrEdge: Connection | Edge | WorkflowEdge) => {
      if (!isConnectionLike(connectionOrEdge)) return false;

      const connection: Connection = {
        source: connectionOrEdge.source,
        target: connectionOrEdge.target,
        sourceHandle: connectionOrEdge.sourceHandle ?? null,
        targetHandle: connectionOrEdge.targetHandle ?? null,
      };

      return isValidWorkflowConnection(connection, nodes, edges);
    },
    [nodes, edges]
  );

  return {
    isValidConnection,
  };
}