"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TextNodeData } from "./text-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import NodeHoverRunButton from "@/components/workflow/common/NodeHoverRunButton";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const TextNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as TextNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const { runWorkflow } = useWorkflowExecution();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { isDark } = useWorkflowTheme();
  const [isEditingLabel, setIsEditingLabel] = useState(false);

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
      ? "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#2e2e2e] bg-[#242424] text-zinc-200 shadow-[0_22px_60px_rgba(0,0,0,0.45)] ring-2 ring-[#4f8cff]/25 transition"
      : "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#2d2d2d] bg-[#242424] text-zinc-200 shadow-[0_22px_60px_rgba(0,0,0,0.45)] transition"
    : selected
    ? "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#4f8cff] bg-[#f5f5f5] text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#4f8cff]/15 transition"
    : "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#e7e7e7] bg-[#f5f5f5] text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

  const topBarClass = isDark
    ? "mb-3 flex items-center gap-4 px-6 text-zinc-500"
    : "mb-3 flex items-center gap-4 px-6 text-zinc-500";

  const titleClass = isDark
    ? "text-[18px] font-medium text-zinc-500"
    : "text-[18px] font-medium text-zinc-500";

  const ioBarClass = isDark
    ? "flex items-center justify-between border-white/6 px-6 py-2 text-[17px] font-medium text-zinc-500"
    : "flex items-center justify-between border-black/6 px-6 py-2 text-[17px] font-medium text-zinc-500";

  const bodyClass = isDark ? "px-6 pb-4 pt-2" : "px-6 pb-4 pt-2";

  const textareaClass = isDark
    ? "nodrag nopan min-h-[140px] w-full resize-none overflow-hidden rounded-[14px] border border-white/8 bg-[#171717] px-4 py-3 text-[18px] leading-8 text-white outline-none placeholder:text-zinc-500 focus:border-white/12 focus:bg-[#191919]"
    : "nodrag nopan min-h-[140px] w-full resize-none overflow-hidden rounded-[14px] border border-black/8 bg-white px-4 py-3 text-[18px] leading-8 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/12 focus:bg-white";
  const handleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(102,45,145,0.22)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(102,45,145,0.16)]";

  const displayLabel = isEditingLabel ? nodeData.label : nodeData.label || "Text 1";

  return (
    <div className="group relative overflow-visible">
      <NodeHoverRunButton
        nodeId={id}
        onRunWorkflow={() => runWorkflow(id, true)}
      />

      <div className={topBarClass}>
        <input
          type="text"
          value={displayLabel}
          placeholder="Node Name"
          className={`${titleClass} nodrag nopan min-w-[72px] bg-transparent outline-none ${
            isDark ? "placeholder:text-zinc-600" : "placeholder:text-zinc-400"
          }`}
          onFocus={() => {
            setIsEditingLabel(true);
            if ((nodeData.label || "Text 1") === "Text 1") {
              updateNodeData(id, { label: "" });
            }
          }}
          onBlur={() => {
            setIsEditingLabel(false);
            if (!nodeData.label.trim()) {
              updateNodeData(id, { label: "Text 1" });
            }
          }}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>

      <div className={containerClass}>
        <Handle
          type="target"
          position={Position.Left}
          id="text-input"
          style={{ top: 36 }}
          className={handleClass}
        />

        <Handle
          type="source"
          position={Position.Right}
          id="text-output"
          style={{ top: 36 }}
          className={handleClass}
        />

        <div className={ioBarClass}>
          <span>Input</span>
          <span>Output</span>
        </div>

        <div className={bodyClass}>
          <textarea
            ref={textareaRef}
            value={nodeData.text}
            onChange={(e) => {
              const nextText = e.target.value;
              updateNodeData(id, { text: nextText });
              requestAnimationFrame(resizeTextarea);
            }}
            placeholder="Write Something..."
            rows={1}
            className={textareaClass}
          />
        </div>
      </div>
    </div>
  );
};

const TextNode = memo(TextNodeComponent);
export default TextNode;
