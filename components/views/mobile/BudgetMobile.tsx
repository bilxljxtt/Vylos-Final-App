"use client";

import React, { useMemo } from "react";
import { ChevronLeft, Sparkles, AlertTriangle, Plus, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { BudgetService } from "@/lib/services/BudgetService";
import { MobilePageHeader } from "../../ui/MobilePageHeader";
import { getMonthStart } from "@/lib/store";
import { TransactionIcon } from "@/components/ui/TransactionIcon";

interface BudgetMobileProps {
  setShowNewBudget: (show: boolean) => void;
  handleDeleteCategory: (cat: string) => void;
  onQuickAddTx?: (cat: any) => void;
  setShowFundCategory?: (show: boolean) => void;
  setShowHealthDetail?: (show: boolean) => void;
  setPage: (page: string) => void;
}

export const BudgetMobile: React.FC<BudgetMobileProps> = ({
  setShowNewBudget,
  setShowFundCategory,
  setPage
}) => {
  const { state, setSelectedMonth, formatCurrency } = useAppStore();

  const selectedMonth = state.selectedMonth || getMonthStart();
  
  const budgetSummary = useMemo(() => {
    return BudgetService.calculateBudgetSummary({
      transactions: state.transactions,
      budgets: state.budgets,
      subscriptions: state.subscriptions,
      userProfile: { monthlyIncome: state.userProfile.monthlyIncome }
    } as any, selectedMonth);
  }, [state.transactions, state.budgets, state.subscriptions, state.userProfile.monthlyIncome, selectedMonth]);

  const { totalAllocated, totalSpent, totalRemaining, percentageUsed, categories } = budgetSummary;

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthDate = new Date(year, month - 1, 1);
  const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

  return (
    <div className="w-full flex flex-col gap-5 pb-24 max-w-md mx-auto px-1 animate-in fade-in duration-500">
      {/* Header */}
      <MobilePageHeader
        title="Budget Tracking"
        onBack={() => setPage("dashboard")}
        rightAction={
          <button 
            onClick={() => setShowNewBudget(true)}
            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
            aria-label="Manage Budgets"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        }
      />

      {/* Warning Banner */}
      {budgetSummary.isUnrealistic && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 min-w-0">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-snug">
            Allocation ({formatCurrency(totalAllocated)}) exceeds monthly income. Adjust category limits.
          </p>
        </div>
      )}

      {/* Main Budget Progress Card */}
      <div className="vylos-glass-readable p-5 rounded-3xl border border-white/20 shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[9px] font-black mobile-muted uppercase tracking-widest">Total Monthly Budget</span>
            <span className="text-2xl font-black mobile-heading tracking-tighter mt-1 leading-none">
              {formatCurrency(totalAllocated)}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black mobile-muted uppercase tracking-widest">Remaining</span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 tracking-tighter mt-1 leading-none">
              {formatCurrency(Math.max(0, totalRemaining))}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                percentageUsed > 90 
                  ? 'bg-gradient-to-r from-red-500 to-rose-400' 
                  : percentageUsed > 80 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, percentageUsed)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold mobile-muted">
            <span>{Math.round(percentageUsed)}% used</span>
            <span>{monthName}</span>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black mobile-label uppercase tracking-widest">Category Limits</span>
          <span className="text-[9px] font-bold mobile-muted bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded">
            {categories.length} limits
          </span>
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-col gap-4">
            {categories.map((cat, i) => {
              const pct = Math.min(100, cat.percentageUsed);
              const isOver = cat.status === 'over';
              const isWarning = cat.status === 'warning';

              const barColor = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500';
              const textColor = isOver ? 'text-red-600 dark:text-red-500 font-black' : isWarning ? 'text-amber-600 dark:text-amber-500 font-black' : 'mobile-muted font-bold';

              return (
                <div key={cat.name || i} className="vylos-glass-readable p-4 rounded-3xl border border-white/25 shadow-md flex flex-col gap-3 min-w-0">
                  <div className="flex justify-between items-center gap-4 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TransactionIcon merchant="" category={cat.name} size="sm" className="shrink-0" />
                      <span className="text-[12px] font-black mobile-subheading truncate">{cat.name}</span>
                    </div>
                    <span className={`text-[10px] shrink-0 ${textColor}`}>
                      {Math.round(cat.percentageUsed)}% Used
                    </span>
                  </div>

                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold mobile-muted">
                    <div className="flex flex-col">
                      <span className="mobile-label text-[9px] uppercase tracking-wider">Spent</span>
                      <span className="font-black mobile-subheading">{formatCurrency(cat.spent)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="mobile-label text-[9px] uppercase tracking-wider">Limit</span>
                      <span className="font-black mobile-body">{formatCurrency(cat.allocated)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="vylos-glass-readable p-8 rounded-3xl border border-white/25 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] font-black mobile-label uppercase tracking-widest">No limits set</span>
            <p className="text-[10px] font-bold mobile-muted mt-1">Set category limits to keep your expenses organized.</p>
          </div>
        )}
      </div>

      {/* Quick Fund Navigation */}
      <div className="flex items-center justify-around gap-2 mt-4 px-2">
        <button 
          onClick={() => setShowFundCategory?.(true)}
          className="flex-1 py-3 bg-white/55 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-2xl text-[9px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1.5"
        >
          <Sparkles size={12} />
          Fund Category
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
