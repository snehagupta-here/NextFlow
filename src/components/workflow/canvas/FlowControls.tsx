"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Lock,
  Unlock,
  Save,
  Play,
  ChevronLeft,
} from "lucide-react";

type FlowControlsProps = {
  isDark: boolean;
  isCanvasLocked: boolean;
  isSaving: boolean;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  children?:
    | React.ReactNode
    | ((helpers: { closeMenu: () => void }) => React.ReactNode);

  onRunAll: () => void | Promise<void>;
  onSaveWorkflow: () => void | Promise<void>;
  onToggleCanvasLock: () => void;
};

const FlowControls = ({
  isDark,
  isCanvasLocked,
  isSaving,
  workflowName,
  onWorkflowNameChange,
  onRunAll,
  onSaveWorkflow,
  onToggleCanvasLock,
  children,
}: FlowControlsProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftWorkflowName, setDraftWorkflowName] = useState(workflowName);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const workflowNameInputRef = useRef<HTMLInputElement | null>(null);

  const pillButtonClass = `inline-flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-4 text-[12px] font-medium transition ${
    isDark
      ? "bg-transparent text-zinc-100 hover:bg-[#141414]"
      : "bg-transparent text-zinc-900 hover:bg-zinc-100"
  }`;

  const menuTriggerClass = `inline-flex h-12 items-center gap-2 rounded-xl px-3 text-sm font-medium transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-[#202020] text-zinc-100"
      : "border border-black/10 bg-[#f3f3f3] text-zinc-900 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_10px_30px_rgba(0,0,0,0.10)]"
  }`;
  const workflowNameButtonClass = isDark
    ? "inline-flex h-6 max-w-[220px] items-center rounded-lg px-2 text-sm leading-none font-medium text-zinc-100 transition hover:bg-[#383838]"
    : "inline-flex h-6 max-w-[220px] items-center rounded-lg px-2 text-sm leading-none font-medium text-zinc-900 transition hover:bg-zinc-200/80";
  const workflowNameInputClass = isDark
    ? "h-6 w-[220px] rounded-lg border border-[0.5px] border-white/35 bg-transparent px-2 py-1 text-sm leading-none font-medium text-zinc-100 outline-none placeholder:text-zinc-500"
    : "h-6 w-[220px] rounded-lg border border-[0.5px] border-black/30 bg-transparent px-2 py-0 text-sm leading-none font-medium text-zinc-900 outline-none placeholder:text-zinc-400";

  const disabledClass = "disabled:cursor-not-allowed disabled:opacity-50";

  const handleAction = (callback: () => void | Promise<void>) => async () => {
    setIsMenuOpen(false);
    await callback();
  };

  const handleGoBack = () => {
    setIsMenuOpen(false);
    window.history.back();
  };

  const commitWorkflowName = () => {
    const trimmedName = draftWorkflowName.trim();
    onWorkflowNameChange(trimmedName || "Untitled");
    setDraftWorkflowName(trimmedName);
    setIsEditingName(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isEditingName) return;
    setDraftWorkflowName(workflowName);
  }, [isEditingName, workflowName]);

  useEffect(() => {
    if (!isEditingName) return;
    workflowNameInputRef.current?.focus();
    workflowNameInputRef.current?.select();
  }, [isEditingName]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex items-center gap-3" ref={containerRef}>
      <div className="relative">
        <div className={menuTriggerClass}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-8 w-7 cursor-pointer items-center justify-center rounded-lg transition hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Open workflow actions"
            title="Open workflow actions"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isEditingName ? (
            <input
              ref={workflowNameInputRef}
              value={draftWorkflowName}
              onChange={(event) => setDraftWorkflowName(event.target.value)}
              onBlur={commitWorkflowName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitWorkflowName();
                }

                if (event.key === "Escape") {
                  setDraftWorkflowName(workflowName);
                  setIsEditingName(false);
                }
              }}
              placeholder="My Workflow"
              className={workflowNameInputClass}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className={workflowNameButtonClass}
              title={workflowName}
            >
              <span className="truncate">{workflowName}</span>
            </button>
          )}
        </div>

        {isMenuOpen ? (
          <div
            className={`absolute left-0 top-14 z-50 flex min-w-[240px] flex-col gap-1 rounded-2xl border border-[0.5px] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
              isDark
                ? "border-white/10 bg-[#202020]"
                : "border-zinc-200 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={handleGoBack}
              className={pillButtonClass}
            >
              <ChevronLeft size={14} />
              Back
            </button>

            {typeof children === "function" ? children({ closeMenu }) : children}

            <button
              type="button"
              onClick={handleAction(() => onRunAll())}
              className={pillButtonClass}
            >
              <Play size={14} />
              Run All
            </button>

            <button
              type="button"
              onClick={handleAction(() => onSaveWorkflow())}
              disabled={isSaving}
              className={`${pillButtonClass} ${disabledClass}`}
            >
              <Save size={14} />
              {isSaving ? "Saving..." : "Save Workflow"}
            </button>

            <button
              type="button"
              onClick={handleAction(onToggleCanvasLock)}
              className={pillButtonClass}
            >
              {isCanvasLocked ? <Lock size={14} /> : <Unlock size={14} />}
              {isCanvasLocked ? "Locked" : "Unlocked"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FlowControls;
