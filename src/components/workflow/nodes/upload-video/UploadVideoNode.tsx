"use client";

import React, { memo, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { UploadVideoNodeData } from "./upload-video-node.types";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import NodeMenu from "@/components/workflow/common/NodeMenu";
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
  const inputRef = useRef<HTMLInputElement | null>(null);

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
const removeNode = useWorkflowEditorStore((state) => state.removeNode);
return (
  <div
    className={`min-w-[320px] max-w-[360px] rounded-2xl border shadow-xl transition ${
      selected
        ? "border-white/20 bg-[#050505] ring-2 ring-white/10"
        : "border-white/10 bg-black/90"
    }`}
  >
    <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Video Input
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {nodeData.label || "Upload Video"}
        </p>
      </div>

      <NodeMenu onDelete={() => removeNode(id)} />
    </div>

    <div className="space-y-3 px-4 py-3">
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
          className="flex h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 text-center transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div>
            <p className="text-sm font-medium text-white">
              {nodeData.isUploading ? "Uploading video..." : "Choose video"}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              MP4, MOV, WEBM, M4V
            </p>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <video
              src={nodeData.videoUrl}
              controls
              preload="metadata"
              className="h-auto max-h-[260px] w-full object-contain"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="truncate text-sm text-zinc-200">
              {nodeData.fileName || "Uploaded video"}
            </p>
            <p className="mt-1 break-all text-xs text-zinc-500">
              {nodeData.videoUrl}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePickFile}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white transition hover:bg-white/[0.06]"
          >
            Replace video
          </button>
        </div>
      )}

      {nodeData.error ? (
        <p className="text-xs text-red-400">{nodeData.error}</p>
      ) : null}
    </div>

    <Handle
      type="source"
      position={Position.Right}
      id="video-url-output"
      className="!h-3 !w-3 !border !border-white/20 !bg-zinc-400"
    />
  </div>
);
};

const UploadVideoNode = memo(UploadVideoNodeComponent);
export default UploadVideoNode;