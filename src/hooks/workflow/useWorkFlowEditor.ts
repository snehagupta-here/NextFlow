"use client";

import { useShallow } from "zustand/react/shallow";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

export function useWorkflowGraph() {
  return useWorkflowEditorStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
    }))
  );
}

export function useWorkflowActions() {
  return useWorkflowEditorStore(
    useShallow((state) => ({
      addNode: state.addNode,
      updateNodeData: state.updateNodeData,
      removeNode: state.removeNode,
      removeEdge: state.removeEdge,
      clearCanvas: state.clearCanvas,
    }))
  );
}