import type { Edge } from "@xyflow/react";
import type { WorkflowNode } from "@/types/workflow";

export type ResolvedNodeOutput =
  | string
  | string[]
  | null
  | undefined;

export type NodeMap = Map<string, WorkflowNode>;

export type IncomingHandleGroup = Record<string, Edge[]>;

export type ResolvedInputs = Record<string, ResolvedNodeOutput>;