"use client";

import React, { memo, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Info } from "lucide-react";
import type { UploadImageNodeData } from "./upload-image-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import NodeHoverRunButton from "@/components/workflow/common/NodeHoverRunButton";
import NodeRunErrorBubble from "@/components/workflow/common/NodeRunErrorBubble";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";

type TransloaditSignResponse = {
  params: {
    auth: {
      key: string;
      expires: string;
    };
    template_id: string;
  };
  signature: string;
};

type TransloaditAssemblyResponse = {
  ok?: string;
  error?: string;
  assembly_id?: string;
  uploads?: Array<{
    ssl_url?: string;
    url?: string;
    name?: string;
  }>;
  results?: Record<
    string,
    Array<{
      ssl_url?: string;
      url?: string;
      name?: string;
    }>
  >;
};

function extractImageUrl(data: TransloaditAssemblyResponse) {
  const resultGroups = data.results ? Object.values(data.results) : [];

  for (const group of resultGroups) {
    if (Array.isArray(group) && group.length > 0) {
      const first = group[0];
      if (first?.ssl_url) return first.ssl_url;
      if (first?.url) return first.url;
    }
  }

  const upload = data.uploads?.[0];
  if (upload?.ssl_url) return upload.ssl_url;
  if (upload?.url) return upload.url;

  return "";
}

const UploadImageNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as UploadImageNodeData;
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const { runNode, runWorkflow } = useWorkflowExecution();
    const [isOutputTooltipOpen, setIsOutputTooltipOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isDark } = useWorkflowTheme();
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

  const bodyClass = isDark
    ? "space-y-3 px-4 py-3"
    : "space-y-3 px-4 py-3 bg-[#fcfcfc]";

  const outputBoxClass = isDark
    ? "relative border border-white/[0.04] bg-[#1b1b1b] px-4 py-4 text-zinc-400"
    : "relative border border-black/[0.04] bg-white px-4 py-4 text-zinc-500";

  const outputPlaceholderClass = isDark
    ? "text-[15px] text-zinc-500"
    : "text-[15px] text-zinc-500";

 const filePickerClass = isDark
  ? `flex h-10 flex-1 items-center rounded-[12px] border border-white/8 bg-[#171717] px-2 ${
      nodeData?.fileName ? "text-[11px]" : "text-[14px] cursor-pointer"
    } text-zinc-400 transition hover:bg-[#1d1d1d] disabled:cursor-not-allowed disabled:opacity-60`
  : `flex h-10 flex-1 items-center rounded-[12px] border border-[#ececec] bg-white px-2 ${
      nodeData?.fileName ? "text-[11px]" : "text-[14px] cursor-pointer"
    } text-zinc-500 transition hover:bg-[#f8f8f8] disabled:cursor-not-allowed disabled:opacity-60`;
 
    const rowLabelClass = isDark
    ? "text-[14px] font-medium text-zinc-300"
    : "text-[14px] font-medium text-zinc-700";

  const inlinePreviewClass = isDark
    ? "overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03]"
    : "overflow-hidden rounded-[14px] border border-[#ececec] bg-white";

  const replaceButtonClass = isDark
    ? "cursor-pointer rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white transition hover:bg-[#141414]"
    : "cursor-pointer rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 transition hover:bg-[#f5f5f5]";

   const sourceHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#24193a] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(102,45,145,0.22)]"
    : "!h-4 !w-4 !border-[3px] !border-[#e9e2f7] !bg-[#4e387e] shadow-[0_0_0_4px_rgba(102,45,145,0.16)]";
  const displayLabel = isEditingLabel ? nodeData.label : nodeData.label || "Image";

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    updateNodeData(id, {
      fileName: file.name,
      isUploading: true,
      error: "",
    });

    try {
      const signRes = await fetch("/api/transloadit/sign", {
        method: "POST",
      });

      if (!signRes.ok) {
        const text = await signRes.text();
        throw new Error(text || "Failed to get Transloadit signature.");
      }

      const signedData = (await signRes.json()) as TransloaditSignResponse;

      const formData = new FormData();
      formData.append("params", JSON.stringify(signedData.params));
      formData.append("signature", signedData.signature);
      formData.append("file", file);

      const uploadRes = await fetch("https://api2.transloadit.com/assemblies", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(text || "Transloadit upload failed.");
      }

      const assembly = (await uploadRes.json()) as TransloaditAssemblyResponse;

      const imageUrl = extractImageUrl(assembly);

      if (!imageUrl) {
        throw new Error("Upload succeeded, but no image URL was returned.");
      }

      updateNodeData(id, {
        fileName: file.name,
        imageUrl,
        assemblyId: assembly.assembly_id ?? "",
        isUploading: false,
        error: "",
      });
    } catch (error) {
      updateNodeData(id, {
        isUploading: false,
        error:
          error instanceof Error ? error.message : "Image upload failed.",
      });
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="group relative overflow-visible">
      {nodeData.error ? (
        <NodeRunErrorBubble
          message={nodeData.error}
          onDismiss={() => updateNodeData(id, { error: "" })}
        />
      ) : null}

      {isOutputTooltipOpen ? (
        <div className="pointer-events-none absolute right-[-268px] top-[150px] z-40">
          <div className="relative whitespace-nowrap rounded-[18px] bg-white px-4 py-2 text-[13px] font-medium text-[#171717] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
            The generated image URL output.
            <div className="absolute left-[-8px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
          </div>
        </div>
      ) : null}

      <NodeHoverRunButton
        nodeId={id}
        onRun={() => runNode(id, true)}
        onRunWorkflow={() => runWorkflow(id, true)}
        disabled={!!nodeData.isUploading || !!nodeData.isProcessing}
        isRunning={!!nodeData.isProcessing}
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
              if ((nodeData.label || "Image") === "Image") {
                updateNodeData(id, { label: "" });
              }
            }}
            onBlur={() => {
              setIsEditingLabel(false);
              if (!nodeData.label.trim()) {
                updateNodeData(id, { label: "Image" });
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
            <div
            >
              <Info size={14} />
            </div>

            <div className="pointer-events-none absolute right-0 top-8 z-30 w-[300px] opacity-0 transition duration-150 group-hover/info:opacity-100">
              <div className="rounded-[14px] bg-black px-6 py-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.52)]">
                <div className="text-[16px] font-medium tracking-[-0.02em]">
                  Image
                </div>
                <p className="mt-2 text-[14px] leading-6 text-white/95">
                  Upload an image and pass its URL to the next connected node.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`px-0 pb-4 pt-0 ${isDark ? "bg-[#1f1f1f]" : "bg-[#f1f1f1]"}`}>
          <div className={`${outputBoxClass} rounded-none border-x-0 border-t-0`}>
            <div className="flex min-h-[110px] max-h-[120px] items-start overflow-y-auto break-all pr-1 text-[14px] leading-6">
              {nodeData.imageUrl ? (
                <p className={isDark ? "text-zinc-200" : "text-zinc-800"}>
                  {nodeData.imageUrl}
                </p>
              ) : (
                <p className={outputPlaceholderClass}>
                  Image node output will appear here...
                </p>
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
              Image
            </span>
          </div>
          <div className={bodyClass}>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <span className={rowLabelClass}>Image</span>
              <button
                type="button"
                onClick={handlePickFile}
                disabled={!!nodeData.isUploading}
                className={filePickerClass}
              >
                <span className="truncate">
                  {nodeData.isUploading
                    ? "Uploading image..."
                    : nodeData.fileName || "Add File"}
                </span>
              </button>
            </div>

            {nodeData.imageUrl ? (
              <div className={inlinePreviewClass}>
                <img
                  src={nodeData.imageUrl}
                  alt={nodeData.fileName || "Uploaded image"}
                  className="h-auto max-h-[180px] w-full object-contain"
                />
              </div>
            ) : null}

            {nodeData.imageUrl ? (
              <>
                {/* <div className={fileInfoClass}>
                  <p className={fileNameClass}>
                    {nodeData.fileName || "Uploaded image"}
                  </p>
                  <p className={fileUrlClass}>{nodeData.imageUrl}</p>
                </div> */}

                <button
                  type="button"
                  onClick={handlePickFile}
                  className={replaceButtonClass}
                >
                  Replace image
                </button>
              </>
            ) : (
              <p className={isDark ? "text-xs text-zinc-500" : "text-xs text-zinc-500"}>
                JPG, JPEG, PNG, WEBP, GIF
              </p>
            )}
          </div>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="image-url-output"
          className={sourceHandleClass}
           style={{ top: nodeData.imageUrl ? 169 : 158 }}
        />
      </div>
    </div>
  );
};

const UploadImageNode = memo(UploadImageNodeComponent);
export default UploadImageNode;
