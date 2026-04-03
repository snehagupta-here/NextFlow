"use client";

import React, { useRef } from "react";
import { Download, Upload } from "lucide-react";

type ImportExportControlsProps = {
  isDark: boolean;
  onExportJson: () => void;
  onImportJson: (file: File) => void | Promise<void>;
};

const ImportExportControls = ({
  isDark,
  onExportJson,
  onImportJson,
}: ImportExportControlsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pillButtonClass = `inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition shadow-xl backdrop-blur ${
    isDark
      ? "border-white/10 bg-black/90 text-zinc-100 hover:bg-[#101010]"
      : "border-zinc-200 bg-white/95 text-zinc-900 hover:bg-zinc-100"
  }`;

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onImportJson(file);
    event.target.value = "";
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

      <button type="button" onClick={onExportJson} className={pillButtonClass}>
        <Download size={16} />
        Export JSON
      </button>

      <button type="button" onClick={handlePickFile} className={pillButtonClass}>
        <Upload size={16} />
        Import JSON
      </button>
    </>
  );
};

export default ImportExportControls;
