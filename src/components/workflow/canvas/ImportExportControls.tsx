"use client";

import React, { useRef } from "react";
import { Download, Upload } from "lucide-react";

type ImportExportControlsProps = {
  isDark: boolean;
  onExportJson: () => void;
  onImportJson: (file: File) => void | Promise<void>;
  onRequestClose?: () => void;
  layout?: "row" | "column";
  iconOnly?: boolean;
};

const ImportExportControls = ({
  isDark,
  onExportJson,
  onImportJson,
  onRequestClose,
  layout = "column",
  iconOnly = false,
}: ImportExportControlsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pillButtonClass = `inline-flex h-10 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-[13px] font-medium transition ${
    isDark
      ? "border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]"
      : "border-black/10 bg-white/80 text-zinc-900 hover:bg-white"
  }`;
  const iconButtonClass = `flex h-10 w-10 items-center justify-center rounded-xl border transition ${
    isDark
      ? "border-transparent bg-transparent text-zinc-100 hover:bg-white/[0.1]"
      : "border-transparent bg-transparent text-zinc-100 hover:bg-white/10"
  }`;
  const buttonWidthClass = layout === "row" ? "" : "w-full justify-start";
  const tooltipClass =
    "border-black/10 bg-white text-black shadow-[0_12px_32px_rgba(0,0,0,0.16)]";

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onImportJson(file);
    onRequestClose?.();
    event.target.value = "";
  };

  const handleExport = () => {
    onExportJson();
    onRequestClose?.();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      {iconOnly ? (
        <>
          <div className="group relative">
            <button
              type="button"
              onClick={handlePickFile}
              className={iconButtonClass}
              aria-label="Import JSON"
              title="Import JSON"
            >
              <Upload size={18} />
            </button>
            <div
              className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-[12px] font-medium opacity-0 transition duration-200 group-hover:opacity-100 md:block ${tooltipClass}`}
            >
              <div className="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1 rotate-45 border-l border-t border-black/10 bg-white" />
              Import JSON
            </div>
          </div>

          <div className="group relative">
            <button
              type="button"
              onClick={handleExport}
              className={iconButtonClass}
              aria-label="Export JSON"
              title="Export JSON"
            >
              <Download size={18} />
            </button>
            <div
              className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-[12px] font-medium opacity-0 transition duration-200 group-hover:opacity-100 md:block ${tooltipClass}`}
            >
              <div className="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1 rotate-45 border-l border-t border-black/10 bg-white" />
              Export JSON
            </div>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={handlePickFile}
            className={`${pillButtonClass} ${buttonWidthClass}`}
          >
            <Upload size={14} />
            Import JSON
          </button>

          <button
            type="button"
            onClick={handleExport}
            className={`${pillButtonClass} ${buttonWidthClass}`}
          >
            <Download size={14} />
            Export JSON
          </button>
        </>
      )}
    </>
  );
};

export default ImportExportControls;
