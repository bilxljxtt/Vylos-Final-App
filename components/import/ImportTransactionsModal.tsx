"use client";

import React, { useState } from "react";
import { Modal } from "../Modal";
import { FileDropzone } from "./FileDropzone";
import { ReviewTable } from "./ReviewTable";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "../Toast";
import { Check, ArrowRight, BrainCircuit, ShieldCheck, RefreshCw } from "lucide-react";

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportTransactionsModal({ isOpen, onClose }: ImportTransactionsModalProps) {
  const { sessionUser, state } = useAppStore();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"upload" | "review" | "success">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [updateRules, setUpdateRules] = useState(true);

  const handleFileSelect = async (file: File) => {
    if (!sessionUser) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", sessionUser.id);

    try {
      const res = await fetch("/api/import/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process file");

      setExtractedData(data.transactions);
      setStep("review");
      toast(`Successfully extracted ${data.transactions.length} transactions`, "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTx = (id: string, updates: any) => {
    setExtractedData(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  };

  const handleRemoveTx = (id: string) => {
    setExtractedData(prev => prev.filter(tx => tx.id !== id));
  };

  const handleFinalize = async () => {
    if (!sessionUser || extractedData.length === 0) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/import/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: extractedData,
          userId: sessionUser.id,
          updateRules,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save transactions");

      setStep("success");
      toast(`Imported ${data.count} transactions to your profile`, "success");
      
      // Refresh AppContext by essentially re-hydrating or letting the user know to refresh
      // In a real app, we'd trigger a reload of transactions from Supabase here
      setTimeout(() => {
        window.location.reload(); // Quickest way to sync everything
      }, 2000);

    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !isProcessing && onClose()} 
      title={step === "upload" ? "Automated Transaction Import" : step === "review" ? "Review & Categorize" : "Import Successful"}
      maxWidth={step === "review" ? "max-w-5xl" : "max-w-xl"}
    >
      <div className="space-y-6">
        {step === "upload" && (
          <>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
              <BrainCircuit className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-xs text-text-main leading-relaxed">
                Vylos AI intelligently extracts dates, merchants, and amounts from any bank statement. 
                Upload a CSV or PDF to begin.
              </p>
            </div>
            <FileDropzone onFileSelect={handleFileSelect} isLoading={isProcessing} />
          </>
        )}

        {step === "review" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-main">
                  {extractedData.length} Rows Extracted
                </h4>
                <p className="text-xs text-text-muted mt-0.5">Please verify the categories before finalising.</p>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={updateRules}
                      onChange={() => setUpdateRules(!updateRules)}
                    />
                    <div className="w-10 h-5 bg-border-main rounded-full peer-checked:bg-primary transition-colors" />
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                  </div>
                  <span className="text-xs font-bold text-text-muted group-hover:text-text-main transition-colors">Learn these mappings</span>
                </label>
              </div>
            </div>

            <ReviewTable 
              transactions={extractedData} 
              onUpdate={handleUpdateTx} 
              onRemove={handleRemoveTx} 
            />

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => !isProcessing && setStep("upload")} 
                className="px-6 py-3 bg-bg border border-border-main text-text-main font-bold rounded-2xl text-sm hover:bg-border-subtle"
              >
                Back
              </button>
              <button 
                onClick={handleFinalize}
                disabled={isProcessing || extractedData.length === 0}
                className="px-8 py-3 bg-primary text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isProcessing ? "Processing..." : "Finalize Import"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-text-main mb-2">Import Finished!</h3>
            <p className="text-text-muted text-sm max-w-xs leading-relaxed mb-8">
              Your dashboard is synchronising now. Your future imports for these merchants will be auto-categorised.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
