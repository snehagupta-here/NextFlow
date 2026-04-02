"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  ColorMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  SelectionMode,
} from "@xyflow/react";
import { useAuth } from "@clerk/nextjs";
import { Undo2, Redo2 } from "lucide-react";
import "@xyflow/react/dist/style.css";

import { workflowNodeTypes } from "@/lib/workflow/node-registry";
import { getFlowTheme } from "@/lib/workflow/flow-theme";
import { useWorkflowGraph } from "@/hooks/workflow/useWorkFlowEditor";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";
import { useWorkflowValidation } from "@/hooks/workflow/useWorkFlowValidation";
import { useWorkflowKeyboardDelete } from "@/hooks/workflow/useWorkFlowKeyboardDelete";
import { useWorkflowKeyboardHistory } from "@/hooks/workflow/useWorkFlowKeyboardHistory";
import { useWorkflowHistory } from "@/hooks/workflow/useWorkFlowHistory";
import { useWorkflowExecution } from "@/hooks/workflow/useWorkFlowExecution";
import FlowHeader from "./FlowHeader";
import FlowControls from "./FlowControls";
import FlowStyles from "./FlowStyles";

type WorkflowCanvasProps = {
  workflowId?: string;
  onWorkflowSaved?: (workflowId: string) => void;
};

const WorkflowCanvas = ({
  workflowId,
  onWorkflowSaved,
}: WorkflowCanvasProps) => {
  const { isSignedIn } = useAuth();
  const { theme, toggleTheme, isDark } = useWorkflowTheme();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useWorkflowGraph();
  const { isValidConnection } = useWorkflowValidation();
  const { undo, redo, canUndo, canRedo } = useWorkflowHistory();
  const { runSelected, runAll } = useWorkflowExecution(workflowId);

  const [isCanvasLocked, setIsCanvasLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const hasInitializedAutosave = useRef(false);
  const lastSavedSnapshot = useRef("");

  useWorkflowKeyboardDelete();
  useWorkflowKeyboardHistory();

  const ui = useMemo(() => getFlowTheme(theme), [theme]);

  const historyButtonClass = `inline-flex h-14 w-14 items-center justify-center rounded-[18px] border transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-[#121212] text-white hover:bg-[#181818]"
      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
  }`;

  const workflowSnapshot = useMemo(
    () =>
      JSON.stringify({
        nodes,
        edges,
      }),
    [nodes, edges]
  );

  const handleSaveWorkflow = async () => {
    try {
      setIsSaving(true);
      setSaveMessage("");

      const payload = {
        name: "My Workflow",
        nodes,
        edges,
      };

      let res = await fetch(
        workflowId ? `/api/workflows/${workflowId}` : "/api/workflows",
        {
          method: workflowId ? "PATCH" : "POST",
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

      if (workflowId && res.status === 404) {
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

      lastSavedSnapshot.current = workflowSnapshot;

      setSaveMessage("Workflow saved successfully.");
    } catch (error) {
      console.error(error);
      setSaveMessage(
        error instanceof Error ? error.message : "Failed to save workflow."
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!workflowId || !isSignedIn) return;

    if (!hasInitializedAutosave.current) {
      hasInitializedAutosave.current = true;
      lastSavedSnapshot.current = workflowSnapshot;
      return;
    }

    if (lastSavedSnapshot.current === workflowSnapshot) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "My Workflow",
            nodes,
            edges,
          }),
        });

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          throw new Error(data?.error || "Failed to autosave workflow.");
        }

        lastSavedSnapshot.current = workflowSnapshot;
      } catch (error) {
        console.error(error);
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [workflowId, isSignedIn, nodes, edges, workflowSnapshot]);

  return (
    <div className={ui.canvasClass}>
      {saveMessage ? (
        <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-zinc-300 shadow-lg">
          {saveMessage}
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
      >
        <Background
          gap={24}
          size={1.2}
          color={isDark ? "#52525b" : "#71717a"}
          className={ui.flowClass}
        />

        <Panel position="top-left">
          <FlowHeader
            panelClass={ui.panelClass}
            subtitleClass={ui.subtitleClass}
          />
        </Panel>

        <Panel position="top-right">
          <FlowControls
            isDark={isDark}
            isCanvasLocked={isCanvasLocked}
            isSaving={isSaving}
            hasWorkflowId={!!workflowId}
            onRunSelected={() => runSelected(true)}
            onRunAll={() => runAll(true)}
            onSaveWorkflow={handleSaveWorkflow}
            onToggleCanvasLock={() => setIsCanvasLocked((prev) => !prev)}
            onToggleTheme={toggleTheme}
          />
        </Panel>

        <Panel position="bottom-left">
          <div className="ml-20 flex items-center gap-2.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className={`${historyButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label="Undo"
              title="Undo"
            >
              <Undo2 size={20} />
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className={`${historyButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label="Redo"
              title="Redo"
            >
              <Redo2 size={20} />
            </button>
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

      <FlowStyles isDark={isDark} />
    </div>
  );
};

export default WorkflowCanvas;
