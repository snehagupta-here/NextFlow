import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";

function extractRunError(run: unknown): string {
  if (!run || typeof run !== "object") return "";

  const runRecord = run as {
    error?: string | { message?: string };
    attempts?: Array<{ error?: string | { message?: string } }>;
  };

  if (typeof runRecord.error === "string") return runRecord.error;
  if (runRecord.error?.message) return runRecord.error.message;

  const attempts = Array.isArray(runRecord.attempts) ? runRecord.attempts : [];
  const lastAttempt = attempts[attempts.length - 1];

  if (typeof lastAttempt?.error === "string") return lastAttempt.error;
  if (lastAttempt?.error?.message) return lastAttempt.error.message;

  return "";
}

export async function GET(request: NextRequest) {
  try {
    const runId = request.nextUrl.searchParams.get("runId");

    if (!runId) {
      return NextResponse.json(
        { error: "Missing runId." },
        { status: 400 }
      );
    }

    const run = await runs.retrieve(runId);

    if (!run) {
      return NextResponse.json(
        { error: "Run not found." },
        { status: 404 }
      );
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
            : "Failed to fetch crop run status.",
      },
      { status: 500 }
    );
  }
}
