import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { runAnyLlmTask } from "@/trigger/run-any-llm";
import { validateBody } from "@/lib/api/zod-validation";
import { runAnyLlmBodySchema } from "@/lib/api/workflow-schemas";

export async function POST(request: Request) {
  const bodyResult = await validateBody(request, runAnyLlmBodySchema);
  if (!bodyResult.success) return bodyResult.response;

  const { model, systemPrompt, userMessage, imageUrls } = bodyResult.data;

  try {
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
