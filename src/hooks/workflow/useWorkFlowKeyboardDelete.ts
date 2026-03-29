"use client";

import { useEffect } from "react";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

export function useWorkflowKeyboardDelete() {
  const removeSelectedElements = useWorkflowEditorStore(
    (state) => state.removeSelectedElements
  );

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
        removeSelectedElements();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [removeSelectedElements]);
}