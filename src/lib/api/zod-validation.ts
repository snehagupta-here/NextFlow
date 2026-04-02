import { z, ZodSchema } from "zod";
import { NextResponse } from "next/server";

export type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type ValidationFailure = {
  success: false;
  response: NextResponse;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status: 400 }
  );
}

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return {
      success: false,
      response: badRequest("Invalid JSON body."),
    };
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    return {
      success: false,
      response: badRequest("Validation failed.", formatZodIssues(result.error)),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export function validateParams<T>(
  params: unknown,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      response: badRequest("Invalid route params.", formatZodIssues(result.error)),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      response: badRequest("Invalid query params.", formatZodIssues(result.error)),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}