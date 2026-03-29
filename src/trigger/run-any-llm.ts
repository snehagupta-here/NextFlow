import { task, logger } from "@trigger.dev/sdk";
import { GoogleGenAI } from "@google/genai";

type RunAnyLlmPayload = {
  model: string;
  systemPrompt?: string;
  userMessage: string;
  imageUrls?: string[];
};

function sanitizeUrls(urls: string[] = []) {
  return urls.map((url) => url.replace(/\s+/g, "").trim()).filter(Boolean);
}

function guessMimeTypeFromUrl(url: string) {
  const lower = url.toLowerCase();

  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export const runAnyLlmTask = task({
  id: "run-any-llm-task",
  run: async (payload: RunAnyLlmPayload) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY.");
    }

    const model = (payload.model || "gemini-2.5-flash").trim();
    const userMessage = String(payload.userMessage ?? "").trim();
    const systemPrompt = String(payload.systemPrompt ?? "").trim();
    const imageUrls = sanitizeUrls(payload.imageUrls ?? []);

    if (!userMessage) {
      throw new Error("User message is required.");
    }

    const ai = new GoogleGenAI({ apiKey });

    logger.log("Running Gemini request", {
      model,
      hasSystemPrompt: !!systemPrompt,
      imageCount: imageUrls.length,
    });

    const parts: any[] = [{ text: userMessage }];

    for (const imageUrl of imageUrls) {
      try {
        new URL(imageUrl);
      } catch {
        throw new Error(`Invalid image URL: ${imageUrl}`);
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${imageUrl}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      parts.push({
        inlineData: {
          mimeType: guessMimeTypeFromUrl(imageUrl),
          data: base64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      config: {
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
      },
    });

    const outputText = response.text?.trim() || "";

    if (!outputText) {
      throw new Error("LLM returned an empty response.");
    }

    return {
      outputText,
      model,
    };
  },
});