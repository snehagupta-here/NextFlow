"use client";

import React, { memo, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ExtractFrameNodeData } from "./extract-frame-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import ConnectedField from "@/components/workflow/common/ConnectedField";
import NodeMenu from "@/components/workflow/common/NodeMenu";
import NodeRunErrorBubble from "@/components/workflow/common/NodeRunErrorBubble";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

function sanitizeTimestamp(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "0";
  return trimmed;
}

const ExtractFrameNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as ExtractFrameNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);

  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);
  const { runNode } = useWorkflowExecution();
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
      ? "min-w-[320px] max-w-[380px] overflow-hidden rounded-[28px] border border-[#4f8cff] bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-[#4f8cff]/20 transition"
      : "min-w-[320px] max-w-[380px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
    : selected
    ? "min-w-[320px] max-w-[380px] overflow-hidden rounded-[28px] border border-[#4f8cff] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#4f8cff]/15 transition"
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

  const resultUrlClass = "break-all text-xs text-zinc-500";

  const processingClass = isDark ? "text-xs text-zinc-400" : "text-xs text-zinc-500";

  const errorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";

  const targetHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#16381f] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
    : "!h-4 !w-4 !border-[3px] !border-[#dcfce7] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.14)]";

  const sourceHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#16381f] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
    : "!h-4 !w-4 !border-[3px] !border-[#dcfce7] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.14)]";

  const handleRun = async () => {
    updateNodeData(id, {
      isProcessing: true,
      error: "",
      extractedFrameUrl: "",
    });

    try {
      const res = await fetch("/api/workflow/extract-frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: effectiveVideoUrl.replace(/\s+/g, "").trim(),
          timestamp: sanitizeTimestamp(effectiveTimestamp),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to start extract frame task.");
      }

      updateNodeData(id, {
        runId: result.runId ?? "",
        isProcessing: true,
        error: "",
        extractedFrameUrl: "",
      });
    } catch (error) {
      updateNodeData(id, {
        isProcessing: false,
        error:
          error instanceof Error ? error.message : "Extract frame failed.",
      });
    }
  };

  useEffect(() => {
    if (!nodeData.runId || !nodeData.isProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/workflow/extract-frame/status?runId=${nodeData.runId}`
        );
        const result = await res.json();

        if (!res.ok) {
          updateNodeData(id, {
            isProcessing: false,
            error: result?.error || "Failed to fetch extract frame status.",
          });
          clearInterval(interval);
          return;
        }

        if (result.status === "COMPLETED" && result.output?.frameImageUrl) {
          updateNodeData(id, {
            extractedFrameUrl: result.output.frameImageUrl,
            isProcessing: false,
            error: "",
          });
          clearInterval(interval);
        }

        if (
          result.status === "FAILED" ||
          result.status === "CANCELED" ||
          result.status === "CANCELLED"
        ) {
          updateNodeData(id, {
            isProcessing: false,
            error: result.error || "Extract frame task failed.",
          });
          clearInterval(interval);
        }
      } catch {
        updateNodeData(id, {
          isProcessing: false,
          error: "Failed to fetch extract frame status.",
        });
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, nodeData.runId, nodeData.isProcessing, updateNodeData]);

  return (
    <div className="relative overflow-visible">
      {nodeData.error ? (
        <NodeRunErrorBubble
          message={nodeData.error}
          onDismiss={() => updateNodeData(id, { error: "" })}
        />
      ) : null}

      <div className={`${containerClass} ${runningGlowClass}`}>
        <Handle
          type="target"
          position={Position.Left}
          id="video-url-input"
          style={{ top: "50%" }}
          className={targetHandleClass}
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

        <button
          type="button"
          onClick={handleRun}
          disabled={!!nodeData.isProcessing || !effectiveVideoUrl}
          className={buttonClass}
        >
          {nodeData.isProcessing ? "Extracting..." : "Extract Frame"}
        </button>

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
