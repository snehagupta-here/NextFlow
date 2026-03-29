import {
  WorkflowNodeType,
  type WorkflowNode,
  type TextNodeData,
  type UploadImageNodeData,
  type UploadVideoNodeData,
  type CropImageNodeData,
  type ExtractFrameNodeData,
  type RunAnyLlmNodeData,
} from "@/types/workflow";
import type { ResolvedNodeOutput } from "./handle-resolver.types";

export function resolveNodeOutput(
  node: WorkflowNode,
  sourceHandle?: string | null
): ResolvedNodeOutput {
  switch (node.type) {
    case WorkflowNodeType.TEXT: {
      const data = node.data as TextNodeData;
      return data.text ?? "";
    }

    case WorkflowNodeType.UPLOAD_IMAGE: {
      const data = node.data as UploadImageNodeData;
      return data.imageUrl ?? "";
    }

    case WorkflowNodeType.UPLOAD_VIDEO: {
      const data = node.data as UploadVideoNodeData;
      return data.videoUrl ?? "";
    }

    case WorkflowNodeType.CROP_IMAGE: {
      const data = node.data as CropImageNodeData;
      return data.croppedImageUrl ?? "";
    }

    case WorkflowNodeType.EXTRACT_FRAME: {
      const data = node.data as ExtractFrameNodeData;
      return data.extractedFrameUrl ?? "";
    }

    case WorkflowNodeType.RUN_ANY_LLM: {
      const data = node.data as RunAnyLlmNodeData;
      return data.outputText ?? "";
    }

    default:
      return "";
  }
}