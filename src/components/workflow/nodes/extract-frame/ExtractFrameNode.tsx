"use client";

import React, { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown, Info } from "lucide-react";
import type { ExtractFrameNodeData } from "./extract-frame-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import NodeHoverRunButton from "@/components/workflow/common/NodeHoverRunButton";
import NodeRunErrorBubble from "@/components/workflow/common/NodeRunErrorBubble";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const ExtractFrameNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as ExtractFrameNodeData;
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isOutputTooltipOpen, setIsOutputTooltipOpen] = useState(false);
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
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

  const containerClass = isDark
    ? selected
      ? "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#4f8cff] bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-[#4f8cff]/20 transition"
      : "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
    : selected
    ? "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#4f8cff] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#4f8cff]/15 transition"
    : "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#ececec] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

  const shellClass = isDark ? "bg-[#1f1f1f]" : "bg-[#f1f1f1]";

  const outputBoxClass = isDark
    ? "relative border border-white/[0.04] bg-[#1b1b1b] px-4 py-4 text-zinc-400"
    : "relative border border-black/[0.04] bg-white px-4 py-4 text-zinc-500";

  const outputPlaceholderClass = "text-[15px] text-zinc-500";

  const bodyClass = isDark
    ? "space-y-3 px-4 py-3"
    : "space-y-3 px-4 py-3 bg-[#fcfcfc]";

  const rowLabelClass = isDark
    ? "text-[14px] font-medium text-zinc-300"
    : "text-[14px] font-medium text-zinc-700";

  const baseInputClass = isDark
    ? "nodrag nopan h-10 w-full rounded-[12px] border border-white/8 bg-[#171717] px-3 text-[14px] text-white outline-none placeholder:text-zinc-500"
    : "nodrag nopan h-10 w-full rounded-[12px] border border-[#ececec] bg-white px-3 text-[14px] text-zinc-800 outline-none placeholder:text-zinc-400";

  const disabledInputClass = isDark
    ? "nodrag nopan h-10 w-full rounded-[12px] border border-white/8 bg-[#171717] px-3 text-[14px] text-zinc-500 outline-none placeholder:text-zinc-600 opacity-70 cursor-not-allowed"
    : "nodrag nopan h-10 w-full rounded-[12px] border border-[#ececec] bg-[#f5f5f5] px-3 text-[14px] text-zinc-400 outline-none placeholder:text-zinc-400 opacity-80 cursor-not-allowed";

  const inlinePreviewClass = isDark
    ? "overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03]"
    : "overflow-hidden rounded-[14px] border border-[#ececec] bg-white";

  const fieldRowClass = "flex items-center gap-3";
  const sectionButtonClass = "flex w-full items-center justify-between py-2 text-left";

  const chevronClass = (isOpen: boolean) =>
    `${isDark ? "text-zinc-500" : "text-zinc-400"} transition-transform ${
      isOpen ? "" : "-rotate-90"
    }`;

  const targetHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#662d91] shadow-[0_0_0_4px_rgba(102,45,145,0.22)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#662d91] shadow-[0_0_0_4px_rgba(102,45,145,0.16)]";

  const runningTargetHandleClass = nodeData.isProcessing
    ? isDark
      ? "workflow-handle-running-dark"
      : "workflow-handle-running-light"
    : "";

  const sourceHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#662d91] shadow-[0_0_0_4px_rgba(102,45,145,0.22)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#662d91] shadow-[0_0_0_4px_rgba(102,45,145,0.16)]";

  const displayLabel = isEditingLabel ? nodeData.label : nodeData.label || "Extract Frame";

  return (
    <div className="group relative overflow-visible">
      {nodeData.error ? (
        <NodeRunErrorBubble
          message={nodeData.error}
          onDismiss={() => updateNodeData(id, { error: "" })}
        />
      ) : null}

      {isOutputTooltipOpen ? (
        <div className="pointer-events-none absolute right-[-308px] top-[150px] z-40">
          <div className="relative whitespace-nowrap rounded-[18px] bg-white px-4 py-2 text-[13px] font-medium text-[#171717] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
            The generated image output.
            <div className="absolute left-[-8px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
          </div>
        </div>
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
        <div className="absolute -top-8 left-0 z-10">
          <input
            type="text"
            value={displayLabel}
            placeholder="Node Name"
            className={`nodrag nopan min-w-[64px] bg-transparent text-[14px] font-medium outline-none ${
              isDark
                ? "text-zinc-400 placeholder:text-zinc-600"
                : "text-zinc-600 placeholder:text-zinc-400"
            }`}
            onFocus={() => {
              setIsEditingLabel(true);
              if ((nodeData.label || "Extract Frame") === "Extract Frame") {
                updateNodeData(id, { label: "" });
              }
            }}
            onBlur={() => {
              setIsEditingLabel(false);
              if (!nodeData.label.trim()) {
                updateNodeData(id, { label: "Extract Frame" });
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

        <div className="absolute -top-6 right-0 z-20">
          <div className="group/info relative">
            <div>
              <Info size={14} />
            </div>

            <div className="pointer-events-none absolute right-0 top-8 z-30 w-[300px] opacity-0 transition duration-150 group-hover/info:opacity-100">
              <div className="rounded-[14px] bg-black px-6 py-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.52)]">
                <div className="text-[16px] font-medium tracking-[-0.02em]">
                  Extract Frame
                </div>
                <p className="mt-2 text-[14px] leading-6 text-white/95">
                  Extract a frame from an input video at a chosen timestamp and pass the frame image URL forward.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Handle
          type="target"
          position={Position.Left}
          id="video-url-input"
          style={{ top: 248 }}
          className={`${targetHandleClass} ${runningTargetHandleClass}`}
        />

        <div className={`px-0 pb-4 pt-0 ${shellClass}`}>
          <div className={`${outputBoxClass} rounded-none border-x-0 border-t-0`}>
            <div className="flex min-h-[110px] max-h-[120px] items-start overflow-y-auto break-all pr-1 text-[14px] leading-6">
              {nodeData.extractedFrameUrl ? (
                <p className={isDark ? "text-zinc-200" : "text-zinc-800"}>
                  {nodeData.extractedFrameUrl}
                </p>
              ) : (
                <p className={outputPlaceholderClass}>
                  Extract frame node output will appear here...
                </p>
              )}
            </div>
          </div>

          <div className="group/output relative flex justify-end">
            <span
              className="mr-5 mt-1 cursor-default text-[14px] font-medium text-zinc-500"
              onMouseEnter={() => setIsOutputTooltipOpen(true)}
              onMouseLeave={() => setIsOutputTooltipOpen(false)}
            >
              Image
            </span>
          </div>

          <div className={bodyClass}>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3 py-2">
                  <span className={rowLabelClass}>Video</span>
                </div>
                <input
                  value={hasConnectedVideoUrl ? effectiveVideoUrl : nodeData.inputVideoUrl}
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
              </div>

              {nodeData.extractedFrameUrl ? (
                <div className={inlinePreviewClass}>
                  <img
                    src={nodeData.extractedFrameUrl}
                    alt="Extracted frame"
                    className="h-auto max-h-[180px] w-full object-contain"
                  />
                </div>
              ) : null}

              <div className="mt-2">
                <button
                  type="button"
                  className={sectionButtonClass}
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    <ChevronDown size={15} className={chevronClass(isSettingsOpen)} />
                    <span className={isDark ? "text-[12px] font-medium text-zinc-400" : "text-[12px] font-medium text-zinc-500"}>
                      Settings
                    </span>
                  </div>
                </button>

                {isSettingsOpen ? (
                  <div className="mt-2">
                    <div className={fieldRowClass}>
                      <span className={`${rowLabelClass} w-20 shrink-0 text-[13px]`}>Timestamp</span>
                      <input
                        value={nodeData.timestamp}
                        onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
                        placeholder='0 or "50%"'
                        className={baseInputClass}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="frame-image-url-output"
          className={sourceHandleClass}
            style={{ top: nodeData.extractedFrameUrl ? 169 : 158 }}
        />
      </div>
    </div>
  );
};

const ExtractFrameNode = memo(ExtractFrameNodeComponent);
export default ExtractFrameNode;
