"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { ToastType } from "../Toast";

interface ImportViewProps {
  handleCSV: (text: string) => void;
  handleImportResults: (txs: any[]) => void;
  showToast: (msg: string, type?: ToastType) => void;
  importPreview: any[] | null;
  setImportPreview: (preview: any[] | null) => void;
  confirmImport: () => void;
  processFile: (file: File) => Promise<void>;
}

import { ViewContainer } from "../ui/ViewContainer";

export const ImportView: React.FC<ImportViewProps> = ({ 
  handleCSV, 
  handleImportResults, 
  showToast, 
  importPreview, 
  setImportPreview, 
  confirmImport,
  processFile
}) => {
  const { formatCurrency } = useAppStore();
  const [drag, setDrag] = useState(false);
  const SAMPLE_CSV = `Date,Description,Amount,Category\n2026-04-18,Shoprite Grocery,-560,Food\n2026-04-17,Uber Pool,-95,Transport\n2026-04-16,Salary,38500,Income\n2026-04-15,Netflix,-199,Entertainment\n2026-04-14,Vodacom,-299,Bills`;

  return (
    <ViewContainer className="flex flex-col gap-10 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted mt-3 uppercase tracking-widest text-[10px] opacity-60">Batch synchronize financial data</p>
        </div>
      </div>

      {!importPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div 
            onDragOver={e => { e.preventDefault(); setDrag(true); }} 
            onDragLeave={() => setDrag(false)} 
            onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
            className={`
              lg:col-span-2 vylos-glass-readable p-20 text-center transition-all duration-500 flex flex-col items-center justify-center !rounded-[3rem]
              ${drag ? "!border-primary !bg-primary/5 scale-[0.98] shadow-2xl shadow-primary/10" : "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"}
            `}
          >
            <div className="w-24 h-24 bg-border-main rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-white/10 group">
              <Upload className={`w-10 h-10 ${drag ? "text-primary" : "text-text-muted opacity-30"} transition-all group-hover:scale-110 group-hover:text-primary group-hover:opacity-100`} />
            </div>
            
            <h3 className="text-3xl font-black text-text-main mb-3 tracking-tighter">Synchronize Assets</h3>
            <p className="text-base font-medium text-text-muted mb-10 max-w-sm mx-auto">Drop your CSV, Excel, or PDF bank statement. Neural parsing will extract the records instantly.</p>
            
            <label className="inline-flex items-center gap-3 bg-primary hover:bg-emerald-400 text-white font-black px-12 py-5 rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all cursor-pointer select-none ring-offset-bg focus-within:ring-4 focus-within:ring-primary/40 active:scale-95">
              <FileText size={20} strokeWidth={3} />
              Browse Data Streams
              <input 
                type="file" 
                accept=".csv,.xlsx,.xls,.txt" 
                className="hidden" 
                onChange={e => {
                  if (e.target.files?.[0]) {
                    processFile(e.target.files[0]);
                    e.target.value = "";
                  }
                }} 
              />
            </label>
          </div>

          <div className="flex flex-col gap-8">
             <div className="vylos-glass-readable p-8 !rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                   <CheckCircle2 size={20} className="text-primary" />
                   <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Compliance Ready</h4>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                   All imports are secured with end-to-end encryption. No PII is stored in the neural index.
                </p>
             </div>

             <div className="vylos-glass-readable p-8 !rounded-[2.5rem] flex flex-col flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-60">Schema Preview</h4>
                  <button 
                    onClick={() => {
                      const file = new File([SAMPLE_CSV], "vylos-sample.csv", { type: "text/csv" });
                      processFile(file);
                    }}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Quick Load
                  </button>
                </div>
                <div className="bg-border-main/40 p-6 rounded-2xl border border-border-main flex-1">
                  <pre className="text-[10px] font-mono text-text-muted/60 whitespace-pre-wrap leading-relaxed">
                    {SAMPLE_CSV}
                  </pre>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="vylos-glass-readable !rounded-[2.5rem] shadow-2xl flex flex-col max-h-[calc(100vh-200px)] overflow-hidden">
          <div className="p-10 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/5 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-10">
              <div>
                <h3 className="text-2xl font-black text-text-main tracking-tighter">Review synchronization</h3>
                <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">{importPreview.length} records staging for commit</p>
              </div>

              <div className="hidden lg:flex items-center gap-6 border-l border-border-main pl-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Duplicates Skipped</span>
                  <span className="text-lg font-black text-amber-500">{importPreview.filter(tx => tx.isDuplicate).length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Net New</span>
                  <span className="text-lg font-black text-primary">{importPreview.filter(tx => !tx.isDuplicate).length}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setImportPreview(null)}
                className="px-8 py-4 rounded-[1.2rem] text-sm font-black text-text-muted hover:text-text-main transition-colors border border-border-main hover:bg-border-main/50"
              >
                Discard
              </button>
              <button 
                onClick={confirmImport}
                className="px-10 py-4 bg-primary hover:bg-emerald-400 text-white font-black rounded-[1.2rem] shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
              >
                Confirm Stream <CheckCircle2 size={18} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col">
              {importPreview.map((tx: any, i: number) => (
                <div key={i} className={`flex items-center gap-6 px-10 py-6 border-b border-border-main/50 transition-colors group ${tx.isDuplicate ? 'opacity-40 bg-card' : 'hover:bg-primary/[0.02]'}`}>
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform ${!tx.isDuplicate && 'group-hover:scale-105'}`}
                    style={{ backgroundColor: `${CATEGORY_METADATA[tx.cat as TransactionCategory]?.color || '#888'}15` }}
                  >
                    {tx.isDuplicate ? <AlertCircle size={24} className="text-amber-500" /> : (CATEGORY_METADATA[tx.cat as TransactionCategory]?.icon || "📦")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`text-base font-black truncate tracking-tight ${tx.isDuplicate ? 'text-text-muted line-through' : 'text-text-main'}`}>{tx.desc}</div>
                      {tx.isDuplicate && <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Duplicate</span>}
                    </div>
                    <div className="text-[11px] font-black text-text-muted uppercase tracking-widest flex items-center gap-3 mt-1">
                      <span>{tx.date}</span>
                      <span className="w-1 h-1 rounded-full bg-border-main" />
                      <span style={{ color: CATEGORY_METADATA[tx.cat as TransactionCategory]?.color }}>{tx.cat}</span>
                    </div>
                  </div>
                  <div className={`text-lg font-black tracking-tighter ${tx.isDuplicate ? 'text-text-muted' : (tx.amount > 0 ? "text-primary" : "text-red-500")}`}>
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ViewContainer>
  );
};
