"use client";

import React from "react";

type FlowStylesProps = {
  isDark: boolean;
};

const FlowStyles = ({ isDark }: FlowStylesProps) => {
  return (
    <style jsx global>{`
      .react-flow__attribution {
        display: none;
      }

      .react-flow__panel {
        margin: 16px;
        z-index: 60;
      }

      .react-flow {
        background: ${isDark ? "#111111" : "#f4f4f5"};
        --xy-selection-background-color: ${isDark
          ? "rgba(59, 130, 246, 0.14)"
          : "rgba(59, 130, 246, 0.10)"};
        --xy-selection-border: 1px dashed
          ${isDark ? "rgba(96, 165, 250, 0.95)" : "rgba(59, 130, 246, 0.9)"};
      }

      .react-flow__renderer,
      .react-flow__pane,
      .react-flow__viewport {
        background: transparent;
      }

      .react-flow__background {
        background-color: transparent;
      }

      .react-flow__controls-button {
        width: 40px;
        height: 40px;
        border-bottom: 1px solid
          ${isDark ? "rgba(255, 255, 255, 0.08)" : "#e4e4e7"};
        background: ${isDark ? "#000000" : "#ffffff"};
        color: ${isDark ? "#f4f4f5" : "#18181b"};
        transition: all 0.2s ease;
      }

      .react-flow__controls-button:hover {
        background: ${isDark ? "#0a0a0a" : "#f4f4f5"};
      }

      .react-flow__controls-button svg {
        fill: ${isDark ? "#f4f4f5" : "#18181b"};
      }

      .react-flow__minimap {
        background: ${isDark ? "#000000" : "#ffffff"};
      }

      .react-flow__node {
        background: transparent;
        border: none;
        border-radius: 0;
        box-shadow: none;
        color: ${isDark ? "#e4e4e7" : "#3f3f46"};
        overflow: visible;
        transition:
          background 0.2s ease,
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          color 0.2s ease;
      }

      @keyframes workflow-node-pulse-dark {
        0%,
        100% {
          box-shadow:
            0 0 0 1px rgba(96, 165, 250, 0.7),
            0 0 18px rgba(59, 130, 246, 0.38),
            0 0 42px rgba(59, 130, 246, 0.22),
            0 20px 60px rgba(0, 0, 0, 0.45);
        }

        50% {
          box-shadow:
            0 0 0 1px rgba(96, 165, 250, 0.98),
            0 0 28px rgba(59, 130, 246, 0.62),
            0 0 64px rgba(59, 130, 246, 0.34),
            0 20px 60px rgba(0, 0, 0, 0.45);
        }
      }

      @keyframes workflow-node-pulse-light {
        0%,
        100% {
          box-shadow:
            0 0 0 1px rgba(59, 130, 246, 0.5),
            0 0 16px rgba(96, 165, 250, 0.22),
            0 0 34px rgba(96, 165, 250, 0.14),
            0 16px 40px rgba(0, 0, 0, 0.08);
        }

        50% {
          box-shadow:
            0 0 0 1px rgba(59, 130, 246, 0.9),
            0 0 24px rgba(96, 165, 250, 0.36),
            0 0 52px rgba(96, 165, 250, 0.2),
            0 16px 40px rgba(0, 0, 0, 0.08);
        }
      }

      .workflow-node-running-dark {
        border-color: rgba(96, 165, 250, 0.95) !important;
        animation: workflow-node-pulse-dark 1.8s ease-in-out infinite;
      }

      .workflow-node-running-light {
        border-color: rgba(59, 130, 246, 0.72) !important;
        animation: workflow-node-pulse-light 1.8s ease-in-out infinite;
      }

      @keyframes workflow-handle-pulse-dark {
        0%,
        100% {
          background: #4e387e;
          box-shadow:
            0 0 0 4px rgba(78, 56, 126, 0.22),
            0 0 10px rgba(96, 165, 250, 0.2);
        }

        50% {
          background: rgba(96, 165, 250, 0.98);
          box-shadow:
            0 0 0 4px rgba(78, 56, 126, 0.28),
            0 0 16px rgba(96, 165, 250, 0.34);
        }
      }

      @keyframes workflow-handle-pulse-light {
        0%,
        100% {
          background: #4e387e;
          box-shadow:
            0 0 0 4px rgba(78, 56, 126, 0.16),
            0 0 8px rgba(59, 130, 246, 0.1);
        }

        50% {
          background: rgba(59, 130, 246, 0.94);
          box-shadow:
            0 0 0 4px rgba(78, 56, 126, 0.2),
            0 0 12px rgba(59, 130, 246, 0.22);
        }
      }

      .workflow-handle-running-dark {
        animation: workflow-handle-pulse-dark 1.4s ease-in-out infinite;
      }

      .workflow-handle-running-light {
        animation: workflow-handle-pulse-light 1.4s ease-in-out infinite;
      }

      @keyframes workflow-edge-flow-dark {
        0% {
          stroke: rgba(96, 165, 250, 0.98);
          stroke-width: 3px;
          stroke-dasharray: 48 260;
          stroke-dashoffset: 308;
          filter:
            drop-shadow(0 0 10px rgba(96, 165, 250, 0.42))
            drop-shadow(0 0 18px rgba(59, 130, 246, 0.22));
        }

        100% {
          stroke: rgba(96, 165, 250, 0.98);
          stroke-width: 3px;
          stroke-dasharray: 48 260;
          stroke-dashoffset: 0;
          filter:
            drop-shadow(0 0 10px rgba(96, 165, 250, 0.42))
            drop-shadow(0 0 18px rgba(59, 130, 246, 0.22));
        }
      }

      @keyframes workflow-edge-flow-light {
        0% {
          stroke: rgba(59, 130, 246, 0.94);
          stroke-width: 3px;
          stroke-dasharray: 48 260;
          stroke-dashoffset: 308;
          filter:
            drop-shadow(0 0 8px rgba(59, 130, 246, 0.26))
            drop-shadow(0 0 14px rgba(96, 165, 250, 0.16));
        }

        100% {
          stroke: rgba(59, 130, 246, 0.94);
          stroke-width: 3px;
          stroke-dasharray: 48 260;
          stroke-dashoffset: 0;
          filter:
            drop-shadow(0 0 8px rgba(59, 130, 246, 0.26))
            drop-shadow(0 0 14px rgba(96, 165, 250, 0.16));
        }
      }

      .workflow-edge-running-dark .react-flow__edge-path,
      .workflow-edge-running-dark .react-flow__connection-path {
        animation: workflow-edge-flow-dark 1.15s linear infinite;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke: rgba(96, 165, 250, 0.98) !important;
      }

      .workflow-edge-running-light .react-flow__edge-path,
      .workflow-edge-running-light .react-flow__connection-path {
        animation: workflow-edge-flow-light 1.15s linear infinite;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke: rgba(59, 130, 246, 0.94) !important;
      }

      .workflow-edge-running-dark .react-flow__arrowhead path {
        fill: rgba(96, 165, 250, 0.98);
      }

      .workflow-edge-running-light .react-flow__arrowhead path {
        fill: rgba(59, 130, 246, 0.94);
      }

      @keyframes workflow-selection-border-move {
        from {
          background-position:
            0 0,
            100% 0,
            0 100%,
            0 0;
        }

        to {
          background-position:
            16px 0,
            100% 16px,
            -16px 100%,
            0 -16px;
        }
      }

      .react-flow__node.selected {
        border-color: transparent;
        box-shadow: none;
      }

      .react-flow__selection {
        background: ${isDark
          ? "rgba(59, 130, 246, 0.04) !important"
          : "rgba(59, 130, 246, 0.03) !important"};
        border: none !important;
        box-shadow: inset 0 0 0 1px
          ${isDark
            ? "rgba(96, 165, 250, 0.12)"
            : "rgba(59, 130, 246, 0.09)"} !important;
        backdrop-filter: none !important;
        position: relative;
        overflow: visible !important;
      }

      .react-flow__selection-rect {
        background: ${isDark
          ? "rgba(59, 130, 246, 0.04) !important"
          : "rgba(59, 130, 246, 0.03) !important"};
        border: none !important;
        box-shadow: inset 0 0 0 1px
          ${isDark
            ? "rgba(96, 165, 250, 0.12)"
            : "rgba(59, 130, 246, 0.09)"} !important;
        backdrop-filter: none !important;
        position: relative;
        overflow: visible !important;
      }

      .react-flow__nodesselection-rect {
        background: ${isDark
          ? "rgba(59, 130, 246, 0.04) !important"
          : "rgba(59, 130, 246, 0.03) !important"};
        border: none !important;
        box-shadow: inset 0 0 0 1px
          ${isDark
            ? "rgba(96, 165, 250, 0.12)"
            : "rgba(59, 130, 246, 0.09)"} !important;
        backdrop-filter: none !important;
        position: relative;
        overflow: visible !important;
      }

      .react-flow__selection::before,
      .react-flow__selection-rect::before,
      .react-flow__nodesselection-rect::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          repeating-linear-gradient(
            90deg,
            ${isDark ? "rgba(96, 165, 250, 0.96)" : "rgba(59, 130, 246, 0.94)"} 0 8px,
            transparent 8px 14px
          ),
          repeating-linear-gradient(
            180deg,
            ${isDark ? "rgba(96, 165, 250, 0.96)" : "rgba(59, 130, 246, 0.94)"} 0 8px,
            transparent 8px 14px
          ),
          repeating-linear-gradient(
            270deg,
            ${isDark ? "rgba(96, 165, 250, 0.96)" : "rgba(59, 130, 246, 0.94)"} 0 8px,
            transparent 8px 14px
          ),
          repeating-linear-gradient(
            0deg,
            ${isDark ? "rgba(96, 165, 250, 0.96)" : "rgba(59, 130, 246, 0.94)"} 0 8px,
            transparent 8px 14px
          );
        background-size:
          100% 1.5px,
          1.5px 100%,
          100% 1.5px,
          1.5px 100%;
        background-repeat: no-repeat;
        animation: workflow-selection-border-move 0.9s linear infinite;
      }

      .react-flow__node-default,
      .react-flow__node-input,
      .react-flow__node-output,
      .react-flow__node-group {
        background: ${isDark ? "#111111" : "#ffffff"};
        color: ${isDark ? "#e4e4e7" : "#3f3f46"};
        border: 1px solid
          ${isDark ? "rgba(255, 255, 255, 0.08)" : "#ececec"};
        border-radius: 20px;
      }

      .react-flow__handle {
        width: 16px;
        height: 16px;
        border: 3px solid ${isDark ? "#24193a" : "#e9e2f7"};
        background: #4e387e;
        box-shadow: 0 0 0 4px
          ${isDark ? "rgba(78, 56, 126, 0.22)" : "rgba(78, 56, 126, 0.16)"};
      }

      .react-flow__handle-bottom {
        background: ${isDark ? "#52525b" : "#a1a1aa"};
        border-color: ${isDark ? "#27272a" : "#e4e4e7"};
        box-shadow: none;
      }
    `}</style>
  );
};

export default FlowStyles;
