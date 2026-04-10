import type { WorkflowEdge, WorkflowNode } from "@/types/workflow";
import { WorkflowNodeType } from "@/types/workflow";
import { createWorkflowEdge } from "@/lib/workflow/edge-factory";

export type WorkflowTemplate = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

const SAMPLE_PRODUCT_IMAGE_URL = "/sample-workflows/shopping.jpeg";
const SAMPLE_PRODUCT_VIDEO_URL = "/sample-workflows/sony-headphones-demo.mp4";
const SAMPLE_VIDEO_FRAME_URL = "/sample-workflows/sony-headphones-frame.jpg";

function buildProductMarketingKitTemplate(): WorkflowTemplate {
  const nodes: WorkflowNode[] = [
    {
      id: "tpl-text-product-description",
      type: WorkflowNodeType.TEXT,
      position: { x: 120, y: 60 },
      data: {
        label: "Text",
        text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description.",
      },
    },
    {
      id: "tpl-text-product-details",
      type: WorkflowNodeType.TEXT,
      position: { x: 120, y: 340 },
      data: {
        label: "Text",
        text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
      },
    },
    {
      id: "tpl-upload-image",
      type: WorkflowNodeType.UPLOAD_IMAGE,
      position: { x: 120, y: 760 },
      data: {
        label: "Upload Image",
        fileName: "shopping.jpeg",
        imageUrl: SAMPLE_PRODUCT_IMAGE_URL,
        assemblyId: "",
        isUploading: false,
        error: "",
      },
    },
    {
      id: "tpl-crop-image",
      type: WorkflowNodeType.CROP_IMAGE,
      position: { x: 540, y: 760 },
      data: {
        label: "Crop Image",
        inputImageUrl: "",
        x: "10",
        y: "10",
        width: "80",
        height: "80",
        croppedImageUrl: SAMPLE_PRODUCT_IMAGE_URL,
        runId: "",
        isProcessing: false,
        error: "",
      },
    },
    {
      id: "tpl-upload-video",
      type: WorkflowNodeType.UPLOAD_VIDEO,
      position: { x: 980, y: 760 },
      data: {
        label: "Upload Video",
        fileName: "sony-headphones-demo.mp4",
        videoUrl: SAMPLE_PRODUCT_VIDEO_URL,
        assemblyId: "",
        isUploading: false,
        error: "",
      },
    },
    {
      id: "tpl-extract-frame",
      type: WorkflowNodeType.EXTRACT_FRAME,
      position: { x: 1400, y: 760 },
      data: {
        label: "Extract Frame",
        inputVideoUrl: "",
        timestamp: "50%",
        extractedFrameUrl: SAMPLE_VIDEO_FRAME_URL,
        runId: "",
        isProcessing: false,
        error: "",
      },
    },
    {
      id: "tpl-llm-copy",
      type: WorkflowNodeType.RUN_ANY_LLM,
      position: { x: 720, y: 150 },
      data: {
        label: "Run Any LLM",
        model: "gemini-2.5-flash-lite",
        systemPrompt: "",
        userMessage: "",
        imageUrls: [],
        outputText: "",
        runId: "",
        isProcessing: false,
        error: "",
      },
    },
    {
      id: "tpl-text-social-post",
      type: WorkflowNodeType.TEXT,
      position: { x: 1260, y: 60 },
      data: {
        label: "Text",
        text: "You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.",
      },
    },
    {
      id: "tpl-llm-final",
      type: WorkflowNodeType.RUN_ANY_LLM,
      position: { x: 1760, y: 240 },
      data: {
        label: "Run Any LLM",
        model: "gemini-2.5-flash-lite",
        systemPrompt: "",
        userMessage: "",
        imageUrls: [],
        outputText: "",
        runId: "",
        isProcessing: false,
        error: "",
      },
    },
  ];

  const makeEdge = (
    source: string,
    target: string,
    sourceHandle?: string,
    targetHandle?: string
  ) =>
    createWorkflowEdge(
      {
        source,
        target,
        sourceHandle: sourceHandle ?? null,
        targetHandle: targetHandle ?? null,
      },
      "dark"
    ) as WorkflowEdge;

  const edges: WorkflowEdge[] = [
    makeEdge(
      "tpl-text-product-description",
      "tpl-llm-copy",
      "text-output",
      "system_prompt"
    ),
    makeEdge(
      "tpl-text-product-details",
      "tpl-llm-copy",
      "text-output",
      "user_message"
    ),
    makeEdge(
      "tpl-upload-image",
      "tpl-crop-image",
      "image-url-output",
      "image-url-input"
    ),
    makeEdge(
      "tpl-crop-image",
      "tpl-llm-copy",
      "cropped-image-url-output",
      "images"
    ),
    makeEdge(
      "tpl-upload-video",
      "tpl-extract-frame",
      "video-url-output",
      "video-url-input"
    ),
    makeEdge(
      "tpl-extract-frame",
      "tpl-llm-final",
      "frame-image-url-output",
      "images"
    ),
    makeEdge(
      "tpl-llm-copy",
      "tpl-llm-final",
      "output",
      "user_message"
    ),
    makeEdge(
      "tpl-text-social-post",
      "tpl-llm-final",
      "text-output",
      "system_prompt"
    ),
    makeEdge(
      "tpl-crop-image",
      "tpl-llm-final",
      "cropped-image-url-output",
      "images"
    ),
  ];

  return {
    id: "product-marketing-kit",
    title: "Product Marketing Kit Generator",
    subtitle: "Generate product copy, social posts, and image/video-driven marketing assets",
    description:
      "A ready-to-run branching workflow that combines product details, cropped images, and extracted video frames into polished LLM marketing outputs.",
    nodes,
    edges,
  };
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  buildProductMarketingKitTemplate(),
];

export function getWorkflowTemplateById(templateId?: string | null) {
  if (!templateId) return null;
  return WORKFLOW_TEMPLATES.find((template) => template.id === templateId) ?? null;
}
