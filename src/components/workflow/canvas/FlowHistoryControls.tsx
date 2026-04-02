"use client";

import React from "react";
import { Undo2, Redo2 } from "lucide-react";

type FlowHistoryControlsProps = {
  isDark: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

const FlowHistoryControls = ({
  isDark,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: FlowHistoryControlsProps) => {
  const buttonClass = `inline-flex h-20 w-20 items-center justify-center rounded-[24px] border transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-[#121212] text-white hover:bg-[#181818]"
      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
  }`;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 size={30} />
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 size={30} />
      </button>
    </div>
  );
};

export default FlowHistoryControls;