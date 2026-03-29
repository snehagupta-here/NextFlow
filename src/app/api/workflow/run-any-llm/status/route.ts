import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";

function extractRunError(run: any): string {
  if (typeof run?.error === "string") return run.error;

  if (run?.error?.message) return run.error.message;

  const attempts = Array.isArray(run?.attempts) ? run.attempts : [];
  const lastAttempt = attempts[attempts.length - 1];

  if (typeof lastAttempt?.error === "string") return lastAttempt.error;
  if (lastAttempt?.error?.message) return lastAttempt.error.message;

  return "";
}

export async function GET(request: NextRequest) {
  try {
    const runId = request.nextUrl.searchParams.get("runId");

    if (!runId) {
      return NextResponse.json({ error: "Missing runId." }, { status: 400 });
    }

    const run = await runs.retrieve(runId);

    if (!run) {
      return NextResponse.json({ error: "Run not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: run.id,
      status: run.status,
      output: run.output ?? null,
      error: extractRunError(run),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch LLM status.",
      },
      { status: 500 }
    );
  }
}