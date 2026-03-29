"use client";

import { useMemo } from "react";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { resolveInputsForNode } from "@/lib/workflow/graph-input-resolver";

export function useResolvedNodeInputs(nodeId: string) {
  const nodes = useWorkflowEditorStore((state) => state.nodes);
  const edges = useWorkflowEditorStore((state) => state.edges);

  return useMemo(() => {
    return resolveInputsForNode(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);
}