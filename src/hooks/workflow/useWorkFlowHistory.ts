"use client";

import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

export function useWorkflowHistory() {
  const undo = useWorkflowEditorStore((state) => state.undo);
  const redo = useWorkflowEditorStore((state) => state.redo);
  const history = useWorkflowEditorStore((state) => state.history);
  const future = useWorkflowEditorStore((state) => state.future);

  return {
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
  };
}