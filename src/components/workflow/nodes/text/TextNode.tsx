"use client";

import React, { memo, useEffect, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TextNodeData } from "./text-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import NodeMenu from "@/components/workflow/common/NodeMenu";
const TextNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as TextNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  useEffect(() => {
    resizeTextarea();
  }, [nodeData.text]);

return (
  <div
    className={`min-w-[260px] max-w-[320px] rounded-2xl border shadow-xl transition ${
      selected
        ? "border-white/20 bg-[#050505] ring-2 ring-white/10"
        : "border-white/10 bg-black/90"
    }`}
  >
    <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Text Node
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {nodeData.label}
        </p>
      </div>

      <NodeMenu onDelete={() => removeNode(id)} />
    </div>

    <div className="px-4 py-3">
      <textarea
        ref={textareaRef}
        value={nodeData.text}
        onChange={(e) => {
          updateNodeData(id, { text: e.target.value });
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

const TextNode = memo(TextNodeComponent);
export default TextNode;