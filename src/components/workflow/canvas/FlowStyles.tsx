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
        background: ${isDark ? "#111111" : "#ffffff"};
        border: 1px solid
          ${isDark ? "rgba(255, 255, 255, 0.08)" : "#ececec"};
        border-radius: 28px;
        box-shadow: ${isDark
          ? "0 20px 60px rgba(0, 0, 0, 0.45)"
          : "0 16px 40px rgba(0, 0, 0, 0.08)"};
        color: ${isDark ? "#e4e4e7" : "#3f3f46"};
        overflow: hidden;
        transition:
          background 0.2s ease,
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          color 0.2s ease;
      }

      .react-flow__node.selected {
        border-color: ${isDark ? "rgba(34, 197, 94, 0.6)" : "#86efac"};
        box-shadow: ${isDark
          ? "0 0 0 1px rgba(34, 197, 94, 0.35), 0 20px 60px rgba(0, 0, 0, 0.45)"
          : "0 0 0 1px rgba(34, 197, 94, 0.25), 0 16px 40px rgba(0, 0, 0, 0.08)"};
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