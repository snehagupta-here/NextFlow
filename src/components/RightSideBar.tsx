"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

type NodeRun = {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeLabel?: string | null;
  status: "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";
  durationMs?: number | null;
  inputsUsed?: any;
  outputsGenerated?: any;
  errorMessage?: string | null;
};

type WorkflowRun = {
  id: string;
  scope: "FULL" | "SELECTED" | "SINGLE";
  status: "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL";
  startedAt: string;
  durationMs?: number | null;
  targetNodeIds?: unknown[] | null;
  nodeRuns: NodeRun[];
};

type RightSideBarProps = {
  workflowId?: string;
  isSignedIn?: boolean;
};

function badgeClass(
  status: WorkflowRun["status"] | NodeRun["status"],
  isDark: boolean
) {
  if (status === "SUCCESS") {
    return isDark
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-emerald-100 text-emerald-700";
  }

  if (status === "FAILED") {
    return isDark
      ? "bg-red-500/15 text-red-300"
      : "bg-red-100 text-red-700";
  }

  if (status === "PARTIAL" || status === "RUNNING" || status === "QUEUED") {
    return isDark
      ? "bg-yellow-500/15 text-yellow-300"
      : "bg-amber-100 text-amber-700";
  }

  return isDark
    ? "bg-zinc-500/15 text-zinc-300"
    : "bg-zinc-100 text-zinc-700";
}

function formatScope(scope: WorkflowRun["scope"], count: number) {
  if (scope === "FULL") return "Full Workflow";
  if (scope === "SINGLE") return "Single Node";
  return `${count} nodes selected`;
}

function getStatusPriority(status: string) {
  switch (status) {
    case "SUCCESS":
    case "FAILED":
    case "SKIPPED":
      return 3;
    case "RUNNING":
      return 2;
    case "QUEUED":
      return 1;
    default:
      return 0;
  }
}

function dedupeNodeRuns(nodeRuns: any[]) {
  const map = new Map<string, any>();

  for (const nodeRun of nodeRuns) {
    const existing = map.get(nodeRun.nodeId);

    if (!existing) {
      map.set(nodeRun.nodeId, nodeRun);
      continue;
    }

    const existingPriority = getStatusPriority(existing.status);
    const currentPriority = getStatusPriority(nodeRun.status);

    if (currentPriority > existingPriority) {
      map.set(nodeRun.nodeId, nodeRun);
      continue;
    }

    if (
      currentPriority === existingPriority &&
      new Date(nodeRun.startedAt || 0).getTime() >
        new Date(existing.startedAt || 0).getTime()
    ) {
      map.set(nodeRun.nodeId, nodeRun);
    }
  }

  return Array.from(map.values());
}

function formatDuration(durationMs?: number | null) {
  if (!durationMs) return "—";
  return `${(durationMs / 1000).toFixed(1)}s`;
}

const RightSideBar = ({
  workflowId,
  isSignedIn = false,
}: RightSideBarProps) => {
  const { isDark } = useWorkflowTheme();
  const historyRefreshKey = useWorkflowEditorStore(
    (state) => state.historyRefreshKey
  );

  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRuns = useCallback(async () => {
    if (!isSignedIn || !workflowId) {
      setRuns([]);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/workflows/${workflowId}/runs`);

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load workflow runs.");
      }

      setRuns(data?.runs ?? []);
    } catch (error) {
      console.error(error);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, workflowId]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns, historyRefreshKey]);

  const runCount = useMemo(() => runs.length, [runs]);

  const sidebarClass = isDark
    ? "h-full overflow-y-auto bg-black px-4 py-4 text-white"
    : "h-full overflow-y-auto bg-white px-4 py-4 text-zinc-900";
    
  const mutedTextClass = isDark ? "text-zinc-50" : "text-zinc-500";
  const secondaryTextClass = isDark ? "text-zinc-400" : "text-zinc-600";

  const runCardClass = isDark
    ? "rounded-2xl border border-white/10 bg-white/[0.03]"
    : "rounded-2xl border border-zinc-200 bg-zinc-50/80";

  const expandedSectionClass = isDark
    ? "border-t border-white/10 px-4 py-3"
    : "border-t border-zinc-200 px-4 py-3";

  const nodeCardClass = isDark
    ? "rounded-xl border border-white/10 bg-white/[0.02] p-3"
    : "rounded-xl border border-zinc-200 bg-white p-3";

  const codeBlockClass = isDark
    ? "overflow-x-auto rounded-lg bg-black/40 p-2 text-[11px] text-zinc-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    : "overflow-x-auto rounded-lg bg-zinc-100 p-2 text-[11px] text-zinc-700 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

  const emptyStateClass = isDark
    ? "rounded-2xl border border-dashed border-white/10 p-4 text-xs text-zinc-500"
    : "rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500";

  return (
    <aside className={sidebarClass}>
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold">Workflow History</h2>

        {!isSignedIn ? (
          <p className={`mt-1 text-xs ${mutedTextClass}`}>
            Sign in to view workflow history.
          </p>
        ) : !workflowId ? (
          <p className={`mt-1 text-[9px] ${mutedTextClass}`}>
            Save a workflow to start tracking run history.
          </p>
        ) : (
          <p className={`mt-1 text-xs ${mutedTextClass}`}>
            {loading
              ? "Loading..."
              : `${runCount} run${runCount === 1 ? "" : "s"}`}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {runs.map((run, index) => {
          const expanded = expandedRunId === run.id;
          const selectedCount = Array.isArray(run.targetNodeIds)
            ? run.targetNodeIds.length
            : dedupeNodeRuns(run.nodeRuns).length;

          return (
            <div key={run.id} className={runCardClass}>
              <button
                type="button"
                onClick={() =>
                  setExpandedRunId((prev) => (prev === run.id ? null : run.id))
                }
                className="w-full px-4 py-3 text-left"
              >
                {workflowId ? (
                  <p className={`mt-1 break-all text-[11px] ${mutedTextClass}`}>
                    Workflow ID: {workflowId}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-red-500">
                    No workflow selected
                  </p>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium">
                      Run #{runs.length - index}
                    </div>

                    <div className={`mt-1 text-[11px] ${mutedTextClass}`}>
                      {new Date(run.startedAt).toLocaleString()}
                    </div>

                    <div className={`mt-1 text-[11px] ${secondaryTextClass}`}>
                      {formatScope(run.scope, selectedCount)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-medium ${badgeClass(
                        run.status,
                        isDark
                      )}`}
                    >
                      {run.status.toLowerCase()}
                    </span>

                    <span className={`text-[11px] ${mutedTextClass}`}>
                      {formatDuration(run.durationMs)}
                    </span>
                  </div>
                </div>
              </button>

              {expanded ? (
                <div className={expandedSectionClass}>
                  <div className="space-y-3">
                    {dedupeNodeRuns(run.nodeRuns).map((nodeRun) => (
                      <div key={nodeRun.id} className={nodeCardClass}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[12px] font-medium">
                              {nodeRun.nodeLabel || nodeRun.nodeType} (
                              {nodeRun.nodeId})
                            </div>

                            <div className={`mt-1 text-[11px] ${mutedTextClass}`}>
                              {formatDuration(nodeRun.durationMs)}
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-medium ${badgeClass(
                              nodeRun.status,
                              isDark
                            )}`}
                          >
                            {nodeRun.status.toLowerCase()}
                          </span>
                        </div>

                        {nodeRun.inputsUsed ? (
                          <div className="mt-3">
                            <div className={`mb-1 text-[11px] ${secondaryTextClass}`}>
                              Inputs
                            </div>
                            <pre className={codeBlockClass}>
                              {JSON.stringify(nodeRun.inputsUsed, null, 2)}
                            </pre>
                          </div>
                        ) : null}

                        {nodeRun.outputsGenerated ? (
                          <div className="mt-3">
                            <div className={`mb-1 text-[11px] ${secondaryTextClass}`}>
                              Outputs
                            </div>
                            <pre className={codeBlockClass}>
                              {JSON.stringify(
                                nodeRun.outputsGenerated,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        ) : null}

                        {nodeRun.errorMessage ? (
                          <div className="mt-3 text-[11px] text-red-500">
                            Error: {nodeRun.errorMessage}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {!loading && workflowId && runs.length === 0 ? (
          <div className={emptyStateClass}>No workflow history yet.</div>
        ) : null}
      </div>
    </aside>
  );
};

export default RightSideBar;
