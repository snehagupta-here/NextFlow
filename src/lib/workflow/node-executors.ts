import { WorkflowNodeType, type WorkflowNode } from "@/types/workflow";
import type {
  ExecuteNodeFn,
  NodeExecutionContext,
  NodeExecutionResult,
} from "./execution-types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${url}`);
  }

  return data as T;
}

async function pollStatus<TOutput extends object>(
  url: string,
  isDone: (payload: any) => boolean,
  getFailure: (payload: any) => string | undefined
): Promise<TOutput> {
  while (true) {
    const payload = await fetchJson<any>(url);

    if (payload.status === "COMPLETED") {
      return payload.output as TOutput;
    }

    if (
      payload.status === "FAILED" ||
      payload.status === "CANCELED" ||
      payload.status === "CANCELLED" ||
      payload.status === "CRASHED" ||
      payload.status === "TIMED_OUT" ||
      payload.status === "SYSTEM_FAILURE" ||
      payload.status === "INTERRUPTED"
    ) {
      throw new Error(getFailure(payload) || `Execution failed (${payload.status})`);
    }

    if (isDone(payload)) {
      return payload.output as TOutput;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

const executeTextNode: ExecuteNodeFn = async ({ node }) => {
  const text = String((node.data as any).text ?? "");
  return {
    outputs: {
      "text-output": text,
    },
  };
};

const executeUploadImageNode: ExecuteNodeFn = async ({ node }) => {
  const imageUrl = String((node.data as any).imageUrl ?? "").trim();
  if (!imageUrl) {
    throw new Error("Upload Image node has no uploaded image.");
  }

  return {
    outputs: {
      "image-url-output": imageUrl,
    },
  };
};

const executeUploadVideoNode: ExecuteNodeFn = async ({ node }) => {
  const videoUrl = String((node.data as any).videoUrl ?? "").trim();
  if (!videoUrl) {
    throw new Error("Upload Video node has no uploaded video.");
  }

  return {
    outputs: {
      "video-url-output": videoUrl,
    },
  };
};

const executeCropImageNode: ExecuteNodeFn = async ({ node, resolvedInputs }) => {
  const data = node.data as any;
  const imageUrl =
    String(resolvedInputs["image-url-input"] ?? data.inputImageUrl ?? "").trim();

  if (!imageUrl) {
    throw new Error("Crop Image node is missing input image URL.");
  }

  const start = await fetchJson<{ runId: string }>("/api/workflow/crop-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrl,
      x: data.x ?? "0",
      y: data.y ?? "0",
      width: data.width ?? "100",
      height: data.height ?? "100",
    }),
  });

  const output = await pollStatus<{ croppedImageUrl: string }>(
    `/api/workflow/crop-image/status?runId=${start.runId}`,
    () => false,
    (payload) => payload.error
  );

  return {
    outputs: {
      "cropped-image-url-output": output.croppedImageUrl,
    },
    uiPatch: {
      croppedImageUrl: output.croppedImageUrl,
      error: "",
      isProcessing: false,
      runId: start.runId,
    },
  };
};

const executeExtractFrameNode: ExecuteNodeFn = async ({
  node,
  resolvedInputs,
}) => {
  const data = node.data as any;
  const videoUrl =
    String(resolvedInputs["video-url-input"] ?? data.inputVideoUrl ?? "").trim();

  if (!videoUrl) {
    throw new Error("Extract Frame node is missing input video URL.");
  }

  const start = await fetchJson<{ runId: string }>("/api/workflow/extract-frame", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoUrl,
      timestamp: String(data.timestamp ?? "0"),
    }),
  });

  const output = await pollStatus<{ frameImageUrl: string }>(
    `/api/workflow/extract-frame/status?runId=${start.runId}`,
    () => false,
    (payload) => payload.error
  );

  return {
    outputs: {
      "frame-image-url-output": output.frameImageUrl,
    },
    uiPatch: {
      extractedFrameUrl: output.frameImageUrl,
      error: "",
      isProcessing: false,
      runId: start.runId,
    },
  };
};

const executeRunAnyLlmNode: ExecuteNodeFn = async ({ node, resolvedInputs }) => {
  const data = node.data as any;

  const systemPrompt = String(
    resolvedInputs["system_prompt"] ?? data.systemPrompt ?? ""
  );

  const userMessage = String(
    resolvedInputs["user_message"] ?? data.userMessage ?? ""
  ).trim();

  const connectedImages = Array.isArray(resolvedInputs["images"])
    ? resolvedInputs["images"]
    : resolvedInputs["images"]
    ? [resolvedInputs["images"]]
    : [];

  const manualImages = Array.isArray(data.imageUrls) ? data.imageUrls : [];

  const imageUrls = Array.from(
    new Set(
      [...manualImages, ...connectedImages]
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    )
  );

  if (!userMessage) {
    throw new Error("Run Any LLM node is missing user message.");
  }

  const start = await fetchJson<{ runId: string }>("/api/workflow/run-any-llm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: data.model,
      systemPrompt,
      userMessage,
      imageUrls,
    }),
  });

  const output = await pollStatus<{ outputText: string }>(
    `/api/workflow/run-any-llm/status?runId=${start.runId}`,
    () => false,
    (payload) => payload.error
  );

  return {
    outputs: {
      output: output.outputText,
    },
    uiPatch: {
      outputText: output.outputText,
      error: "",
      isProcessing: false,
      runId: start.runId,
    },
  };
};

export const nodeExecutors: Record<string, ExecuteNodeFn> = {
  [WorkflowNodeType.TEXT]: executeTextNode,
  [WorkflowNodeType.UPLOAD_IMAGE]: executeUploadImageNode,
  [WorkflowNodeType.UPLOAD_VIDEO]: executeUploadVideoNode,
  [WorkflowNodeType.CROP_IMAGE]: executeCropImageNode,
  [WorkflowNodeType.EXTRACT_FRAME]: executeExtractFrameNode,
  [WorkflowNodeType.RUN_ANY_LLM]: executeRunAnyLlmNode,
};

export function getNodeExecutor(node: WorkflowNode) {
  const executor = nodeExecutors[node.type];
  if (!executor) {
    throw new Error(`No executor registered for node type: ${node.type}`);
  }
  return executor;
}