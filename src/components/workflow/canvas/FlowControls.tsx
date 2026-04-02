"use client";

import React from "react";
import {
  Lock,
  Unlock,
  Save,
  Play,
  ListChecks,
  Moon,
  Sun,
} from "lucide-react";

type FlowControlsProps = {
  isDark: boolean;
  isCanvasLocked: boolean;
  isSaving: boolean;
  hasWorkflowId: boolean;

  onRunSelected: () => void | Promise<void>;
  onRunAll: () => void | Promise<void>;
  onSaveWorkflow: () => void | Promise<void>;
  onToggleCanvasLock: () => void;
  onToggleTheme: () => void;
};

const FlowControls = ({
  isDark,
  isCanvasLocked,
  isSaving,
  hasWorkflowId,
  onRunSelected,
  onRunAll,
  onSaveWorkflow,
  onToggleCanvasLock,
  onToggleTheme,
}: FlowControlsProps) => {
  const pillButtonClass = `inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-black/90 text-zinc-100 hover:bg-[#101010]"
      : "border-zinc-200 bg-white/95 text-zinc-900 hover:bg-zinc-100"
  }`;

  const iconButtonClass = `inline-flex h-10 w-10 items-center justify-center rounded-[16px] border transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-[#121212] text-white hover:bg-[#1a1a1a]"
      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
  }`;

  const disabledClass = "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex max-w-[720px] flex-wrap items-center justify-end gap-3">
      <button type="button" onClick={onRunSelected} className={pillButtonClass}>
        <ListChecks size={16} />
        Run Selected
      </button>

      <button type="button" onClick={onRunAll} className={pillButtonClass}>
        <Play size={16} />
        Run All
      </button>

      <button
        type="button"
        onClick={onSaveWorkflow}
        disabled={isSaving}
        className={`${pillButtonClass} ${disabledClass}`}
      >
        <Save size={16} />
        {isSaving ? "Saving..." : "Save Workflow"}
      </button>

      <button
        type="button"
        onClick={onToggleCanvasLock}
        className={pillButtonClass}
      >
        {isCanvasLocked ? <Lock size={16} /> : <Unlock size={16} />}
        {isCanvasLocked ? "Locked" : "Unlocked"}
      </button>

      <button
        type="button"
        onClick={onToggleTheme}
        className={iconButtonClass}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
};

export default FlowControls;