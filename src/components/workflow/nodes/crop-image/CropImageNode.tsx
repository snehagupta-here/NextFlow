"use client";

import React, { memo, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CropImageNodeData } from "./crop-image-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import ConnectedField from "@/components/workflow/common/ConnectedField";
import NodeMenu from "@/components/workflow/common/NodeMenu";
function sanitizePercent(value: string, fallback: string) {
  if (value.trim() === "") return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return String(Math.min(100, Math.max(0, num)));
}

const CropImageNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as CropImageNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);

  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);

  const hasConnectedImageUrl = connectedHandles.has("image-url-input");
const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  const effectiveImageUrl =
    (typeof resolvedInputs["image-url-input"] === "string"
      ? resolvedInputs["image-url-input"]
      : "") || nodeData.inputImageUrl;

  const disabledInputClass =
    "bg-white/[0.02] text-zinc-500 placeholder:text-zinc-600 opacity-70 cursor-not-allowed";

  const updateField = (
    key: "inputImageUrl" | "x" | "y" | "width" | "height",
    value: string
  ) => {
    updateNodeData(id, { [key]: value } as Partial<CropImageNodeData>);
  };

  const handleRunCrop = async () => {
    updateNodeData(id, {
      isProcessing: true,
      error: "",
      croppedImageUrl: "",
    });

    try {
      const res = await fetch("/api/workflow/crop-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: effectiveImageUrl.replace(/\s+/g, "").trim(),
          x: sanitizePercent(nodeData.x, "0"),
          y: sanitizePercent(nodeData.y, "0"),
          width: sanitizePercent(nodeData.width, "100"),
          height: sanitizePercent(nodeData.height, "100"),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to start crop task.");
      }

      updateNodeData(id, {
        runId: result.runId ?? "",
        croppedImageUrl: result.croppedImageUrl ?? "",
        isProcessing: false,
        error: "",
      });
    } catch (error) {
      updateNodeData(id, {
        isProcessing: false,
        error: error instanceof Error ? error.message : "Crop failed.",
      });
    }
  };

  useEffect(() => {
    if (!nodeData.runId || !nodeData.isProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/workflow/crop-image/status?runId=${nodeData.runId}`
        );

        const result = await res.json();

        if (!res.ok) {
          updateNodeData(id, {
            isProcessing: false,
            error: result?.error || "Failed to fetch crop status.",
          });
          clearInterval(interval);
          return;
        }

        if (result.status === "COMPLETED" && result.output?.croppedImageUrl) {
          updateNodeData(id, {
            croppedImageUrl: result.output.croppedImageUrl,
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
            error: result.error || "Crop task failed.",
          });
          clearInterval(interval);
        }
      } catch {
        updateNodeData(id, {
          isProcessing: false,
          error: "Failed to fetch crop status.",
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
      id="image-url-input"
      className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
    />

    <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Image Transform
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {nodeData.label || "Crop Image"}
        </p>
      </div>

      <NodeMenu onDelete={() => removeNode(id)} />
    </div>

    <div className="space-y-3 px-4 py-3">
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
          className={`w-full rounded-xl border border-white/10 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 ${
            hasConnectedImageUrl
              ? disabledInputClass
              : "bg-white/[0.04] text-white"
          }`}
        />
      </ConnectedField>

      <div className="grid grid-cols-2 gap-3">
        <ConnectedField label="X %" connected={false}>
          <input
            value={nodeData.x}
            onChange={(e) => updateField("x", e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </ConnectedField>

        <ConnectedField label="Y %" connected={false}>
          <input
            value={nodeData.y}
            onChange={(e) => updateField("y", e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </ConnectedField>

        <ConnectedField label="Width %" connected={false}>
          <input
            value={nodeData.width}
            onChange={(e) => updateField("width", e.target.value)}
            placeholder="100"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </ConnectedField>

        <ConnectedField label="Height %" connected={false}>
          <input
            value={nodeData.height}
            onChange={(e) => updateField("height", e.target.value)}
            placeholder="100"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </ConnectedField>
      </div>

      <button
        type="button"
        onClick={handleRunCrop}
        disabled={!!nodeData.isProcessing || !effectiveImageUrl}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {nodeData.isProcessing ? "Cropping..." : "Run Crop"}
      </button>

      {nodeData.croppedImageUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <img
              src={nodeData.croppedImageUrl}
              alt="Cropped result"
              className="h-auto max-h-[240px] w-full object-contain"
            />
          </div>

          <p className="break-all text-xs text-zinc-500">
            {nodeData.croppedImageUrl}
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
      id="cropped-image-url-output"
      className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
    />
  </div>
);
};

const CropImageNode = memo(CropImageNodeComponent);
export default CropImageNode;