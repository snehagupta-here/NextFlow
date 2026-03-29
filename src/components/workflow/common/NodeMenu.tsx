"use client";

import React, { useState } from "react";

type NodeMenuProps = {
  onDelete: () => void;
};

const NodeMenu = ({ onDelete }: NodeMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative nodrag nopan">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
      >
        ⋯
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[120px] rounded-xl border border-white/10 bg-zinc-950 p-1 shadow-2xl">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-white/[0.05]"
          >
            Delete node
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default NodeMenu;