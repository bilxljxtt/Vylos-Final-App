"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function FileDropzone({ onFileSelect, isLoading }: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative h-64 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center p-8 text-center ${
        dragActive 
          ? "border-primary bg-primary/5 scale-[0.99] shadow-inner" 
          : "border-border-main bg-bg hover:border-primary/50"
      } ${isLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !isLoading && document.getElementById("file-upload")?.click()}
    >
      <input
        id="file-upload"
        type="file"
        multiple={false}
        onChange={handleChange}
        accept=".csv,.xlsx,.xls,.pdf,.txt,.docx"
        className="hidden"
      />

      <div className={`p-4 rounded-full mb-4 ${dragActive ? "bg-primary text-white" : "bg-border-subtle text-text-muted"}`}>
        <Upload className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-text-main mb-2">
        {isLoading ? "Processing Financial Data..." : "Upload Bank Statement"}
      </h3>
      <p className="text-sm text-text-muted max-w-xs leading-relaxed">
        Drag and drop your statement here, or click to browse.
        <br />
        <span className="text-[10px] uppercase font-black tracking-widest mt-2 block opacity-60">
          CSV · EXCEL · PDF · TXT · WORD
        </span>
      </p>

      {isLoading && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-border-subtle overflow-hidden rounded-b-[2rem]">
          <div className="h-full bg-primary animate-progress-indeterminate" />
        </div>
      )}
    </div>
  );
}
