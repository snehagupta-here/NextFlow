"use client";

import React, { useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

type TextNodeData = {
  label?: string;
  text?: string;
  onChange?: (id: string, value: string) => void;
};

const TextNode = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as TextNodeData;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [nodeData.text]);

  return (
    <div
      className={`min-w-[260px] max-w-[300px] rounded-2xl border shadow-xl transition ${
        selected
          ? "border-white/20 bg-[#050505] ring-2 ring-white/10"
          : "border-white/10 bg-black/90"
      }`}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Text Node
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {nodeData.label || "Text"}
        </p>
      </div>

      <div className="px-4 py-3">
        <textarea
          ref={textareaRef}
          value={nodeData.text || ""}
          onChange={(e) => {
            nodeData.onChange?.(id, e.target.value);
            requestAnimationFrame(resizeTextarea);
          }}
          placeholder="Enter text here..."
          rows={1}
          className="w-full resize-none overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/[0.06]"
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
      />
    </div>
  );
};

export default TextNode;