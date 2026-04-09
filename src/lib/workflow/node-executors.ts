import { WorkflowNodeType, type WorkflowNode } from "@/types/workflow";
import type {
  ExecuteNodeFn,
  NodeExecutionContext,
  NodeExecutionResult,
} from "./execution-types";

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

async function waitForVisibleRun(durationMs = 120) {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
}

function extractTransloaditAssetUrl(data: TransloaditAssemblyResponse) {
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

function inferFileNameFromUrl(url: string, fallback: string) {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    const candidate = pathname.split("/").pop()?.trim();
    return candidate || fallback;
  } catch {
    return fallback;
  }
}

function shouldUploadAssetForExecution(url: string, assemblyId?: string) {
  if (!url) return false;
  if (assemblyId?.trim()) return false;

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return true;
  }
}

async function uploadAssetToTransloadit(
  assetUrl: string,
  fallbackFileName: string
) {
  const assetResponse = await fetch(assetUrl, { cache: "no-store" });

  if (!assetResponse.ok) {
    throw new Error("Failed to load sample media before upload.");
  }

  const blob = await assetResponse.blob();

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
  formData.append(
    "file",
    blob,
    inferFileNameFromUrl(assetUrl, fallbackFileName)
  );

  const uploadRes = await fetch("https://api2.transloadit.com/assemblies", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(text || "Transloadit upload failed.");
  }

  const assembly = (await uploadRes.json()) as TransloaditAssemblyResponse;
  const uploadedUrl = extractTransloaditAssetUrl(assembly);

  if (!uploadedUrl) {
    throw new Error("Upload succeeded, but no asset URL was returned.");
  }

  return {
    uploadedUrl,
    assemblyId: assembly.assembly_id ?? "",
  };
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
  const data = node.data as any;
  const imageUrl = String(data.imageUrl ?? "").trim();
  if (!imageUrl) {
    throw new Error("Upload Image node has no uploaded image.");
  }

  await waitForVisibleRun();

  if (shouldUploadAssetForExecution(imageUrl, data.assemblyId)) {
    const { uploadedUrl, assemblyId } = await uploadAssetToTransloadit(
      imageUrl,
      data.fileName || "sample-image"
    );

    return {
      outputs: {
        "image-url-output": uploadedUrl,
      },
      uiPatch: {
        imageUrl: uploadedUrl,
        assemblyId,
        error: "",
        isProcessing: false,
      },
    };
  }

  return {
    outputs: {
      "image-url-output": imageUrl,
    },
  };
};

const executeUploadVideoNode: ExecuteNodeFn = async ({ node }) => {
  const data = node.data as any;
  const videoUrl = String(data.videoUrl ?? "").trim();
  if (!videoUrl) {
    throw new Error("Upload Video node has no uploaded video.");
  }

  await waitForVisibleRun();

  if (shouldUploadAssetForExecution(videoUrl, data.assemblyId)) {
    const { uploadedUrl, assemblyId } = await uploadAssetToTransloadit(
      videoUrl,
      data.fileName || "sample-video"
    );

    return {
      outputs: {
        "video-url-output": uploadedUrl,
      },
      uiPatch: {
        videoUrl: uploadedUrl,
        assemblyId,
        error: "",
        isProcessing: false,
      },
    };
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
