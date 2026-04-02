"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { executeWorkflow } from "@/lib/workflow/workflow-executor";
import type { ExecutionMode } from "@/lib/workflow/execution-types";

type WorkflowRunScope = "FULL" | "SELECTED" | "SINGLE";
type WorkflowRunStatus = "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL";
type NodeRunStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";

function getRunScope(mode: ExecutionMode): WorkflowRunScope {
  if (mode.type === "single") return "SINGLE";
  if (mode.type === "selected") return "SELECTED";
  return "FULL";
}

function getNodeInputsSnapshot(
  node: any
): Record<string, unknown> {
  switch (node.type) {
    case "uploadImageNode":
      return {};

    case "uploadVideoNode":
      return {};

    case "cropImageNode":
      return {
        inputImageUrl: node.data?.inputImageUrl ?? "",
        x: node.data?.x ?? "0",
        y: node.data?.y ?? "0",
        width: node.data?.width ?? "100",
        height: node.data?.height ?? "100",
      };

    case "extractFrameNode":
      return {
        inputVideoUrl: node.data?.inputVideoUrl ?? "",
        timestamp: node.data?.timestamp ?? "0",
      };

    case "runAnyLlmNode":
      return {
        systemPrompt: node.data?.systemPrompt ?? "",
        userMessage: node.data?.userMessage ?? "",
        imageUrls: node.data?.imageUrls ?? [],
        model: node.data?.model ?? "",
      };

    case "textNode":
      return {
        text: node.data?.text ?? "",
      };

    default:
      return {};
  }
}

export function useWorkflowExecution(workflowId?: string) {
  const { isSignedIn } = useAuth();
  const nodes = useWorkflowEditorStore((state) => state.nodes);
  const edges = useWorkflowEditorStore((state) => state.edges);
  const patchNodeData = useWorkflowEditorStore((state) => state.patchNodeData);
  const currentWorkflowId = useWorkflowEditorStore(
    (state) => state.currentWorkflowId
  );
  const setCurrentWorkflowId = useWorkflowEditorStore(
    (state) => state.setCurrentWorkflowId
  );
  const bumpHistoryRefreshKey = useWorkflowEditorStore(
    (state) => state.bumpHistoryRefreshKey
  );

  const effectiveWorkflowId = workflowId ?? currentWorkflowId;

  const applyNodePatch = useCallback(
    (nodeId: string, patch: Record<string, unknown>) => {
      patchNodeData(nodeId, patch);
    },
    [patchNodeData]
  );

  const executeLocalOnly = useCallback(
    async (mode: ExecutionMode) => {
      await executeWorkflow(mode, nodes, edges, {
        onNodeQueued: (nodeId) => {
          applyNodePatch(nodeId, {
            isProcessing: true,
            error: "",
          });
        },

        onNodeRunning: (nodeId) => {
          applyNodePatch(nodeId, {
            isProcessing: true,
            error: "",
          });
        },

        onNodeSuccess: (nodeId, _outputs, uiPatch) => {
          applyNodePatch(nodeId, {
            isProcessing: false,
            error: "",
            ...(uiPatch ?? {}),
          });
        },

        onNodeError: (nodeId, error) => {
          applyNodePatch(nodeId, {
            isProcessing: false,
            error,
          });
        },

        onNodeSkipped: (nodeId, reason) => {
          applyNodePatch(nodeId, {
            isProcessing: false,
            error: reason,
          });
        },
      });
    },
    [nodes, edges, applyNodePatch]
  );

  const execute = useCallback(
    async (mode: ExecutionMode) => {
      if (nodes.length === 0) return;

      let workflowIdForRun = effectiveWorkflowId;

      if (!workflowIdForRun && isSignedIn) {
        const saveRes = await fetch("/api/workflows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "My Workflow",
            nodes,
            edges,
          }),
        });

        let saveData: any = null;
        try {
          saveData = await saveRes.json();
        } catch {
          saveData = null;
        }

        if (!saveRes.ok || !saveData?.id) {
          throw new Error(saveData?.error || "Failed to save workflow before run.");
        }

        workflowIdForRun = saveData.id;
        setCurrentWorkflowId(saveData.id);
      }

      if (!workflowIdForRun) {
        await executeLocalOnly(mode);
        return;
      }

      const startedAt = Date.now();
      const nodeRunIds = new Map<string, string>();
      const nodeStartedAt = new Map<string, number>();

      const targetNodeIds =
        mode.type === "single"
          ? [mode.nodeId]
          : mode.type === "selected"
          ? mode.nodeIds
          : nodes.map((node) => node.id);

      const runRes = await fetch(`/api/workflows/${workflowIdForRun}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: getRunScope(mode),
          targetNodeIds,
        }),
      });

      const runData = await runRes.json();

      if (!runRes.ok) {
        throw new Error(runData?.error || "Failed to create workflow run.");
      }

      const runId = runData.id as string;

      const createNodeRun = async (
        nodeId: string,
        status: NodeRunStatus,
        extra?: Record<string, unknown>
      ) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const res = await fetch(`/api/workflow-runs/${runId}/node-runs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeId,
            nodeType: node.type,
            nodeLabel: (node.data as any)?.label ?? null,
            status,
            startedAt: new Date().toISOString(),
            ...extra,
          }),
        });

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (res.ok && data?.id) {
          nodeRunIds.set(nodeId, data.id);
        }
      };

      const updateNodeRun = async (
        nodeId: string,
        patch: Record<string, unknown>
      ) => {
        const nodeRunId = nodeRunIds.get(nodeId);
        if (!nodeRunId) return;

        await fetch(`/api/workflow-runs/${runId}/node-runs/${nodeRunId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch),
        });
      };

      const finalizeWorkflowRun = async (
        status: WorkflowRunStatus,
        errorMessage?: string
      ) => {
        const finishedAt = Date.now();

        await fetch(`/api/workflow-runs/${runId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            finishedAt: new Date(finishedAt).toISOString(),
            durationMs: finishedAt - startedAt,
            errorMessage,
          }),
        });

        bumpHistoryRefreshKey();
      };

      const nodeResults = new Map<
        string,
        { status: NodeRunStatus; error?: string }
      >();

      try {
        await executeWorkflow(mode, nodes, edges, {
          onNodeQueued: async (nodeId) => {
            applyNodePatch(nodeId, {
              isProcessing: true,
              error: "",
            });

            nodeResults.set(nodeId, { status: "QUEUED" });
          },

          onNodeRunning: async (nodeId) => {
            applyNodePatch(nodeId, {
              isProcessing: true,
              error: "",
            });

            nodeResults.set(nodeId, { status: "RUNNING" });

            if (!nodeStartedAt.has(nodeId)) {
              nodeStartedAt.set(nodeId, Date.now());
            }

            if (!nodeRunIds.has(nodeId)) {
              await createNodeRun(nodeId, "RUNNING");
            } else {
              await updateNodeRun(nodeId, {
                status: "RUNNING",
              });
            }
          },

          onNodeSuccess: async (nodeId, outputs, uiPatch) => {
            applyNodePatch(nodeId, {
              isProcessing: false,
              error: "",
              ...(uiPatch ?? {}),
            });

            nodeResults.set(nodeId, { status: "SUCCESS" });

            const started = nodeStartedAt.get(nodeId);
            const node = nodes.find((n) => n.id === nodeId);
            const inputsUsed = node ? getNodeInputsSnapshot(node) : {};

            if (!nodeRunIds.has(nodeId)) {
              if (!nodeStartedAt.has(nodeId)) {
                nodeStartedAt.set(nodeId, Date.now());
              }

              await createNodeRun(nodeId, "SUCCESS", {
                finishedAt: new Date().toISOString(),
                durationMs: started ? Date.now() - started : 0,
                inputsUsed,
                outputsGenerated: outputs ?? {},
              });
            } else {
              await updateNodeRun(nodeId, {
                status: "SUCCESS",
                finishedAt: new Date().toISOString(),
                durationMs: started ? Date.now() - started : 0,
                inputsUsed,
                outputsGenerated: outputs ?? {},
              });
            }
          },

          onNodeError: async (nodeId, error) => {
            applyNodePatch(nodeId, {
              isProcessing: false,
              error,
            });

            nodeResults.set(nodeId, { status: "FAILED", error });

            const started = nodeStartedAt.get(nodeId);
            const node = nodes.find((n) => n.id === nodeId);
            const inputsUsed = node ? getNodeInputsSnapshot(node) : {};

            if (!nodeRunIds.has(nodeId)) {
              if (!nodeStartedAt.has(nodeId)) {
                nodeStartedAt.set(nodeId, Date.now());
              }

              await createNodeRun(nodeId, "FAILED", {
                finishedAt: new Date().toISOString(),
                durationMs: started ? Date.now() - started : 0,
                inputsUsed,
                errorMessage: error,
              });
            } else {
              await updateNodeRun(nodeId, {
                status: "FAILED",
                finishedAt: new Date().toISOString(),
                durationMs: started ? Date.now() - started : 0,
                inputsUsed,
                errorMessage: error,
              });
            }
          },

          onNodeSkipped: async (nodeId, reason) => {
            applyNodePatch(nodeId, {
              isProcessing: false,
              error: reason,
            });

            nodeResults.set(nodeId, { status: "SKIPPED", error: reason });

            const started = nodeStartedAt.get(nodeId);
            const node = nodes.find((n) => n.id === nodeId);
            const inputsUsed = node ? getNodeInputsSnapshot(node) : {};

            if (!nodeRunIds.has(nodeId)) {
              if (!nodeStartedAt.has(nodeId)) {
                nodeStartedAt.set(nodeId, Date.now());
              }

              await createNodeRun(nodeId, "SKIPPED", {
                finishedAt: new Date().toISOString(),
                durationMs: started ? Date.now() - started : 0,
                inputsUsed,
                errorMessage: reason,
              });
            } else {
              await updateNodeRun(nodeId, {
                status: "SKIPPED",
                finishedAt: new Date().toISOString(),
                durationMs: started ? Date.now() - started : 0,
                inputsUsed,
                errorMessage: reason,
              });
            }
          },
        });

        const statuses = Array.from(nodeResults.values()).map((r) => r.status);

        const hasFailed = statuses.includes("FAILED");
        const hasSkipped = statuses.includes("SKIPPED");
        const hasSuccess = statuses.includes("SUCCESS");

        const finalStatus: WorkflowRunStatus =
          hasFailed && hasSuccess
            ? "PARTIAL"
            : hasFailed || hasSkipped
            ? "FAILED"
            : "SUCCESS";

        await finalizeWorkflowRun(finalStatus);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Workflow execution failed.";
        await finalizeWorkflowRun("FAILED", message);
        throw error;
      }
    },
    [
      effectiveWorkflowId,
      nodes,
      edges,
      isSignedIn,
      applyNodePatch,
      executeLocalOnly,
      setCurrentWorkflowId,
      bumpHistoryRefreshKey,
    ]
  );

  const runNode = useCallback(
    async (nodeId: string, force = false) => {
      await execute({ type: "single", nodeId, force });
    },
    [execute]
  );

  const runSelected = useCallback(
    async (force = false) => {
      const selectedNodeIds = nodes
        .filter((node) => node.selected)
        .map((node) => node.id);

      if (selectedNodeIds.length === 0) return;

      await execute({ type: "selected", nodeIds: selectedNodeIds, force });
    },
    [nodes, execute]
  );

  const runAll = useCallback(
    async (force = false) => {
      if (nodes.length === 0) return;
      await execute({ type: "all", force });
    },
    [nodes, execute]
  );

  return {
    runNode,
    runSelected,
    runAll,
  };
}
