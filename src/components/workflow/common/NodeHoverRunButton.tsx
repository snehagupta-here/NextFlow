"use client";

import React, { useMemo } from "react";
import { Play } from "lucide-react";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";

type NodeHoverRunButtonProps = {
  nodeId: string;
  onRun?: () => void;
  onRunWorkflow?: () => void;
  disabled?: boolean;
  isRunning?: boolean;
  forceRunTextWhite?: boolean;
};

const NodeHoverRunButton = ({
  nodeId,
  onRun,
  onRunWorkflow,
  disabled = false,
  isRunning = false,
  forceRunTextWhite = false,
}: NodeHoverRunButtonProps) => {
  const { isDark } = useWorkflowTheme();
  const nodes = useWorkflowEditorStore((state) => state.nodes);
  const edges = useWorkflowEditorStore((state) => state.edges);
  const selectedNodeCount = useMemo(
    () => nodes.filter((node) => node.selected).length,
    [nodes]
  );

  const showWorkflowButton = useMemo(() => {
    if (!onRunWorkflow) return false;

    const connectedNodeIds = new Set<string>();
    const stack = [nodeId];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current)) continue;

      visited.add(current);
      connectedNodeIds.add(current);

      for (const edge of edges) {
        if (edge.source === current && !visited.has(edge.target)) {
          stack.push(edge.target);
        }

        if (edge.target === current && !visited.has(edge.source)) {
          stack.push(edge.source);
        }
      }
    }

    if (connectedNodeIds.size < 2) return false;

    const connectedNodes = nodes.filter((node) => connectedNodeIds.has(node.id));
    if (connectedNodes.length < 2) return false;

    const connectedIncomingTargets = new Set(
      edges
        .filter(
          (edge) =>
            connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)
        )
        .map((edge) => edge.target)
    );

    return !connectedIncomingTargets.has(nodeId);
  }, [edges, nodeId, nodes, onRunWorkflow]);

  const buttonClass = isDark
    ? "pointer-events-auto inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-[15px] border border-white/8 bg-black/96 px-5 text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(0,0,0,0.4)] backdrop-blur transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-45"
    : "pointer-events-auto inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-[15px] border border-black/10 bg-white/96 px-5 text-[15px] font-medium text-zinc-900 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45";

  const iconClass = isDark ? "text-white" : "text-black";
  const runTextClass = forceRunTextWhite ? "text-white" : undefined;
  const workflowButtonClass =
    "pointer-events-auto inline-flex h-9 cursor-pointer items-center gap-2 rounded-[12px] border px-3 text-[13px] font-medium text-white shadow-[0_14px_30px_rgba(16,96,255,0.28)] transition hover:brightness-[0.96]";

  if (selectedNodeCount > 1) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-0 -top-1 z-30 -translate-x-[104%] opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <div className="flex flex-col items-start gap-2">
        {showWorkflowButton ? (
          <button
            type="button"
            onClick={onRunWorkflow}
            className={workflowButtonClass}
            style={{
              backgroundColor: "oklch(0.579 0.2497 257.07)",
              borderColor: "oklch(0.579 0.2497 257.07)",
            }}
            aria-label="Run workflow"
          >
            <Play size={13} fill="currentColor" className="text-white" />
            <span>Run workflow</span>
          </button>
        ) : null}

        {onRun ? (
          <button
            type="button"
            onClick={onRun}
            disabled={disabled}
            className={buttonClass}
            aria-label={isRunning ? "Node running" : "Run node"}
          >
            <Play size={15} fill="currentColor" className={iconClass} />
            <span className={runTextClass}>{isRunning ? "Running" : "Run node"}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default NodeHoverRunButton;
