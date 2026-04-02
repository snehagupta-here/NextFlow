"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CropImageNodeData } from "./crop-image-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import ConnectedField from "@/components/workflow/common/ConnectedField";
import NodeMenu from "@/components/workflow/common/NodeMenu";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const CropImageNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as CropImageNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);

  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);
  const { runNode } = useWorkflowExecution();
  const { isDark } = useWorkflowTheme();

  const hasConnectedImageUrl = connectedHandles.has("image-url-input");

  const effectiveImageUrl =
    (typeof resolvedInputs["image-url-input"] === "string"
      ? resolvedInputs["image-url-input"]
      : "") || nodeData.inputImageUrl;

  const containerClass = isDark
    ? selected
      ? "min-w-[320px] max-w-[380px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-white/10 transition"
      : "min-w-[320px] max-w-[380px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
    : selected
    ? "min-w-[320px] max-w-[380px] overflow-hidden rounded-[28px] border border-[#e7e7e7] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-black/5 transition"
    : "min-w-[320px] max-w-[380px] overflow-hidden rounded-[28px] border border-[#ececec] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

  const headerClass = isDark
    ? "flex items-start justify-between border-b border-white/10 px-4 py-3 bg-[#111111]"
    : "flex items-start justify-between border-b border-[#f0f0f0] px-4 py-3 bg-white";

  const bodyClass = isDark
    ? "space-y-3 px-4 py-3 bg-[#1a1a1a]"
    : "space-y-3 px-4 py-3 bg-[#fcfcfc]";

  const mutedLabelClass = isDark
    ? "text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
    : "text-xs font-medium uppercase tracking-[0.2em] text-zinc-500";

  const titleClass = isDark
    ? "mt-1 text-sm font-semibold text-white"
    : "mt-1 text-sm font-semibold text-zinc-800";

  const baseInputClass = isDark
    ? "w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
    : "w-full rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400";

  const disabledInputClass = isDark
    ? "w-full rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-zinc-500 outline-none placeholder:text-zinc-600 opacity-70 cursor-not-allowed"
    : "w-full rounded-2xl border border-[#ececec] bg-[#f5f5f5] px-3 py-2 text-sm text-zinc-400 outline-none placeholder:text-zinc-400 opacity-80 cursor-not-allowed";

  const buttonClass = isDark
    ? "w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white transition hover:bg-[#141414] disabled:cursor-not-allowed disabled:opacity-60"
    : "w-full rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60";

  const resultBoxClass = isDark
    ? "overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
    : "overflow-hidden rounded-2xl border border-[#ececec] bg-white";

  const resultUrlClass = isDark
    ? "break-all text-xs text-zinc-500"
    : "break-all text-xs text-zinc-500";

  const errorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";

  const targetHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#16381f] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
    : "!h-4 !w-4 !border-[3px] !border-[#dcfce7] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.14)]";

  const sourceHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#16381f] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
    : "!h-4 !w-4 !border-[3px] !border-[#dcfce7] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.14)]";

  const updateField = (
    key: "inputImageUrl" | "x" | "y" | "width" | "height",
    value: string
  ) => {
    updateNodeData(id, { [key]: value } as Partial<CropImageNodeData>);
  };

  return (
    <div className={containerClass}>
      <Handle
        type="target"
        position={Position.Left}
        id="image-url-input"
        className={targetHandleClass}
      />

      <div className={headerClass}>
        <div>
          <p className={mutedLabelClass}>Image Transform</p>
          <p className={titleClass}>{nodeData.label || "Crop Image"}</p>
        </div>

        <NodeMenu onRun={() => runNode(id, true)} onDelete={() => removeNode(id)} />
      </div>

      <div className={bodyClass}>
        <ConnectedField
          label="Input Image URL"
          connected={hasConnectedImageUrl}
        >
          <input
            value={nodeData.inputImageUrl}
            onChange={(e) => updateField("inputImageUrl", e.target.value)}
            disabled={hasConnectedImageUrl}
            placeholder={
              hasConnectedImageUrl
                ? "Value comes from connected node"
                : "https://..."
            }
            className={hasConnectedImageUrl ? disabledInputClass : baseInputClass}
          />
        </ConnectedField>

        <div className="grid grid-cols-2 gap-3">
          <ConnectedField label="X %" connected={false}>
            <input
              value={nodeData.x}
              onChange={(e) => updateField("x", e.target.value)}
              placeholder="0"
              className={baseInputClass}
            />
          </ConnectedField>

          <ConnectedField label="Y %" connected={false}>
            <input
              value={nodeData.y}
              onChange={(e) => updateField("y", e.target.value)}
              placeholder="0"
              className={baseInputClass}
            />
          </ConnectedField>

          <ConnectedField label="Width %" connected={false}>
            <input
              value={nodeData.width}
              onChange={(e) => updateField("width", e.target.value)}
              placeholder="100"
              className={baseInputClass}
            />
          </ConnectedField>

          <ConnectedField label="Height %" connected={false}>
            <input
              value={nodeData.height}
              onChange={(e) => updateField("height", e.target.value)}
              placeholder="100"
              className={baseInputClass}
            />
          </ConnectedField>
        </div>

        <button
          type="button"
          onClick={() => runNode(id, true)}
          disabled={!!nodeData.isProcessing || !effectiveImageUrl}
          className={buttonClass}
        >
          {nodeData.isProcessing ? "Cropping..." : "Run Crop"}
        </button>

        {nodeData.croppedImageUrl ? (
          <div className="space-y-3">
            <div className={resultBoxClass}>
              <img
                src={nodeData.croppedImageUrl}
                alt="Cropped result"
                className="h-auto max-h-[240px] w-full object-contain"
              />
            </div>

            <p className={resultUrlClass}>{nodeData.croppedImageUrl}</p>
          </div>
        ) : null}

        {nodeData.error ? (
          <p className={errorClass}>{nodeData.error}</p>
        ) : null}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="cropped-image-url-output"
        className={sourceHandleClass}
      />
    </div>
  );
};

const CropImageNode = memo(CropImageNodeComponent);
export default CropImageNode;