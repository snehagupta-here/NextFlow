"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock, Unlock, Save, Play, Plus } from "lucide-react";

type FlowControlsProps = {
  isDark: boolean;
  isCanvasLocked: boolean;
  isSaving: boolean;
  isNewWorkflowDisabled: boolean;
  children?: React.ReactNode;
  onCreateNewWorkflow: () => void;
  onRunAll: () => void | Promise<void>;
  onSaveWorkflow: () => void | Promise<void>;
  onToggleCanvasLock: () => void;
};

type WorkflowNameControlProps = {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
};

export const WorkflowNameControl = ({
  workflowName,
  onWorkflowNameChange,
}: WorkflowNameControlProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftWorkflowName, setDraftWorkflowName] = useState(workflowName);
  const workflowNameInputRef = useRef<HTMLInputElement | null>(null);
  const nameButtonClass =
    "inline-flex h-11 w-[min(72vw,200px)] items-center justify-center rounded-[12px] bg-[#202020] px-4 text-sm font-medium text-zinc-100 shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition hover:bg-[#2a2a2a]";
  const nameInputClass =
    "h-11 w-[min(72vw,200px)] rounded-[12px] bg-[#202020] px-4 text-center text-sm font-medium text-zinc-100 outline-none shadow-[0_18px_45px_rgba(0,0,0,0.28)] placeholder:text-zinc-500";

  const commitWorkflowName = () => {
    const trimmedName = draftWorkflowName.trim();
    const nextName = trimmedName || "Untitled";
    onWorkflowNameChange(nextName);
    setDraftWorkflowName(nextName);
    setIsEditingName(false);
  };

  useEffect(() => {
    if (isEditingName) return;
    setDraftWorkflowName(workflowName);
  }, [isEditingName, workflowName]);

  useEffect(() => {
    if (!isEditingName) return;
    workflowNameInputRef.current?.focus();
    workflowNameInputRef.current?.select();
  }, [isEditingName]);

  if (isEditingName) {
    return (
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
        placeholder="Untitled"
        className={nameInputClass}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditingName(true)}
      className={nameButtonClass}
      title={workflowName}
    >
      <span className="truncate">{workflowName}</span>
    </button>
  );
};

const FlowControls = ({
  isDark,
  isCanvasLocked,
  isSaving,
  isNewWorkflowDisabled,
  onCreateNewWorkflow,
  onRunAll,
  onSaveWorkflow,
  onToggleCanvasLock,
  children,
}: FlowControlsProps) => {
  const railClass = isDark
    ? "bg-[#202020] text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
    : "bg-[#202020] text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.22)]";
  const iconButtonClass = `flex h-10 w-10 items-center justify-center rounded-xl transition ${
    isDark
      ? "text-zinc-100 hover:bg-white/[0.1]"
      : "text-zinc-100 hover:bg-white/10"
  }`;
  const saveButtonClass = `flex h-10 w-10 items-center justify-center rounded-xl transition ${
    isDark
      ? "text-emerald-100 hover:bg-emerald-500/22"
      : "text-emerald-300 hover:bg-emerald-500/20"
  }`;
  const primaryButtonClass =
    `flex h-10 w-10 items-center justify-center rounded-xl transition ${
      isDark
        ? "text-zinc-100 hover:bg-white/[0.1]"
        : "text-zinc-100 hover:bg-white/10"
    }`;

  const disabledClass = "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className={`flex w-fit items-center gap-1 rounded-[14px] px-2 py-1.5 backdrop-blur-xl ${railClass}`}>
      <ActionIcon
        label="New Workflow"
        isDark={isDark}
        className={`${primaryButtonClass} ${disabledClass}`}
        disabled={isNewWorkflowDisabled}
        onClick={onCreateNewWorkflow}
      >
        <Plus size={18} />
      </ActionIcon>

      {children}

      <ActionIcon
        label="Run All"
        isDark={isDark}
        className={iconButtonClass}
        onClick={() => onRunAll()}
      >
        <Play size={18} />
      </ActionIcon>

      <ActionIcon
        label={isSaving ? "Saving..." : "Save Workflow"}
        isDark={isDark}
        className={`${saveButtonClass} ${disabledClass}`}
        disabled={isSaving}
        onClick={() => onSaveWorkflow()}
      >
        <Save size={18} />
      </ActionIcon>

      <ActionIcon
        label={isCanvasLocked ? "Unlock Canvas" : "Lock Canvas"}
        isDark={isDark}
        className={iconButtonClass}
        onClick={onToggleCanvasLock}
      >
        {isCanvasLocked ? <Lock size={18} /> : <Unlock size={18} />}
      </ActionIcon>
    </div>
  );
};

type ActionIconProps = {
  label: string;
  isDark: boolean;
  className: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
};

const ActionIcon = ({
  label,
  isDark,
  className,
  disabled = false,
  children,
  onClick,
}: ActionIconProps) => {
  const tooltipClass =
    "border-black/10 bg-white text-black shadow-[0_12px_32px_rgba(0,0,0,0.16)]";

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => {
          void onClick();
        }}
        disabled={disabled}
        className={className}
        aria-label={label}
        title={label}
      >
        {children}
      </button>

      <div
        className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-[12px] font-medium opacity-0 transition duration-200 group-hover:opacity-100 md:block ${tooltipClass}`}
      >
        <div className="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1 rotate-45 border-l border-t border-black/10 bg-white" />
        {label}
      </div>
    </div>
  );
};

export default FlowControls;
