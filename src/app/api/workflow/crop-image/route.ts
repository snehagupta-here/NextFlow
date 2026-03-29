import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { cropImageTask } from "@/trigger/crop-image";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const imageUrl = body.imageUrl;
    const x = Number(body.x ?? 0);
    const y = Number(body.y ?? 0);
    const width = Number(body.width ?? 100);
    const height = Number(body.height ?? 100);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing upstream image URL." },
        { status: 400 }
      );
    }

    const handle = await tasks.trigger<typeof cropImageTask>("crop-image-task", {
      imageUrl,
      x,
      y,
      width,
      height,
    });

    return NextResponse.json({
      runId: handle.id,
      status: "queued",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to start crop image task.",
      },
      { status: 500 }
    );
  }
}