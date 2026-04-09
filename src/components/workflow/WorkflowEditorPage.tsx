"use client";

import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useAuth } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import WorkflowCanvas from "@/components/workflow/canvas/WorkFlowCanvas";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const CollapseSidebarIcon = (_: { collapsed: boolean }) => {
  return (
    <svg
      width="18"
      height="18"
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
        d="M9 6V18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

type WorkflowEditorPageProps = {
  requestedWorkflowId?: string;
  startBlank?: boolean;
};

export default function WorkflowEditorPage({
  requestedWorkflowId,
  startBlank = false,
}: WorkflowEditorPageProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const currentWorkflowId = useWorkflowEditorStore(
    (state) => state.currentWorkflowId
  );
  const setCurrentWorkflowId = useWorkflowEditorStore(
    (state) => state.setCurrentWorkflowId
  );
  const setCurrentWorkflowName = useWorkflowEditorStore(
    (state) => state.setCurrentWorkflowName
  );
  const replaceWorkflow = useWorkflowEditorStore((state) => state.replaceWorkflow);
  const resetWorkflow = useWorkflowEditorStore((state) => state.resetWorkflow);

  const { isDark } = useWorkflowTheme();
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isHydratingWorkflow, setIsHydratingWorkflow] = useState(true);

  const shouldStartBlank = startBlank;

  const canvasLoadingClass = isDark
    ? "flex h-full w-full items-center justify-center bg-black text-zinc-400"
    : "flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-500";
  const loadingPanelClass = isDark
    ? "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3"
    : "flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 px-5 py-3";

  useEffect(() => {
    setIsThemeReady(true);
  }, []);

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

        if (shouldStartBlank) {
          resetWorkflow();
          setCurrentWorkflowName("Untitled");
          return;
        }

        const endpoint = requestedWorkflowId
          ? `/api/workflows/${requestedWorkflowId}`
          : "/api/workflows?limit=1";

        const workflowsRes = await fetch(endpoint, {
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

        const workflowToLoad = requestedWorkflowId
          ? workflowsData
          : workflowsData?.workflows?.[0];

        if (!workflowToLoad) {
          resetWorkflow();
          return;
        }

        replaceWorkflow({
          nodes: workflowToLoad.nodes ?? [],
          edges: workflowToLoad.edges ?? [],
          workflowId: workflowToLoad.id,
          workflowName: workflowToLoad.name,
        });
      } catch (error) {
        console.error(error);
        resetWorkflow();
      } finally {
        setIsHydratingWorkflow(false);
      }
    };

    loadWorkflow();
  }, [
    isLoaded,
    isSignedIn,
    replaceWorkflow,
    requestedWorkflowId,
    resetWorkflow,
    setCurrentWorkflowName,
    shouldStartBlank,
  ]);

  if (!isThemeReady) {
    return (
      <ReactFlowProvider>
        <div className="h-[100vh] w-[100vw] bg-background" />
      </ReactFlowProvider>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-[100vh] w-[100vw] overflow-hidden bg-background">
        <div
          className={`relative transition-all duration-300 ease-in-out ${
            isLeftSidebarCollapsed
              ? "w-[51px] min-w-[51px]"
              : "w-[255.5px] min-w-[255.5px]"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsLeftSidebarCollapsed((prev) => !prev)}
            className={`absolute top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg transition ${
              isLeftSidebarCollapsed ? "left-1/2 -translate-x-1/2" : "left-3"
            } ${
              isDark
                ? "bg-transparent text-zinc-400 hover:bg-zinc-800/90 hover:text-zinc-300"
                : "bg-transparent text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
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
              onOpenHistory={() => setIsRightSidebarOpen((prev) => !prev)}
              isHistoryOpen={isRightSidebarOpen}
              isLeftSidebarCollapsed={isLeftSidebarCollapsed}
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

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isRightSidebarOpen
              ? "w-[320px] min-w-[320px]"
              : "w-0 min-w-0"
          }`}
        >
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
}
