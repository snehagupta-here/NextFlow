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
          ? "rgba(59, 130, 246, 0.08) !important"
          : "rgba(59, 130, 246, 0.06) !important"};
        border: none !important;
        box-shadow: inset 0 0 0 1px
          ${isDark
            ? "rgba(96, 165, 250, 0.16)"
            : "rgba(59, 130, 246, 0.12)"} !important;
        backdrop-filter: none !important;
        position: relative;
        overflow: visible !important;
      }

      .react-flow__selection-rect {
        background: ${isDark
          ? "rgba(59, 130, 246, 0.08) !important"
          : "rgba(59, 130, 246, 0.06) !important"};
        border: none !important;
        box-shadow: inset 0 0 0 1px
          ${isDark
            ? "rgba(96, 165, 250, 0.16)"
            : "rgba(59, 130, 246, 0.12)"} !important;
        backdrop-filter: none !important;
        position: relative;
        overflow: visible !important;
      }

      .react-flow__nodesselection-rect {
        background: ${isDark
          ? "rgba(59, 130, 246, 0.08) !important"
          : "rgba(59, 130, 246, 0.06) !important"};
        border: none !important;
        box-shadow: inset 0 0 0 1px
          ${isDark
            ? "rgba(96, 165, 250, 0.16)"
            : "rgba(59, 130, 246, 0.12)"} !important;
        backdrop-filter: none !important;
        position: relative;
        overflow: visible !important;
        transform: translate(-8px, -8px);
        width: calc(100% + 16px) !important;
        height: calc(100% + 16px) !important;
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
        border-radius: 28px;
      }

      .react-flow__handle {
        width: 16px;
        height: 16px;
        border: 3px solid ${isDark ? "#16381f" : "#dcfce7"};
        background: #22c55e;
        box-shadow: 0 0 0 4px
          ${isDark ? "rgba(34, 197, 94, 0.18)" : "rgba(34, 197, 94, 0.14)"};
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
