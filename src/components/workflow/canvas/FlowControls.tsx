"use client";

import React from "react";
import {
  Undo2,
  Redo2,
  Lock,
  Unlock,
} from "lucide-react";

type FlowControlsProps = {
  isDark: boolean;
  isCanvasLocked: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleCanvasLock: () => void;
  onAddTextNode: () => void;
  onAddImageNode: () => void;
  onAddVideoNode: () => void;
  onAddCropImageNode: () => void;
  onAddExtractFrameNode: () => void;
  onAddRunAnyLlmNode: () => void;
  onToggleTheme: () => void;
};

const FlowControls = ({
  isDark,
  isCanvasLocked,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleCanvasLock,
  onAddTextNode,
  onAddImageNode,
  onAddVideoNode,
  onAddCropImageNode,
  onAddExtractFrameNode,
  onAddRunAnyLlmNode,
  onToggleTheme,
}: FlowControlsProps) => {
  const buttonClass = `inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-black/90 text-zinc-100 hover:bg-[#0a0a0a]"
      : "border-zinc-300 bg-white/90 text-zinc-900 hover:bg-zinc-50"
  }`;

  const disabledClass = "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`${buttonClass} ${disabledClass}`}
      >
        <Undo2 size={16} />
        Undo
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`${buttonClass} ${disabledClass}`}
      >
        <Redo2 size={16} />
        Redo
      </button>

      <button type="button" onClick={onToggleCanvasLock} className={buttonClass}>
        {isCanvasLocked ? <Lock size={16} /> : <Unlock size={16} />}
        {isCanvasLocked ? "Canvas Locked" : "Canvas Unlocked"}
      </button>

      <button type="button" onClick={onAddTextNode} className={buttonClass}>
        Add Text Node
      </button>

      <button type="button" onClick={onAddImageNode} className={buttonClass}>
        Add Image Node
      </button>

      <button type="button" onClick={onAddVideoNode} className={buttonClass}>
        Add Video Node
      </button>

      <button type="button" onClick={onAddCropImageNode} className={buttonClass}>
        Add Crop Image Node
      </button>

      <button
        type="button"
        onClick={onAddExtractFrameNode}
        className={buttonClass}
      >
        Add Extract Frame Node
      </button>

      <button type="button" onClick={onAddRunAnyLlmNode} className={buttonClass}>
        Add LLM Node
      </button>

      <button type="button" onClick={onToggleTheme} className={buttonClass}>
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
};

export default FlowControls;