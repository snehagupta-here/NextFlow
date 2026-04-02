"use client";

import React, { memo, useEffect, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TextNodeData } from "./text-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import NodeMenu from "@/components/workflow/common/NodeMenu";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const TextNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as TextNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { isDark } = useWorkflowTheme();

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [nodeData.text]);

  const containerClass = isDark
    ? selected
      ? "min-w-[260px] max-w-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-white/10 transition"
      : "min-w-[260px] max-w-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
    : selected
    ? "min-w-[260px] max-w-[320px] overflow-hidden rounded-[28px] border border-[#e7e7e7] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-black/5 transition"
    : "min-w-[260px] max-w-[320px] overflow-hidden rounded-[28px] border border-[#ececec] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

  const headerClass = isDark
    ? "flex items-start justify-between border-b border-white/10 px-4 py-3 bg-[#111111]"
    : "flex items-start justify-between border-b border-[#f0f0f0] px-4 py-3 bg-white";

  const bodyClass = isDark ? "px-4 py-3 bg-[#1a1a1a]" : "px-4 py-3 bg-[#fcfcfc]";

  const mutedLabelClass = isDark
    ? "text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
    : "text-xs font-medium uppercase tracking-[0.2em] text-zinc-500";

  const titleClass = isDark
    ? "mt-1 text-sm font-semibold text-white"
    : "mt-1 text-sm font-semibold text-zinc-800";

  const textareaClass = isDark
    ? "w-full resize-none overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20 focus:bg-[#141414]"
    : "w-full resize-none overflow-hidden rounded-2xl border border-[#ececec] bg-white px-3 py-3 text-sm leading-6 text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white";

  const sourceHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#16381f] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
    : "!h-4 !w-4 !border-[3px] !border-[#dcfce7] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.14)]";

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <div>
          <p className={mutedLabelClass}>Text Node</p>
          <p className={titleClass}>{nodeData.label}</p>
        </div>

        <NodeMenu onDelete={() => removeNode(id)} />
      </div>

      <div className={bodyClass}>
        <textarea
          ref={textareaRef}
          value={nodeData.text}
          onChange={(e) => {
            updateNodeData(id, { text: e.target.value });
            requestAnimationFrame(resizeTextarea);
          }}
          placeholder="Enter text here..."
          rows={1}
          className={textareaClass}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        className={sourceHandleClass}
      />
    </div>
  );
};

const TextNode = memo(TextNodeComponent);
export default TextNode;