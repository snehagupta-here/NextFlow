"use client";

import React, { memo, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { RunAnyLlmNodeData } from "./run-any-llm-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import { useGeminiModels } from "@/hooks/gemini/useGeminiModels";
import ModelSelector from "./ModelSelector";
import ConnectedField from "@/components/workflow/common/ConnectedField";
import NodeMenu from "@/components/workflow/common/NodeMenu";

function parseImageUrls(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const RunAnyLlmNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as RunAnyLlmNodeData;
  const updateNodeData = useWorkflowEditorStore(
    (state) => state.updateNodeData
  );

  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);
const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  const {
    models,
    isLoading: isLoadingModels,
    error: modelsError,
  } = useGeminiModels();

  const hasConnectedSystemPrompt = connectedHandles.has("system_prompt");
  const hasConnectedUserMessage = connectedHandles.has("user_message");
  const hasConnectedImages = connectedHandles.has("images");

  const effectiveSystemPrompt =
    (typeof resolvedInputs["system_prompt"] === "string"
      ? resolvedInputs["system_prompt"]
      : "") || nodeData.systemPrompt;

  const effectiveUserMessage =
    (typeof resolvedInputs["user_message"] === "string"
      ? resolvedInputs["user_message"]
      : "") || nodeData.userMessage;

  const effectiveImageUrls = [
    ...nodeData.imageUrls,
    ...((resolvedInputs["images"] as string[]) || []),
  ].filter(Boolean);

  const mergedImageUrls = Array.from(new Set(effectiveImageUrls));

  useEffect(() => {
    if (!models.length) return;

    const selectedModel = models.find((model) => model.id === nodeData.model);

    if (!selectedModel || selectedModel.disabled) {
      const firstUsableModel = models.find((model) => !model.disabled);
      if (firstUsableModel) {
        updateNodeData(id, { model: firstUsableModel.id });
      }
    }
  }, [models, nodeData.model, id, updateNodeData]);

  const handleRun = async () => {
    updateNodeData(id, {
      isProcessing: true,
      error: "",
      outputText: "",
    });

    try {
      const res = await fetch("/api/workflow/run-any-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: nodeData.model,
          systemPrompt: effectiveSystemPrompt,
          userMessage: effectiveUserMessage,
          imageUrls: mergedImageUrls,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to start LLM task.");
      }

      updateNodeData(id, {
        runId: result.runId ?? "",
        isProcessing: true,
        error: "",
        outputText: "",
      });
    } catch (error) {
      updateNodeData(id, {
        isProcessing: false,
        error: error instanceof Error ? error.message : "LLM execution failed.",
      });
    }
  };

  useEffect(() => {
    if (!nodeData.runId || !nodeData.isProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/workflow/run-any-llm/status?runId=${nodeData.runId}`
        );
        const result = await res.json();

        if (!res.ok) {
          updateNodeData(id, {
            isProcessing: false,
            error: result?.error || "Failed to fetch LLM status.",
          });
          clearInterval(interval);
          return;
        }

        if (result.status === "COMPLETED" && result.output?.outputText) {
          updateNodeData(id, {
            outputText: result.output.outputText,
            isProcessing: false,
            error: "",
          });
          clearInterval(interval);
          return;
        }

        if (
          result.status === "FAILED" ||
          result.status === "CANCELED" ||
          result.status === "CANCELLED" ||
          result.status === "CRASHED" ||
          result.status === "TIMED_OUT" ||
          result.status === "SYSTEM_FAILURE" ||
          result.status === "INTERRUPTED"
        ) {
          updateNodeData(id, {
            isProcessing: false,
            error: result.error || `LLM task failed (${result.status}).`,
          });
          clearInterval(interval);
        }
      } catch {
        updateNodeData(id, {
          isProcessing: false,
          error: "Failed to fetch LLM status.",
        });
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, nodeData.runId, nodeData.isProcessing, updateNodeData]);

  const selectedModel = models.find((model) => model.id === nodeData.model);
  const isSelectedModelDisabled = !!selectedModel?.disabled;

  const disabledInputClass =
    "bg-white/[0.02] text-zinc-500 placeholder:text-zinc-600 opacity-70 cursor-not-allowed";

  return (
    <div
      className={`min-w-[340px] max-w-[420px] rounded-2xl border shadow-xl transition ${
        nodeData.isProcessing
          ? "border-indigo-400/40 bg-[#050505] ring-2 ring-indigo-400/20 animate-pulse"
          : selected
          ? "border-white/20 bg-[#050505] ring-2 ring-white/10"
          : "border-white/10 bg-black/90"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="system_prompt"
        style={{ top: "24%" }}
        className="!h-3 !w-3 !border !border-white/20 !bg-zinc-500"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="user_message"
        style={{ top: "50%" }}
        className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="images"
        style={{ top: "76%" }}
        className="!h-3 !w-3 !border !border-white/20 !bg-zinc-300"
      />

      <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
  <div>
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
      LLM
    </p>
    <p className="mt-1 text-sm font-semibold text-white">
      {nodeData.label || "Run Any LLM"}
    </p>
  </div>

  <NodeMenu onDelete={() => removeNode(id)} />
</div>

      <div className="space-y-3 px-4 py-3">
        <ConnectedField label="Model" connected={false}>
          <div
            className="nodrag nopan"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ModelSelector
              value={nodeData.model}
              models={models}
              isLoading={isLoadingModels}
              onChange={(value) => updateNodeData(id, { model: value })}
            />
          </div>
        </ConnectedField>

        {modelsError ? (
          <p className="text-xs text-red-400">{modelsError}</p>
        ) : null}

        <ConnectedField
          label="System Prompt"
          connected={hasConnectedSystemPrompt}
        >
          <textarea
            value={nodeData.systemPrompt}
            onChange={(e) =>
              updateNodeData(id, { systemPrompt: e.target.value })
            }
            rows={3}
            disabled={hasConnectedSystemPrompt}
            placeholder={
              hasConnectedSystemPrompt
                ? "Value comes from connected node"
                : "Optional system instructions..."
            }
            className={`w-full resize-none rounded-xl border border-white/10 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 ${
              hasConnectedSystemPrompt
                ? disabledInputClass
                : "bg-white/[0.04] text-white"
            }`}
          />
        </ConnectedField>

        <ConnectedField
          label="User Message"
          connected={hasConnectedUserMessage}
        >
          <textarea
            value={nodeData.userMessage}
            onChange={(e) =>
              updateNodeData(id, { userMessage: e.target.value })
            }
            rows={4}
            disabled={hasConnectedUserMessage}
            placeholder={
              hasConnectedUserMessage
                ? "Value comes from connected node"
                : "Required user message..."
            }
            className={`w-full resize-none rounded-xl border border-white/10 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 ${
              hasConnectedUserMessage
                ? disabledInputClass
                : "bg-white/[0.04] text-white"
            }`}
          />
        </ConnectedField>

        <ConnectedField
          label="Image URLs (one per line)"
          connected={hasConnectedImages}
        >
          <textarea
            value={nodeData.imageUrls.join("\n")}
            onChange={(e) =>
              updateNodeData(id, { imageUrls: parseImageUrls(e.target.value) })
            }
            rows={3}
            disabled={hasConnectedImages}
            placeholder={
              hasConnectedImages
                ? "Images come from connected node(s)"
                : "Optional image URLs..."
            }
            className={`w-full resize-none rounded-xl border border-white/10 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 ${
              hasConnectedImages
                ? disabledInputClass
                : "bg-white/[0.04] text-white"
            }`}
          />
        </ConnectedField>

        <button
          type="button"
          onClick={handleRun}
          disabled={
            !!nodeData.isProcessing ||
            !effectiveUserMessage.trim() ||
            !nodeData.model ||
            isSelectedModelDisabled
          }
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {nodeData.isProcessing ? "Running..." : "Run LLM"}
        </button>

        {nodeData.runId && nodeData.isProcessing ? (
          <p className="text-xs text-indigo-300">Running LLM task...</p>
        ) : null}

        {nodeData.outputText ? (
          <div
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3 nodrag nopan"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-xs text-zinc-400">Response</div>

            <div
              className="max-h-56 overflow-y-auto overscroll-contain pr-1 nodrag nopan"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onWheelCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.scrollTop += e.deltaY;
              }}
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">
                {nodeData.outputText}
              </p>
            </div>
          </div>
        ) : null}

        {nodeData.error ? (
          <p className="text-xs text-red-400">{nodeData.error}</p>
        ) : null}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
      />
    </div>
  );
};

const RunAnyLlmNode = memo(RunAnyLlmNodeComponent);
export default RunAnyLlmNode;