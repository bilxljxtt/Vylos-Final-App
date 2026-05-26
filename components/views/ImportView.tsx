"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Table, Settings2, Trash2, X } from "lucide-react";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { ToastType } from "../Toast";
import { ViewContainer } from "../ui/ViewContainer";
import { ParserService, RawParsedData } from "@/lib/services/import/ParserService";
import { ImportService, ColumnMapping, ImportPreviewTransaction } from "@/lib/services/import/ImportService";

interface ImportViewProps {
  showToast: (msg: string, type?: ToastType) => void;
  importPreview: ImportPreviewTransaction[] | null;
  setImportPreview: (preview: ImportPreviewTransaction[] | null) => void;
  confirmImport: () => void;
}

type ImportStage = "upload" | "mapping" | "preview";

export const ImportView: React.FC<ImportViewProps> = ({ 
  showToast, 
  importPreview, 
  setImportPreview, 
  confirmImport
}) => {
  const { state, formatCurrency } = useAppStore();
  const [stage, setStage] = useState<ImportStage>(importPreview ? "preview" : "upload");
  const [drag, setDrag] = useState(false);
  const [rawData, setRawData] = useState<RawParsedData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({ date: "", merchant: "", amount: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await ParserService.getRawData(file);
      if (data.headers.length === 0) {
        showToast("No data found in file", "error");
        return;
      }
      setRawData(data);
      const suggested = ImportService.suggestMapping(data.headers);
      setMapping(suggested);
      
      // If auto-detection is fully successful, we can skip to preview, 
      // but let's show mapping UI anyway for better control as requested.
      setStage("mapping");
    } catch (err) {
      showToast("Failed to parse file", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyMapping = async () => {
    if (!rawData || !mapping.date || !mapping.merchant || (!mapping.amount && (!mapping.debit || !mapping.credit))) {
      showToast("Please map all required fields", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const results = await ImportService.processRawData(rawData.rows, mapping, state.transactions);
      setImportPreview(results);
      setStage("preview");
    } catch (err) {
      showToast("Error processing data", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderUpload = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-500">
      <div 
        onDragOver={e => { e.preventDefault(); setDrag(true); }} 
        onDragLeave={() => setDrag(false)} 
        onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
        className={`
          lg:col-span-2 vylos-glass-readable p-8 sm:p-20 text-center transition-all duration-500 flex flex-col items-center justify-center !rounded-[1.5rem] sm:!rounded-[3rem]
          ${drag ? "!border-primary !bg-primary/5 scale-[0.98] shadow-2xl shadow-primary/10" : "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"}
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-border-main rounded-[1.2rem] sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner ring-1 ring-white/10 group">
          <Upload className={`w-8 h-8 sm:w-10 sm:h-10 ${drag ? "text-primary" : "text-text-muted opacity-30"} transition-all group-hover:scale-110 group-hover:text-primary group-hover:opacity-100`} />
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-black text-text-main mb-3 tracking-tighter">Import Transactions</h3>
        <p className="text-sm sm:text-base font-medium text-text-muted mb-8 sm:mb-10 max-w-sm mx-auto">Upload your CSV or Excel bank statement. We'll help you map the columns to Vylos.</p>
        
        <label className="inline-flex items-center gap-2.5 sm:gap-3 bg-primary hover:bg-emerald-400 text-white font-black px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all cursor-pointer select-none active:scale-95 text-xs sm:text-sm">
          {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={16} sm-size={20} strokeWidth={3} />}
          {isProcessing ? "Analyzing..." : "Choose Statement"}
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            className="hidden" 
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
          />
        </label>
      </div>

      <div className="flex flex-col gap-6">
        <div className="vylos-glass-readable p-6 sm:p-8 !rounded-[1.5rem] sm:!rounded-[2.5rem]">
          <h4 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4">Supported Formats</h4>
          <ul className="space-y-3">
            {["Standard CSV", "Excel Sheets (.xlsx)", "Standard Bank Formats"].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs font-bold text-text-main">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="vylos-glass-readable p-6 sm:p-8 !rounded-[1.5rem] sm:!rounded-[2.5rem] flex-1">
          <h4 className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">Pro Tip</h4>
          <p className="text-xs font-medium text-text-muted leading-relaxed">
            Ensure your file has headers in the first row for the best experience. Vylos will try to auto-detect them.
          </p>
        </div>
      </div>
    </div>
  );

  const renderMapping = () => (
    <div className="vylos-glass-readable !rounded-[1.5rem] sm:!rounded-[3rem] p-5 sm:p-10 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-text-main tracking-tighter">Map your data</h3>
          <p className="text-xs sm:text-sm font-medium text-text-muted">Tell us which columns contain your transaction details.</p>
        </div>
        <button 
          onClick={() => setStage("upload")}
          className="p-2 sm:p-3 text-text-muted hover:text-red-500 transition-colors"
        >
          <X size={20} sm-size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block pl-2">Date Column</label>
            <select 
              value={mapping.date}
              onChange={e => setMapping({ ...mapping, date: e.target.value })}
              className="w-full bg-border-main/20 border border-border-main rounded-2xl p-4 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              <option value="">Select Column...</option>
              {rawData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block pl-2">Description / Merchant</label>
            <select 
              value={mapping.merchant}
              onChange={e => setMapping({ ...mapping, merchant: e.target.value })}
              className="w-full bg-border-main/20 border border-border-main rounded-2xl p-4 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              <option value="">Select Column...</option>
              {rawData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block pl-2">Amount Strategy</label>
               <button 
                onClick={() => setMapping({ ...mapping, amount: "", debit: "", credit: "" })}
                className="text-[10px] font-black text-primary uppercase tracking-widest"
               >
                Toggle Mode
               </button>
            </div>
            
            {mapping.amount !== undefined ? (
              <select 
                value={mapping.amount}
                onChange={e => setMapping({ ...mapping, amount: e.target.value, debit: "", credit: "" })}
                className="w-full bg-border-main/20 border border-border-main rounded-2xl p-4 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option value="">Select Single Amount Column...</option>
                {rawData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={mapping.debit}
                  onChange={e => setMapping({ ...mapping, debit: e.target.value, amount: "" })}
                  className="bg-border-main/20 border border-border-main rounded-2xl p-4 text-sm font-bold text-text-main outline-none"
                >
                  <option value="">Debit...</option>
                  {rawData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select 
                  value={mapping.credit}
                  onChange={e => setMapping({ ...mapping, credit: e.target.value, amount: "" })}
                  className="bg-border-main/20 border border-border-main rounded-2xl p-4 text-sm font-bold text-text-main outline-none"
                >
                  <option value="">Credit...</option>
                  {rawData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block pl-2">Category (Optional)</label>
            <select 
              value={mapping.category || ""}
              onChange={e => setMapping({ ...mapping, category: e.target.value })}
              className="w-full bg-border-main/20 border border-border-main rounded-2xl p-4 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              <option value="">Auto-categorize (None)</option>
              {rawData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-border-main/10 rounded-[2rem] p-8 border border-border-main flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Table size={18} className="text-text-muted" />
            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-widest">Data Preview (First 5 rows)</h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {rawData?.headers.slice(0, 4).map(h => (
                    <th key={h} className="text-[9px] font-black text-text-muted uppercase tracking-widest pb-4 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawData?.rows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {rawData?.headers.slice(0, 4).map(h => (
                      <td key={h} className="text-[10px] font-bold text-text-main py-2 pr-4 truncate max-w-[100px]">{String(row[h])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button 
            onClick={handleApplyMapping}
            disabled={isProcessing}
            className="mt-8 w-full bg-primary hover:bg-emerald-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Settings2 size={20} />}
            Process with mapping
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="vylos-glass-readable !rounded-[1.5rem] sm:!rounded-[3rem] shadow-2xl flex flex-col max-h-[calc(100vh-200px)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="p-5 sm:p-10 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-white/5 dark:bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-text-main tracking-tighter">Review synchronization</h3>
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">{(importPreview || []).length} records staging for commit</p>
          </div>

          <div className="flex items-center gap-6 border-l border-border-main pl-6 sm:pl-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Duplicates Skipped</span>
              <span className="text-lg font-black text-amber-500">{(importPreview || []).filter(tx => tx.isDuplicate).length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Net New</span>
              <span className="text-lg font-black text-primary">{(importPreview || []).filter(tx => !tx.isDuplicate).length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => { setImportPreview(null); setStage("upload"); }}
            className="flex-1 md:flex-initial px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.2rem] text-sm font-black text-text-muted hover:text-text-main transition-colors border border-border-main hover:bg-border-main/50"
          >
            Discard
          </button>
          <button 
            onClick={confirmImport}
            className="flex-1 md:flex-initial px-8 sm:px-10 py-3.5 sm:py-4 bg-primary hover:bg-emerald-400 text-white font-black rounded-[1.2rem] shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Confirm Stream <CheckCircle2 size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {(importPreview || []).map((tx, i) => (
            <div key={i} className={`flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-4 sm:py-6 border-b border-border-main/50 transition-colors group ${tx.isDuplicate ? 'opacity-40 bg-card' : 'hover:bg-primary/[0.02]'}`}>
              <div 
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl shadow-inner transition-transform shrink-0 ${!tx.isDuplicate && 'group-hover:scale-105'}`}
                style={{ backgroundColor: `${CATEGORY_METADATA[tx.cat as TransactionCategory]?.color || '#888'}15` }}
              >
                {tx.isDuplicate ? <AlertCircle size={20} className="text-amber-500 sm:hidden" /> : (CATEGORY_METADATA[tx.cat as TransactionCategory]?.icon || "📦")}
                {tx.isDuplicate ? <AlertCircle size={24} className="text-amber-500 hidden sm:block" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={`text-[13px] sm:text-base font-black truncate tracking-tight ${tx.isDuplicate ? 'text-text-muted line-through' : 'text-text-main'}`}>{tx.desc}</div>
                  {tx.isDuplicate && <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">Dup</span>}
                </div>
                <div className="text-[10px] sm:text-[11px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5 sm:gap-3 mt-1">
                  <span>{tx.date}</span>
                  <span className="w-1 h-1 rounded-full bg-border-main" />
                  <span className="truncate" style={{ color: CATEGORY_METADATA[tx.cat as TransactionCategory]?.color }}>{tx.cat}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-8 shrink-0 ml-3">
                <div className={`text-[13px] sm:text-lg font-black tracking-tighter ${tx.isDuplicate ? 'text-text-muted' : (tx.amount > 0 ? "text-primary" : "text-red-500")}`}>
                  {formatCurrency(tx.amount)}
                </div>
                <button 
                  onClick={() => setImportPreview((importPreview || []).filter((_, idx) => idx !== i))}
                  className="p-1.5 sm:p-2 text-text-muted hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0"
                >
                  <Trash2 size={16} className="sm:hidden" />
                  <Trash2 size={18} className="hidden sm:block" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ViewContainer className="flex flex-col gap-10 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted mt-3 uppercase tracking-widest text-[10px] opacity-60">
            {stage === "upload" && "Batch synchronize financial data"}
            {stage === "mapping" && "Configure data mapping"}
            {stage === "preview" && "Validate data stream"}
          </p>
        </div>
      </div>

      {stage === "upload" && renderUpload()}
      {stage === "mapping" && renderMapping()}
      {stage === "preview" && renderPreview()}
    </ViewContainer>
  );
};
