"use client";

import React, { memo, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ExtractFrameNodeData } from "./extract-frame-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import ConnectedField from "@/components/workflow/common/ConnectedField";
import NodeMenu from "@/components/workflow/common/NodeMenu";
function sanitizeTimestamp(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "0";
  return trimmed;
}

const ExtractFrameNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as ExtractFrameNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);

  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);

  const hasConnectedVideoUrl = connectedHandles.has("video-url-input");
const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  const effectiveVideoUrl =
    (typeof resolvedInputs["video-url-input"] === "string"
      ? resolvedInputs["video-url-input"]
      : "") || nodeData.inputVideoUrl;

  const effectiveTimestamp = nodeData.timestamp;

  const disabledInputClass =
    "bg-white/[0.02] text-zinc-500 placeholder:text-zinc-600 opacity-70 cursor-not-allowed";

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
    <div
      className={`min-w-[320px] max-w-[380px] rounded-2xl border shadow-xl transition ${
        selected
          ? "border-white/20 bg-[#050505] ring-2 ring-white/10"
          : "border-white/10 bg-black/90"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="video-url-input"
        style={{ top: "50%" }}
        className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
      />

   <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
  <div>
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
      Video Transform
    </p>
    <p className="mt-1 text-sm font-semibold text-white">
      {nodeData.label || "Extract Frame"}
    </p>
  </div>

  <NodeMenu onDelete={() => removeNode(id)} />
</div>

<div className="space-y-3 px-4 py-3">
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
      className={`w-full rounded-xl border border-white/10 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 ${
        hasConnectedVideoUrl
          ? disabledInputClass
          : "bg-white/[0.04] text-white"
      }`}
    />
  </ConnectedField>

  <ConnectedField label="Timestamp (seconds or %)" connected={false}>
    <input
      value={nodeData.timestamp}
      onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
      placeholder='0 or "50%"'
      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
    />
  </ConnectedField>

  <button
    type="button"
    onClick={handleRun}
    disabled={!!nodeData.isProcessing || !effectiveVideoUrl}
    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
  >
    {nodeData.isProcessing ? "Extracting..." : "Extract Frame"}
  </button>

  {nodeData.runId && nodeData.isProcessing ? (
    <p className="text-xs text-zinc-400">Processing extract frame task...</p>
  ) : null}

  {nodeData.extractedFrameUrl ? (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        <img
          src={nodeData.extractedFrameUrl}
          alt="Extracted frame"
          className="h-auto max-h-[240px] w-full object-contain"
        />
      </div>

      <p className="break-all text-xs text-zinc-500">
        {nodeData.extractedFrameUrl}
      </p>
    </div>
  ) : null}

  {nodeData.error ? (
    <p className="text-xs text-red-400">{nodeData.error}</p>
  ) : null}
</div>

      <Handle
        type="source"
        position={Position.Right}
        id="frame-image-url-output"
        className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
      />
    </div>
  );
};

const ExtractFrameNode = memo(ExtractFrameNodeComponent);
export default ExtractFrameNode;