// import { NextRequest, NextResponse } from "next/server";
// import { runs } from "@trigger.dev/sdk/v3";

// export async function GET(request: NextRequest) {
//   try {
//     const runId = request.nextUrl.searchParams.get("runId");

//     if (!runId) {
//       return NextResponse.json({ error: "Missing runId." }, { status: 400 });
//     }

//     const run = await runs.retrieve(runId);

//     if (!run) {
//       return NextResponse.json({ error: "Run not found." }, { status: 404 });
//     }

//     return NextResponse.json({
//       id: run.id,
//       status: run.status,
//       output: run.output ?? null,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Failed to fetch extract frame status.",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import {
  validateSearchParams,
} from "@/lib/api/zod-validation";
import { extractFrameStatusQuerySchema } from "@/lib/api/workflow-schemas";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const queryResult = validateSearchParams(
    url.searchParams,
    extractFrameStatusQuerySchema
  );
  if (!queryResult.success) return queryResult.response;

  const { runId } = queryResult.data;

  try {
    // fetch task status using runId
    return NextResponse.json({
      success: true,
      status: "RUNNING",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch extract frame status.",
      },
      { status: 500 }
    );
  }
}