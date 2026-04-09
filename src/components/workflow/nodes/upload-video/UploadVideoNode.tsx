"use client";

import React, { memo, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { UploadVideoNodeData } from "./upload-video-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import NodeMenu from "@/components/workflow/common/NodeMenu";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const ACCEPT = ".mp4,.mov,.webm,.m4v";

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

function extractVideoUrl(data: TransloaditAssemblyResponse) {
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

const UploadVideoNodeComponent = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as UploadVideoNodeData;
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const removeNode = useWorkflowEditorStore((state) => state.removeNode);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isDark } = useWorkflowTheme();

  const containerClass = isDark
    ? selected
      ? "min-w-[320px] max-w-[360px] overflow-hidden rounded-[28px] border border-[#4f8cff] bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-2 ring-[#4f8cff]/20 transition"
      : "min-w-[320px] max-w-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition"
    : selected
    ? "min-w-[320px] max-w-[360px] overflow-hidden rounded-[28px] border border-[#4f8cff] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#4f8cff]/15 transition"
    : "min-w-[320px] max-w-[360px] overflow-hidden rounded-[28px] border border-[#ececec] bg-white text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition";

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

  const uploadButtonClass = isDark
    ? "flex h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 text-center transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
    : "flex h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-[#d4d4d8] bg-white px-4 text-center transition hover:bg-[#f8f8f8] disabled:cursor-not-allowed disabled:opacity-60";

  const uploadTitleClass = isDark
    ? "text-sm font-medium text-white"
    : "text-sm font-medium text-zinc-800";

  const uploadSubtitleClass = "mt-2 text-xs text-zinc-500";

  const previewBoxClass = isDark
    ? "overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
    : "overflow-hidden rounded-2xl border border-[#ececec] bg-white";

  const fileInfoClass = isDark
    ? "rounded-2xl border border-white/10 bg-white/[0.03] p-3"
    : "rounded-2xl border border-[#ececec] bg-white p-3";

  const fileNameClass = isDark
    ? "truncate text-sm text-zinc-200"
    : "truncate text-sm text-zinc-800";

  const fileUrlClass = "mt-1 break-all text-xs text-zinc-500";

  const replaceButtonClass = isDark
    ? "rounded-2xl border border-white/10 bg-[#0d0d0d] px-3 py-2 text-sm text-white transition hover:bg-[#141414]"
    : "rounded-2xl border border-[#ececec] bg-white px-3 py-2 text-sm text-zinc-800 transition hover:bg-[#f5f5f5]";

  const errorClass = isDark ? "text-xs text-red-400" : "text-xs text-red-500";

  const sourceHandleClass = isDark
    ? "!h-4 !w-4 !border-[3px] !border-[#16381f] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
    : "!h-4 !w-4 !border-[3px] !border-[#dcfce7] !bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.14)]";

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
      const videoUrl = extractVideoUrl(assembly);

      if (!videoUrl) {
        throw new Error("Upload succeeded, but no video URL was returned.");
      }

      updateNodeData(id, {
        fileName: file.name,
        videoUrl,
        assemblyId: assembly.assembly_id ?? "",
        isUploading: false,
        error: "",
      });
    } catch (error) {
      updateNodeData(id, {
        isUploading: false,
        error:
          error instanceof Error ? error.message : "Video upload failed.",
      });
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <div>
          <p className={mutedLabelClass}>Video Input</p>
          <p className={titleClass}>{nodeData.label || "Upload Video"}</p>
        </div>

        <NodeMenu onDelete={() => removeNode(id)} />
      </div>

      <div className={bodyClass}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileChange}
          className="hidden"
        />

        {!nodeData.videoUrl ? (
          <button
            type="button"
            onClick={handlePickFile}
            disabled={!!nodeData.isUploading}
            className={uploadButtonClass}
          >
            <div>
              <p className={uploadTitleClass}>
                {nodeData.isUploading ? "Uploading video..." : "Choose video"}
              </p>
              <p className={uploadSubtitleClass}>MP4, MOV, WEBM, M4V</p>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <div className={previewBoxClass}>
              <video
                src={nodeData.videoUrl}
                controls
                preload="metadata"
                className="h-auto max-h-[260px] w-full object-contain"
              />
            </div>

            <div className={fileInfoClass}>
              <p className={fileNameClass}>
                {nodeData.fileName || "Uploaded video"}
              </p>
              <p className={fileUrlClass}>{nodeData.videoUrl}</p>
            </div>

            <button
              type="button"
              onClick={handlePickFile}
              className={replaceButtonClass}
            >
              Replace video
            </button>
          </div>
        )}

        {nodeData.error ? <p className={errorClass}>{nodeData.error}</p> : null}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="video-url-output"
        className={sourceHandleClass}
      />
    </div>
  );
};

const UploadVideoNode = memo(UploadVideoNodeComponent);
export default UploadVideoNode;
