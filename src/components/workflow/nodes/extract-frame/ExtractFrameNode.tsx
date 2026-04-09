"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ExtractFrameNodeData } from "./extract-frame-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import ConnectedField from "@/components/workflow/common/ConnectedField";
import NodeMenu from "@/components/workflow/common/NodeMenu";
import NodeHoverRunButton from "@/components/workflow/common/NodeHoverRunButton";
import NodeRunErrorBubble from "@/components/workflow/common/NodeRunErrorBubble";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const ExtractFrameNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as ExtractFrameNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);

  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);
  const { runNode, runWorkflow } = useWorkflowExecution();
  const { isDark } = useWorkflowTheme();

  const hasConnectedVideoUrl = connectedHandles.has("video-url-input");

  const effectiveVideoUrl =
    (typeof resolvedInputs["video-url-input"] === "string"
      ? resolvedInputs["video-url-input"]
      : "") || nodeData.inputVideoUrl;
  const runningGlowClass = nodeData.isProcessing
    ? isDark
      ? "workflow-node-running-dark"
      : "workflow-node-running-light"
    : "";

  const effectiveTimestamp = nodeData.timestamp;

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

  const resultUrlClass = "break-all text-xs text-zinc-500";

  const processingClass = isDark ? "text-xs text-zinc-400" : "text-xs text-zinc-500";

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
        onRun={() => runNode(id)}
        onRunWorkflow={() => runWorkflow(id, true)}
        disabled={!!nodeData.isProcessing || !effectiveVideoUrl}
        isRunning={!!nodeData.isProcessing}
        forceRunTextWhite
      />

      <div className={`${containerClass} ${runningGlowClass}`}>
        <Handle
          type="target"
          position={Position.Left}
          id="video-url-input"
          style={{ top: "50%" }}
          className={`${targetHandleClass} ${runningTargetHandleClass}`}
        />

      <div className={headerClass}>
        <div>
          <p className={mutedLabelClass}>Video Transform</p>
          <p className={titleClass}>{nodeData.label || "Extract Frame"}</p>
        </div>

        <NodeMenu onRun={() => runNode(id)} onDelete={() => removeNode(id)} />
      </div>

      <div className={bodyClass}>
        <ConnectedField
          label="Input Video URL"
          connected={hasConnectedVideoUrl}
        >
          <input
            value={nodeData.inputVideoUrl}
            onChange={(e) =>
              updateNodeData(id, { inputVideoUrl: e.target.value })
            }
            disabled={hasConnectedVideoUrl}
            placeholder={
              hasConnectedVideoUrl
                ? "Value comes from connected node"
                : "https://..."
            }
            className={hasConnectedVideoUrl ? disabledInputClass : baseInputClass}
          />
        </ConnectedField>

        <ConnectedField label="Timestamp (seconds or %)" connected={false}>
          <input
            value={nodeData.timestamp}
            onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
            placeholder='0 or "50%"'
            className={baseInputClass}
          />
        </ConnectedField>

        {nodeData.runId && nodeData.isProcessing ? (
          <p className={processingClass}>Processing extract frame task...</p>
        ) : null}

        {nodeData.extractedFrameUrl ? (
          <div className="space-y-3">
            <div className={resultBoxClass}>
              <img
                src={nodeData.extractedFrameUrl}
                alt="Extracted frame"
                className="h-auto max-h-[240px] w-full object-contain"
              />
            </div>

            <p className={resultUrlClass}>{nodeData.extractedFrameUrl}</p>
          </div>
        ) : null}
      </div>

        <Handle
          type="source"
          position={Position.Right}
          id="frame-image-url-output"
          className={sourceHandleClass}
        />
      </div>
    </div>
  );
};

const ExtractFrameNode = memo(ExtractFrameNodeComponent);
export default ExtractFrameNode;
