import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBody,
  validateParams,
} from "@/lib/api/zod-validation";
import {
  nodeRunParamsSchema,
  updateNodeRunBodySchema,
} from "@/lib/api/workflow-schemas";

type RouteContext = {
  params: Promise<{ runId: string; nodeRunId: string }>;
};

function toNullableJsonInput(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

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
  const paramsResult = validateParams(rawParams, nodeRunParamsSchema);
  if (!paramsResult.success) return paramsResult.response;

  const bodyResult = await validateBody(request, updateNodeRunBodySchema);
  if (!bodyResult.success) return bodyResult.response;

  const existing = await prisma.nodeRun.findFirst({
    where: {
      id: paramsResult.data.nodeRunId,
      workflowRunId: paramsResult.data.runId,
      userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json(
      {
        success: false,
        error: "Node run not found.",
      },
      { status: 404 }
    );
  }

  try {
    const nodeRun = await prisma.nodeRun.update({
      where: { id: paramsResult.data.nodeRunId },
      data: {
        status: bodyResult.data.status,
        startedAt: bodyResult.data.startedAt
          ? new Date(bodyResult.data.startedAt)
          : undefined,
        finishedAt: bodyResult.data.finishedAt
          ? new Date(bodyResult.data.finishedAt)
          : undefined,
        durationMs: bodyResult.data.durationMs,
        inputsUsed: toNullableJsonInput(bodyResult.data.inputsUsed),
        outputsGenerated: toNullableJsonInput(bodyResult.data.outputsGenerated),
        errorMessage: bodyResult.data.errorMessage,
      },
    });

    return NextResponse.json(nodeRun);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update node run.",
      },
      { status: 500 }
    );
  }
}
