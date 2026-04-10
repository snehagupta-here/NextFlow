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
  LogIn,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkflowActions } from "@/hooks/workflow/useWorkFlowEditor";
import { WorkflowNodeType } from "@/types/workflow";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";

const WORKFLOW_NODE_DRAG_TYPE = "application/x-workflow-node-type";

type LeftSideBarProps = {
  collapsed?: boolean;
};

const LeftSideBar = ({ collapsed = false }: LeftSideBarProps) => {
  const { addNode } = useWorkflowActions();
  const { isDark } = useWorkflowTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const wrapperClass = isDark
    ? "h-full bg-black text-white"
    : "h-full bg-[#f5f5f5] text-zinc-900";

  const itemClass = `group flex items-center transition ${
    collapsed
      ? "h-11 w-full justify-center rounded-xl px-0"
      : "h-12 w-full gap-3 justify-start rounded-xl px-3"
  } ${
    isDark
      ? "text-zinc-100 hover:bg-white/8"
      : "text-zinc-900 hover:bg-[rgba(0,0,0,0.06)]"
  }`;
  const authItemClass = isSignedIn
    ? itemClass
    : `group flex items-center transition ${
        collapsed
          ? "h-9 w-9 justify-center m-1 self-center rounded-xl px-0"
          : "h-12 w-full gap-3 justify-start rounded-xl px-3"
      } ${
        isDark
          ? "bg-[#2f6df6] text-white hover:bg-[#2760dd]"
          : "border border-black/8 bg-white text-[#171717] hover:bg-black/[0.03]"
      }`;
  const labelClass = `min-w-0 overflow-hidden whitespace-nowrap text-sm font-medium tracking-[-0.01em] transition-all duration-200 ease-out ${
    collapsed
      ? "w-0 translate-x-[-4px] opacity-0"
      : "w-auto translate-x-0 opacity-100"
  }`;
  const hintClass = `overflow-hidden px-3 text-xs transition-all duration-200 ease-out ${
    collapsed || isSignedIn || !isLoaded
      ? "mb-0 max-h-0 translate-y-[-4px] opacity-0"
      : "mb-4 max-h-12 translate-y-0 opacity-100"
  } ${isDark ? "text-zinc-400" : "text-zinc-500"}`;

  const items = [
    {
      icon: Type,
      label: "Text Node",
      type: WorkflowNodeType.TEXT,
      iconClass: isDark ? "text-[#f5c84c]" : "text-[#d39a00]",
    },
    {
      icon: ImagePlus,
      label: "Image Node",
      type: WorkflowNodeType.UPLOAD_IMAGE,
      iconClass: isDark ? "text-[#59a7ff]" : "text-[#1f78ff]",
    },
    {
      icon: Video,
      label: "Video Node",
      type: WorkflowNodeType.UPLOAD_VIDEO,
      iconClass: isDark ? "text-[#53d769]" : "text-[#21a53a]",
    },
    {
      icon: Crop,
      label: "Crop Image",
      type: WorkflowNodeType.CROP_IMAGE,
      iconClass: isDark ? "text-[#ff8c5a]" : "text-[#e05b1f]",
    },
    {
      icon: ScanLine,
      label: "Extract Frame",
      type: WorkflowNodeType.EXTRACT_FRAME,
      iconClass: isDark ? "text-[#c38bff]" : "text-[#8648d8]",
    },
    {
      icon: Bot,
      label: "LLM Node",
      type: WorkflowNodeType.RUN_ANY_LLM,
      iconClass: isDark ? "text-[#ff6f91]" : "text-[#db2f62]",
    },
  ];

  const handleAddNode = (type: WorkflowNodeType) => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(pathname || "/nodes")}`
      );
      return;
    }

    addNode({ type });
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    type: WorkflowNodeType
  ) => {
    if (!isLoaded || !isSignedIn) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData(WORKFLOW_NODE_DRAG_TYPE, type);
    event.dataTransfer.setData("text/plain", type);
    event.dataTransfer.effectAllowed = "copyMove";
  };

  const handleAuthAction = () => {
    if (!isLoaded) return;

    if (isSignedIn) {
      void clerk.signOut({
        redirectUrl: "/nodes",
      });
      return;
    }

    router.push(
      `/sign-in?redirect_url=${encodeURIComponent(pathname || "/nodes")}`
    );
  };

  return (
    <aside className={wrapperClass}>
      <div
        className={`flex h-full flex-col ${
          collapsed ? "px-2 pt-18 pb-3" : "px-3 pt-18 pb-4"
        }`}
      >
        <p aria-hidden={collapsed || isSignedIn || !isLoaded} className={hintClass}>
          Sign in to add nodes to the canvas.
        </p>

        <div className="flex flex-1 flex-col gap-1.5">
          {items.map(({ icon: Icon, label, type, iconClass }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleAddNode(type)}
              draggable={!!isLoaded && !!isSignedIn}
              onDragStart={(event) => handleDragStart(event, type)}
              className={`${itemClass} cursor-pointer`}
              title={label}
              aria-label={label}
              disabled={!isLoaded}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center ${iconClass}`}
              >
                <Icon size={18} strokeWidth={2.1} />
              </span>

              <span
                aria-hidden={collapsed}
                className={labelClass}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-3">
          {!isLoaded ? (
            <div
              aria-hidden="true"
              className={`animate-pulse ${
                collapsed
                  ? "m-1 h-9 w-9 self-center rounded-xl"
                  : "h-12 w-full rounded-xl"
              } ${isDark ? "bg-white/8" : "bg-black/6"}`}
            />
          ) : (
            <button
              type="button"
              onClick={handleAuthAction}
              className={`${authItemClass} cursor-pointer ${collapsed && !isSignedIn ? "m-1" : ""}`}
              title={isSignedIn ? "Log out" : "Sign in"}
              aria-label={isSignedIn ? "Log out" : "Sign in"}
            >
                {isSignedIn ? (
                  <>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                        isDark ? "text-zinc-300" : "text-zinc-700"
                      }`}
                    >
                      <LogOut size={16} strokeWidth={2.1} />
                    </span>

                    <span
                      aria-hidden={collapsed}
                      className={labelClass}
                    >
                      Log out
                    </span>
                  </>
                ) : (
                  <>
                    {collapsed ? (
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                          isDark ? "text-white" : "text-[#171717]"
                        }`}
                      >
                        <LogIn size={14} strokeWidth={2.1} />
                      </span>
                    ) : (
                      <span
                        className={`w-full text-center text-sm font-medium tracking-[-0.01em] ${
                          isDark ? "text-white" : "text-[#171717]"
                        }`}
                      >
                        Sign in
                      </span>
                    )}
                  </>
                )}
              </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeftSideBar;
