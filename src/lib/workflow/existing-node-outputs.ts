import {
  WorkflowNodeType,
  type WorkflowNode,
} from "@/types/workflow";

export function getExistingNodeOutputs(node: WorkflowNode): Record<string, unknown> {
  const data = node.data as any;

  switch (node.type) {
    case WorkflowNodeType.TEXT:
      return data.text
        ? { "text-output": data.text }
        : {};

    case WorkflowNodeType.UPLOAD_IMAGE:
      return data.imageUrl
        ? { "image-url-output": data.imageUrl }
        : {};

    case WorkflowNodeType.UPLOAD_VIDEO:
      return data.videoUrl
        ? { "video-url-output": data.videoUrl }
        : {};

    case WorkflowNodeType.CROP_IMAGE:
      return data.croppedImageUrl
        ? { "cropped-image-url-output": data.croppedImageUrl }
        : {};

    case WorkflowNodeType.EXTRACT_FRAME:
      return data.extractedFrameUrl
        ? { "frame-image-url-output": data.extractedFrameUrl }
        : {};

    case WorkflowNodeType.RUN_ANY_LLM:
      return data.outputText
        ? { output: data.outputText }
        : {};

    default:
      return {};
  }
}