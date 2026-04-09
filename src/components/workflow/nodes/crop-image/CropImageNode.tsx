"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CropImageNodeData } from "./crop-image-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import ConnectedField from "@/components/workflow/common/ConnectedField";
import NodeMenu from "@/components/workflow/common/NodeMenu";
import NodeHoverRunButton from "@/components/workflow/common/NodeHoverRunButton";
import NodeRunErrorBubble from "@/components/workflow/common/NodeRunErrorBubble";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const CropImageNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as CropImageNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);

  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);
  const { runNode, runWorkflow } = useWorkflowExecution();
  const { isDark } = useWorkflowTheme();

  const hasConnectedImageUrl = connectedHandles.has("image-url-input");

  const effectiveImageUrl =
    (typeof resolvedInputs["image-url-input"] === "string"
      ? resolvedInputs["image-url-input"]
      : "") || nodeData.inputImageUrl;
  const runningGlowClass = nodeData.isProcessing
    ? isDark
      ? "workflow-node-running-dark"
      : "workflow-node-running-light"
    : "";

  const containerClass = isDark
    ? selected
      ? "min-w-[320px] max-w-[380px] overflow-hidden rounded-[20px] border border-[#4f8cff] bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-[#4f8cff]/20 transition"
      : "min-w-[320px] max-w-[380px] overflow-hidden rounded-[20px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
    : selected
    ? "min-w-[320px] max-w-[380px] overflow-hidden rounded-[20px] border border-[#4f8cff] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#4f8cff]/15 transition"
    : "min-w-[320px] max-w-[380px] overflow-hidden rounded-[20px] border border-[#ececec] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

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
    ? "nodrag nopan w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
    : "nodrag nopan w-full rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400";

  const disabledInputClass = isDark
    ? "nodrag nopan w-full rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-zinc-500 outline-none placeholder:text-zinc-600 opacity-70 cursor-not-allowed"
    : "nodrag nopan w-full rounded-2xl border border-[#ececec] bg-[#f5f5f5] px-3 py-2 text-sm text-zinc-400 outline-none placeholder:text-zinc-400 opacity-80 cursor-not-allowed";

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
    ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(78,56,126,0.22)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(78,56,126,0.16)]";
  const runningTargetHandleClass = nodeData.isProcessing
    ? isDark
      ? "workflow-handle-running-dark"
      : "workflow-handle-running-light"
    : "";

  const sourceHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(78,56,126,0.22)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(78,56,126,0.16)]";

  const updateField = (
    key: "inputImageUrl" | "x" | "y" | "width" | "height",
    value: string
  ) => {
    updateNodeData(id, { [key]: value } as Partial<CropImageNodeData>);
  };

  return (
    <div className="group relative overflow-visible">
      {nodeData.error ? (
        <NodeRunErrorBubble
          message={nodeData.error}
          onDismiss={() => updateNodeData(id, { error: "" })}
        />
      ) : null}

      <NodeHoverRunButton
        nodeId={id}
        onRun={() => runNode(id, true)}
        onRunWorkflow={() => runWorkflow(id, true)}
        disabled={!!nodeData.isProcessing || !effectiveImageUrl}
        isRunning={!!nodeData.isProcessing}
        forceRunTextWhite
      />

      <div className={`${containerClass} ${runningGlowClass}`}>
        <Handle
          type="target"
          position={Position.Left}
          id="image-url-input"
          className={`${targetHandleClass} ${runningTargetHandleClass}`}
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
      </div>

        <Handle
          type="source"
          position={Position.Right}
          id="cropped-image-url-output"
          className={sourceHandleClass}
        />
      </div>
    </div>
  );
};

const CropImageNode = memo(CropImageNodeComponent);
export default CropImageNode;
