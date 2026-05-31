"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, Search, Plus, Upload, Download, ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { cleanMerchantName, formatDate } from "@/lib/utils";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { TransactionIcon } from "@/components/ui/TransactionIcon";
import { V2Select } from "@/components/ui/V2Select";
import { VylosCalculations } from "@/lib/vylosCalculations";
import { MobilePageHeader } from "../../ui/MobilePageHeader";

interface TransactionsMobileProps {
  transactions: any[];
  filterCat: string;
  setFilterCat: (cat: string) => void;
  setShowAddTx: (show: boolean) => void;
  deleteTx: (id: string) => void;
  setPage: (page: string) => void;
  setShowExportModal?: (show: boolean) => void;
  trends?: { incomeTrend: number; expenseTrend: number; netWorthTrend: number; };
}

export const TransactionsMobile: React.FC<TransactionsMobileProps> = ({
  transactions,
  filterCat,
  setFilterCat,
  setShowAddTx,
  deleteTx,
  setPage
}) => {
  const { formatCurrency, state } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(25);

  const fullFilteredTxs = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCat === "All" || t.category === filterCat;
      return matchesSearch && matchesCat;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchTerm, filterCat]);

  const filteredTxs = useMemo(() => fullFilteredTxs.slice(0, visibleCount), [fullFilteredTxs, visibleCount]);

  const stats = useMemo(() => {
    return VylosCalculations.getMonthStats({ 
      transactions: state.transactions, 
      budgets: state.budgets, 
      goals: state.goals 
    } as any, state.selectedMonth);
  }, [state.transactions, state.budgets, state.goals, state.selectedMonth]);

  return (
    <div className="w-full flex flex-col gap-5 pb-24 max-w-md mx-auto px-1 animate-in fade-in duration-500">
      {/* Header */}
      <MobilePageHeader
        title="Activity History"
        onBack={() => setPage("dashboard")}
        rightAction={
          <button 
            onClick={() => setShowAddTx(true)}
            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
            aria-label="Add Transaction"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        }
      />

      {/* Monthly Outflow / Cash Flow Summary Card */}
      <div className="vylos-glass-readable p-5 rounded-3xl border border-white/20 shadow-md flex items-center justify-between min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Spent This Month</span>
          <span className="text-xl font-black mobile-heading tracking-tighter mt-1 whitespace-nowrap truncate leading-none">
            {formatCurrency(stats.expense)}
          </span>
        </div>
        <div className="flex flex-col items-end min-w-0">
          <span className="text-[9px] font-black mobile-muted uppercase tracking-widest">Inflow</span>
          <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 tracking-tighter mt-1 whitespace-nowrap truncate leading-none">
            +{formatCurrency(stats.income)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative w-full">
          <Search size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input 
            type="text" 
            placeholder="Search activity..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 vylos-glass-input rounded-2xl text-[12px] font-black focus:outline-none shadow-sm transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="w-full">
          <V2Select 
            value={filterCat} 
            onChange={setFilterCat} 
            options={[
              { value: "All", label: "All Categories" },
              ...Object.keys(CATEGORY_METADATA).map(cat => ({ value: cat, label: cat }))
            ]} 
            buttonClassName="h-11 py-0 px-4 text-[10px] font-black uppercase tracking-widest mobile-subheading w-full rounded-2xl bg-white/50 dark:bg-slate-900/30 border border-slate-300 dark:border-white/15"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black mobile-label uppercase tracking-widest">Transactions</span>
          <span className="text-[9px] font-bold mobile-muted bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded">
            {fullFilteredTxs.length} items
          </span>
        </div>

        {filteredTxs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredTxs.map((tx, i) => {
              const isIncome = tx.amount > 0;
              const now = new Date();
              const txDate = new Date(tx.date);
              const daysAgo = Math.floor((now.getTime() - txDate.getTime())/(1000*3600*24));
              const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;

              return (
                <div key={tx.id || i} className="vylos-glass-readable p-3 rounded-2xl border border-white/25 shadow-sm flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <TransactionIcon 
                      merchant={tx.merchant} 
                      category={tx.category} 
                      type={isIncome ? "income" : "expense"}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-black mobile-subheading leading-tight truncate">
                        {cleanMerchantName(tx.merchant)}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold mobile-muted">{formatDate(tx.date)}</span>
                        <span className="text-[8px] text-slate-300 dark:text-white/10">•</span>
                        <span className="text-[9px] font-bold mobile-body uppercase tracking-wide truncate max-w-[80px]">{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-0.5 shrink-0 ml-3">
                    <span className={`text-[12px] font-black ${isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'mobile-heading'}`}>
                      {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[9px] font-bold mobile-muted">{timeLabel}</span>
                  </div>
                </div>
              );
            })}

            {fullFilteredTxs.length > visibleCount && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 25)}
                className="w-full py-3 bg-white/55 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-2xl text-[10px] font-black uppercase tracking-widest mobile-muted transition-all hover:bg-white/60 active:scale-[0.98] mt-2"
              >
                Load More
              </button>
            )}
          </div>
        ) : (
          <div className="vylos-glass-readable p-8 rounded-3xl border border-white/25 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] font-black mobile-label uppercase tracking-widest">No activity found</span>
            <p className="text-[10px] font-bold mobile-muted mt-1">Try resetting search filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Floating Action Navigation Helper */}
      <div className="flex items-center justify-around gap-2 mt-4 px-2">
        <button 
          onClick={() => setPage("import")}
          className="flex-1 py-3 bg-white/55 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-2xl text-[9px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1.5"
        >
          <Upload size={12} />
          Import
        </button>
        <button 
          onClick={() => setPage("dashboard")}
          className="flex-1 py-3 bg-white/55 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-2xl text-[9px] font-black uppercase tracking-widest mobile-muted flex items-center justify-center"
        >
          Close
        </button>
      </div>
    </div>
  );
};
