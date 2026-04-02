"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import type {
  ThemeMode,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
  AddNodePayload,
} from "@/types/workflow";
import { createWorkflowNode } from "@/lib/workflow/node-factory";
import { createWorkflowEdge } from "@/lib/workflow/edge-factory";

type WorkflowSnapshot = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

type WorkflowEditorState = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  history: WorkflowSnapshot[];
  future: WorkflowSnapshot[];
  historyRefreshKey: number;

  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  replaceWorkflow: (payload: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    workflowId?: string;
  }) => void;
  resetWorkflow: () => void;
  bumpHistoryRefreshKey: () => void;
  patchNodeData: (nodeId: string, patch: Record<string, unknown>) => void;

  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  onConnect: (connection: Connection, theme: ThemeMode) => void;

  addNode: (payload: AddNodePayload) => void;

  updateNodeData: (
    nodeId: string,
    updater:
      | Partial<WorkflowNodeData>
      | ((current: WorkflowNodeData) => WorkflowNodeData)
  ) => void;

  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  removeSelectedElements: () => void;
  clearCanvas: () => void;
currentWorkflowId?: string;
setCurrentWorkflowId: (id?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

const MAX_HISTORY = 100;

function createSnapshot(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowSnapshot {
  return {
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
  };
}

function areSnapshotsEqual(a: WorkflowSnapshot, b: WorkflowSnapshot) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pushHistory(state: WorkflowEditorState): Pick<
  WorkflowEditorState,
  "history" | "future"
> {
  const current = createSnapshot(state.nodes, state.edges);
  const last = state.history[state.history.length - 1];

  if (last && areSnapshotsEqual(last, current)) {
    return {
      history: state.history,
      future: [],
    };
  }

  const nextHistory = [...state.history, current].slice(-MAX_HISTORY);

  return {
    history: nextHistory,
    future: [],
  };
}

export const useWorkflowEditorStore = create<WorkflowEditorState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],

      history: [],
      future: [],
      historyRefreshKey: 0,

      setNodes: (nodes) =>
        set((state) => ({
          ...pushHistory(state),
          nodes,
        })),

      setEdges: (edges) =>
        set((state) => ({
          ...pushHistory(state),
          edges,
        })),
      replaceWorkflow: ({ nodes, edges, workflowId }) =>
        set(() => ({
          nodes,
          edges,
          history: [],
          future: [],
          historyRefreshKey: 0,
          currentWorkflowId: workflowId,
        })),

      resetWorkflow: () =>
        set(() => ({
          nodes: [],
          edges: [],
          history: [],
          future: [],
          historyRefreshKey: 0,
          currentWorkflowId: undefined,
        })),

      bumpHistoryRefreshKey: () =>
        set((state) => ({
          historyRefreshKey: state.historyRefreshKey + 1,
        })),

      currentWorkflowId: undefined,

      setCurrentWorkflowId: (id) =>
        set(() => ({
          currentWorkflowId: id,
        })),
      patchNodeData: (nodeId, patch) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id !== nodeId
              ? node
              : {
                  ...node,
                  data: {
                    ...node.data,
                    ...patch,
                  },
                }
          ),
        })),

      onNodesChange: (changes) =>
        set((state) => {
          const nextNodes = applyNodeChanges(changes, state.nodes);

          if (JSON.stringify(nextNodes) === JSON.stringify(state.nodes)) {
            return state;
          }

          return {
            ...pushHistory(state),
            nodes: nextNodes,
          };
        }),

      onEdgesChange: (changes) =>
        set((state) => {
          const nextEdges = applyEdgeChanges(changes, state.edges);

          if (JSON.stringify(nextEdges) === JSON.stringify(state.edges)) {
            return state;
          }

          return {
            ...pushHistory(state),
            edges: nextEdges,
          };
        }),

      onConnect: (connection, theme) =>
        set((state) => ({
          ...pushHistory(state),
          edges: addEdge(createWorkflowEdge(connection, theme), state.edges),
        })),

      addNode: (payload) =>
        set((state) => ({
          ...pushHistory(state),
          nodes: [...state.nodes, createWorkflowNode(payload)],
        })),

      updateNodeData: (nodeId, updater) =>
        set((state) => {
          const nextNodes = state.nodes.map((node) => {
            if (node.id !== nodeId) return node;

            const current = node.data as WorkflowNodeData;
            const nextData =
              typeof updater === "function"
                ? updater(current)
                : { ...current, ...updater };

            return {
              ...node,
              data: nextData,
            };
          });

          if (JSON.stringify(nextNodes) === JSON.stringify(state.nodes)) {
            return state;
          }

          return {
            ...pushHistory(state),
            nodes: nextNodes,
          };
        }),

      removeNode: (nodeId) =>
        set((state) => ({
          ...pushHistory(state),
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        })),

      removeEdge: (edgeId) =>
        set((state) => ({
          ...pushHistory(state),
          edges: state.edges.filter((edge) => edge.id !== edgeId),
        })),

      removeSelectedElements: () =>
        set((state) => {
          const selectedNodeIds = new Set(
            state.nodes.filter((node) => node.selected).map((node) => node.id)
          );

          const remainingNodes = state.nodes.filter((node) => !node.selected);

          const remainingEdges = state.edges.filter(
            (edge) =>
              !edge.selected &&
              !selectedNodeIds.has(edge.source) &&
              !selectedNodeIds.has(edge.target)
          );

          if (
            remainingNodes.length === state.nodes.length &&
            remainingEdges.length === state.edges.length
          ) {
            return state;
          }

          return {
            ...pushHistory(state),
            nodes: remainingNodes,
            edges: remainingEdges,
          };
        }),

      clearCanvas: () =>
        set((state) => ({
          ...pushHistory(state),
          nodes: [],
          edges: [],
        })),

      undo: () =>
        set((state) => {
          if (state.history.length === 0) return state;

          const previous = state.history[state.history.length - 1];
          const current = createSnapshot(state.nodes, state.edges);

          return {
            nodes: previous.nodes,
            edges: previous.edges,
            history: state.history.slice(0, -1),
            future: [current, ...state.future].slice(0, MAX_HISTORY),
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;

          const next = state.future[0];
          const current = createSnapshot(state.nodes, state.edges);

          return {
            nodes: next.nodes,
            edges: next.edges,
            history: [...state.history, current].slice(-MAX_HISTORY),
            future: state.future.slice(1),
          };
        }),

      canUndo: () => get().history.length > 0,
      canRedo: () => get().future.length > 0,
    }),
    {
      name: "workflow-editor-store",
      storage: createJSONStorage(() => localStorage),
     partialize: (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  history: state.history,
  future: state.future,
  historyRefreshKey: state.historyRefreshKey,
  currentWorkflowId: state.currentWorkflowId,
}),
    }
  )
);
