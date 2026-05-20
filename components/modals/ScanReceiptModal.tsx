"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle2, AlertCircle, FileText, Loader2, Image as ImageIcon } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { useToast } from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  transactionId?: string; // Optional: Link directly to a transaction on upload
}

export function ScanReceiptModal({ isOpen, onClose, onUploadSuccess, transactionId }: ScanReceiptModalProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Esc key closure & restore scroll
  useEffect(() => {
    if (!isOpen) return;
    
    // Ensure body scroll is managed properly
    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Clean up simulated progress ticks
  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopProgressSimulation();
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    stopProgressSimulation();
    setFile(null);
    setPreviewUrl("");
    setUploading(false);
    setUploadProgress(0);
    setUploadSuccess(false);
    setErrorMsg("");
    document.body.style.overflow = "unset";
    onClose();
  };

  // Helper to format clean merchant names from filenames
  const getMerchantSuggestion = (filename: string): string => {
    // Strip extension
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    // Replace hyphens/underscores/special chars with spaces
    return baseName
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Handle file validation
  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg("");
    
    // 10MB size limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size allowed is 10MB.");
      return;
    }

    // Supported MIME types: JPG, PNG, WEBP, PDF
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMsg("Unsupported format. Please select a JPG, PNG, WebP image or PDF document.");
      return;
    }

    setFile(selectedFile);
    
    // Create preview only for images
    if (selectedFile.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(""); // PDFs will use a fallback document icon
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const startProgressSimulation = () => {
    setUploadProgress(0);
    stopProgressSimulation();
    
    progressIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          stopProgressSimulation();
          return 90; // Wait at 90% until server resolution
        }
        const step = prev < 50 ? 15 : prev < 75 ? 8 : 4;
        return prev + step;
      });
    }, 150);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    startProgressSimulation();

    try {
      const supabase = createClient();

      // 1. Fetch current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Authentication failed. Please log in and try again.");
      }

      // 2. Generate secure UUIDs and clean file path
      const receiptId = crypto.randomUUID();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Target path: receipts/{user_id}/{receipt_id}/{filename}
      const storagePath = `receipts/${user.id}/${receiptId}/${cleanFilename}`;

      // 3. Upload file directly to Supabase Storage private bucket
      const { error: storageError } = await supabase.storage
        .from("receipts")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw new Error("Failed to save file to Supabase storage. Verify storage bucket permissions.");
      }

      // 4. Save metadata record directly to receipts table
      const merchantNameSuggestion = getMerchantSuggestion(file.name);
      
      const { error: insertError } = await supabase
        .from("receipts")
        .insert({
          id: receiptId,
          user_id: user.id,
          transaction_id: transactionId || null,
          file_path: storagePath,
          file_type: file.type,
          file_size: file.size,
          source: "manual_upload",
          status: "uploaded",
          merchant_name: merchantNameSuggestion,
          amount: null,
          receipt_date: new Date().toISOString().split("T")[0]
        });

      if (insertError) {
        console.error("Database insert error:", insertError);
        // Rollback uploaded file on DB insert failure
        await supabase.storage.from("receipts").remove([storagePath]);
        throw new Error("Failed to register receipt record in database.");
      }

      // ====================================================================
      // 🌟 FUTURE OCR INTEGRATION PLACEHOLDER
      // ====================================================================
      // When adding automated OCR parsing:
      // 1. Trigger an asynchronous Serverless Function / Edge Route
      //    e.g., fetch('/api/receipt-ocr', { method: 'POST', body: JSON.stringify({ receiptId }) })
      // 2. OCR process will extract:
      //    - merchant: parsed merchant string -> cleanMerchantName()
      //    - total amount: parsed numeric total
      //    - date: parsed date -> YYYY-MM-DD
      //    - VAT/Tax: extracted tax values
      //    - category suggestion: LLM/Regex classification based on merchant
      // 3. Match with transaction:
      //    - If transactionId is missing, query user transactions with similar amount + date (+- 3 days)
      //    - If match found, update receipts.transaction_id. If multiple, suggest matching.
      // ====================================================================

      stopProgressSimulation();
      setUploadProgress(100);
      setUploadSuccess(true);
      toast("Receipt uploaded and registered successfully!", "success");
      
      // Refresh list immediately
      onUploadSuccess();

      // Automatically close modal after 1.8 seconds
      setTimeout(() => {
        handleClose();
      }, 1800);

    } catch (err: any) {
      console.error("Upload process crashed:", err);
      stopProgressSimulation();
      setUploadProgress(0);
      setErrorMsg(err.message || "An unexpected error occurred during receipt upload.");
      toast(err.message || "Failed to upload receipt", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer" onClick={handleClose} />
        
        {/* Modal Window Container */}
        <div className="relative vylos-modal-glass w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh]">
          {/* Top glow border decoration */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="p-8 relative overflow-y-auto flex-1 custom-scrollbar">
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-main hover:bg-border-main/50 rounded-xl transition-all z-20"
              title="Close modal"
              disabled={uploading}
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center gap-6">
              {/* Dynamic status header icon */}
              {uploadSuccess ? (
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce">
                  <CheckCircle2 size={36} strokeWidth={2.5} />
                </div>
              ) : errorMsg ? (
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <AlertCircle size={36} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Upload size={32} strokeWidth={2.5} />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-text-main tracking-tight">
                  {uploadSuccess 
                    ? "Upload Complete!" 
                    : transactionId 
                    ? "Link Transaction Receipt" 
                    : "Upload Receipt"
                  }
                </h3>
                <p className="text-xs font-bold text-text-muted max-w-[280px]">
                  {uploadSuccess 
                    ? "Your receipt is securely saved and synced directly to your dashboard."
                    : transactionId
                    ? "Attach an image or PDF receipt directly to this transaction record."
                    : "Upload your receipt photo to save it securely inside Vylos."
                  }
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-300 text-xs font-bold text-left animate-in shake duration-300">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Content Panel: File Drag/Drop & Capture or Success View */}
              {uploadSuccess ? (
                <div className="w-full h-64 bg-white/5 dark:bg-black/10 rounded-3xl border border-white/10 shadow-inner flex flex-col items-center justify-center gap-3 animate-in fade-in duration-500">
                  <CheckCircle2 size={64} className="text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Database Synced</span>
                </div>
              ) : (
                <div className="w-full">
                  {!file ? (
                    // Drag/Drop and File Picker Zone
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 select-none ${
                        dragActive 
                          ? "border-primary bg-primary/10 text-white scale-[1.01]" 
                          : "border-white/20 bg-white/5 hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/30 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                        <Upload size={24} strokeWidth={2.5} />
                      </div>
                      <div className="text-center px-4">
                        <span className="text-xs font-black uppercase tracking-widest block">Choose Receipt File</span>
                        <span className="text-[10px] font-bold text-slate-400 block mt-1">Drag & drop or tap to upload</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mt-2">
                          JPG, PNG, WEBP, PDF up to 10MB
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Preview Card for Selected File
                    <div className="relative w-full rounded-3xl overflow-hidden border border-white/20 shadow-xl bg-black/40 h-64 flex items-center justify-center">
                      {file.type.startsWith("image/") ? (
                        <img 
                          src={previewUrl} 
                          alt="Receipt Preview" 
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <FileText size={36} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest">PDF Document</span>
                        </div>
                      )}

                      {/* Reset button to clear selected file */}
                      {!uploading && (
                        <button
                          onClick={() => { setFile(null); setPreviewUrl(""); }}
                          className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-center">
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selected File</span>
                          <span className="text-xs font-black text-white truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded shrink-0">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hidden native input with camera capture */}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    onChange={handleChange}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    capture="environment"
                    className="hidden" 
                  />
                </div>
              )}

              {/* Instructions Box */}
              {!uploadSuccess && (
                <div className="w-full p-4 bg-primary/5 border border-primary/10 rounded-2xl text-left space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary block">
                    💡 Phone Capture Hack
                  </span>
                  <p className="text-[10px] font-bold text-slate-300 leading-tight">
                    For easiest upload, open Vylos on your phone and tap this button to snap a receipt photo instantly!
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              {!uploadSuccess && (
                <div className="w-full flex flex-col gap-3 mt-2">
                  {file ? (
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full py-4.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <span>Uploading {uploadProgress}%</span>
                          <Loader2 size={16} className="animate-spin" />
                        </>
                      ) : (
                        <>
                          <span>Upload & Link</span>
                          <Upload size={16} />
                        </>
                      )}
                    </button>
                  ) : null}

                  {!uploading && (
                    <button
                      onClick={handleClose}
                      className="w-full py-4 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/5 text-text-main font-black rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {/* Progress bar */}
              {uploading && (
                <div className="w-full space-y-2 animate-in fade-in duration-300">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Uploading receipt file</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
