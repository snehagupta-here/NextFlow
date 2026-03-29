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
    `}</style>
  );
};

export default FlowStyles;