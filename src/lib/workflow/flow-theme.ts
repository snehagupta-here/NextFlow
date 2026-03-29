import { MarkerType } from "@xyflow/react";
import type { ThemeMode } from "@/types/workflow";

export function getFlowTheme(theme: ThemeMode) {
  const isDark = theme === "dark";

  return {
    isDark,
    canvasClass: isDark ? "h-screen w-full bg-black" : "h-screen w-full bg-zinc-100",
    flowClass: isDark ? "bg-black" : "bg-zinc-100",
    backgroundColor: isDark ? "#111111" : "#d4d4d8",
    panelClass: isDark
      ? "rounded-2xl border border-white/10 bg-black/90 text-zinc-100 shadow-xl backdrop-blur"
      : "rounded-2xl border border-zinc-300 bg-white/90 text-zinc-900 shadow-xl backdrop-blur",
    subtitleClass: isDark ? "text-zinc-400" : "text-zinc-500",
    edgeDefaults: {
      style: {
        stroke: isDark ? "#71717a" : "#52525b",
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isDark ? "#71717a" : "#52525b",
      },
    },
    controlsClass: isDark
      ? "!overflow-hidden !rounded-2xl !border !border-white/10 !bg-black/90 !shadow-xl"
      : "!overflow-hidden !rounded-2xl !border !border-zinc-300 !bg-white/95 !shadow-xl",
    minimapClass: isDark
      ? "!overflow-hidden !rounded-2xl !border !border-white/10 !bg-black/90 !shadow-xl"
      : "!overflow-hidden !rounded-2xl !border !border-zinc-300 !bg-white/95 !shadow-xl",
    minimapNodeColor: isDark ? "#52525b" : "#a1a1aa",
    minimapMaskColor: isDark
      ? "rgba(0,0,0,0.6)"
      : "rgba(255,255,255,0.65)",
  };
}