"use client";

import { useEffect } from "react";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

export function useWorkflowKeyboardHistory() {
  const undo = useWorkflowEditorStore((state) => state.undo);
  const redo = useWorkflowEditorStore((state) => state.redo);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      const isTyping =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable;

      if (isTyping) return;

      const modifier = event.metaKey || event.ctrlKey;

      if (modifier && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      if (
        modifier &&
        ((event.key.toLowerCase() === "z" && event.shiftKey) ||
          event.key.toLowerCase() === "y")
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);
}