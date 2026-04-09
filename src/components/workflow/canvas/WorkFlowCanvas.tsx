"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ColorMode,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  SelectionMode,
  useReactFlow,
} from "@xyflow/react";
import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  ChevronDown,
  History,
  Moon,
  Redo2,
  Undo2,
  X,
} from "lucide-react";
import "@xyflow/react/dist/style.css";
import { usePathname, useRouter } from "next/navigation";

import { workflowNodeTypes } from "@/lib/workflow/node-registry";
import { getFlowTheme } from "@/lib/workflow/flow-theme";
import {
  createWorkflowExportDocument,
  parseWorkflowImportDocument,
} from "@/lib/workflow/serialization";
import { useWorkflowActions, useWorkflowGraph } from "@/hooks/workflow/useWorkFlowEditor";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";
import { useWorkflowValidation } from "@/hooks/workflow/useWorkFlowValidation";
import { useWorkflowKeyboardDelete } from "@/hooks/workflow/useWorkFlowKeyboardDelete";
import { useWorkflowKeyboardHistory } from "@/hooks/workflow/useWorkFlowKeyboardHistory";
import { useWorkflowHistory } from "@/hooks/workflow/useWorkFlowHistory";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import { useWorkflowEditorStore } from "@/stores/workflow-editor.store";
import { WorkflowNodeType } from "@/types/workflow";
import FlowControls from "./FlowControls";
import FlowStyles from "./FlowStyles";
import ImportExportControls from "./ImportExportControls";

const WORKFLOW_NODE_DRAG_TYPE = "application/x-workflow-node-type";

type CanvasMessage =
  | { type: "success"; text: string }
  | { type: "import-error"; text: string };

function isWorkflowNodeType(value: string): value is WorkflowNodeType {
  return Object.values(WorkflowNodeType).includes(value as WorkflowNodeType);
}

function createImportedId(prefix: string, originalId: string) {
  return `${prefix}-${originalId}`;
}

function getImportedEdgePresentation(isDark: boolean) {
  const stroke = isDark ? "#8b5cf6" : "#7c3aed";

  return {
    animated: true,
    style: {
      stroke,
      strokeWidth: 2.2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: stroke,
    },
  };
}

type WorkflowCanvasProps = {
  workflowId?: string;
  onWorkflowSaved?: (workflowId: string) => void;
  onOpenHistory?: () => void;
  isHistoryOpen?: boolean;
  isLeftSidebarCollapsed?: boolean;
};

const WorkflowCanvas = ({
  workflowId,
  onWorkflowSaved,
  onOpenHistory,
  isHistoryOpen = false,
  isLeftSidebarCollapsed = false,
}: WorkflowCanvasProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useWorkflowTheme();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useWorkflowGraph();
  const { addNode } = useWorkflowActions();
  const replaceWorkflow = useWorkflowEditorStore((state) => state.replaceWorkflow);
  const currentWorkflowId = useWorkflowEditorStore(
    (state) => state.currentWorkflowId
  );
  const currentWorkflowName = useWorkflowEditorStore(
    (state) => state.currentWorkflowName
  );
  const setCurrentWorkflowId = useWorkflowEditorStore(
    (state) => state.setCurrentWorkflowId
  );
  const setCurrentWorkflowName = useWorkflowEditorStore(
    (state) => state.setCurrentWorkflowName
  );
  const { isValidConnection } = useWorkflowValidation();
  const { undo, redo, canUndo, canRedo } = useWorkflowHistory();
  const { runSelected, runAll } = useWorkflowExecution(workflowId);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [isCanvasLocked, setIsCanvasLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [canvasMessage, setCanvasMessage] = useState<CanvasMessage | null>(null);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [showUndoTooltip, setShowUndoTooltip] = useState(false);
  const [showRedoTooltip, setShowRedoTooltip] = useState(false);
  const hasInitializedAutosave = useRef(false);
  const isCreatingDraftWorkflow = useRef(false);
  const lastSavedSnapshot = useRef("");
  const historyMenuRef = useRef<HTMLDivElement | null>(null);

  useWorkflowKeyboardDelete();
  useWorkflowKeyboardHistory();

  const ui = useMemo(() => getFlowTheme(theme), [theme]);

  const historyButtonClass = `inline-flex h-9 w-9 items-center justify-center rounded-[12px] border transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-[#1c1c1c] text-white hover:bg-[#2a2a2a]"
      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
  }`;

  const topBarButtonClass = `inline-flex h-10 items-center gap-2 rounded-[12px] px-2 text-sm font-medium transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-[#1c1c1c] text-white hover:bg-[#2a2a2a]"
      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
  }`;
  const authButtonClass = `inline-flex h-10 items-center justify-center rounded-[12px] border px-4 text-sm font-medium transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-[#1c1c1c] text-white hover:bg-[#2a2a2a]"
      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
  }`;

  const segmentedHistoryClass = isDark
    ? "overflow-hidden rounded-[11px] border border-[0.5px] border-white/10 bg-[#1c1c1c] shadow-xl backdrop-blur"
    : "overflow-hidden rounded-[11px] border border-zinc-200 bg-[#f3f3f3] shadow-[0_10px_30px_rgba(0,0,0,0.10)]";

  const tooltipBubbleClass = isDark
    ? "relative whitespace-nowrap rounded-lg bg-white px-3 py-1 text-[11px] font-medium text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.28)] bg-[#1c1c1c] hover:bg-[#2a2a2a]"
    : "relative whitespace-nowrap rounded-lg bg-black px-3 py-1 text-[11px] font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)]";

  const workflowSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: currentWorkflowName,
        nodes,
        edges,
      }),
    [currentWorkflowName, nodes, edges]
  );
  const effectiveWorkflowId = workflowId ?? currentWorkflowId;
  const leftSidebarCenterOffset = isLeftSidebarCollapsed ? 0 : 102.25;
  const rightSidebarCenterOffset = isHistoryOpen ? -160 : 0;
  const addNodeCenterOffset =
    leftSidebarCenterOffset + rightSidebarCenterOffset;

  const showSuccessMessage = (text: string) => {
    setCanvasMessage({ type: "success", text });
  };

  const showImportErrorMessage = (text: string) => {
    setCanvasMessage({ type: "import-error", text });
  };

  const handleOpenSignIn = () => {
    router.push(
      `/sign-in?redirect_url=${encodeURIComponent(pathname || "/nodes")}`
    );
  };

  const handleOpenSignUp = () => {
    router.push(
      `/sign-up?redirect_url=${encodeURIComponent(pathname || "/nodes/new")}`
    );
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const draggedType =
      event.dataTransfer.getData(WORKFLOW_NODE_DRAG_TYPE) ||
      event.dataTransfer.getData("text/plain");
    if (!isWorkflowNodeType(draggedType)) return;

    event.preventDefault();

    if (!isSignedIn) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNode({
      type: draggedType,
      position,
    });
  };

  const handleSaveWorkflow = async () => {
    try {
      setIsSaving(true);
      setCanvasMessage(null);

      const payload = {
        name: currentWorkflowName || "Untitled",
        nodes,
        edges,
      };

      let res = await fetch(
        effectiveWorkflowId
          ? `/api/workflows/${effectiveWorkflowId}`
          : "/api/workflows",
        {
          method: effectiveWorkflowId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (effectiveWorkflowId && res.status === 404) {
        res = await fetch("/api/workflows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        try {
          data = await res.json();
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save workflow.");
      }

      if (data?.id && onWorkflowSaved) {
        onWorkflowSaved(data.id);
      }

      if (data?.id) {
        setCurrentWorkflowId(data.id);
      }

      lastSavedSnapshot.current = workflowSnapshot;

      showSuccessMessage("Workflow saved successfully.");
    } catch (error) {
      console.error(error);
      showImportErrorMessage(
        error instanceof Error ? error.message : "Failed to save workflow."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = () => {
    try {
      const documentData = createWorkflowExportDocument(nodes, edges);
      const blob = new Blob([JSON.stringify(documentData, null, 2)], {
        type: "application/json",
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      link.href = objectUrl;
      link.download = `workflow-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      showSuccessMessage("Workflow exported as JSON.");
    } catch (error) {
      showImportErrorMessage(
        error instanceof Error ? error.message : "Failed to export workflow."
      );
    }
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseWorkflowImportDocument(text);
      const importPrefix = `import-${Date.now()}`;
      const importedMinX = Math.min(...imported.nodes.map((node) => node.position.x));
      const importedMinY = Math.min(...imported.nodes.map((node) => node.position.y));
      const existingMaxX =
        nodes.length > 0
          ? Math.max(...nodes.map((node) => node.position.x))
          : 0;
      const existingMinY =
        nodes.length > 0
          ? Math.min(...nodes.map((node) => node.position.y))
          : importedMinY;
      const xOffset =
        nodes.length > 0 ? existingMaxX - importedMinX + 260 : 0;
      const yOffset = nodes.length > 0 ? existingMinY - importedMinY : 0;

      const importedNodes = imported.nodes.map((node) => {
        const nextId = createImportedId(importPrefix, node.id);

        return {
          ...node,
          id: nextId,
          position: {
            x: node.position.x + xOffset,
            y: node.position.y + yOffset,
          },
        };
      });

      const importedEdges = imported.edges.map((edge) => ({
        ...edge,
        id: createImportedId(importPrefix, edge.id),
        source: createImportedId(importPrefix, edge.source),
        target: createImportedId(importPrefix, edge.target),
        ...getImportedEdgePresentation(isDark),
      }));

      const mergedNodes = [...nodes, ...importedNodes];
      const mergedEdges = [...edges, ...importedEdges];

      replaceWorkflow({
        nodes: mergedNodes,
        edges: mergedEdges,
        workflowId,
        workflowName: currentWorkflowName,
      });
      hasInitializedAutosave.current = false;
      lastSavedSnapshot.current = "";
      showSuccessMessage("Workflow imported. Save it to create a new record.");

      requestAnimationFrame(() => {
        void fitView({
          padding: 0.18,
          duration: 300,
          nodes: importedNodes.map((node) => ({ id: node.id })),
        });
      });
    } catch (error) {
      showImportErrorMessage(
        error instanceof Error ? error.message : "Failed to import workflow."
      );
    }
  };

  useEffect(() => {
    if (canvasMessage?.type !== "import-error") return;

    const timeoutId = window.setTimeout(() => {
      setCanvasMessage((current) =>
        current?.type === "import-error" ? null : current
      );
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [canvasMessage]);

  useEffect(() => {
    if (canvasMessage?.type !== "success") return;

    const timeoutId = window.setTimeout(() => {
      setCanvasMessage((current) =>
        current?.type === "success" ? null : current
      );
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [canvasMessage]);

  useEffect(() => {
    if (!isSignedIn) return;

    const hasWorkflowContent = nodes.length > 0 || edges.length > 0;

    if (!hasInitializedAutosave.current) {
      hasInitializedAutosave.current = true;
      lastSavedSnapshot.current =
        effectiveWorkflowId || hasWorkflowContent ? workflowSnapshot : "";
      return;
    }

    if (!effectiveWorkflowId && !hasWorkflowContent) {
      return;
    }

    if (lastSavedSnapshot.current === workflowSnapshot) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        if (!effectiveWorkflowId && isCreatingDraftWorkflow.current) {
          return;
        }

        const payload = {
          name: currentWorkflowName || "Untitled",
          nodes,
          edges,
        };

        const isCreatingNewDraft = !effectiveWorkflowId;

        if (isCreatingNewDraft) {
          isCreatingDraftWorkflow.current = true;
        }

        let res = await fetch(
          effectiveWorkflowId
            ? `/api/workflows/${effectiveWorkflowId}`
            : "/api/workflows",
          {
            method: effectiveWorkflowId ? "PATCH" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (effectiveWorkflowId && res.status === 404) {
          res = await fetch("/api/workflows", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          try {
            data = await res.json();
          } catch {
            data = null;
          }
        }

        if (!res.ok) {
          throw new Error(data?.error || "Failed to autosave workflow.");
        }

        if (data?.id) {
          setCurrentWorkflowId(data.id);
          onWorkflowSaved?.(data.id);
        }

        lastSavedSnapshot.current = workflowSnapshot;
      } catch (error) {
        console.error(error);
      } finally {
        isCreatingDraftWorkflow.current = false;
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [
    effectiveWorkflowId,
    isSignedIn,
    nodes,
    edges,
    currentWorkflowName,
    onWorkflowSaved,
    setCurrentWorkflowId,
    workflowSnapshot,
  ]);

  useEffect(() => {
    if (!isHistoryMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!historyMenuRef.current) return;
      if (historyMenuRef.current.contains(event.target as Node)) return;
      setIsHistoryMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isHistoryMenuOpen]);

  return (
    <div className={ui.canvasClass}>
      {canvasMessage?.type === "success" ? (
        <div className="absolute bottom-5 right-5 z-20 w-full max-w-[360px] px-4">
          <div className="rounded-[16px] border border-emerald-500/20 bg-[#102116] px-4 py-3 text-[13px] font-medium text-emerald-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            {canvasMessage.text}
          </div>
        </div>
      ) : null}

      {canvasMessage?.type === "import-error" ? (
        <div className="absolute bottom-5 right-5 z-30 w-full max-w-[420px] px-4">
          <div className="flex items-center gap-2 rounded-[18px] border border-[#8f1717] bg-[#640a0a] px-4 py-3 text-[#ff6b6b] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <AlertTriangle size={16} className="shrink-0 text-[#ff6b6b]" />
              <div className="min-w-0 text-[13px] font-medium">
                {canvasMessage.text}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCanvasMessage(null)}
              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#ff8f8f] transition hover:bg-[#7a1212]"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={workflowNodeTypes}
        colorMode={theme as ColorMode}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(connection) => onConnect(connection, theme)}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={ui.edgeDefaults}
        fitView
        className={ui.flowClass}
        deleteKeyCode={["Delete", "Backspace"]}
        elementsSelectable
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={["Meta", "Control"]}
        selectionKeyCode={["Shift", "Meta", "Control"]}
        zoomOnScroll={!isCanvasLocked}
        panOnScroll={!isCanvasLocked}
        panOnDrag={isCanvasLocked ? false : [1]}
        zoomOnPinch={!isCanvasLocked}
        zoomOnDoubleClick={!isCanvasLocked}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color={isDark ? "#2f2f2f" : "#71717a"}
          className={ui.flowClass}
        />

        <Panel position="top-left">
          <FlowControls
            isDark={isDark}
            isCanvasLocked={isCanvasLocked}
            isSaving={isSaving}
            workflowName={currentWorkflowName}
            onWorkflowNameChange={setCurrentWorkflowName}
            onRunSelected={() => runSelected(true)}
            onRunAll={() => runAll(true)}
            onSaveWorkflow={handleSaveWorkflow}
            onToggleCanvasLock={() => setIsCanvasLocked((prev) => !prev)}
          >
            {({ closeMenu }) => (
              <ImportExportControls
                isDark={isDark}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
                onRequestClose={closeMenu}
              />
            )}
          </FlowControls>
        </Panel>

        <Panel position="top-right">
          <div className="flex items-center gap-3" ref={historyMenuRef}>
            {isLoaded && !isSignedIn ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenSignIn}
                  className={authButtonClass}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={handleOpenSignUp}
                  className={authButtonClass}
                >
                  Sign up
                </button>
              </>
            ) : null}

            <div className="relative">
              {showThemeTooltip ? (
                <div className="pointer-events-none absolute left-1/2 top-[calc(100%+12px)] z-[999] -translate-x-1/2">
                  <div className={tooltipBubbleClass}>
                    Toggle Theme
                    <div
                      className={`absolute bottom-full left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1 rotate-45 ${
                        isDark ? "bg-white" : "bg-black"
                      }`}
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={toggleTheme}
                className={`${topBarButtonClass} w-10 justify-center px-0`}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                onMouseEnter={() => setShowThemeTooltip(true)}
                onMouseLeave={() => setShowThemeTooltip(false)}
              >
                {isDark ? (
                  <Moon size={16} className="scale-x-[-1] fill-current stroke-current" />
                ) : (
                  <svg
                    width="16"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
                    <path
                      d="M12 2.5V5.5M12 18.5V21.5M21.5 12H18.5M5.5 12H2.5M18.72 5.28L16.6 7.4M7.4 16.6L5.28 18.72M18.72 18.72L16.6 16.6M7.4 7.4L5.28 5.28"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="relative">
              <div className={`flex items-center ${segmentedHistoryClass}`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsHistoryMenuOpen(false);
                    onOpenHistory?.();
                  }}
                  className={`flex h-8 w-10 items-center justify-center transition ${
                    isDark
                      ? "bg-[#1c1c1c] text-white hover:bg-[#2a2a2a]"
                      : "bg-[#f3f3f3] text-zinc-900 hover:bg-zinc-100"
                  }`}
                  aria-label={isHistoryOpen ? "Collapse workflow history" : "Expand workflow history"}
                  title={isHistoryOpen ? "Collapse workflow history" : "Expand workflow history"}
                >
                  <History size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsHistoryMenuOpen((prev) => !prev)}
                  className={`flex h-9 w-7 items-center justify-center transition ${
                    isDark
                      ? "bg-[#1c1c1c] text-white hover:bg-[#2a2a2a]"
                      : "bg-[#f3f3f3] text-zinc-900 hover:bg-zinc-100"
                  }`}
                  aria-label="Toggle history dropdown"
                  title="Toggle history dropdown"
                >
                  <ChevronDown
                    size={14}
                    className={`text-current/70 transition-transform ${
                      isHistoryMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {isHistoryMenuOpen ? (
                <div
                  className={`absolute right-0 top-[calc(100%+12px)] z-[999] min-w-[180px] rounded-xl border border-[0.5px] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
                    isDark
                      ? "border-white/10 bg-[#202020]"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsHistoryMenuOpen(false);
                      if (!isHistoryOpen) {
                        onOpenHistory?.();
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[12px] transition ${
                      isDark
                        ? "text-zinc-100 hover:bg-[#2b2b2b]"
                        : "text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <History size={14} />
                    <span>Workflow History</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </Panel>

        <Panel position="bottom-left">
          <div className="ml-20 flex items-center gap-2.5">
            <div className="relative">
              {showUndoTooltip ? (
                <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-[999] -translate-x-1/2">
                  <div className={tooltipBubbleClass}>
                    Undo
                    <div
                      className={`absolute top-full left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1 rotate-45 ${
                        isDark ? "bg-white" : "bg-black"
                      }`}
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className={`${historyButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
                aria-label="Undo"
                onMouseEnter={() => setShowUndoTooltip(true)}
                onMouseLeave={() => setShowUndoTooltip(false)}
              >
                <Undo2 size={15} />
              </button>
            </div>

            <div className="relative">
              {showRedoTooltip ? (
                <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-[999] -translate-x-1/2">
                  <div className={tooltipBubbleClass}>
                    Redo
                    <div
                      className={`absolute top-full left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1 rotate-45 ${
                        isDark ? "bg-white" : "bg-black"
                      }`}
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className={`${historyButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
                aria-label="Redo"
                onMouseEnter={() => setShowRedoTooltip(true)}
                onMouseLeave={() => setShowRedoTooltip(false)}
              >
                <Redo2 size={15} />
              </button>
            </div>
          </div>
        </Panel>

        <Controls
          position="bottom-left"
          showInteractive={false}
          className={ui.controlsClass}
        />

        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={ui.minimapNodeColor}
          maskColor={ui.minimapMaskColor}
          className={ui.minimapClass}
        />
      </ReactFlow>

      {nodes.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div
            className={`text-md font-medium transition-transform duration-300 ease-in-out ${
              isDark ? "text-white/50" : "text-zinc-600"
            }`}
            style={{ transform: `translateX(${addNodeCenterOffset}px)` }}
          >
            Add a node
          </div>
        </div>
      ) : null}

      <FlowStyles isDark={isDark} />
    </div>
  );
};

export default WorkflowCanvas;
