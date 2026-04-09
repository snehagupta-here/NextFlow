import type { Edge, Node, XYPosition } from "@xyflow/react";

export type ThemeMode = "dark" | "light";

export enum WorkflowNodeType {
  TEXT = "textNode",
  UPLOAD_IMAGE = "uploadImageNode",
  UPLOAD_VIDEO = "uploadVideoNode",
  CROP_IMAGE = "cropImageNode",
  EXTRACT_FRAME = "extractFrameNode",
  RUN_ANY_LLM = "runAnyLlmNode",
}

export type TextNodeData = {
  label: string;
  text: string;
};

export type UploadImageNodeData = {
  label: string;
  fileName: string;
  imageUrl: string;
  assemblyId?: string;
  isUploading?: boolean;
  isProcessing?: boolean;
  runId?: string;
  error?: string;
};

export type UploadVideoNodeData = {
  label: string;
  fileName: string;
  videoUrl: string;
  assemblyId?: string;
  isUploading?: boolean;
  isProcessing?: boolean;
  runId?: string;
  error?: string;
};

export type CropImageNodeData = {
  label: string;
  inputImageUrl: string;
  x: string;
  y: string;
  width: string;
  height: string;
  croppedImageUrl: string;
  runId?: string;
  isProcessing?: boolean;
  error?: string;
};

export type ExtractFrameNodeData = {
  label: string;
  inputVideoUrl: string;
  timestamp: string;
  extractedFrameUrl: string;
  runId?: string;
  isProcessing?: boolean;
  error?: string;
};

export type RunAnyLlmNodeData = {
  label: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  imageUrls: string[];
  outputText: string;
  runId?: string;
  isProcessing?: boolean;
  error?: string;
};

export type WorkflowNodeDataMap = {
  [WorkflowNodeType.TEXT]: TextNodeData;
  [WorkflowNodeType.UPLOAD_IMAGE]: UploadImageNodeData;
  [WorkflowNodeType.UPLOAD_VIDEO]: UploadVideoNodeData;
  [WorkflowNodeType.CROP_IMAGE]: CropImageNodeData;
  [WorkflowNodeType.EXTRACT_FRAME]: ExtractFrameNodeData;
  [WorkflowNodeType.RUN_ANY_LLM]: RunAnyLlmNodeData;
};

export type WorkflowNodeData = WorkflowNodeDataMap[keyof WorkflowNodeDataMap];
export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export type AddNodePayload = {
  type: WorkflowNodeType;
  position?: XYPosition;
  data?: Partial<WorkflowNodeData>;
};
