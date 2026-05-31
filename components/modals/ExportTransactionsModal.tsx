"use client";

import React, { useState } from "react";
import { X, Download, FileText, CheckCircle2, Table, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient } from "@/utils/supabase/client";

const VYLOS_TAGLINE = "Track. Understand. Improve. Grow.";

interface ExportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any[]; // Optional prop to export specific filtered data
}

export function ExportTransactionsModal({ isOpen, onClose, data }: ExportTransactionsModalProps) {
  const { state, formatCurrency } = useAppStore();
  const { toast } = useToast();
  const supabase = createClient();
  const [format, setFormat] = useState<"csv" | "xlsx" | "pdf">("csv");
  const [exportRange, setExportRange] = useState<"all" | "filtered">(data ? "filtered" : "all");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const fetchAllTransactions = async () => {
    if (!state.userProfile?.id) return [];
    
    const pageSize = 1000;
    let from = 0;
    let allTransactions: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const to = from + pageSize - 1;
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", state.userProfile.id)
        .order("date", { ascending: false })
        .range(from, to);

      const { data: fetchRes, error } = await query;
      if (error) throw error;

      allTransactions = [...allTransactions, ...(fetchRes || [])];
      if (!fetchRes || fetchRes.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }
    return allTransactions;
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      // 1. Fetch data
      let transactionsToExport = [];
      if (exportRange === "filtered" && data) {
        transactionsToExport = data;
      } else {
        transactionsToExport = await fetchAllTransactions();
      }
      
      if (!transactionsToExport || transactionsToExport.length === 0) {
        throw new Error("No transactions found to export.");
      }

      const exportDate = new Date().toLocaleDateString('en-ZA', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
      const userName = state.userProfile?.name || "Vylos User";
      const fileNameDate = new Date().toISOString().split('T')[0];

      if (format === "csv") {
        const csvData = transactionsToExport.map(tx => ({
          Date: tx.date,
          Merchant: tx.merchant || tx.title || "Unknown",
          Category: tx.category,
          Amount: tx.amount,
          Type: tx.amount >= 0 ? "Income" : "Expense",
          Notes: tx.notes || ""
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `vylos-transactions-${fileNameDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } else if (format === "xlsx") {
        const workbook = XLSX.utils.book_new();
        const txData = transactionsToExport.map(tx => ({
          Date: tx.date,
          Merchant: tx.merchant || tx.title || "Unknown",
          Category: tx.category,
          Amount: tx.amount,
          Type: tx.amount >= 0 ? "Income" : "Expense",
          Notes: tx.notes || ""
        }));
        const txSheet = XLSX.utils.json_to_sheet(txData);
        txSheet["!cols"] = [{ wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(workbook, txSheet, "Transactions");

        const totalIncome = transactionsToExport.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const totalExpenses = transactionsToExport.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        
        const summaryData = [
          ["Vylos Transaction Report", ""],
          ["Export Date", exportDate],
          ["User", userName],
          ["", ""],
          ["Summary Metrics", ""],
          ["Total Income", totalIncome],
          ["Total Spending", totalExpenses],
          ["Net Difference", totalIncome - totalExpenses],
          ["Transaction Count", transactionsToExport.length]
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
        XLSX.writeFile(workbook, `vylos-statement-${fileNameDate}.xlsx`);

      } else if (format === "pdf") {
        const doc = new jsPDF();
        const primaryBlue: [number, number, number] = [37, 99, 235]; // #2563eb
        const darkNavy: [number, number, number] = [15, 23, 42];
        const softGrey: [number, number, number] = [241, 245, 249];
        const textMuted: [number, number, number] = [100, 116, 139];

        const totalIncome = transactionsToExport.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const totalExpenses = transactionsToExport.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        const net = totalIncome - totalExpenses;

        const tableData = transactionsToExport.map(tx => [
          tx.date,
          tx.merchant || tx.title || "Unknown",
          tx.category,
          tx.amount >= 0 ? "Inflow" : "Outflow",
          formatCurrency(tx.amount).replace('R', 'R ')
        ]);

        autoTable(doc, {
          startY: 85,
          head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
          body: tableData,
          margin: { top: 40, bottom: 25, left: 20, right: 20 },
          styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak', font: 'helvetica' },
          headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [250, 251, 253] },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          },
          didDrawPage: (data) => {
            // Header
            doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            doc.rect(0, 0, 210, 30, 'F');
            
            // Branding
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("VYLOS", 20, 18);
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(VYLOS_TAGLINE, 20, 24);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("TRANSACTION REPORT", 190, 18, { align: 'right' });
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`ID: ${state.userProfile?.id?.slice(0,8).toUpperCase() || "N/A"}`, 190, 24, { align: 'right' });

            if (data.pageNumber === 1) {
              // Page 1: User & Summary Info
              doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text("Financial Activity Summary", 20, 45);
              
              doc.setFontSize(9);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
              doc.text(`Account Holder: ${userName}`, 20, 52);
              doc.text(`Reporting Period: All Transactions`, 20, 57);
              doc.text(`Exported On: ${exportDate}`, 20, 62);

              // Summary Boxes
              const boxW = 54;
              const boxH = 15;
              const boxY = 68;

              // Income Box
              doc.setFillColor(240, 253, 244);
              doc.roundedRect(20, boxY, boxW, boxH, 2, 2, 'F');
              doc.setTextColor(21, 128, 61);
              doc.setFontSize(7);
              doc.text("TOTAL INCOME", 24, boxY + 5);
              doc.setFontSize(9);
              doc.setFont("helvetica", "bold");
              doc.text(formatCurrency(totalIncome), 24, boxY + 11);

              // Expense Box
              doc.setFillColor(254, 242, 242);
              doc.roundedRect(20 + boxW + 4, boxY, boxW, boxH, 2, 2, 'F');
              doc.setTextColor(185, 28, 28);
              doc.setFontSize(7);
              doc.setFont("helvetica", "normal");
              doc.text("TOTAL EXPENSES", 24 + boxW + 4, boxY + 5);
              doc.setFontSize(9);
              doc.setFont("helvetica", "bold");
              doc.text(formatCurrency(totalExpenses), 24 + boxW + 4, boxY + 11);

              // Net Box
              doc.setFillColor(softGrey[0], softGrey[1], softGrey[2]);
              doc.roundedRect(20 + (boxW + 4) * 2, boxY, boxW, boxH, 2, 2, 'F');
              doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
              doc.setFontSize(7);
              doc.setFont("helvetica", "normal");
              doc.text("NET BALANCE", 24 + (boxW + 4) * 2, boxY + 5);
              doc.setFontSize(9);
              doc.setFont("helvetica", "bold");
              doc.text(formatCurrency(net), 24 + (boxW + 4) * 2, boxY + 11);
            }

            // Footer (Excludes page number - stamped in second pass)
            doc.setFontSize(8);
            doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
            doc.text("Generated by Vylos Intelligence Engine", 20, 285);
            doc.setFontSize(7);
            doc.text("This report is confidential and intended for the user's personal financial record keeping.", 190, 285, { align: 'right' });
          }
        });

        // Second pass: Stamp Page Numbers
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
          doc.text(`Page ${i} of ${totalPages}`, 105, 285, { align: "center" });
        }

        doc.save(`vylos-transaction-report-${fileNameDate}.pdf`);
      }

      toast("Report exported successfully", "success");
      onClose();
    } catch (err: any) {
      console.error("Export error:", err);
      toast(`Export failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer" onClick={onClose} />
        
        <div className="relative vylos-modal-glass w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-border-main flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Download size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-text-main tracking-tight">Export Data</h2>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Save your transaction history</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-text-muted hover:text-text-main hover:bg-border-main rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Segmented Control for Export Range */}
            {data && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Export Range</label>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setExportRange("filtered")}
                    className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      exportRange === "filtered"
                        ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-white/5"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    Filtered ({data.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportRange("all")}
                    className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      exportRange === "all"
                        ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-white/5"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    All Transactions
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Select Format</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "csv", label: "CSV Spreadsheet", icon: <Table size={18} />, desc: "Best for simple data analysis" },
                  { id: "xlsx", label: "Excel Workbook", icon: <Download size={18} />, desc: "Best for advanced Excel features" },
                  { id: "pdf", label: "PDF Report", icon: <FileText size={18} />, desc: "Clean, professional document" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id as any)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group ${
                      format === opt.id 
                        ? 'bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-600/5' 
                        : 'bg-border-main/5 border-border-main hover:border-border-strong'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${format === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-black transition-colors ${format === opt.id ? 'text-blue-600' : 'text-text-main'}`}>{opt.label}</p>
                      <p className="text-[10px] font-bold text-text-muted">{opt.desc}</p>
                    </div>
                    {format === opt.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white animate-in zoom-in-50">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
              <Calendar size={16} className="text-amber-500 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Exporting Info</p>
                <p className="text-[10px] font-medium text-text-muted leading-relaxed">
                  {exportRange === "filtered" && data
                    ? `Your current filtered search results (${data.length} transactions) will be exported.`
                    : `All transactions for your active account will be included in this export.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-border-main/20 border-t border-border-main flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-[12px] font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleExport}
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Start Export"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
