import { z } from "zod";
import type { CSSProperties } from "react";
import {
  WorkflowNodeType,
  type WorkflowEdge,
  type WorkflowNode,
  type WorkflowNodeData,
  type CropImageNodeData,
  type ExtractFrameNodeData,
  type RunAnyLlmNodeData,
  type TextNodeData,
  type UploadImageNodeData,
  type UploadVideoNodeData,
} from "@/types/workflow";
import { NODE_DEFAULTS } from "./constants";

const nodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const workflowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.nativeEnum(WorkflowNodeType),
  position: nodePositionSchema,
  data: z.record(z.string(), z.unknown()).default({}),
});

const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  style: z.record(z.string(), z.unknown()).optional(),
  markerEnd: z.record(z.string(), z.unknown()).optional(),
});

const workflowDocumentSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().optional(),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

const workflowImportSchema = z.union([
  workflowDocumentSchema,
  z
    .object({
      nodes: z.array(workflowNodeSchema),
      edges: z.array(workflowEdgeSchema),
    })
    .passthrough(),
]);

export type WorkflowDocument = z.infer<typeof workflowDocumentSchema>;

function sanitizeNodeData(
  type: WorkflowNodeType,
  data: Record<string, unknown>
): WorkflowNodeData {
  switch (type) {
    case WorkflowNodeType.TEXT: {
      const baseData = structuredClone(
        NODE_DEFAULTS[WorkflowNodeType.TEXT]
      ) as TextNodeData;

      return {
        ...baseData,
        label: String(data.label ?? baseData.label),
        text: String(data.text ?? baseData.text),
      };
    }
    case WorkflowNodeType.UPLOAD_IMAGE: {
      const baseData = structuredClone(
        NODE_DEFAULTS[WorkflowNodeType.UPLOAD_IMAGE]
      ) as UploadImageNodeData;

      return {
        ...baseData,
        label: String(data.label ?? baseData.label),
        fileName: String(data.fileName ?? data.file_name ?? baseData.fileName),
        imageUrl: String(data.imageUrl ?? baseData.imageUrl),
        assemblyId: String(data.assemblyId ?? baseData.assemblyId ?? ""),
        isUploading: false,
        error: "",
      };
    }
    case WorkflowNodeType.UPLOAD_VIDEO: {
      const baseData = structuredClone(
        NODE_DEFAULTS[WorkflowNodeType.UPLOAD_VIDEO]
      ) as UploadVideoNodeData;

      return {
        ...baseData,
        label: String(data.label ?? baseData.label),
        fileName: String(data.fileName ?? data.file_name ?? baseData.fileName),
        videoUrl: String(data.videoUrl ?? baseData.videoUrl),
        assemblyId: String(data.assemblyId ?? baseData.assemblyId ?? ""),
        isUploading: false,
        error: "",
      };
    }
    case WorkflowNodeType.CROP_IMAGE: {
      const baseData = structuredClone(
        NODE_DEFAULTS[WorkflowNodeType.CROP_IMAGE]
      ) as CropImageNodeData;

      return {
        ...baseData,
        label: String(data.label ?? baseData.label),
        inputImageUrl: String(data.inputImageUrl ?? baseData.inputImageUrl),
        x: String(data.x ?? baseData.x),
        y: String(data.y ?? baseData.y),
        width: String(data.width ?? baseData.width),
        height: String(data.height ?? baseData.height),
        croppedImageUrl: String(data.croppedImageUrl ?? baseData.croppedImageUrl),
        runId: "",
        isProcessing: false,
        error: "",
      };
    }
    case WorkflowNodeType.EXTRACT_FRAME: {
      const baseData = structuredClone(
        NODE_DEFAULTS[WorkflowNodeType.EXTRACT_FRAME]
      ) as ExtractFrameNodeData;

      return {
        ...baseData,
        label: String(data.label ?? baseData.label),
        inputVideoUrl: String(data.inputVideoUrl ?? baseData.inputVideoUrl),
        timestamp: String(data.timestamp ?? baseData.timestamp),
        extractedFrameUrl: String(
          data.extractedFrameUrl ?? baseData.extractedFrameUrl
        ),
        runId: "",
        isProcessing: false,
        error: "",
      };
    }
    case WorkflowNodeType.RUN_ANY_LLM: {
      const baseData = structuredClone(
        NODE_DEFAULTS[WorkflowNodeType.RUN_ANY_LLM]
      ) as RunAnyLlmNodeData;

      return {
        ...baseData,
        label: String(data.label ?? baseData.label),
        model: String(data.model ?? baseData.model),
        systemPrompt: String(data.systemPrompt ?? baseData.systemPrompt),
        userMessage: String(data.userMessage ?? baseData.userMessage),
        imageUrls: Array.isArray(data.imageUrls)
          ? data.imageUrls.map((value) => String(value))
          : [],
        outputText: String(data.outputText ?? baseData.outputText),
        runId: "",
        isProcessing: false,
        error: "",
      };
    }
  }
}

export function createWorkflowExportDocument(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowDocument {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: sanitizeNodeData(
        node.type as WorkflowNodeType,
        (node.data ?? {}) as Record<string, unknown>
      ),
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      type: edge.type,
      animated: edge.animated,
      data: edge.data as Record<string, unknown> | undefined,
      style: edge.style as Record<string, unknown> | undefined,
      markerEnd: edge.markerEnd as Record<string, unknown> | undefined,
    })),
  };
}

export function parseWorkflowImportDocument(input: string): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(input);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  const parsed = workflowImportSchema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error("Invalid workflow file format.");
  }

  return {
    nodes: parsed.data.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: sanitizeNodeData(
        node.type,
        node.data as Record<string, unknown>
      ),
    })),
    edges: parsed.data.edges.map((edge) => {
      const importedEdge: WorkflowEdge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? undefined,
        targetHandle: edge.targetHandle ?? undefined,
        type: edge.type,
        animated: edge.animated,
        data: edge.data,
        style: edge.style as CSSProperties | undefined,
      };

      if (edge.markerEnd) {
        importedEdge.markerEnd = edge.markerEnd as WorkflowEdge["markerEnd"];
      }

      return importedEdge;
    }),
  };
}
