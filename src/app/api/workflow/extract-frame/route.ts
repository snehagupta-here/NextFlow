import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { extractFrameTask } from "@/trigger/extract-frame";

function sanitizeUrl(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const videoUrl = sanitizeUrl(body.videoUrl);
    const timestamp =
      typeof body.timestamp === "string" || typeof body.timestamp === "number"
        ? String(body.timestamp)
        : "0";

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Missing upstream video URL." },
        { status: 400 }
      );
    }

    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid video URL." },
        { status: 400 }
      );
    }

    const handle = await tasks.trigger<typeof extractFrameTask>(
      "extract-frame-task",
      {
        videoUrl,
        timestamp,
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
            : "Failed to start extract frame task.",
      },
      { status: 500 }
    );
  }
}