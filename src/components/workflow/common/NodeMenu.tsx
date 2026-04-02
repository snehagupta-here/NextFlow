"use client";

import React, { useState } from "react";
import { MoreHorizontal, Play, Trash2 } from "lucide-react";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

type NodeMenuProps = {
  onRun?: () => void;
  onDelete: () => void;
};

const NodeMenu = ({ onRun, onDelete }: NodeMenuProps) => {
  const [open, setOpen] = useState(false);
  const { isDark } = useWorkflowTheme();

  const triggerClass = isDark
    ? "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0d0d0d] text-zinc-300 transition hover:bg-[#161616] hover:text-white"
    : "flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900";

  const menuClass = isDark
    ? "absolute right-0 top-11 z-50 min-w-[160px] overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
    : "absolute right-0 top-11 z-50 min-w-[160px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-1 shadow-[0_16px_40px_rgba(0,0,0,0.10)]";

  const itemClass = isDark
    ? "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-white/10"
    : "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100";

  const deleteClass = isDark
    ? "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10"
    : "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClass}
        aria-label="Node options"
        title="Node options"
      >
        <MoreHorizontal size={16} />
      </button>

      {open ? (
        <div className={menuClass}>
          {onRun ? (
            <button
              type="button"
              onClick={() => {
                onRun();
                setOpen(false);
              }}
              className={itemClass}
            >
              <Play size={15} />
              Run
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className={deleteClass}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default NodeMenu;