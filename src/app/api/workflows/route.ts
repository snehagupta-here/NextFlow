import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBody,
  validateSearchParams,
} from "@/lib/api/zod-validation";
import {
  createWorkflowBodySchema,
  workflowListQuerySchema,
} from "@/lib/api/workflow-schemas";

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function workflowWhereByUser(userId: string): Prisma.WorkflowWhereInput {
  return { userId } as unknown as Prisma.WorkflowWhereInput;
}

function workflowCreateData(
  userId: string,
  name: string,
  nodes: unknown,
  edges: unknown
): Prisma.WorkflowCreateInput {
  return {
    userId,
    name,
    nodes: toJsonInput(nodes),
    edges: toJsonInput(edges),
  } as unknown as Prisma.WorkflowCreateInput;
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const queryResult = validateSearchParams(
    url.searchParams,
    workflowListQuerySchema
  );

  if (!queryResult.success) return queryResult.response;

  const workflows = await prisma.workflow.findMany({
    where: workflowWhereByUser(userId),
    orderBy: { updatedAt: "desc" },
    take: queryResult.data.limit,
  });

  return NextResponse.json({
    success: true,
    workflows,
  });
}

export async function POST(request: Request) {
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

  const bodyResult = await validateBody(request, createWorkflowBodySchema);
  if (!bodyResult.success) return bodyResult.response;

  const body = bodyResult.data;

  try {
    const workflow = await prisma.workflow.create({
      data: workflowCreateData(userId, body.name, body.nodes, body.edges),
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create workflow.",
      },
      { status: 500 }
    );
  }
}
