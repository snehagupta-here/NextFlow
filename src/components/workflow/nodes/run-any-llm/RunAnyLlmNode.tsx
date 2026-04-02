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
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

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
  const { runNode } = useWorkflowExecution();
  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  const { isDark } = useWorkflowTheme();

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

  const containerClass = isDark
    ? nodeData.isProcessing
      ? "min-w-[340px] max-w-[420px] overflow-hidden rounded-[28px] border border-indigo-400/40 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-indigo-400/20 transition"
      : selected
      ? "min-w-[340px] max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-white/10 transition"
      : "min-w-[340px] max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
    : nodeData.isProcessing
    ? "min-w-[340px] max-w-[420px] overflow-hidden rounded-[28px] border border-indigo-200 bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-indigo-100 transition"
    : selected
    ? "min-w-[340px] max-w-[420px] overflow-hidden rounded-[28px] border border-[#e7e7e7] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-black/5 transition"
    : "min-w-[340px] max-w-[420px] overflow-hidden rounded-[28px] border border-[#ececec] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

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

  const baseTextareaClass = isDark
    ? "w-full resize-none rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
    : "w-full resize-none rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400";

  const disabledTextareaClass = isDark
    ? "w-full resize-none rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-zinc-500 outline-none placeholder:text-zinc-600 opacity-70 cursor-not-allowed"
    : "w-full resize-none rounded-2xl border border-[#ececec] bg-[#f5f5f5] px-3 py-2 text-sm text-zinc-400 outline-none placeholder:text-zinc-400 opacity-80 cursor-not-allowed";

  const buttonClass = isDark
    ? "w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white transition hover:bg-[#141414] disabled:cursor-not-allowed disabled:opacity-60"
    : "w-full rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60";

  const runningTextClass = isDark
    ? "text-xs text-indigo-300"
    : "text-xs text-indigo-600";

  const responseBoxClass = isDark
    ? "rounded-2xl border border-white/10 bg-white/[0.03] p-3 nodrag nopan"
    : "rounded-2xl border border-[#ececec] bg-white p-3 nodrag nopan";

  const responseLabelClass = isDark
    ? "mb-2 text-xs text-zinc-400"
    : "mb-2 text-xs text-zinc-500";

  const responseTextClass = isDark
    ? "whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200"
    : "whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700";

  const modelsErrorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";
  const errorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";

  const handleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#16381f] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
    : "!h-4 !w-4 !border-[3px] !border-[#dcfce7] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.14)]";

  return (
    <div className={containerClass}>
      <Handle
        type="target"
        position={Position.Left}
        id="system_prompt"
        style={{ top: "24%" }}
        className={handleClass}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="user_message"
        style={{ top: "50%" }}
        className={handleClass}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="images"
        style={{ top: "76%" }}
        className={handleClass}
      />

      <div className={headerClass}>
        <div>
          <p className={mutedLabelClass}>LLM</p>
          <p className={titleClass}>{nodeData.label || "Run Any LLM"}</p>
        </div>

        <NodeMenu onRun={() => runNode(id)} onDelete={() => removeNode(id)} />
      </div>

      <div className={bodyClass}>
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

        {modelsError ? <p className={modelsErrorClass}>{modelsError}</p> : null}

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
            className={
              hasConnectedSystemPrompt
                ? disabledTextareaClass
                : baseTextareaClass
            }
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
            className={
              hasConnectedUserMessage
                ? disabledTextareaClass
                : baseTextareaClass
            }
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
            className={
              hasConnectedImages
                ? disabledTextareaClass
                : baseTextareaClass
            }
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
          className={buttonClass}
        >
          {nodeData.isProcessing ? "Running..." : "Run LLM"}
        </button>

        {nodeData.runId && nodeData.isProcessing ? (
          <p className={runningTextClass}>Running LLM task...</p>
        ) : null}

        {nodeData.outputText ? (
          <div
            className={responseBoxClass}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className={responseLabelClass}>Response</div>

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
              <p className={responseTextClass}>{nodeData.outputText}</p>
            </div>
          </div>
        ) : null}

        {nodeData.error ? <p className={errorClass}>{nodeData.error}</p> : null}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className={handleClass}
      />
    </div>
  );
};

const RunAnyLlmNode = memo(RunAnyLlmNodeComponent);
export default RunAnyLlmNode;