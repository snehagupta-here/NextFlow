import { WorkflowNodeType, type WorkflowNodeDataMap } from "@/types/workflow";

export const DEFAULT_NODE_POSITION = {
  x: 240,
  y: 180,
};

export const NODE_DEFAULTS: {
  [K in WorkflowNodeType]: WorkflowNodeDataMap[K];
} = {
  [WorkflowNodeType.TEXT]: {
    label: "Text",
    text: "",
  },
  [WorkflowNodeType.UPLOAD_IMAGE]: {
    label: "Upload Image",
    fileName: "",
    imageUrl: "",
    assemblyId: "",
    isUploading: false,
    isProcessing: false,
    runId: "",
    error: "",
  },
  [WorkflowNodeType.UPLOAD_VIDEO]: {
    label: "Upload Video",
    fileName: "",
    videoUrl: "",
    assemblyId: "",
    isUploading: false,
    isProcessing: false,
    runId: "",
    error: "",
  },
  [WorkflowNodeType.CROP_IMAGE]: {
    label: "Crop Image",
    inputImageUrl: "",
    x: "0",
    y: "0",
    width: "100",
    height: "100",
    croppedImageUrl: "",
    runId: "",
    isProcessing: false,
    error: "",
  },
  [WorkflowNodeType.EXTRACT_FRAME]: {
    label: "Extract Frame",
    inputVideoUrl: "",
    timestamp: "0",
    extractedFrameUrl: "",
    runId: "",
    isProcessing: false,
    error: "",
  },
  [WorkflowNodeType.RUN_ANY_LLM]: {
  label: "Run Any LLM",
  model: "gemini-2.5-flash",
  systemPrompt: "",
  userMessage: "",
  imageUrls: [],
  outputText: "",
  runId: "",
  isProcessing: false,
  error: "",
},
};
