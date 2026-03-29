"use client";

import React from "react";

type FlowHeaderProps = {
  panelClass: string;
  subtitleClass: string;
};

const FlowHeader = ({ panelClass, subtitleClass }: FlowHeaderProps) => {
  return (
    <div className={`${panelClass} px-4 py-3`}>
      <p className="text-sm font-semibold">Workflow Canvas</p>
      <p className={`text-xs ${subtitleClass}`}>
        Drag, connect, and organize nodes
      </p>
    </div>
  );
};

export default FlowHeader;