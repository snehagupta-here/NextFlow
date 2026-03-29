import { NextResponse } from "next/server";
import { listGeminiModels } from "@/lib/gemini/list-models";

export async function GET() {
  try {
    const models = await listGeminiModels();

    return NextResponse.json({
      models,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load Gemini models.",
      },
      { status: 500 }
    );
  }
}