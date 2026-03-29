"use client";

import { useWorkflowUiStore } from "@/stores/workflow-ui.store";

export function useWorkflowTheme() {
  const theme = useWorkflowUiStore((state) => state.theme);
  const toggleTheme = useWorkflowUiStore((state) => state.toggleTheme);

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };
}