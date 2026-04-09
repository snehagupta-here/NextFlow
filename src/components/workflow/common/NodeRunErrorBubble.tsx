"use client";

import React from "react";
import { AlertTriangle, Copy, X } from "lucide-react";

type NodeRunErrorBubbleProps = {
  message: string;
  onDismiss: () => void;
};

const NodeRunErrorBubble = ({
  message,
  onDismiss,
}: NodeRunErrorBubbleProps) => {
  return (
    <div className="pointer-events-auto absolute bottom-[calc(100%+12px)] left-1/2 z-30 w-[320px] -translate-x-1/2">
      <div className="relative overflow-hidden rounded-[22px] border border-[#8a5626] bg-[#5c3919] px-4 py-3 text-[#f6d3ae] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#ffd8b0]" />
            <div>
              <div className="text-[14px] font-semibold leading-none">Failed</div>
              <p className="mt-2 max-w-[210px] text-[13px] leading-6 text-[#f6d3ae]">
                {message}
              </p>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="mt-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-2xl bg-[#7a431b] px-3.5 text-[12px] font-medium text-[#fff1df] transition hover:bg-[#8a4d20]"
              >
                <Copy size={14} />
                Copy error details
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl text-[#f7d8b4] transition hover:bg-[#74421d]"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>

        <div className="absolute bottom-[-7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-r border-[#8a5626] bg-[#5c3919]" />
      </div>
    </div>
  );
};

export default NodeRunErrorBubble;
