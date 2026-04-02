import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBody,
  validateParams,
} from "@/lib/api/zod-validation";
import {
  createWorkflowRunBodySchema,
  workflowIdParamSchema,
} from "@/lib/api/workflow-schemas";

type RouteContext = {
  params: Promise<{ workflowId: string }>;
};

function toNullableJsonInput(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

export async function GET(_request: Request, context: RouteContext) {
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

  const paramsResult = validateParams(rawParams, workflowIdParamSchema);
  if (!paramsResult.success) return paramsResult.response;

  const { workflowId } = paramsResult.data;

  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
      select: { id: true },
    });

    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow not found.",
        },
        { status: 404 }
      );
    }

    const runs = await prisma.workflowRun.findMany({
      where: { workflowId, userId },
      orderBy: { startedAt: "desc" },
      include: {
        nodeRuns: {
          orderBy: { startedAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      runs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load runs.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
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

  const paramsResult = validateParams(rawParams, workflowIdParamSchema);
  if (!paramsResult.success) return paramsResult.response;

  const bodyResult = await validateBody(request, createWorkflowRunBodySchema);
  if (!bodyResult.success) return bodyResult.response;

  const { workflowId } = paramsResult.data;
  const { scope, targetNodeIds } = bodyResult.data;

  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
      select: { id: true },
    });

    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow not found.",
        },
        { status: 404 }
      );
    }

    const run = await prisma.workflowRun.create({
      data: {
        userId,
        workflowId,
        scope,
        status: "RUNNING",
        targetNodeIds: toNullableJsonInput(targetNodeIds),
      },
    });

    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create workflow run.",
      },
      { status: 500 }
    );
  }
}
