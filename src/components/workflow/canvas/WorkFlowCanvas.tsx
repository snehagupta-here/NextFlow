"use client";

import React, { useMemo, useState } from "react";
import {
  Background,
  ColorMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SelectionMode } from "@xyflow/react";
import { workflowNodeTypes } from "@/lib/workflow/node-registry";
import { getFlowTheme } from "@/lib/workflow/flow-theme";
import { WorkflowNodeType } from "@/types/workflow";
import {
  useWorkflowGraph,
  useWorkflowActions,
} from "@/hooks/workflow/useWorkFlowEditor";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";
import { useWorkflowValidation } from "@/hooks/workflow/useWorkFlowValidation";
import { useWorkflowKeyboardDelete } from "@/hooks/workflow/useWorkFlowKeyboardDelete";
import { useWorkflowHistory } from "@/hooks/workflow/useWorkFlowHistory";
import FlowHeader from "./FlowHeader";
import FlowControls from "./FlowControls";
import FlowStyles from "./FlowStyles";

const WorkflowCanvas = () => {
  const { theme, toggleTheme, isDark } = useWorkflowTheme();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useWorkflowGraph();
  const { addNode } = useWorkflowActions();
  const { isValidConnection } = useWorkflowValidation();
  const { undo, redo, canUndo, canRedo } = useWorkflowHistory();

  const [isCanvasLocked, setIsCanvasLocked] = useState(false);

  useWorkflowKeyboardDelete();

  const ui = useMemo(() => getFlowTheme(theme), [theme]);

  return (
    <div className={ui.canvasClass}>
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
          size={1}
          color={ui.backgroundColor}
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
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onToggleCanvasLock={() => setIsCanvasLocked((prev) => !prev)}
            onAddTextNode={() => addNode({ type: WorkflowNodeType.TEXT })}
            onAddImageNode={() => addNode({ type: WorkflowNodeType.UPLOAD_IMAGE })}
            onAddVideoNode={() => addNode({ type: WorkflowNodeType.UPLOAD_VIDEO })}
            onAddCropImageNode={() => addNode({ type: WorkflowNodeType.CROP_IMAGE })}
            onAddExtractFrameNode={() => addNode({ type: WorkflowNodeType.EXTRACT_FRAME })}
            onAddRunAnyLlmNode={() => addNode({ type: WorkflowNodeType.RUN_ANY_LLM })}
            onToggleTheme={toggleTheme}
          />
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