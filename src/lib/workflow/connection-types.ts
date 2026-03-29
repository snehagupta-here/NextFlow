export type HandleValueType =
  | "text"
  | "image_url"
  | "video_url";

export type HandleDirection = "source" | "target";

export type HandleSpec = {
  nodeType: string;
  handleId: string;
  direction: HandleDirection;
  valueType: HandleValueType;
  multiple?: boolean;
};

export const HANDLE_SPECS: HandleSpec[] = [
  {
    nodeType: "textNode",
    handleId: "text-output",
    direction: "source",
    valueType: "text",
  },

  {
    nodeType: "uploadImageNode",
    handleId: "image-url-output",
    direction: "source",
    valueType: "image_url",
  },

  {
    nodeType: "uploadVideoNode",
    handleId: "video-url-output",
    direction: "source",
    valueType: "video_url",
  },

  {
    nodeType: "cropImageNode",
    handleId: "image-url-input",
    direction: "target",
    valueType: "image_url",
  },
  {
    nodeType: "cropImageNode",
    handleId: "cropped-image-url-output",
    direction: "source",
    valueType: "image_url",
  },

  {
    nodeType: "extractFrameNode",
    handleId: "video-url-input",
    direction: "target",
    valueType: "video_url",
  },
  {
    nodeType: "extractFrameNode",
    handleId: "frame-image-url-output",
    direction: "source",
    valueType: "image_url",
  },

  {
    nodeType: "runAnyLlmNode",
    handleId: "system_prompt",
    direction: "target",
    valueType: "text",
  },
  {
    nodeType: "runAnyLlmNode",
    handleId: "user_message",
    direction: "target",
    valueType: "text",
  },
  {
    nodeType: "runAnyLlmNode",
    handleId: "images",
    direction: "target",
    valueType: "image_url",
    multiple: true,
  },
  {
    nodeType: "runAnyLlmNode",
    handleId: "output",
    direction: "source",
    valueType: "text",
  },
];

export function getHandleSpec(nodeType?: string, handleId?: string | null) {
  return HANDLE_SPECS.find(
    (spec) => spec.nodeType === nodeType && spec.handleId === handleId
  );
}