import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBody,
  validateParams,
} from "@/lib/api/zod-validation";
import {
  runIdParamSchema,
  updateWorkflowRunBodySchema,
} from "@/lib/api/workflow-schemas";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required.",
      },
      { status: 401 }
    );
  }

  const rawParams = await context.params;
  const paramsResult = validateParams(rawParams, runIdParamSchema);
  if (!paramsResult.success) return paramsResult.response;

  const bodyResult = await validateBody(request, updateWorkflowRunBodySchema);
  if (!bodyResult.success) return bodyResult.response;

  const existing = await prisma.workflowRun.findFirst({
    where: {
      id: paramsResult.data.runId,
      userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json(
      {
        success: false,
        error: "Workflow run not found.",
      },
      { status: 404 }
    );
  }

  try {
    const run = await prisma.workflowRun.update({
      where: { id: paramsResult.data.runId },
      data: {
        status: bodyResult.data.status,
        finishedAt: bodyResult.data.finishedAt
          ? new Date(bodyResult.data.finishedAt)
          : undefined,
        durationMs: bodyResult.data.durationMs,
        errorMessage: bodyResult.data.errorMessage,
      },
    });

    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update workflow run.",
      },
      { status: 500 }
    );
  }
}
