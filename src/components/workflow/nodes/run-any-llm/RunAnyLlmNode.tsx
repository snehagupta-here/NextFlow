// "use client";

// import React, { memo, useEffect } from "react";
// import { Handle, Position, type NodeProps } from "@xyflow/react";
// import type { RunAnyLlmNodeData } from "./run-any-llm-node.types";
// import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
// import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
// import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
// import { useGeminiModels } from "@/hooks/gemini/useGeminiModels";
// import ModelSelector from "./ModelSelector";
// import ConnectedField from "@/components/workflow/common/ConnectedField";
// import NodeMenu from "@/components/workflow/common/NodeMenu";
// import NodeHoverRunButton from "@/components/workflow/common/NodeHoverRunButton";
// import NodeRunErrorBubble from "@/components/workflow/common/NodeRunErrorBubble";
// import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
// import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

// function parseImageUrls(value: string) {
//   return value
//     .split("\n")
//     .map((item) => item.trim())
//     .filter(Boolean);
// }

// const RunAnyLlmNodeComponent = ({ id, data, selected }: NodeProps) => {
//   const nodeData = data as RunAnyLlmNodeData;
//   const updateNodeData = useWorkflowEditorStore(
//     (state) => state.updateNodeData
//   );
//   const { runNode, runWorkflow } = useWorkflowExecution();
//   const resolvedInputs = useResolvedNodeInputs(id);
//   const connectedHandles = useConnectedInputHandles(id);
//   const removeNode = useWorkflowEditorStore((state) => state.removeNode);
//   const { isDark } = useWorkflowTheme();

//   const {
//     models,
//     isLoading: isLoadingModels,
//     error: modelsError,
//   } = useGeminiModels();

//   const hasConnectedSystemPrompt = connectedHandles.has("system_prompt");
//   const hasConnectedUserMessage = connectedHandles.has("user_message");
//   const hasConnectedImages = connectedHandles.has("images");

//   const effectiveSystemPrompt =
//     (typeof resolvedInputs["system_prompt"] === "string"
//       ? resolvedInputs["system_prompt"]
//       : "") || nodeData.systemPrompt;

//   const effectiveUserMessage =
//     (typeof resolvedInputs["user_message"] === "string"
//       ? resolvedInputs["user_message"]
//       : "") || nodeData.userMessage;

//   const effectiveImageUrls = [
//     ...nodeData.imageUrls,
//     ...((resolvedInputs["images"] as string[]) || []),
//   ].filter(Boolean);

//   const mergedImageUrls = Array.from(new Set(effectiveImageUrls));
//   const runningGlowClass = nodeData.isProcessing
//     ? isDark
//       ? "workflow-node-running-dark"
//       : "workflow-node-running-light"
//     : "";

//   useEffect(() => {
//     if (!models.length) return;

//     const selectedModel = models.find((model) => model.id === nodeData.model);

//     if (!selectedModel || selectedModel.disabled) {
//       const firstUsableModel = models.find((model) => !model.disabled);
//       if (firstUsableModel) {
//         updateNodeData(id, { model: firstUsableModel.id });
//       }
//     }
//   }, [models, nodeData.model, id, updateNodeData]);

//   const selectedModel = models.find((model) => model.id === nodeData.model);
//   const isSelectedModelDisabled = !!selectedModel?.disabled;

//   const containerClass = isDark
//     ? selected
//       ? "min-w-[340px] max-w-[420px] overflow-hidden rounded-[20px] border border-[#4f8cff] bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-[#4f8cff]/20 transition"
//       : "min-w-[340px] max-w-[420px] overflow-hidden rounded-[20px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
//     : selected
//     ? "min-w-[340px] max-w-[420px] overflow-hidden rounded-[20px] border border-[#4f8cff] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#4f8cff]/15 transition"
//     : "min-w-[340px] max-w-[420px] overflow-hidden rounded-[20px] border border-[#ececec] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

//   const headerClass = isDark
//     ? "flex items-start justify-between border-b border-white/10 px-4 py-3 bg-[#111111]"
//     : "flex items-start justify-between border-b border-[#f0f0f0] px-4 py-3 bg-white";

//   const bodyClass = isDark
//     ? "space-y-3 px-4 py-3 bg-[#1a1a1a]"
//     : "space-y-3 px-4 py-3 bg-[#fcfcfc]";

//   const mutedLabelClass = isDark
//     ? "text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
//     : "text-xs font-medium uppercase tracking-[0.2em] text-zinc-500";

//   const titleClass = isDark
//     ? "mt-1 text-sm font-semibold text-white"
//     : "mt-1 text-sm font-semibold text-zinc-800";

//   const baseTextareaClass = isDark
//     ? "nodrag nopan w-full resize-none rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
//     : "nodrag nopan w-full resize-none rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400";

//   const disabledTextareaClass = isDark
//     ? "nodrag nopan w-full resize-none rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-zinc-500 outline-none placeholder:text-zinc-600 opacity-70 cursor-not-allowed"
//     : "nodrag nopan w-full resize-none rounded-2xl border border-[#ececec] bg-[#f5f5f5] px-3 py-2 text-sm text-zinc-400 outline-none placeholder:text-zinc-400 opacity-80 cursor-not-allowed";

//   const buttonClass = isDark
//     ? "w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white transition hover:bg-[#141414] disabled:cursor-not-allowed disabled:opacity-60"
//     : "w-full rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60";

//   const runningTextClass = isDark
//     ? "text-xs text-indigo-300"
//     : "text-xs text-indigo-600";

//   const responseBoxClass = isDark
//     ? "rounded-2xl border border-white/10 bg-white/[0.03] p-3 nodrag nopan"
//     : "rounded-2xl border border-[#ececec] bg-white p-3 nodrag nopan";

//   const responseLabelClass = isDark
//     ? "mb-2 text-xs text-zinc-400"
//     : "mb-2 text-xs text-zinc-500";

//   const responseTextClass = isDark
//     ? "whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200"
//     : "whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700";

//   const modelsErrorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";
//   const errorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";

//   const handleClass = isDark
//     ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(78,56,126,0.22)]"
//     : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(78,56,126,0.16)]";
//   const runningTargetHandleClass = nodeData.isProcessing
//     ? isDark
//       ? "workflow-handle-running-dark"
//       : "workflow-handle-running-light"
//     : "";

//   return (
//     <div className="group relative overflow-visible">
//       {nodeData.error ? (
//         <NodeRunErrorBubble
//           message={nodeData.error}
//           onDismiss={() => updateNodeData(id, { error: "" })}
//         />
//       ) : null}

//       <NodeHoverRunButton
//         nodeId={id}
//         onRun={() => runNode(id)}
//         onRunWorkflow={() => runWorkflow(id, true)}
//         disabled={
//           !!nodeData.isProcessing ||
//           !effectiveUserMessage.trim() ||
//           !nodeData.model ||
//           isSelectedModelDisabled
//         }
//         isRunning={!!nodeData.isProcessing}
//         forceRunTextWhite
//       />

//       <div className={`${containerClass} ${runningGlowClass}`}>
//         <Handle
//           type="target"
//           position={Position.Left}
//           id="system_prompt"
//           style={{ top: "24%" }}
//           className={`${handleClass} ${runningTargetHandleClass}`}
//         />

//       <Handle
//         type="target"
//         position={Position.Left}
//         id="user_message"
//         style={{ top: "50%" }}
//         className={`${handleClass} ${runningTargetHandleClass}`}
//       />

//       <Handle
//         type="target"
//         position={Position.Left}
//         id="images"
//         style={{ top: "76%" }}
//         className={`${handleClass} ${runningTargetHandleClass}`}
//       />

//       <div className={headerClass}>
//         <div>
//           <p className={mutedLabelClass}>LLM</p>
//           <p className={titleClass}>{nodeData.label || "Run Any LLM"}</p>
//         </div>

//         <NodeMenu onRun={() => runNode(id)} onDelete={() => removeNode(id)} />
//       </div>

//       <div className={bodyClass}>
//         <ConnectedField label="Model" connected={false}>
//           <div
//             className="nodrag nopan"
//             onMouseDown={(e) => e.stopPropagation()}
//             onPointerDown={(e) => e.stopPropagation()}
//           >
//             <ModelSelector
//               value={nodeData.model}
//               models={models}
//               isLoading={isLoadingModels}
//               onChange={(value) => updateNodeData(id, { model: value })}
//             />
//           </div>
//         </ConnectedField>

//         {modelsError ? <p className={modelsErrorClass}>{modelsError}</p> : null}

//         <ConnectedField
//           label="System Prompt"
//           connected={hasConnectedSystemPrompt}
//         >
//           <textarea
//             value={nodeData.systemPrompt}
//             onChange={(e) =>
//               updateNodeData(id, { systemPrompt: e.target.value })
//             }
//             rows={3}
//             disabled={hasConnectedSystemPrompt}
//             placeholder={
//               hasConnectedSystemPrompt
//                 ? "Value comes from connected node"
//                 : "Optional system instructions..."
//             }
//             className={
//               hasConnectedSystemPrompt
//                 ? disabledTextareaClass
//                 : baseTextareaClass
//             }
//           />
//         </ConnectedField>

//         <ConnectedField
//           label="User Message"
//           connected={hasConnectedUserMessage}
//         >
//           <textarea
//             value={nodeData.userMessage}
//             onChange={(e) =>
//               updateNodeData(id, { userMessage: e.target.value })
//             }
//             rows={4}
//             disabled={hasConnectedUserMessage}
//             placeholder={
//               hasConnectedUserMessage
//                 ? "Value comes from connected node"
//                 : "Required user message..."
//             }
//             className={
//               hasConnectedUserMessage
//                 ? disabledTextareaClass
//                 : baseTextareaClass
//             }
//           />
//         </ConnectedField>

//         <ConnectedField
//           label="Image URLs (one per line)"
//           connected={hasConnectedImages}
//         >
//           <textarea
//             value={nodeData.imageUrls.join("\n")}
//             onChange={(e) =>
//               updateNodeData(id, { imageUrls: parseImageUrls(e.target.value) })
//             }
//             rows={3}
//             disabled={hasConnectedImages}
//             placeholder={
//               hasConnectedImages
//                 ? "Images come from connected node(s)"
//                 : "Optional image URLs..."
//             }
//             className={
//               hasConnectedImages
//                 ? disabledTextareaClass
//                 : baseTextareaClass
//             }
//           />
//         </ConnectedField>

//         {nodeData.runId && nodeData.isProcessing ? (
//           <p className={runningTextClass}>Running LLM task...</p>
//         ) : null}

//         {nodeData.outputText ? (
//           <div
//             className={responseBoxClass}
//             onMouseDown={(e) => e.stopPropagation()}
//             onPointerDown={(e) => e.stopPropagation()}
//           >
//             <div className={responseLabelClass}>Response</div>

//             <div
//               className="max-h-56 overflow-y-auto overscroll-contain pr-1 nodrag nopan"
//               onMouseDown={(e) => e.stopPropagation()}
//               onPointerDown={(e) => e.stopPropagation()}
//               onWheelCapture={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 e.currentTarget.scrollTop += e.deltaY;
//               }}
//             >
//               <p className={responseTextClass}>{nodeData.outputText}</p>
//             </div>
//           </div>
//         ) : null}
//       </div>

//         <Handle
//           type="source"
//           position={Position.Right}
//           id="output"
//           className={handleClass}
//         />
//       </div>
//     </div>
//   );
// };

// const RunAnyLlmNode = memo(RunAnyLlmNodeComponent);
// export default RunAnyLlmNode;

"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown, Info, Pencil } from "lucide-react";
import type { RunAnyLlmNodeData } from "./run-any-llm-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useResolvedNodeInputs } from "@/hooks/workflow/useResolvedNodeInputs";
import { useConnectedInputHandles } from "@/hooks/workflow/useConnectedInputHandles";
import { useGeminiModels } from "@/hooks/gemini/useGeminiModels";
import ModelSelector from "./ModelSelector";
import NodeHoverRunButton from "@/components/workflow/common/NodeHoverRunButton";
import NodeRunErrorBubble from "@/components/workflow/common/NodeRunErrorBubble";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const DEFAULT_SYSTEM_PROMPT = "You are a friendly and helpful assistant.";

function parseImageUrls(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const RunAnyLlmNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as RunAnyLlmNodeData;
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isOutputTooltipOpen, setIsOutputTooltipOpen] = useState(false);
  const hasSeededDefaultSystemPrompt = useRef(false);
  const updateNodeData = useWorkflowEditorStore(
    (state) => state.updateNodeData
  );
  const { runNode, runWorkflow } = useWorkflowExecution();
  const resolvedInputs = useResolvedNodeInputs(id);
  const connectedHandles = useConnectedInputHandles(id);
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
  const runningGlowClass = nodeData.isProcessing
    ? isDark
      ? "workflow-node-running-dark"
      : "workflow-node-running-light"
    : "";

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

  useEffect(() => {
    if (hasSeededDefaultSystemPrompt.current) return;
    hasSeededDefaultSystemPrompt.current = true;

    if (!nodeData.systemPrompt.trim()) {
      updateNodeData(id, { systemPrompt: DEFAULT_SYSTEM_PROMPT });
    }
  }, [id, nodeData.systemPrompt, updateNodeData]);

  const selectedModel = models.find((model) => model.id === nodeData.model);
  const isSelectedModelDisabled = !!selectedModel?.disabled;

  const containerClass = isDark
    ? selected
      ? "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#4f8cff] bg-[#1c1c1c] text-zinc-200 shadow-[0_24px_70px_rgba(0,0,0,0.5)] ring-2 ring-[#4f8cff]/20 transition"
      : "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-white/8 bg-[#1c1c1c] text-zinc-200 shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition"
    : selected
    ? "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#4f8cff] bg-[#f4f4f4] text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#4f8cff]/15 transition"
    : "min-w-[318px] max-w-[318px] overflow-hidden rounded-[16px] border border-[#ececec] bg-[#f4f4f4] text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

  const shellClass = isDark ? "bg-[#1f1f1f]" : "bg-[#f1f1f1]";

  const outputBoxClass = isDark
    ? "relative rounded-[18px] border border-white/[0.04] bg-[#1b1b1b] px-4 py-4 text-zinc-400"
    : "relative rounded-[18px] border border-black/[0.04] bg-white px-4 py-4 text-zinc-500";

  const outputTextClass = isDark
    ? "whitespace-pre-wrap break-words text-[15px] leading-6 text-zinc-200"
    : "whitespace-pre-wrap break-words text-[15px] leading-6 text-zinc-800";

  const panelLabelClass = isDark
    ? "text-[13px] font-medium text-zinc-400 cursor-pointer"
    : "text-[13px] font-medium text-zinc-500 cursor-pointer";

  const sectionButtonClass = isDark
    ? "flex w-full items-center justify-between py-2 text-left"
    : "flex w-full items-center justify-between py-2 text-left";

  const baseTextareaClass = isDark
    ? "nodrag nopan w-full resize-none rounded-[12px] border border-white/6 bg-[#171717] px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-zinc-500"
    : "nodrag nopan w-full resize-none rounded-[12px] border border-[#ececec] bg-[#fafafa] px-3 py-2.5 text-[14px] text-zinc-800 outline-none placeholder:text-zinc-400";

  const disabledTextareaClass = isDark
    ? "nodrag nopan w-full resize-none rounded-[12px] border border-white/6 bg-[#171717] px-3 py-2.5 text-[14px] text-zinc-500 outline-none placeholder:text-zinc-600 opacity-70 cursor-not-allowed"
    : "nodrag nopan w-full resize-none rounded-[12px] border border-[#ececec] bg-[#f1f1f1] px-3 py-2.5 text-[14px] text-zinc-400 outline-none placeholder:text-zinc-400 opacity-80 cursor-not-allowed";

  const runningTextClass = isDark
    ? "text-xs text-indigo-300"
    : "text-xs text-indigo-600";

  const modelsErrorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";
  const errorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";

  const handleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(102,45,145,0.22)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(102,45,145,0.16)]";
  const collapsedHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#2e2e2e] !bg-[#b8b8b8] shadow-[0_0_0_4px_rgba(184,184,184,0.16)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e5e5e5] !bg-[#bdbdbd] shadow-[0_0_0_4px_rgba(189,189,189,0.14)]";
  const runningTargetHandleClass = nodeData.isProcessing
    ? isDark
      ? "workflow-handle-running-dark"
      : "workflow-handle-running-light"
    : "";
  const chevronClass = (isOpen: boolean) =>
    `cursor-pointer ${isDark ? "text-zinc-500" : "text-zinc-400"} transition-transform ${
      isOpen ? "" : "-rotate-90"
    }`;
  const editableSystemPrompt = hasConnectedSystemPrompt
    ? effectiveSystemPrompt
    : nodeData.systemPrompt;
  const displayLabel = isEditingLabel ? nodeData.label : nodeData.label || "LLM";

  return (
    <div className="group relative overflow-visible">
      {nodeData.error ? (
        <NodeRunErrorBubble
          message={nodeData.error}
          onDismiss={() => updateNodeData(id, { error: "" })}
        />
      ) : null}

      {isOutputTooltipOpen ? (
        <div className="pointer-events-none absolute right-[-238px] top-[305px] z-40">
          <div className="relative whitespace-nowrap rounded-[18px] bg-white px-6 py-4 text-[15px] font-medium text-[#171717] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
            The generated text output.
            <div className="absolute left-[-8px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
          </div>
        </div>
      ) : null}

      <NodeHoverRunButton
        nodeId={id}
        onRun={() => runNode(id)}
        onRunWorkflow={() => runWorkflow(id, true)}
        disabled={
          !!nodeData.isProcessing ||
          !effectiveUserMessage.trim() ||
          !nodeData.model ||
          isSelectedModelDisabled
        }
        isRunning={!!nodeData.isProcessing}
        forceRunTextWhite
      />

      <div className={`${containerClass} ${runningGlowClass}`}>
        <div className="absolute -top-6 right-0 z-20">
          <div className="group/info relative">
            <div
              // className={`flex h-6 w-6 items-center justify-center rounded-full border ${
              //   isDark
              //     ? "border-white/15 bg-[#171717] text-zinc-400"
              //     : "border-black/10 bg-white text-zinc-500"
              // }`}
            >
              <Info size={14} />
            </div>

            <div className="pointer-events-none absolute right-0 top-8 z-30 w-[340px]  opacity-0 transition duration-150 group-hover/info:opacity-100">
              <div className="rounded-[14px] bg-black px-8 py-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.52)]">
                <div className="text-[16px] font-medium tracking-[-0.02em]">
                  LLM
                </div>
                <p className="mt-2 max-w-[540px] text-[14px] leading-6 text-white/95">
                  Run large language model queries with customizable system and
                  user prompts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -top-8 left-0 z-10">
          <input
            type="text"
            value={displayLabel}
            placeholder="Node Name"
            className={`nodrag nopan min-w-[64px] bg-transparent text-[14px] font-medium outline-none ${
              isDark ? "text-zinc-400 placeholder:text-zinc-600" : "text-zinc-600 placeholder:text-zinc-400"
            }`}
            onFocus={() => {
              setIsEditingLabel(true);
              if ((nodeData.label || "LLM") === "LLM") {
                updateNodeData(id, { label: "" });
              }
            }}
            onBlur={() => {
              setIsEditingLabel(false);
              if (!nodeData.label.trim()) {
                updateNodeData(id, { label: "LLM" });
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

        <Handle
          type="target"
          position={Position.Left}
          id="system_prompt"
          style={{ top: isSettingsOpen ? 803 : 690 }}
          className={`${
            isSettingsOpen ? handleClass : collapsedHandleClass
          } ${runningTargetHandleClass}`}
        />

        <Handle
          type="target"
          position={Position.Left}
          id="user_message"
          style={{ top: 340 }}
          className={`${handleClass} ${runningTargetHandleClass}`}
        />

        <Handle
          type="target"
          position={Position.Left}
          id="images"
          style={{ top: 548 }}
          className={`${handleClass} ${runningTargetHandleClass}`}
        />

        <div className={`px-0 pb-4 pt-0 ${shellClass}`}>
          <div
            className={`${outputBoxClass} rounded-none border-x-0 border-t-0`}
          >
            <div
              className="min-h-[248px] max-h-[248px] overflow-y-auto overscroll-contain pr-1"
              onWheelCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.scrollTop += e.deltaY;
              }}
            >
              {nodeData.outputText ? (
                <p className={outputTextClass}>{nodeData.outputText}</p>
              ) : (
                <p className="text-[15px] text-zinc-500">LLM output will appear here...</p>
              )}
            </div>
          </div>
          <div className="group/output relative flex justify-end">
            <span
              className={`cursor-default text-[14px] mr-5 mt-1 font-medium ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}
              onMouseEnter={() => setIsOutputTooltipOpen(true)}
              onMouseLeave={() => setIsOutputTooltipOpen(false)}
            >
              Output
            </span>
          </div>
          <div className="mt-3 px-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-2">
                <span className={isDark ? "text-[14px] font-medium text-zinc-300" : "text-[14px] font-medium text-zinc-700"}>
                  Prompt
                </span>
                <Pencil size={12} className={isDark ? "text-zinc-500" : "text-zinc-400"} />
              </div>

            
            </div>
            <div className="mt-1">
              <textarea
                value={
                  hasConnectedUserMessage
                    ? effectiveUserMessage
                    : nodeData.userMessage
                }
                onChange={(e) =>
                  updateNodeData(id, { userMessage: e.target.value })
                }
                rows={6}
                disabled={hasConnectedUserMessage}
                placeholder={
                  hasConnectedUserMessage
                    ? "Value comes from connected node"
                    : "Write something..."
                }
                className={
                  hasConnectedUserMessage
                    ? disabledTextareaClass
                    : baseTextareaClass
                }
              />
            </div>
          </div>

          <div className="mt-3 px-4">
            <div className="flex items-center gap-3 py-2">
              <span className={isDark ? "text-[14px] font-medium text-zinc-300" : "text-[14px] font-medium text-zinc-700"}>
                Image URLs
              </span>
            </div>
            <div className="mt-1">
              <textarea
                value={
                  hasConnectedImages
                    ? mergedImageUrls.join("\n")
                    : nodeData.imageUrls.join("\n")
                }
                onChange={(e) =>
                  updateNodeData(id, { imageUrls: parseImageUrls(e.target.value) })
                }
                rows={3}
                disabled={hasConnectedImages}
                placeholder={
                  hasConnectedImages
                    ? "Images come from connected node(s)"
                    : "Paste image URLs, one per line..."
                }
                className={
                  hasConnectedImages
                    ? disabledTextareaClass
                    : baseTextareaClass
                }
              />
            </div>
          </div>

          <div className="mt-3 px-4">
            <button
              type="button"
              className={sectionButtonClass}
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <ChevronDown size={15} className={chevronClass(isSettingsOpen)} />
                <span className={panelLabelClass}>Settings</span>
              </div>
            </button>

            {isSettingsOpen ? (
              <div className="mt-2 space-y-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={panelLabelClass}>Model</span>
                  </div>
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
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={panelLabelClass}>System Prompt</span>
                    <Pencil size={12} className={isDark ? "text-zinc-500" : "text-zinc-400"} />
                  </div>
                  <textarea
                    value={editableSystemPrompt}
                    onChange={(e) =>
                      updateNodeData(id, { systemPrompt: e.target.value })
                    }
                    rows={5}
                    disabled={hasConnectedSystemPrompt}
                    placeholder={
                      hasConnectedSystemPrompt
                        ? "Value comes from connected node"
                        : DEFAULT_SYSTEM_PROMPT
                    }
                    className={
                      hasConnectedSystemPrompt
                        ? disabledTextareaClass
                        : baseTextareaClass
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          {modelsError ? <p className={`mt-3 ${modelsErrorClass}`}>{modelsError}</p> : null}
          {nodeData.error ? <p className={`mt-2 ${errorClass}`}>{nodeData.error}</p> : null}
          {nodeData.runId && nodeData.isProcessing ? (
            <p className={`mt-2 ${runningTextClass}`}>Running LLM task...</p>
          ) : null}
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="output"
           style={{ top: isSettingsOpen ? '31%' : '41%' }}
          className={handleClass}
        />
      </div>
    </div>
  );
};

const RunAnyLlmNode = memo(RunAnyLlmNodeComponent);
export default RunAnyLlmNode;
