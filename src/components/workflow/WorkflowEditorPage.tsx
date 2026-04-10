"use client";

import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useAuth } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import WorkflowCanvas from "@/components/workflow/canvas/WorkFlowCanvas";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import { hydrateWorkflowDocument } from "@/lib/workflow/serialization";
import { getWorkflowTemplateById } from "@/lib/workflow/templates";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";
import {
  WorkflowNodeType,
  type WorkflowNode,
  type WorkflowNodeData,
} from "@/types/workflow";

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
  templateId?: string;
};

export default function WorkflowEditorPage({
  requestedWorkflowId,
  startBlank = false,
  templateId,
}: WorkflowEditorPageProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const currentWorkflowId = useWorkflowEditorStore(
    (state) => state.currentWorkflowId
  );
  const currentNodesCount = useWorkflowEditorStore((state) => state.nodes.length);
  const currentEdgesCount = useWorkflowEditorStore((state) => state.edges.length);
  const hasHydratedStore = useWorkflowEditorStore((state) => state.hasHydrated);
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
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isHydratingWorkflow, setIsHydratingWorkflow] = useState(true);

  const shouldStartBlank = startBlank;

  const handleWorkflowSaved = (workflowId: string) => {
    setCurrentWorkflowId(workflowId);

    if (requestedWorkflowId !== workflowId || shouldStartBlank) {
      router.replace(`/nodes/${workflowId}`);
    }
  };

  const fullPageLoadingClass = isDark
    ? "flex h-dvh w-screen items-center justify-center bg-black text-zinc-400"
    : "flex h-dvh w-screen items-center justify-center bg-zinc-100 text-zinc-500";
  const canvasLoadingClass = isDark
    ? "flex h-full min-h-0 w-full items-center justify-center bg-black text-zinc-400"
    : "flex h-full min-h-0 w-full items-center justify-center bg-zinc-100 text-zinc-500";

  const absolutizeAssetUrl = (value: string) => {
    if (!value) return value;

    try {
      return new URL(value, window.location.origin).toString();
    } catch {
      return value;
    }
  };

  const absolutizeTemplateNodes = (nodes: WorkflowNode[]): WorkflowNode[] =>
    nodes.map((node) => {
      const data = { ...(node.data as WorkflowNodeData) } as WorkflowNodeData;

      if (node.type === WorkflowNodeType.UPLOAD_IMAGE) {
        return {
          ...node,
          data: {
            ...data,
            imageUrl: absolutizeAssetUrl(String((data as any).imageUrl ?? "")),
          },
        };
      }

      if (node.type === WorkflowNodeType.UPLOAD_VIDEO) {
        return {
          ...node,
          data: {
            ...data,
            videoUrl: absolutizeAssetUrl(String((data as any).videoUrl ?? "")),
          },
        };
      }

      if (node.type === WorkflowNodeType.CROP_IMAGE) {
        return {
          ...node,
          data: {
            ...data,
            croppedImageUrl: absolutizeAssetUrl(
              String((data as any).croppedImageUrl ?? "")
            ),
          },
        };
      }

      if (node.type === WorkflowNodeType.EXTRACT_FRAME) {
        return {
          ...node,
          data: {
            ...data,
            extractedFrameUrl: absolutizeAssetUrl(
              String((data as any).extractedFrameUrl ?? "")
            ),
          },
        };
      }

      return node;
    });

  useEffect(() => {
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !hasHydratedStore) return;

    const loadWorkflow = async () => {
      const hasCurrentWorkflowContent =
        currentNodesCount > 0 || currentEdgesCount > 0;

      if (
        requestedWorkflowId &&
        currentWorkflowId === requestedWorkflowId &&
        hasCurrentWorkflowContent
      ) {
        setIsHydratingWorkflow(false);
        return;
      }

      if (!isSignedIn) {
        resetWorkflow();
        setIsHydratingWorkflow(false);
        return;
      }

      try {
        setIsHydratingWorkflow(true);

        if (shouldStartBlank) {
          const template = getWorkflowTemplateById(templateId);

          if (template) {
            const hydratedTemplate = hydrateWorkflowDocument({
              nodes: template.nodes,
              edges: template.edges,
            });
            const preparedTemplateNodes = absolutizeTemplateNodes(
              hydratedTemplate.nodes
            );

            replaceWorkflow({
              nodes: preparedTemplateNodes,
              edges: hydratedTemplate.edges,
              workflowName: template.title,
            });
            setCurrentWorkflowId(undefined);
            return;
          }

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

        const hydratedWorkflow = hydrateWorkflowDocument({
          nodes: workflowToLoad.nodes,
          edges: workflowToLoad.edges,
        });

        replaceWorkflow({
          nodes: hydratedWorkflow.nodes,
          edges: hydratedWorkflow.edges,
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
    hasHydratedStore,
    isLoaded,
    isSignedIn,
    replaceWorkflow,
    currentEdgesCount,
    currentNodesCount,
    currentWorkflowId,
    requestedWorkflowId,
    resetWorkflow,
    setCurrentWorkflowName,
    templateId,
    shouldStartBlank,
  ]);

  if (!isThemeReady) {
    return (
      <ReactFlowProvider>
        <div className="h-dvh w-screen bg-background" />
      </ReactFlowProvider>
    );
  }

  if (!hasHydratedStore) {
    return (
      <ReactFlowProvider>
        <div className={fullPageLoadingClass}>
          <LoaderCircle size={18} className="animate-spin" />
        </div>
      </ReactFlowProvider>
    );
  }

  if (isHydratingWorkflow) {
    return (
      <ReactFlowProvider>
        <div className={fullPageLoadingClass}>
          <LoaderCircle size={18} className="animate-spin" />
        </div>
      </ReactFlowProvider>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-dvh w-screen flex-col overflow-hidden bg-background md:flex-row">
        <div
          className={`sticky top-0 z-50 flex h-[64px] w-full shrink-0 touch-pan-y items-center px-4 md:hidden ${
            isDark ? "bg-black" : "border-b border-black/8 bg-white"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen((current) => !current)}
            className={`flex h-7 w-7 items-center justify-center rounded-md bg-transparent transition ${
              isDark
                ? "text-zinc-400 hover:bg-zinc-800/90 hover:text-zinc-300"
                : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
            }`}
            aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <CollapseSidebarIcon collapsed={!isMobileSidebarOpen} />
          </button>
        </div>

        <div
          className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
            isMobileSidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close sidebar overlay"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-[255.5px] transition-transform duration-300 ease-out ${
              isDark
                ? "bg-black shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                : "bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
            } ${
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="sticky top-0 h-full">
              <LeftSideBar collapsed={false} />
            </div>
          </div>
        </div>

        {isRightSidebarOpen ? (
          <div className="fixed inset-x-0 bottom-0 top-[124px] z-[45] md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close history overlay"
              onClick={() => setIsRightSidebarOpen(false)}
            />
            <div
              className={`absolute right-0 top-0 h-full w-[280px] max-w-[85vw] rounded-tl-2xl transition-transform duration-300 ease-out ${
                isDark
                  ? "bg-black shadow-[-20px_0_60px_rgba(0,0,0,0.45)]"
                  : "bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.12)]"
              } translate-x-0`}
            >
              <div className="sticky top-0 h-full">
                <RightSideBar
                  workflowId={
                    isSignedIn && !isHydratingWorkflow ? currentWorkflowId : undefined
                  }
                  isSignedIn={!!isSignedIn && !isHydratingWorkflow}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div
          className={`relative hidden transition-all duration-300 ease-in-out md:block ${
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
              onWorkflowSaved={handleWorkflowSaved}
              onOpenHistory={() => setIsRightSidebarOpen((prev) => !prev)}
              isHistoryOpen={isRightSidebarOpen}
              isLeftSidebarCollapsed={isLeftSidebarCollapsed}
            />
          )}

          {isHydratingWorkflow ? (
            <div className={`h-full ${canvasLoadingClass}`}>
              <LoaderCircle size={18} className="animate-spin" />
            </div>
          ) : null}
        </div>

        <div
          className={`hidden overflow-hidden transition-all duration-300 ease-in-out md:block ${
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
