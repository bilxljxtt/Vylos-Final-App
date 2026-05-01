"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Plus, 
  ChevronRight, 
  Calendar, 
  MoreHorizontal, 
  Download, 
  Filter, 
  Edit3, 
  Trash2, 
  Clock 
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { BudgetService } from "@/lib/services/BudgetService";
import Chart from "chart.js/auto";

interface BudgetViewProps {
  budgets: Record<string, { limit: number }>;
  spendByCat: Record<string, number>;
  transactions: any[];
  savingsRate: number;
  setShowNewBudget: (show: boolean) => void;
  setShowFundCategory: (show: boolean) => void;
  handleDeleteCategory: (cat: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  spendByCat,
  transactions,
  savingsRate,
  setShowNewBudget,
  setShowFundCategory,
  handleDeleteCategory
}) => {
  const { state, formatCurrency, lastSynced } = useAppStore();
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const donutInst = useRef<any>(null);

  const budgetSummary = BudgetService.getBudgetSummary(state, state.selectedMonth);
  const { totalLimit, totalFunding, totalSpent: totalGrossExpenses, totalAvailable, totalSpentPercent: totalSpentPct } = budgetSummary;

  useEffect(() => {
    if (!donutRef.current) return;
    if (donutInst.current) donutInst.current.destroy();

    // Prepare Donut Data (Spent funds per category)
    const catData = budgetSummary.categories
      .map(c => [c.category, c.spent] as [string, number])
      .filter(([, v]) => v > 0);

    donutInst.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: catData.map(([k]) => k),
        datasets: [{
          data: catData.map(([, v]) => v),
          backgroundColor: ["#00C853", "#FF7043", "#7C4DFF", "#FF6D00", "#795548", "#0091EA", "#FF1744", "#3F51B5", "#F50057", "#00BCD4", "#4CAF50", "#607D8B", "#546E7A"],
          borderWidth: 0,
          hoverOffset: 10,
          spacing: 4,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: false }
        }
      }
    });

    return () => {
      if (donutInst.current) donutInst.current.destroy();
    };
  }, [budgetSummary]);

  const getStyleForCategory = (cat: string) => {
    return CATEGORY_METADATA[cat as TransactionCategory] || { color: "#607D8B", icon: <MoreHorizontal size={18} /> };
  };

  return (
    <div className="flex flex-col gap-8 pt-4 pb-20 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-text-main tracking-tight">Budget</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted opacity-60 uppercase tracking-widest">
               <Calendar size={14} />
               <span>Budget Period Active</span>
               <span className="mx-1">•</span>
               <span>Last synced {lastSynced ? lastSynced.toLocaleTimeString() : 'Never'}</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="p-3 bg-card border border-border-main rounded-xl text-text-muted hover:text-primary transition-all shadow-sm">
               <Download size={18} />
            </button>
            <button className="p-3 bg-card border border-border-main rounded-xl text-text-muted hover:text-primary transition-all shadow-sm">
               <Filter size={18} />
            </button>
            <button 
              onClick={() => setShowNewBudget(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
               <Plus size={18} strokeWidth={3} />
               Set Limits
            </button>
         </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Monthly Limit */}
          <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
             <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wallet size={24} strokeWidth={2.5} className="text-primary" />
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Monthly Limit</span>
                <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{formatCurrency(totalLimit || 0)}</span>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">Base Plan</span>
             </div>
          </div>
          {/* Total Funding */}
          <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
             <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Plus size={24} strokeWidth={2.5} className="text-amber-500" />
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Extra Funding</span>
                <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{formatCurrency(totalFunding || 0)}</span>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">Manual Top-ups</span>
             </div>
          </div>
          {/* Month Spend */}
          <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
             <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={24} strokeWidth={2.5} className="text-blue-500" />
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Month Spend</span>
                <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{formatCurrency(totalGrossExpenses || 0)}</span>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">Gross Expenses</span>
             </div>
          </div>
          {/* Net Available */}
          <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
             <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Target size={24} strokeWidth={2.5} className="text-emerald-500" />
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Net Available</span>
                <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{formatCurrency(totalAvailable || 0)}</span>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">Remaining Funds</span>
             </div>
          </div>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
         {/* Left: Donut Overview */}
         <div className="lg:col-span-4 bg-card border border-border-main p-8 rounded-2xl shadow-sm flex flex-col items-center justify-between min-h-[400px]">
            <div className="w-full text-center mb-6">
               <h3 className="text-lg font-black text-text-main tracking-tight">Budget Overview</h3>
               <span className="text-xs font-bold text-text-muted opacity-60 uppercase tracking-widest mt-1">Status vs Targets</span>
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
               <div className="relative w-[220px] aspect-square flex-shrink-0 mx-auto">
                  <canvas ref={donutRef}></canvas>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                      <div className="text-2xl font-black text-text-main tracking-tight leading-none">
                         {formatCurrency(totalGrossExpenses || 0)}
                      </div>
                      <div className="text-[10px] font-bold text-text-muted mt-1.5 opacity-80 uppercase tracking-widest">
                         Total Spent
                      </div>
                  </div>
               </div>
            </div>

            <div className="w-full grid grid-cols-1 gap-3 mt-8">
               {budgetSummary.categories.length === 0 ? (
                  <div className="text-center py-4 text-text-muted/40 text-[10px] font-black uppercase tracking-widest">No budget data</div>
               ) : (
                 budgetSummary.categories.map((c) => {
                    const meta = CATEGORY_METADATA[c.category as TransactionCategory] || { color: "#607D8B" };
                    return (
                       <div key={c.category} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: meta.color }} />
                              <span className="text-[13px] font-bold text-text-main tracking-tight">{c.category}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[13px] font-black text-text-main w-16 text-right">{formatCurrency(c.spent || 0)}</span>
                              <span className="text-[11px] font-bold text-text-muted w-8 text-right opacity-60">{c.percent}%</span>
                            </div>
                         </div>
                      )
                   })
                 )}
               </div>
            </div>

         {/* Right: Detailed List */}
         <div className="lg:col-span-8 flex flex-col gap-8">
            <div className={`border rounded-xl p-5 flex items-center justify-between px-6 ${(totalLimit === 0 && totalGrossExpenses === 0) ? 'bg-slate-500/10 border-slate-500/20' : (totalSpentPct >= 100 ? 'bg-red-500/10 border-red-500/20' : (totalSpentPct > 80 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-primary/10 border-primary/20'))}`}>
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${(totalLimit === 0 && totalGrossExpenses === 0) ? 'bg-slate-500/20 text-slate-500' : (totalSpentPct >= 100 ? 'bg-red-500/20 text-red-500' : (totalSpentPct > 80 ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'))}`}>
                     {(totalLimit === 0 && totalGrossExpenses === 0) ? <Clock size={20} strokeWidth={3} /> : (totalSpentPct >= 100 ? <TrendingDown size={20} strokeWidth={3} /> : <TrendingUp size={20} strokeWidth={3} />)}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm font-black text-text-main tracking-tight leading-tight">
                       {(totalLimit === 0 && totalGrossExpenses === 0) ? 'No budget set for this period.' : (totalSpentPct >= 100 ? `You've exceeded your budget by ${formatCurrency(Math.abs(totalAvailable))}.` : (totalSpentPct > 80 ? `You've spent ${totalSpentPct}% of your budget. Slow down!` : `You've spent ${totalSpentPct}% of your budget. Keep it up!`))}
                     </span>
                     <span className="text-xs font-bold text-text-muted mt-0.5">
                       {(totalLimit === 0 && totalGrossExpenses === 0) ? 'Add your income and set limits to get started.' : (totalSpentPct >= 100 ? 'Review your categories to adjust limits.' : `${formatCurrency(totalAvailable)} remaining for the period.`)}
                     </span>
                  </div>
               </div>
               <button onClick={() => setShowNewBudget(true)}>
                  <ChevronRight size={18} className="text-text-muted/50" />
               </button>
            </div>

            <div className="bg-card border border-border-main p-8 rounded-2xl shadow-sm flex flex-col h-full">
               <div className="flex justify-between items-end mb-8 pt-1">
                  <h3 className="text-lg font-black text-text-main tracking-tight">Budget by Category</h3>
                  <div className="flex items-center gap-6">
                     <button onClick={() => setShowNewBudget(true)} className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 hover:bg-primary/10 transition-all">
                       <Plus size={14} strokeWidth={3} /> Add Category
                     </button>
                     <div className="flex gap-10">
                       <span className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Available</span>
                       <span className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Limit</span>
                       <span className="w-4"></span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-8 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  {budgetSummary.categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 gap-4">
                      <Target size={40} className="text-text-muted/20" />
                      <span className="text-xs font-bold text-text-muted opacity-40 uppercase tracking-widest">No Active Budgets</span>
                    </div>
                  ) : (
                    budgetSummary.categories.map((c) => {
                        const style = getStyleForCategory(c.category);
                        return (
                           <div key={c.category} className="flex items-center gap-6 group">
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${style.color}11`, color: style.color }}>{style.icon}</div>
                              <div className="flex-1 flex flex-col justify-center">
                                 <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[14px] font-black text-text-main tracking-tight leading-none">{c.category}</span>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setShowFundCategory(true)} className="p-1 hover:text-primary transition-colors"><Plus size={12} strokeWidth={3} /></button>
                                        <button onClick={() => setShowNewBudget(true)} className="p-1 hover:text-primary transition-colors"><Edit3 size={12} /></button>
                                        <button onClick={() => handleDeleteCategory(c.category)} className="p-1 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                      </div>
                                    </div>
                                    <span className={`text-[12px] font-bold ${c.percent >= 100 ? 'text-red-500' : 'text-text-muted'}`}>{c.percent}%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-border-main rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.percent}%`, backgroundColor: c.percent >= 100 ? '#EF4444' : (c.percent >= 80 ? '#F59E0B' : style.color) }} />
                                 </div>
                              </div>
                              <div className="flex items-center gap-8 pl-4">
                                 <span className={`text-[14px] font-bold w-16 text-right tracking-tight ${c.available < 0 ? 'text-red-500' : 'text-primary'}`}>{formatCurrency(c.available || 0)}</span>
                                 <span className="text-[14px] font-medium text-text-muted w-16 text-right tracking-tight">{formatCurrency(c.limit + c.funding || 0)}</span>
                                 <ChevronRight size={16} className="text-text-muted opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                              </div>
                           </div>
                        );
                     })
                   )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
