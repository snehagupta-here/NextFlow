import type { GeminiModelOption } from "@/types/gemini-model";

type GeminiListModelsResponse = {
  models?: Array<{
    name: string;
    displayName?: string;
    description?: string;
    supportedGenerationMethods?: string[];
    inputTokenLimit?: number;
    outputTokenLimit?: number;
  }>;
  nextPageToken?: string;
};

const PAID_OR_RESTRICTED_MODEL_IDS = new Set([
  "gemini-3.1-pro-preview",
  "gemini-3-pro-image-preview",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
 "gemini-2.0-flash-lite-001",
 "gemini-2.5-flash-image",
  "gemini-2.5-flash",
  "gemini-3.1-flash-image-preview",
  "gemini-pro-latest",
  "gemini-flash-latest",
  "gemini-3.1-pro-preview-customtools",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite-preview-09-2025",
     "gemini-2.5-computer-use-preview-10-2025",
]);

const DEPRECATED_MODEL_IDS = new Set([
  "gemini-3-pro-preview",
]);

function normalizeModelId(name: string) {
  return name.replace(/^models\//, "");
}

function supportsGenerateContent(methods?: string[]) {
  return (methods ?? []).includes("generateContent");
}

function shouldIncludeModel(id: string) {
  return (
    id.includes("gemini") &&
    !id.includes("embedding") &&
    !id.includes("aqa") &&
    !id.includes("tts") &&
    !id.includes("image-generation")
  );
}

export async function listGeminiModels(): Promise<GeminiModelOption[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to list Gemini models: ${text}`);
  }

  const data = (await response.json()) as GeminiListModelsResponse;

  const models = (data.models ?? [])
    .map((model) => {
      const id = normalizeModelId(model.name);
      const supported = supportsGenerateContent(
        model.supportedGenerationMethods
      );

      let disabled = !supported;
      let disabledReason: GeminiModelOption["disabledReason"] | undefined;
      let badge: GeminiModelOption["badge"] | undefined;

      if (!supported) {
        disabled = true;
        disabledReason = "unsupported";
        badge = "unsupported";
      }

      if (DEPRECATED_MODEL_IDS.has(id)) {
        disabled = true;
        disabledReason = "deprecated";
        badge = "deprecated";
      }

      if (PAID_OR_RESTRICTED_MODEL_IDS.has(id)) {
        disabled = true;
        disabledReason = "paid_quota";
        badge = "paid quota";
      }

      return {
        id,
        label: model.displayName || id,
        description: model.description,
        supportedGenerationMethods: model.supportedGenerationMethods,
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit,
        disabled,
        disabledReason,
        badge,
      } satisfies GeminiModelOption;
    })
    .filter((model) => shouldIncludeModel(model.id))
    .sort((a, b) => {
      if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
      return a.id.localeCompare(b.id);
    });

  return models;
}