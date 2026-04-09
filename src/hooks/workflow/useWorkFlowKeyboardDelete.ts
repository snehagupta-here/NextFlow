"use client";

import { useEffect } from "react";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

export function useWorkflowKeyboardDelete(fallbackNodeId?: string | null) {
  const removeSelectedElements = useWorkflowEditorStore(
    (state) => state.removeSelectedElements
  );
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  const nodes = useWorkflowEditorStore((state) => state.nodes);
  const edges = useWorkflowEditorStore((state) => state.edges);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      const isTyping =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        const hasSelectedElements =
          nodes.some((node) => node.selected) || edges.some((edge) => edge.selected);

        if (hasSelectedElements) {
          event.preventDefault();
          removeSelectedElements();
          return;
        }

        if (fallbackNodeId && nodes.some((node) => node.id === fallbackNodeId)) {
          event.preventDefault();
          removeNode(fallbackNodeId);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [edges, fallbackNodeId, nodes, removeNode, removeSelectedElements]);
}
