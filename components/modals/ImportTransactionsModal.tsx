"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Trash2, Edit3, Loader2, ChevronDown } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { useAppStore } from "@/lib/AppContext";
import { TransactionCategory, TRANSACTION_CATEGORIES, generateId } from "@/lib/store";
import { CategorizationEngine } from "@/lib/services/CategorizationEngine";
import { useToast } from "@/components/Toast";
import { V2Select } from "../ui/V2Select";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { VylosLoadingScreen } from "@/components/ui/VylosLoadingScreen";

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportedTransaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: TransactionCategory;
  type: "income" | "expense";
  account: string;
  notes: string;
  selected: boolean;
  warning?: string;
}

export function ImportTransactionsModal({ isOpen, onClose }: ImportTransactionsModalProps) {
  const { state, addTransaction, formatCurrency } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "processing">("upload");
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({
    date: "",
    merchant: "",
    amount: "",
    debit: "",
    credit: "",
    category: "",
    account: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("upload");
      setTransactions([]);
      setRawRows([]);
      setHeaders([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".pdf") || fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      handleParse(file);
    } else {
      setError("Unsupported file format. Please upload CSV, Excel, PDF, or Word files.");
      setLoading(false);
    }
  };

  const handleParse = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      const fileName = file.name.toLowerCase();
      let data: any[] = [];
      
      if (fileName.endsWith(".csv")) {
        data = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err)
          });
        });
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(sheet);
      } else if (fileName.endsWith(".pdf") || fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        // Simple mock/placeholder for PDF/Word text extraction until full parser is integrated
        // In a real app, this would call a server-side extraction API
        setError(`${fileName.split('.').pop()?.toUpperCase()} parsing is currently limited. For best results, convert to CSV or Excel. Attempting basic extraction...`);
        // Fallback to empty for now or try to extract text if libraries were available
        setLoading(false);
        return;
      }
      
      processRawData(data);
    } catch (err: any) {
      setError(`Failed to parse file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processRawData = (data: any[]) => {
    if (!data || data.length === 0) {
      setError("The file appears to be empty.");
      setLoading(false);
      return;
    }

    const fileHeaders = Object.keys(data[0]);
    setHeaders(fileHeaders);
    setRawRows(data);

    const DATE_HEADERS = ["date", "transaction date", "timestamp", "effective date", "transaction_date", "posting", "valuta"];
    const MERCHANT_HEADERS = ["description", "merchant", "title", "payee", "narrative", "merchant_name", "beneficiary", "reference", "memo", "info"];
    const AMOUNT_HEADERS = ["amount", "value", "transaction amount", "transaction value", "balance movement", "total", "rand value", "zar amount", "movement", "zar", "rand", "sum", "price"];
    const DEBIT_HEADERS = ["debit", "money out", "paid out", "withdrawal", "payment", "expenditure", "out", "spend", "expense", "debit amount"];
    const CREDIT_HEADERS = ["credit", "money in", "paid in", "deposit", "income", "in", "receipt", "credit amount"];

    // Auto-detection logic
    const detectedMapping = {
      date: fileHeaders.find(h => DATE_HEADERS.includes(h.trim().toLowerCase())) || fileHeaders.find(h => h.toLowerCase().includes("date")) || "",
      merchant: fileHeaders.find(h => MERCHANT_HEADERS.includes(h.trim().toLowerCase())) || fileHeaders.find(h => h.toLowerCase().includes("desc")) || "",
      amount: fileHeaders.find(h => AMOUNT_HEADERS.includes(h.trim().toLowerCase())) || fileHeaders.find(h => h.toLowerCase().includes("amount")) || "",
      debit: fileHeaders.find(h => DEBIT_HEADERS.includes(h.trim().toLowerCase())) || "",
      credit: fileHeaders.find(h => CREDIT_HEADERS.includes(h.trim().toLowerCase())) || "",
      category: fileHeaders.find(h => h.trim().toLowerCase() === "category" || h.toLowerCase().includes("cat")) || "",
      account: fileHeaders.find(h => h.trim().toLowerCase() === "account") || ""
    };

    setMapping(detectedMapping);

    // If we can't find crucial columns, go to mapping step
    if (!detectedMapping.date || !detectedMapping.merchant || (!detectedMapping.amount && (!detectedMapping.debit && !detectedMapping.credit))) {
      setStep("mapping");
      setLoading(false);
      return;
    }

    applyMapping(data, detectedMapping);
  };

  const cleanNumeric = (val: any): number | null => {
    if (val === undefined || val === null) return null;
    if (typeof val === 'number') return val;
    let s = String(val).trim();
    if (!s) return null;
    
    // Handle brackets for negatives (e.g. (250.00))
    let isNegative = false;
    if (s.startsWith('(') && s.endsWith(')')) {
      isNegative = true;
      s = s.substring(1, s.length - 1);
    }
    
    // Handle trailing CR/DR
    if (s.toLowerCase().endsWith('dr')) {
      isNegative = true;
      s = s.substring(0, s.length - 2).trim();
    } else if (s.toLowerCase().endsWith('cr')) {
      s = s.substring(0, s.length - 2).trim();
    }

    // Remove currency symbols (R, ZAR, $, £, €) and spaces
    let cleaned = s.replace(/[R\$£€ZAR\s]/gi, '');
    
    // Handle commas and dots
    if (cleaned.includes(',') && cleaned.includes('.')) {
      if (cleaned.indexOf(',') < cleaned.indexOf('.')) {
        cleaned = cleaned.replace(/,/g, ''); 
      } else {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      }
    } else if (cleaned.includes(',')) {
      const parts = cleaned.split(',');
      if (parts[parts.length - 1].length === 2) {
        cleaned = cleaned.replace(/,/g, '.');
      } else {
        cleaned = cleaned.replace(/,/g, '');
      }
    }

    const num = parseFloat(cleaned);
    if (isNaN(num)) return null;
    return isNegative ? -Math.abs(num) : num;
  };

  const applyMapping = (data: any[], colMapping: typeof mapping) => {
    try {
      const processed: ImportedTransaction[] = data.map((row: any) => {
        let amount = 0;
        let type: "income" | "expense" = "expense";
        let warning: string | undefined = undefined;

        if (colMapping.debit || colMapping.credit) {
          const debitVal = colMapping.debit ? cleanNumeric(row[colMapping.debit]) : null;
          const creditVal = colMapping.credit ? cleanNumeric(row[colMapping.credit]) : null;

          if (debitVal !== null && debitVal !== 0) {
            amount = -Math.abs(debitVal);
            type = "expense";
          } else if (creditVal !== null && creditVal !== 0) {
            amount = Math.abs(creditVal);
            type = "income";
          } else {
            amount = 0;
            warning = "Amount missing";
          }
        } else if (colMapping.amount) {
          const val = cleanNumeric(row[colMapping.amount]);
          if (val !== null) {
            amount = val;
            type = amount >= 0 ? "income" : "expense";
          } else {
            amount = 0;
            warning = "Amount missing";
          }
        } else {
          amount = 0;
          warning = "Needs mapping";
        }

        const rawDate = row[colMapping.date] || new Date().toISOString().split("T")[0];
        const rawMerchant = row[colMapping.merchant] || "Unknown Merchant";
        
        const type_final = amount >= 0 ? "income" : "expense";
        const category = colMapping.category && row[colMapping.category] && TRANSACTION_CATEGORIES.includes(row[colMapping.category] as TransactionCategory)
          ? (row[colMapping.category] as TransactionCategory)
          : CategorizationEngine.categorize(String(rawMerchant), type_final, state.merchantRules);

        let date = "";
        try {
          const d = new Date(rawDate);
          date = isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
        } catch {
          date = new Date().toISOString().split("T")[0];
        }

        return {
          id: generateId(),
          date,
          merchant: String(rawMerchant).trim(),
          amount,
          category,
          type: type_final,
          account: colMapping.account ? row[colMapping.account] : "Main Account",
          notes: row.Notes || row.notes || row.Reference || row.reference || "",
          selected: !warning,
          warning
        };
      });

      setTransactions(processed);
      setStep("preview");
    } catch (err: any) {
      setError(`Mapping error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTx = (id: string, updates: Partial<ImportedTransaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  };

  const handleToggleSelect = (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, selected: !tx.selected } : tx));
  };

  const handleRemove = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const handleConfirmImport = async () => {
    const selectedTxs = transactions.filter(tx => tx.selected);
    if (selectedTxs.length === 0) {
      toast("No transactions selected for import", "info");
      return;
    }

    setStep("processing");
    setLoading(true);

    let successCount = 0;
    let failCount = 0;

    for (const tx of selectedTxs) {
      try {
        await addTransaction({
          merchant: tx.merchant,
          amount: tx.amount, // AppContext handles the sign correctly
          category: tx.category,
          date: tx.date,
          transaction_date: tx.date,
          notes: tx.notes,
          payment_status: "completed",
          recurring: false
        });
        successCount++;
      } catch (err) {
        console.error("Import failed for row:", tx, err);
        failCount++;
      }
    }

    setLoading(false);
    if (failCount === 0) {
      toast(`Successfully imported ${successCount} transactions`, "success");
      onClose();
    } else {
      toast(`Imported ${successCount} rows. ${failCount} failed.`, "warning");
      onClose();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer" onClick={onClose} />
        
        <div className="relative vylos-modal-glass w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-border-main flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Upload size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-main tracking-tight">
                  {step === "preview" ? "Review Imported Transactions" : "Import Transactions"}
                </h2>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">
                  {step === "preview" ? "Review and categorise before saving" : "Upload CSV or Excel statements"}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-text-muted hover:text-text-main hover:bg-border-main rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {step === "upload" && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-lg aspect-video border-2 border-dashed border-border-main rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setLoading(true);
                      const fileName = file.name.toLowerCase();
                      if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
                        handleParse(file);
                      } else {
                        setError("Unsupported file format. Please use CSV or Excel.");
                        setLoading(false);
                      }
                    }
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-main mb-1">Drag and drop your bank statement here</p>
                    <p className="text-xs font-bold text-text-muted">or browse files</p>
                  </div>
                  <button className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 group-hover:bg-blue-700 transition-all">
                    Choose File
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                  />
                </div>

                {loading && (
                  <VylosLoadingScreen variant="inline" text="Reading file..." />
                )}

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl pt-8">
                  {[
                    { title: "Smart Mapping", desc: "We automatically detect columns" },
                    { title: "Auto-Categorise", desc: "Rule-based engine labels rows" },
                    { title: "Safe Review", desc: "Review and edit before saving" }
                  ].map((feature, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border-main">
                      <span className="text-[11px] font-black text-text-main uppercase tracking-widest">{feature.title}</span>
                      <span className="text-[10px] font-medium text-text-muted leading-relaxed">{feature.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "mapping" && (
              <div className="p-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h3 className="text-2xl font-black text-text-main tracking-tight">We need help matching your file</h3>
                  <p className="text-sm font-bold text-text-muted">We couldn't automatically detect all columns. Please tell us which columns contain your transaction details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Date Column</label>
                      <select 
                        value={mapping.date}
                        onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-border-main rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Date Column</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Merchant / Description</label>
                      <select 
                        value={mapping.merchant}
                        onChange={(e) => setMapping({ ...mapping, merchant: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-border-main rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Merchant Column</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Which column shows the amount?</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-black/20 p-1 rounded-2xl">
                          <button 
                            onClick={() => setMapping({ ...mapping, debit: "", credit: "" })}
                            className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!mapping.debit && !mapping.credit ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-text-muted hover:text-text-main'}`}
                          >
                            Single Column
                          </button>
                          <button 
                            onClick={() => setMapping({ ...mapping, amount: "" })}
                            className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mapping.debit || mapping.credit ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-text-muted hover:text-text-main'}`}
                          >
                            Debit / Credit
                          </button>
                        </div>
                      </div>

                      {(!mapping.debit && !mapping.credit) ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Amount Column</label>
                          <select 
                            value={mapping.amount}
                            onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                            className="w-full bg-white dark:bg-white/5 border border-border-main rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                          >
                            <option value="">Select Amount Column</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Date Column</label>
                            <select 
                              value={mapping.debit}
                              onChange={(e) => setMapping({ ...mapping, debit: e.target.value })}
                              className="w-full bg-white dark:bg-white/5 border border-border-main rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            >
                              <option value="">Select Debit Column</option>
                              {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Credit Column (In)</label>
                            <select 
                              value={mapping.credit}
                              onChange={(e) => setMapping({ ...mapping, credit: e.target.value })}
                              className="w-full bg-white dark:bg-white/5 border border-border-main rounded-2xl px-5 py-4 text-sm font-bold text-text-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            >
                              <option value="">Select Credit Column</option>
                              {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                   <div className="flex items-center gap-2 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl max-w-xl text-[11px] font-medium text-amber-700 leading-relaxed">
                     <AlertCircle size={16} className="shrink-0" />
                     <span>Ensure your column mapping is accurate. Incorrect mapping may lead to inaccurate financial insights and budget calculations.</span>
                   </div>
                </div>
              </div>
            )}

            {step === "preview" && (
              <div className="p-0 flex flex-col h-full">
                <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-border-main flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Transactions Found</span>
                      <span className="text-sm font-black text-text-main">{transactions.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Income</span>
                      <span className="text-sm font-black text-emerald-600">{formatCurrency(transactions.filter(t => t.selected && t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Total Expenses</span>
                      <span className="text-sm font-black text-red-500">{formatCurrency(transactions.filter(t => t.selected && t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0))}</span>
                    </div>
                    {transactions.filter(t => t.warning).length > 0 && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Needs Review</span>
                        <span className="text-sm font-black text-amber-600">{transactions.filter(t => t.warning).length} rows</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setTransactions(prev => prev.map(tx => ({ ...tx, selected: true })))}
                      className="text-[10px] font-black text-text-muted hover:text-text-main uppercase tracking-widest px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-all"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={() => setTransactions(prev => prev.map(tx => ({ ...tx, selected: false })))}
                      className="text-[10px] font-black text-text-muted hover:text-text-main uppercase tracking-widest px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-all"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
                      <tr className="border-b border-border-main">
                        <th className="p-4 w-10"></th>
                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Merchant / Description</th>
                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Category</th>
                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Amount</th>
                        <th className="p-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr 
                          key={tx.id} 
                          className={`border-b border-border-main/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!tx.selected ? 'opacity-40 grayscale-[0.5]' : ''}`}
                        >
                          <td className="p-4">
                            <button 
                              onClick={() => handleToggleSelect(tx.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${tx.selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-border-main'}`}
                            >
                              {tx.selected && <CheckCircle2 size={12} />}
                            </button>
                          </td>
                          <td className="p-4">
                            <input 
                              type="date" 
                              value={tx.date}
                              onChange={(e) => handleUpdateTx(tx.id, { date: e.target.value })}
                              className="bg-transparent border-none text-[13px] font-bold text-text-main focus:ring-0 w-32"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="text" 
                              value={tx.merchant}
                              onChange={(e) => handleUpdateTx(tx.id, { merchant: e.target.value })}
                              className="bg-transparent border-none text-[13px] font-black text-text-main focus:ring-0 w-full"
                            />
                          </td>
                          <td className="p-4 min-w-[160px]">
                            <select
                              value={tx.category}
                              onChange={(e) => handleUpdateTx(tx.id, { category: e.target.value as TransactionCategory })}
                              className="bg-slate-100 dark:bg-white/5 border border-border-main rounded-xl px-3 py-1.5 text-[11px] font-bold text-text-main outline-none"
                            >
                              {TRANSACTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => handleUpdateTx(tx.id, { 
                                   type: tx.type === 'income' ? 'expense' : 'income',
                                   amount: -tx.amount
                                 })}
                                 className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}
                               >
                                 {tx.type}
                               </button>
                               <input 
                                 type="number" 
                                 value={Math.abs(tx.amount)}
                                 onChange={(e) => {
                                   const val = parseFloat(e.target.value) || 0;
                                   handleUpdateTx(tx.id, { amount: tx.type === 'income' ? val : -val });
                                 }}
                                 className="bg-transparent border-none text-[13px] font-black text-text-main focus:ring-0 w-24 text-right"
                               />
                               {tx.warning && (
                                 <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse shrink-0">
                                   <AlertCircle size={10} />
                                   {tx.warning}
                                 </div>
                               )}
                            </div>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleRemove(tx.id)}
                              className="p-2 text-text-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {step === "processing" && (
              <VylosLoadingScreen variant="inline" text="Syncing your finances to secure cloud database..." />
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-border-main/20 border-t border-border-main flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                  {step === "upload" && "Select a statement file"}
                  {step === "mapping" && "Configure columns"}
                  {step === "preview" && `${transactions.filter(t => t.selected).length} transactions ready`}
                  {step === "processing" && "Importing..."}
               </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-3 text-[12px] font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              
              {step === "mapping" && (
                <button 
                  onClick={() => applyMapping(rawRows, mapping)}
                  disabled={!mapping.date || !mapping.merchant || (!mapping.amount && !mapping.debit && !mapping.credit)}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  Apply Mapping
                  <ArrowRight size={16} />
                </button>
              )}
              
              {step === "preview" && (
                <button 
                  onClick={handleConfirmImport}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Import Selected Transactions
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
