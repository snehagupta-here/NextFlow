"use client";

import React from "react";

type ConnectedFieldProps = {
  label: string;
  connected: boolean;
  children: React.ReactNode;
};

const ConnectedField = ({
  label,
  connected,
  children,
}: ConnectedFieldProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400">{label}</span>
      {connected ? (
        <span className="text-[10px] text-zinc-500">Connected input</span>
      ) : null}
    </div>
    {children}
  </div>
);

export default ConnectedField;