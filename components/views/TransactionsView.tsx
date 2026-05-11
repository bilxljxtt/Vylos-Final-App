"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, Download, MoreHorizontal, ChevronDown, 
  TrendingUp, TrendingDown, FileText, Globe, Music, Zap, Building2, Car, Coffee, Briefcase, ShoppingBag, Calendar, Plus, Upload
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { cleanMerchantName, formatDate } from "@/lib/utils";
import { V2Select } from "../ui/V2Select";
import { VylosCalculations } from "@/lib/vylosCalculations";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import Chart from "chart.js/auto";
import { TransactionIcon } from "@/components/ui/TransactionIcon";
import { ImportTransactionsModal } from "@/components/modals/ImportTransactionsModal";
import { ExportTransactionsModal } from "@/components/modals/ExportTransactionsModal";

interface TransactionsViewProps {
  transactions: any[];
  filterCat: string;
  setFilterCat: (cat: string) => void;
  setShowAddTx: (show: boolean) => void;
  deleteTx: (id: string) => void;
  setPage: (page: string) => void;
  trends?: { incomeTrend: number; expenseTrend: number; netWorthTrend: number; };
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ 
  transactions, filterCat, setFilterCat, setShowAddTx, deleteTx, setPage
}) => {
  const { formatCurrency, state } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const donutInst = useRef<any>(null);

  const fullFilteredTxs = useMemo(() => {
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(t => {
      const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCat === "All" || t.category === filterCat;
      return matchesSearch && matchesCat;
    });
  }, [transactions, searchTerm, filterCat]);

  const filteredTxs = fullFilteredTxs;

  const stats = useMemo(() => VylosCalculations.getMonthStats(state, state.selectedMonth), [state]);
  const spendByCatMap = useMemo(() => VylosCalculations.getSpendingByCategory(state, state.selectedMonth), [state]);
  const allocation = useMemo(() => VylosCalculations.getAllocationPercentages(state, state.selectedMonth), [state]);

  const spendingSummary = {
    total: stats.expense,
    needs: { pct: allocation.needs, amt: stats.expense * (allocation.needs / 100), color: "#2563EB" },
    wants: { pct: allocation.wants, amt: stats.expense * (allocation.wants / 100), color: "#06B6D4" },
    savings: { pct: Math.max(0, 100 - (allocation.needs + allocation.wants)), amt: stats.income - stats.expense, color: "#8B5CF6" }
  };

  const recurringPayments = state.reminders
    .filter(r => r.recurring !== 'none' && r.status !== 'completed')
    .slice(0, 3)
    .map(r => ({
      name: r.title,
      cat: r.category,
      amt: r.amount || 0,
      due: `Due ${r.due_date}`,
      iconBg: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white"
    }));

  const spendingByCategory = Object.entries(spendByCatMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amt]) => ({
      name,
      amt,
      pct: stats.expense > 0 ? Math.round((amt / stats.expense) * 100) : 0,
      color: CATEGORY_METADATA[name as TransactionCategory]?.color || "#94A3B8"
    }));

  useEffect(() => {
    if (!donutRef.current) return;
    if (donutInst.current) donutInst.current.destroy();

    donutInst.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Needs', 'Wants', 'Savings'],
        datasets: [{
          data: [spendingSummary.needs.pct, spendingSummary.wants.pct, spendingSummary.savings.pct],
          backgroundColor: [spendingSummary.needs.color, spendingSummary.wants.color, spendingSummary.savings.color],
          borderWidth: 0,
          hoverOffset: 4,
          spacing: 2,
          borderRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });

    return () => { if (donutInst.current) donutInst.current.destroy(); };
  }, [spendingSummary]);


  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">Transactions</h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">Manage and track your financial activity across the Vylos ecosystem.</p>
        </div>

        <button 
          onClick={() => setShowAddTx(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Add Transaction
        </button>
      </div>

      {/* ─── Filters Bar ─── */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search transactions, merchants, categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-[13px] font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="w-48">
            <V2Select 
              value={filterCat} 
              onChange={setFilterCat} 
              options={["All", ...Object.keys(CATEGORY_METADATA)]} 
              label="All Categories"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 shadow-sm transition-all whitespace-nowrap">
            <Calendar size={16} className="text-slate-400" /> Date Range <ChevronDown size={16} className="text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => setShowImportModal(true)}
              className="w-11 h-11 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-blue-600 hover:border-blue-500 shadow-sm transition-all shrink-0"
              title="Import Transactions"
            >
              <Upload size={18} />
            </button>
            <button 
              onClick={() => setShowExportModal(true)}
              className="w-11 h-11 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-blue-600 hover:border-blue-500 shadow-sm transition-all shrink-0"
              title="Export Transactions"
            >
              <Download size={18} />
            </button>
            <button className="w-11 h-11 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-blue-500 shadow-sm transition-all shrink-0">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* Left Column (Span 8) - Transactions Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="vylos-glass-readable p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white">Financial Activity</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                  {fullFilteredTxs.length} Records Found
                </span>
              </div>
            </div>
            
            <div className="w-full overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-4">Merchant</th>
                    <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-4">Category</th>
                    <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-4">Date</th>
                    <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Provide exact visual mockup rows if needed or map real data */}
                  {filteredTxs.map((tx, i) => {
                    const isIncome = tx.amount > 0;
                    const now = new Date();
                    const txDate = new Date(tx.date);
                    const daysAgo = Math.floor((now.getTime() - txDate.getTime())/(1000*3600*24));
                    const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;

                    return (
                      <tr key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <TransactionIcon 
                              merchant={tx.merchant} 
                              category={tx.category} 
                              type={isIncome ? "income" : "expense"}
                              size="md"
                              className="group-hover:scale-105 transition-transform"
                            />
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">{cleanMerchantName(tx.merchant)}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-white/5 w-fit rounded-lg border border-slate-100 dark:border-white/5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{tx.category}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-slate-900 dark:text-white">{formatDate(tx.date)}</span>
                            <span className="text-[10px] font-medium text-slate-500 mt-0.5">{timeLabel}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`text-[13px] font-black ${isIncome ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                              {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 mt-0.5">{isIncome ? 'Inflow' : 'Outflow'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>


          </div>
        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Spending Summary */}
          <div className="vylos-glass-readable p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Spending Summary</h3>
              <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                This Month <ChevronDown size={12} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-500">Total Spending</span>
                <span className="text-[28px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{formatCurrency(spendingSummary.total)}</span>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <TrendingUp size={10} /> {spendingSummary.trend}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="w-20 h-20 relative">
                <canvas ref={donutRef} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 w-12">Needs</span>
                  <span className="text-[10px] font-bold text-slate-400">{spendingSummary.needs.pct}%</span>
                </div>
                <span className="text-[12px] font-bold text-slate-900 dark:text-white">{formatCurrency(spendingSummary.needs.amt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 w-12">Wants</span>
                  <span className="text-[10px] font-bold text-slate-400">{spendingSummary.wants.pct}%</span>
                </div>
                <span className="text-[12px] font-bold text-slate-900 dark:text-white">{formatCurrency(spendingSummary.wants.amt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 w-12">Savings</span>
                  <span className="text-[10px] font-bold text-slate-400">{spendingSummary.savings.pct}%</span>
                </div>
                <span className="text-[12px] font-bold text-slate-900 dark:text-white">{formatCurrency(spendingSummary.savings.amt)}</span>
              </div>
            </div>
          </div>

          {/* Recurring Payments */}
          <div className="vylos-glass-readable p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Recurring Payments</h3>
              <button className="text-[11px] font-black text-blue-600 hover:underline uppercase tracking-widest">View all</button>
            </div>
            
            <div className="flex flex-col gap-4 mb-4">
              {recurringPayments.map((sub, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5 ${sub.iconBg}`}>
                      <Globe size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{sub.name}</span>
                      <span className="text-[10px] font-medium text-slate-500">{sub.cat}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-slate-900 dark:text-white">{formatCurrency(sub.amt)}</span>
                    <span className="text-[10px] font-bold text-slate-400">{sub.due}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Total upcoming</span>
              <span className="text-[13px] font-black text-slate-900 dark:text-white">{formatCurrency(recurringPayments.reduce((acc, sub) => acc + sub.amt, 0))}</span>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="vylos-glass-readable p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Spending by Category</h3>
              <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                This Month <ChevronDown size={12} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 flex-1">
              {spendingByCategory.map((cat, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${cat.color} bg-opacity-20 flex items-center justify-center`}>
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-slate-900 dark:text-white">{formatCurrency(cat.amt)}</span>
                      <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{cat.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-center">
              <button className="text-[12px] font-black text-blue-600 hover:text-blue-700 transition-colors">
                View full breakdown
              </button>
            </div>
          </div>

        </div>

      </div>

      <ImportTransactionsModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />
      <ExportTransactionsModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        data={fullFilteredTxs}
      />
    </div>
  );
};
