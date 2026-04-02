"use client";

import React from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
  Type,
  ImagePlus,
  Video,
  Crop,
  ScanLine,
  Bot,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkflowActions } from "@/hooks/workflow/useWorkFlowEditor";
import { WorkflowNodeType } from "@/types/workflow";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

type LeftSideBarProps = {
  collapsed?: boolean;
};

const LeftSideBar = ({ collapsed = false }: LeftSideBarProps) => {
  const { addNode } = useWorkflowActions();
  const { isDark } = useWorkflowTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const pathname = usePathname();

  const wrapperClass = isDark
    ? "h-full bg-black text-white"
    : "h-full bg-[#f5f5f5] text-zinc-900";

  const sectionTitleClass = isDark
    ? "px-4 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
    : "px-4 text-xs font-medium uppercase tracking-[0.14em] text-zinc-400";

  const itemClass = `group flex items-center transition ${
    collapsed
      ? "h-12 w-12 justify-center rounded-2xl"
      : "h-14 w-full gap-3 rounded-2xl px-4"
  } ${
    isDark
      ? "text-zinc-100 hover:bg-white/10"
      : "text-zinc-900 hover:bg-[rgba(0,0,0,0.06)]"
  }`;

  const iconWrapClass = `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
    isDark ? "text-zinc-100" : "text-zinc-900"
  }`;

  const items = [
    {
      icon: Type,
      label: "Text Node",
      type: WorkflowNodeType.TEXT,
    },
    {
      icon: ImagePlus,
      label: "Image Node",
      type: WorkflowNodeType.UPLOAD_IMAGE,
    },
    {
      icon: Video,
      label: "Video Node",
      type: WorkflowNodeType.UPLOAD_VIDEO,
    },
    {
      icon: Crop,
      label: "Crop Image",
      type: WorkflowNodeType.CROP_IMAGE,
    },
    {
      icon: ScanLine,
      label: "Extract Frame",
      type: WorkflowNodeType.EXTRACT_FRAME,
    },
    {
      icon: Bot,
      label: "LLM Node",
      type: WorkflowNodeType.RUN_ANY_LLM,
    },
  ];

  const handleAddNode = (type: WorkflowNodeType) => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      clerk.openSignIn({
        fallbackRedirectUrl: pathname,
        forceRedirectUrl: pathname,
      });
      return;
    }

    addNode({ type });
  };

  return (
    <aside className={wrapperClass}>
      <div className={`h-full ${collapsed ? "px-3 pt-20" : "px-4 pt-20 pb-6"}`}>
        {!collapsed && (
          <div className="mb-5">
            <p className={sectionTitleClass}>Tools</p>
            {!isSignedIn && isLoaded ? (
              <p
                className={`mt-2 px-4 text-xs ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Sign in to add nodes to the canvas.
              </p>
            ) : null}
          </div>
        )}

        <div className={`flex flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
          {items.map(({ icon: Icon, label, type }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleAddNode(type)}
              className={itemClass}
              title={label}
              aria-label={label}
              disabled={!isLoaded}
            >
              <span className={iconWrapClass}>
                <Icon size={18} strokeWidth={2.1} />
              </span>

              {!collapsed && (
                <span className="text-sm font-medium tracking-[-0.01em]">
                  {label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default LeftSideBar;
