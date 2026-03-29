import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { runAnyLlmTask } from "@/trigger/run-any-llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

   const model =
  typeof body.model === "string" && body.model.trim()
    ? body.model.trim()
    : "gemini-2.5-flash";
    const systemPrompt =
      typeof body.systemPrompt === "string" ? body.systemPrompt : "";
    const userMessage =
      typeof body.userMessage === "string" ? body.userMessage : "";
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : [];

    if (!userMessage.trim()) {
      return NextResponse.json(
        { error: "User message is required." },
        { status: 400 }
      );
    }

    const handle = await tasks.trigger<typeof runAnyLlmTask>(
      "run-any-llm-task",
      {
        model,
        systemPrompt,
        userMessage,
        imageUrls,
      }
    );

    return NextResponse.json({
      runId: handle.id,
      status: "queued",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start LLM task.",
      },
      { status: 500 }
    );
  }
}