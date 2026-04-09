"use client";

import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useAuth } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import WorkflowCanvas from "@/components/workflow/canvas/WorkFlowCanvas";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import { hydrateWorkflowDocument } from "@/lib/workflow/serialization";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const CollapseSidebarIcon = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect
        x="3.5"
        y="4"
        width="17"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d={collapsed ? "M9 6V18" : "M15 6V18"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

const Dashboard = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const currentWorkflowId = useWorkflowEditorStore(
    (state) => state.currentWorkflowId
  );
  const setCurrentWorkflowId = useWorkflowEditorStore(
    (state) => state.setCurrentWorkflowId
  );
  const replaceWorkflow = useWorkflowEditorStore((state) => state.replaceWorkflow);
  const resetWorkflow = useWorkflowEditorStore((state) => state.resetWorkflow);

  const { isDark } = useWorkflowTheme();
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isHydratingWorkflow, setIsHydratingWorkflow] = useState(true);

  const sidebarBorderClass = isDark ? "border-white/10" : "border-zinc-200";
  const canvasLoadingClass = isDark
    ? "flex h-full w-full items-center justify-center bg-black text-zinc-400"
    : "flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-500";
  const loadingPanelClass = isDark
    ? "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3"
    : "flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 px-5 py-3";

  useEffect(() => {
    if (!isLoaded) return;

    const loadWorkflow = async () => {
      if (!isSignedIn) {
        resetWorkflow();
        setIsHydratingWorkflow(false);
        return;
      }

      try {
        setIsHydratingWorkflow(true);

        const workflowsRes = await fetch("/api/workflows?limit=1", {
          cache: "no-store",
        });

        let workflowsData: any = null;
        try {
          workflowsData = await workflowsRes.json();
        } catch {
          workflowsData = null;
        }

        if (!workflowsRes.ok) {
          throw new Error(
            workflowsData?.error || "Failed to load workflows for this user."
          );
        }

        const latestWorkflow = workflowsData?.workflows?.[0];

        if (!latestWorkflow) {
          resetWorkflow();
          return;
        }

        const hydratedWorkflow = hydrateWorkflowDocument({
          nodes: latestWorkflow.nodes,
          edges: latestWorkflow.edges,
        });

        replaceWorkflow({
          nodes: hydratedWorkflow.nodes,
          edges: hydratedWorkflow.edges,
          workflowId: latestWorkflow.id,
        });
      } catch (error) {
        console.error(error);
        resetWorkflow();
      } finally {
        setIsHydratingWorkflow(false);
      }
    };

    loadWorkflow();
  }, [isLoaded, isSignedIn, replaceWorkflow, resetWorkflow]);

  return (
    <ReactFlowProvider>
      <div className="flex h-[100vh] w-[100vw] overflow-hidden bg-background">
        <div
          className={`relative border-r transition-all duration-300 ease-in-out ${
            isLeftSidebarCollapsed
              ? "w-[72px] min-w-[72px]"
              : "w-[320px] min-w-[320px]"
          } ${sidebarBorderClass}`}
        >
          <button
            type="button"
            onClick={() => setIsLeftSidebarCollapsed((prev) => !prev)}
            className={`absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-xl border shadow-lg transition ${
              isDark
                ? "border-white/10 bg-black text-zinc-300 hover:bg-zinc-900"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
            aria-label={
              isLeftSidebarCollapsed
                ? "Expand left sidebar"
                : "Collapse left sidebar"
            }
            title={
              isLeftSidebarCollapsed
                ? "Expand left sidebar"
                : "Collapse left sidebar"
            }
          >
            <CollapseSidebarIcon collapsed={isLeftSidebarCollapsed} />
          </button>

          <div className="h-full">
            <LeftSideBar collapsed={isLeftSidebarCollapsed} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {isHydratingWorkflow ? null : (
            <WorkflowCanvas
              workflowId={isSignedIn ? currentWorkflowId : undefined}
              onWorkflowSaved={setCurrentWorkflowId}
            />
          )}

          {isHydratingWorkflow ? (
            <div className={canvasLoadingClass}>
              <div className={loadingPanelClass}>
                <LoaderCircle size={18} className="animate-spin" />
                <span className="text-sm font-medium">Loading workflow...</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className={`w-[320px] min-w-[320px] border-l ${sidebarBorderClass}`}>
          <RightSideBar
            workflowId={
              isSignedIn && !isHydratingWorkflow ? currentWorkflowId : undefined
            }
            isSignedIn={!!isSignedIn && !isHydratingWorkflow}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default Dashboard;
