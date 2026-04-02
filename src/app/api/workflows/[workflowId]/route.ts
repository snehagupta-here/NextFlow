import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBody,
  validateParams,
} from "@/lib/api/zod-validation";
import {
  workflowIdParamSchema,
  updateWorkflowBodySchema,
} from "@/lib/api/workflow-schemas";

type RouteContext = {
  params: Promise<{ workflowId: string }>;
};

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function workflowWhereByIdAndUser(
  workflowId: string,
  userId: string
): Prisma.WorkflowWhereInput {
  return {
    id: workflowId,
    userId,
  } as unknown as Prisma.WorkflowWhereInput;
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

  const workflow = await prisma.workflow.findFirst({
    where: workflowWhereByIdAndUser(paramsResult.data.workflowId, userId),
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

  return NextResponse.json(workflow);
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

  const paramsResult = validateParams(rawParams, workflowIdParamSchema);
  if (!paramsResult.success) return paramsResult.response;

  const bodyResult = await validateBody(request, updateWorkflowBodySchema);
  if (!bodyResult.success) return bodyResult.response;

  const { workflowId } = paramsResult.data;
  const body = bodyResult.data;

  const existing = await prisma.workflow.findFirst({
    where: workflowWhereByIdAndUser(workflowId, userId),
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json(
      {
        success: false,
        error: `Workflow not found for id: ${workflowId}`,
      },
      { status: 404 }
    );
  }

  try {
    const workflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        name: body.name,
        nodes: body.nodes === undefined ? undefined : toJsonInput(body.nodes),
        edges: body.edges === undefined ? undefined : toJsonInput(body.edges),
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update workflow.",
      },
      { status: 500 }
    );
  }
}
