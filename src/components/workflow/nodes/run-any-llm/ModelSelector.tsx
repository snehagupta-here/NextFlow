"use client";

import React, { useEffect, useRef, useState } from "react";
import type { GeminiModelOption } from "@/types/gemini-model";

type ModelSelectorProps = {
  value: string;
  models: GeminiModelOption[];
  isLoading?: boolean;
  onChange: (value: string) => void;
};

function getBadgeClass(badge?: GeminiModelOption["badge"]) {
  if (badge === "deprecated") {
    return "bg-amber-500/15 text-amber-300";
  }

  if (badge === "paid quota") {
    return "bg-rose-500/15 text-rose-300";
  }

  if (badge === "quota unavailable") {
    return "bg-orange-500/15 text-orange-300";
  }

  return "bg-zinc-500/15 text-zinc-300";
}

const ModelSelector = ({
  value,
  models,
  isLoading = false,
  onChange,
}: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedModel =
    models.find((model) => model.id === value) ||
    models.find((model) => !model.disabled);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!menuRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    menuRef.current.scrollTop += e.deltaY;
  };

  return (
    <div
      ref={rootRef}
      className="relative nodrag nopan"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen((prev) => !prev)}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="nodrag nopan flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate">
            {isLoading
              ? "Loading models..."
              : selectedModel?.id || "Select model"}
          </span>

          {selectedModel?.badge ? (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${getBadgeClass(
                selectedModel.badge
              )}`}
            >
              {selectedModel.badge}
            </span>
          ) : null}
        </div>

        <span
          className={`ml-3 shrink-0 text-xs text-zinc-400 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          className="nodrag nopan absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onWheelCapture={handleWheelCapture}
        >
          {models.length === 0 && !isLoading ? (
            <div className="px-3 py-2 text-sm text-zinc-400">
              No models available
            </div>
          ) : null}

          {models.map((model) => {
            const isSelected = model.id === selectedModel?.id;

            return (
              <button
                key={model.id}
                type="button"
                disabled={model.disabled}
                onClick={() => {
                  if (model.disabled) return;
                  onChange(model.id);
                  setOpen(false);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className={`mb-1 flex w-full items-start justify-between rounded-xl border px-3 py-2 text-left transition last:mb-0 ${
                  model.disabled
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
                    : isSelected
                    ? "border-white/15 bg-white/[0.06]"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="truncate text-sm text-white">{model.id}</div>

                  {model.description ? (
                    <div className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {model.description}
                    </div>
                  ) : null}

                  {model.disabled && model.disabledReason ? (
                    <div className="mt-1 text-[11px] text-zinc-500">
                      {model.disabledReason === "unsupported"
                        ? "Does not support generateContent"
                        : model.disabledReason === "deprecated"
                        ? "Deprecated model"
                        : model.disabledReason === "paid_quota"
                        ? "Requires paid quota or restricted access"
                        : "Quota unavailable"}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {model.badge ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getBadgeClass(
                        model.badge
                      )}`}
                    >
                      {model.badge}
                    </span>
                  ) : null}

                  {isSelected ? (
                    <span className="text-xs text-zinc-300">✓</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ModelSelector;