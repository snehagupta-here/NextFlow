import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";

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
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch extract frame status.",
      },
      { status: 500 }
    );
  }
}