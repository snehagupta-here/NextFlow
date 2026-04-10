"use client";

import React, { useRef } from "react";
import { Download, Upload } from "lucide-react";

type ImportExportControlsProps = {
  isDark: boolean;
  onExportJson: () => void;
  onImportJson: (file: File) => void | Promise<void>;
  onRequestClose?: () => void;
};   

const ImportExportControls = ({
  isDark,
  onExportJson,
  onImportJson,   
  onRequestClose,
}: ImportExportControlsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pillButtonClass = `inline-flex h-10 cursor-pointer items-center gap-3 rounded-xl px-4 text-[12px] font-medium transition ${
    isDark
      ? "bg-transparent text-zinc-100 hover:bg-[#141414]"
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

      <button type="button" onClick={handlePickFile} className={`${pillButtonClass} w-full justify-start`}>
        <Upload size={14} />
        Import JSON
      </button>

      <button type="button" onClick={handleExport} className={`${pillButtonClass} w-full justify-start`}>
        <Download size={14} />
        Export JSON
      </button>
    </>
  );
};

export default ImportExportControls;
