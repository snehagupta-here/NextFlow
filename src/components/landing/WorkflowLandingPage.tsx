"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Check, ChevronDown, Eye, EyeOff, Plus, Search } from "lucide-react";
import LeftSideBar from "@/components/LeftSideBar";
import { useWorkflowTheme } from "@/hooks/workflow/useWorkFlowUi";
import { WORKFLOW_TEMPLATES } from "@/lib/workflow/templates";

type WorkflowListItem = {
  id: string;
  name: string;
  updatedAt: string;
  nodes?: unknown[];
  edges?: unknown[];
};

type ShelfTab = "Projects" | "Apps" | "Examples" | "Templates";
type SortBy = "Last viewed" | "Date created" | "Alphabetical";
type OrderBy = "Newest first" | "Oldest first";

type ShelfCard = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  variant: "new" | "project" | "template";
  isEmpty?: boolean;
};

const tabs: ShelfTab[] = ["Projects", "Apps", "Examples", "Templates"];

const CollapseSidebarIcon = (_: { collapsed: boolean }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect
        x="3.5"
        y="4"
        width="17"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 6V18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  const delta = Date.now() - date.getTime();

  if (Number.isNaN(delta)) return "Edited recently";

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (delta < hour) {
    const minutes = Math.max(1, Math.round(delta / minute));
    return `Edited ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (delta < day) {
    const hours = Math.max(1, Math.round(delta / hour));
    return `Edited ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.max(1, Math.round(delta / day));
  return `Edited ${days} day${days === 1 ? "" : "s"} ago`;
}

function ProjectThumbnail({
  variant,
  isDark,
}: {
  variant: ShelfCard["variant"];
  isDark: boolean;
}) {
  if (variant === "new") {
    return (
      <div
        className={`flex aspect-[2/1.33] w-full items-center justify-center rounded-md border ${
          isDark
            ? "border-white/6 bg-[#2b2b2b] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "border-black/8 bg-[#f2f2f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
        }`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-sm">
          <Plus size={16} />
        </div>
      </div>
    );
  }

  if (variant === "project") {
    return (
      <div
        className={`flex aspect-[2/1.33] w-full items-center justify-center rounded-md border px-8 ${
          isDark
            ? "border-white/6 bg-[#1b1b1b]"
            : "border-black/8 bg-[#f5f5f5]"
        }`}
      >
        <div className="grid w-full grid-cols-2 gap-5">
          <div className={`h-[92px] rounded-[4px] ${isDark ? "bg-[#4a4a4a]" : "bg-[#dddddd]"}`} />
          <div className={`h-[108px] rounded-[4px] ${isDark ? "bg-[#5a5a5a]" : "bg-[#d3d3d3]"}`} />
        </div>
      </div>
    );
  }

  if (variant === "template") {
    return (
      <div
        className={`flex aspect-[2/1.33] w-full items-center justify-center rounded-md border px-7 ${
          isDark
            ? "border-white/6 bg-[linear-gradient(180deg,#1b1b1b_0%,#161616_100%)]"
            : "border-black/8 bg-[linear-gradient(180deg,#fafafa_0%,#f2f2f2_100%)]"
        }`}
      >
        <div className="grid w-full grid-cols-[1.1fr_0.85fr] gap-4">
          <div className="flex flex-col gap-3">
            <div className={`h-5 w-24 rounded-full ${isDark ? "bg-white/10" : "bg-black/8"}`} />
            <div className={`h-[74px] rounded-[10px] ${isDark ? "bg-[#262626]" : "bg-white"} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]`} />
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <div className={`h-[44px] rounded-[10px] ${isDark ? "bg-[#232323]" : "bg-white"} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]`} />
            <div className={`h-[58px] rounded-[10px] ${isDark ? "bg-[#202020]" : "bg-[#f8f8f8]"}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-[2/1.33] w-full items-center justify-center rounded-md border border-white/6 bg-[#1a1a1a] px-10">
      <div className="h-[108px] w-[72px] rounded-[6px] bg-gradient-to-b from-[#585858] to-[#474747]" />
    </div>
  );
}

function EmptyWorkflowState({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`mx-auto flex max-w-[760px] flex-col items-center  px-8 py-8 text-center `}
    >
      <img
        src="https://optim-images.krea.ai/https---s-krea-ai-icons-NodeEditor-png-256.webp"
        alt=""
        className="h-12 w-12 object-cover"
        draggable={false}
      />

      <h2
        className={`mt-4 text-[19px] font-medium tracking-[-0.04em] ${
          isDark ? "text-white" : "text-[#111111]"
        }`}
      >
        No Workflows Yet
      </h2>

      <p
        className={`mt-2 max-w-[520px] text-[14px] leading-6 ${
          isDark ? "text-white/55" : "text-black/55"
        }`}
      >
        You haven&apos;t created any workflows yet.
        <br />
        Get started by creating your first one.
      </p>

      <Link
        href="/sign-in?redirect_url=%2Fnodes%2Fnew"
        className={`mt-6 inline-flex h-10 min-w-[170px] items-center justify-center rounded-full px-6 text-[14px] font-medium transition ${
          isDark
            ? "bg-white text-black hover:bg-white/92"
            : "bg-black text-white hover:bg-black/92"
        }`}
      >
        New Workflow
      </Link>
    </div>
  );
}

export default function WorkflowLandingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isDark } = useWorkflowTheme();
  const [activeTab, setActiveTab] = useState<ShelfTab>("Projects");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("Last viewed");
  const [orderBy, setOrderBy] = useState<OrderBy>("Newest first");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [showEmptyProjects, setShowEmptyProjects] = useState(false);
  const [showVisibilityTooltip, setShowVisibilityTooltip] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const tooltipTimeoutRef = useRef<number | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const newWorkflowHref = isSignedIn
    ? "/nodes/new"
    : "/sign-in?redirect_url=%2Fnodes%2Fnew";

  useEffect(() => {
    if (!isLoaded) return;
    if (activeTab !== "Projects") {
      setIsLoadingProjects(false);
      return;
    }

    let isCancelled = false;

    const loadProjects = async () => {
      if (!isSignedIn) {
        if (!isCancelled) {
          setWorkflows([]);
          setIsLoadingProjects(false);
        }
        return;
      }

      try {
        if (!isCancelled) {
          setIsLoadingProjects(true);
        }

        const response = await fetch("/api/workflows?limit=12", {
          cache: "no-store",
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          if (!isCancelled) {
            setWorkflows([]);
          }
          return;
        }

        const nextWorkflows = Array.isArray(payload?.workflows)
          ? (payload.workflows as WorkflowListItem[])
          : [];

        if (!isCancelled) {
          setWorkflows(nextWorkflows);
        }
      } catch {
        if (!isCancelled) {
          setWorkflows([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProjects(false);
        }
      }
    };

    loadProjects();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, isLoaded, isSignedIn]);

  const projectCards: ShelfCard[] = [
    {
      id: "new-workflow",
      title: "New Workflow",
      subtitle: "Start from a blank canvas",
      href: newWorkflowHref,
      variant: "new",
    },
    ...workflows.map((workflow) => ({
      id: workflow.id,
      title: workflow.name?.trim() || "Untitled",
      subtitle: formatUpdatedAt(workflow.updatedAt),
      href: `/nodes/${workflow.id}`,
      variant: "project" as const,
      isEmpty:
        (workflow.nodes?.length ?? 0) === 0 && (workflow.edges?.length ?? 0) === 0,
    })),
  ];
  const templateCards: ShelfCard[] = WORKFLOW_TEMPLATES.map((template) => {
    const href = isSignedIn
      ? `/nodes/new?template=${encodeURIComponent(template.id)}`
      : `/sign-in?redirect_url=${encodeURIComponent(
          `/nodes/new?template=${template.id}`
        )}`;

    return {
      id: template.id,
      title: template.title,
      subtitle: template.description,
      href,
      variant: "template" as const,
    };
  });

  let visibleCards =
    activeTab === "Projects"
      ? projectCards
      : activeTab === "Templates"
      ? templateCards
      : [];

  if (activeTab === "Projects" && !showEmptyProjects) {
    visibleCards = visibleCards.filter(
      (card) => card.variant === "new" || !card.isEmpty
    );
  }

  if (query.trim()) {
    const normalizedQuery = query.trim().toLowerCase();
    visibleCards = visibleCards.filter((card) =>
      `${card.title} ${card.subtitle}`.toLowerCase().includes(normalizedQuery)
    );
  }

  if (activeTab === "Projects") {
    const [newWorkflowCard, ...savedWorkflowCards] = visibleCards;

    if (sortBy === "Alphabetical") {
      visibleCards = [
        newWorkflowCard,
        ...[...savedWorkflowCards].sort((a, b) =>
        a.title.localeCompare(b.title)
        ),
      ].filter(Boolean);
    }

    if (orderBy === "Oldest first") {
      const [pinnedNewWorkflowCard, ...sortableWorkflowCards] = visibleCards;
      visibleCards = [
        pinnedNewWorkflowCard,
        ...sortableWorkflowCards.reverse(),
      ].filter(Boolean);
    }
  }

  const visibilityTooltipLabel = showEmptyProjects
    ? "Showing all projects"
    : "Showing non-empty projects";

  const showTooltipBriefly = () => {
    setShowVisibilityTooltip(true);

    if (tooltipTimeoutRef.current) {
      window.clearTimeout(tooltipTimeoutRef.current);
    }

    tooltipTimeoutRef.current = window.setTimeout(() => {
      setShowVisibilityTooltip(false);
      tooltipTimeoutRef.current = null;
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        window.clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSortMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!sortMenuRef.current) return;
      if (sortMenuRef.current.contains(event.target as Node)) return;
      setIsSortMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isSortMenuOpen]);

  return (
    <main className={`min-h-screen ${isDark ? "bg-background text-white" : "bg-white text-[#171717]"}`}>
      <div
        className={`sticky top-0 z-30 flex h-[64px] w-full items-center px-4 md:hidden ${
          isDark ? "bg-black" : "bg-white border-b border-black/8"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen((current) => !current)}
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-transparent transition ${
            isDark
              ? "text-zinc-400 hover:bg-zinc-800/90 hover:text-zinc-300"
              : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
          }`}
          aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
          title={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <CollapseSidebarIcon collapsed={!isMobileSidebarOpen} />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMobileSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Close sidebar overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[255.5px] transition-transform duration-300 ease-out ${
            isDark
              ? "bg-black shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              : "bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          } ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="sticky top-0 h-full">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`absolute left-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-transparent transition ${
                isDark
                  ? "text-zinc-400 hover:bg-zinc-800/90 hover:text-zinc-300"
                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
              }`}
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <CollapseSidebarIcon collapsed={false} />
            </button>
            <LeftSideBar />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        <div
          className={`relative hidden shrink-0 transition-all duration-300 ease-in-out md:block ${
            isLeftSidebarCollapsed
              ? "w-[51px] min-w-[51px]"
              : "w-[255.5px] min-w-[255.5px]"
          }`}
        >
          <div
            className={`fixed left-0 top-0 z-20 h-screen transition-all duration-300 ease-in-out ${
              isLeftSidebarCollapsed
                ? "w-[51px] min-w-[51px]"
                : "w-[255.5px] min-w-[255.5px]"
            }`}
          >
            <button
              type="button"
              onClick={() => setIsLeftSidebarCollapsed((current) => !current)}
              className={`absolute top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-transparent transition ${
                isLeftSidebarCollapsed ? "left-1/2 -translate-x-1/2" : "left-3"
              } ${
                isDark
                  ? "text-zinc-400 hover:bg-zinc-800/90 hover:text-zinc-300"
                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
              }`}
              aria-label={
                isLeftSidebarCollapsed
                  ? "Expand left sidebar"
                  : "Collapse left sidebar"
              }
              title={
                isLeftSidebarCollapsed
                  ? "Expand left sidebar"
                  : "Collapse left sidebar"
              }
            >
              <CollapseSidebarIcon collapsed={isLeftSidebarCollapsed} />
            </button>

            <LeftSideBar collapsed={isLeftSidebarCollapsed} />
          </div>
        </div>

        <div className={`min-w-0 flex-1 ${isDark ? "bg-[#111111]" : "bg-white"}`}>
          <section
            className="relative isolate h-[30vh] min-h-[260px] w-full overflow-hidden bg-[#d9d6d1] bg-cover bg-center text-white px-6 py-6 sm:h-[400px] sm:min-h-0 sm:px-10 md:px-20 md:py-8"
            style={{
              backgroundImage:
                "url('https://optim-images.krea.ai/https---s-krea-ai-nodesHeaderBannerBlurGradient-webp-256.webp')",
            }}
          >
            <img
              src="https://s.krea.ai/nodesHeaderBannerBlurGradient.webp"
              alt=""
              className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover object-center [filter:contrast(1.04)_brightness(0.96)]"
              draggable={false}
            />
            <div className="absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(18,18,18,0.26)_0%,rgba(18,18,18,0.14)_18%,rgba(18,18,18,0.04)_36%,rgba(18,18,18,0)_56%)]" />

            <div className="relative z-[3] flex h-full w-full flex-col justify-between">
              <div />

              <div className="mt-1 flex max-w-[700px] flex-col gap-3  sm:gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://optim-images.krea.ai/https---s-krea-ai-icons-NodeEditor-png-256.webp"
                    alt="Node Editor icon."
                    className="h-9 w-9 object-cover"
                    draggable={false}
                  />
                  <h1 className="text-3xl font-medium tracking-[-0.04em] text-white">
                    Node Editor
                  </h1>
                </div>

                <p className="max-w-[382px] text-[16px] leading-[1.45] text-white/92 sm:max-w-[450px] md:max-lg:max-w-[360px]">
                  Nodes is the most powerful way to operate Krea. Connect every
                  tool and model into complex automated pipelines.
                </p>
              </div>

              <div className="mb-1 mt-10 flex flex-col gap-4 sm:mb-[52px] sm:mt-0 xl:mt-2 xl:flex-row">
                <Link
                  href={newWorkflowHref}
                  className={`group inline-flex h-10 w-[98%] max-w-none shrink-0 self-center items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-medium text-[#191919] transition hover:bg-white/95 sm:w-fit sm:max-w-max sm:self-start ${
                    isLeftSidebarCollapsed ? "" : "md:max-lg:w-[360px] md:max-lg:max-w-[360px]"
                  }`}
                >
                  <span>New Workflow</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </section>

          <section
            className={`border-t ${
              isDark
                ? "border-white/6 bg-[linear-gradient(180deg,#171717_0%,#111111_22%,#101010_100%)]"
                : "border-black/8 bg-white"
            }`}
          >
            <div className="mx-auto w-[98%] px-6 py-8 sm:px-8 md:px-6 lg:w-[98%] lg:px-6 xl:w-[95%] xl:px-14 xl:py-12">
              <div
                className={`flex flex-col gap-3 border-b pb-4 xl:flex-row xl:items-center xl:justify-between ${
                  isDark ? "border-white/7" : "border-black/8"
                }`}
              >
                <div className="flex flex-wrap gap-1 md:flex-nowrap md:overflow-x-auto xl:overflow-visible">
                  {tabs.map((tab) => {
                    const isActive = tab === activeTab;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`inline-flex h-10 w-25 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                          isActive
                            ? isDark
                              ? "bg-white/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                              : "bg-black/[0.04] text-[#171717] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                            : isDark
                              ? "text-white hover:bg-white/5 hover:text-white"
                              : "text-[#171717] hover:bg-black/[0.04] hover:text-[#171717]"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <div className="flex w-full flex-row items-center gap-3 self-start xl:w-auto xl:self-auto">
                  <label
                    className={`hidden flex-1 items-center gap-3 rounded-lg border px-3 py-2 md:flex md:max-w-[223px] xl:w-[223px] xl:max-w-none xl:flex-none ${
                      isDark
                        ? "border-white/10 bg-white/[0.03] text-white/60"
                        : "border-black/10 bg-white text-black/55"
                    }`}
                  >
                    <Search size={16} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search projects..."
                      className={`w-full bg-transparent text-sm outline-none ${
                        isDark
                          ? "text-white placeholder:text-white/36"
                          : "text-[#171717] placeholder:text-black/35"
                      }`}
                    />
                  </label>

                  <div className="relative" ref={sortMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsSortMenuOpen((current) => !current)}
                      className={`inline-flex h-9 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 text-sm md:w-[135px] md:shrink-0 ${
                        isDark
                          ? "border-white/10 bg-white/[0.03] text-white"
                          : "border-black/10 bg-white text-[#171717]"
                      }`}
                    >
                      <span>{sortBy}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          isDark ? "text-white/45" : "text-black/40"
                        } ${
                          isSortMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isSortMenuOpen ? (
                      <div
                        className={`absolute right-0 top-12 z-20 w-[137px] rounded-xl border p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)] ${
                          isDark
                            ? "border-white/10 bg-[#171717]"
                            : "border-black/10 bg-white"
                        }`}
                      >
                        <div>
                          <p className={`mb-1 text-[12px] ${isDark ? "text-white/35" : "text-black/35"}`}>Sort by</p>
                          <div className="">
                            {(["Last viewed", "Date created", "Alphabetical"] as SortBy[]).map(
                              (option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    setSortBy(option);
                                    setIsSortMenuOpen(false);
                                  }}
                                  className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-[14px] transition ${
                                    isDark
                                      ? "text-white hover:bg-white/8"
                                      : "text-[#171717] hover:bg-black/[0.05]"
                                  }`}
                                >
                                  <span>{option}</span>
                                  {sortBy === option ? <Check size={15} /> : null}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        <div className={`my-2 border-t ${isDark ? "border-white/10" : "border-black/10"}`} />

                        <div>
                          <p className={`mb-1 text-[12px] ${isDark ? "text-white/35" : "text-black/35"}`}>Order by</p>
                          <div className="">
                            {(["Newest first", "Oldest first"] as OrderBy[]).map(
                              (option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    setOrderBy(option);
                                    setIsSortMenuOpen(false);
                                  }}
                                  className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-[14px] transition ${
                                    isDark
                                      ? "text-white hover:bg-white/8"
                                      : "text-[#171717] hover:bg-black/[0.05]"
                                  }`}
                                >
                                  <span>{option}</span>
                                  {orderBy === option ? <Check size={15} /> : null}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="relative cursor-pointer">
                    {showVisibilityTooltip ? (
                      <div className="pointer-events-none cursor-pointer absolute bottom-[calc(100%+12px)] left-1/2 z-20 -translate-x-1/2">
                        <div className="relative whitespace-nowrap rounded-lg bg-white px-3 py-1 text-[11px] font-medium text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                          {visibilityTooltipLabel}
                          <div className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1 rotate-45 bg-white" />
                        </div>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border px-2.5 transition ${
                        isDark
                          ? "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/8 hover:text-white"
                          : "border-black/10 bg-white text-black/45 hover:bg-black/[0.05] hover:text-[#171717]"
                      }`}
                      aria-label={visibilityTooltipLabel}
                      onMouseEnter={() => setShowVisibilityTooltip(true)}
                      onMouseLeave={() => setShowVisibilityTooltip(false)}
                      onClick={() => {
                        setShowEmptyProjects((current) => !current);
                        showTooltipBriefly();
                      }}
                    >
                      {showEmptyProjects ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                {(activeTab === "Projects" || activeTab === "Templates") &&
                !isLoadingProjects &&
                ((activeTab === "Projects" &&
                  visibleCards.length === 1 &&
                  visibleCards[0]?.variant === "new") ||
                  (activeTab === "Templates" && visibleCards.length === 0)) ? (
                  activeTab === "Projects" ? (
                    <EmptyWorkflowState isDark={isDark} />
                  ) : (
                    <div className={`rounded-[28px] border px-6 py-10 ${isDark ? "border-white/8 bg-white/[0.02] text-white/72" : "border-black/8 bg-black/[0.02] text-black/70"}`}>
                      <p className={`text-xl font-medium ${isDark ? "text-white" : "text-[#171717]"}`}>
                        No templates yet.
                      </p>
                      <p className={`mt-2 max-w-[520px] text-[16px] leading-7 ${isDark ? "text-white/50" : "text-black/50"}`}>
                        Shared starter workflows will appear here for everyone.
                      </p>
                    </div>
                  )
                ) : activeTab === "Projects" && isLoadingProjects ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`loading-${index}`} className="animate-pulse">
                        <div className={`aspect-[2/1.33] rounded-md ${isDark ? "bg-white/6" : "bg-black/6"}`} />
                        <div className={`mt-3 h-4 w-28 rounded ${isDark ? "bg-white/8" : "bg-black/8"}`} />
                        <div className={`mt-2 h-3 w-20 rounded ${isDark ? "bg-white/6" : "bg-black/6"}`} />
                      </div>
                    ))}
                  </div>
                ) : visibleCards.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {visibleCards.map((card) => (
                      <Link
                        key={card.id}
                        href={card.href}
                        className="group flex w-full flex-col items-start gap-3 transition hover:translate-y-[-2px]"
                      >
                        <ProjectThumbnail variant={card.variant} isDark={isDark} />
                        <div className="flex flex-col gap-0.5">
                          <h2 className={`line-clamp-1 text-base font-medium tracking-[-0.03em] ${isDark ? "text-white" : "text-[#171717]"}`}>
                            {card.title}
                          </h2>
                          <p className={`text-xs ${isDark ? "text-white/46" : "text-black/45"}`}>
                            {card.subtitle}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className={`rounded-[28px] border px-6 py-10 ${isDark ? "border-white/8 bg-white/[0.02] text-white/72" : "border-black/8 bg-black/[0.02] text-black/70"}`}>
                    <p className={`text-xl font-medium ${isDark ? "text-white" : "text-[#171717]"}`}>
                      No matching workflows yet.
                    </p>
                    <p className={`mt-2 max-w-[520px] text-[16px] leading-7 ${isDark ? "text-white/50" : "text-black/50"}`}>
                      {activeTab === "Projects"
                        ? "Try a different search, or start a new workflow from the blank canvas and it will appear here once saved."
                        : `No ${activeTab.toLowerCase()} available yet.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
