"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface BudgetControlWidgetProps {
  summary?: {
    totalAllocated: number;
    totalSpent: number;
    totalRemaining: number;
    percentageUsed: number;
    categories: Array<{
      name: string;
      allocated: number;
      spent: number;
      percentageUsed: number;
      status: "safe" | "warning" | "over";
    }>;
  };
  formatCurrency: (val: number) => string;
  onViewAll?: () => void;
  selectedMonth?: string;
}

export const BudgetControlWidget: React.FC<BudgetControlWidgetProps> = ({ 
  summary, formatCurrency, onViewAll, selectedMonth
}) => {
  const topCategories = summary?.categories.slice(0, 3) || [];
  const totalLimit = summary?.totalAllocated || 0;
  const expense = summary?.totalSpent || 0;
  const overallPct = Math.min(100, Math.round(summary?.percentageUsed || 0));

  const monthLabel = React.useMemo(() => {
    if (!selectedMonth) return new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
    const parts = selectedMonth.split('-');
    if (parts.length < 2) return new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString('default', { month: 'short' }).toUpperCase();
  }, [selectedMonth]);

  return (
    <GlassCard p="p-8" className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter">Budget Control</h4>
        <div className="flex items-center gap-4">
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          )}
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-lg">
            {monthLabel}
          </span>
        </div>
      </div>
      
      {totalLimit > 0 || expense > 0 ? (
        <>
          <div className="vylos-glass-soft p-6 mb-8 shadow-inner border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-slate-500">Limit Remaining</span>
              <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{formatCurrency(Math.max(0, totalLimit - expense))}</span>
            </div>
            <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">{overallPct}% <span className="text-sm text-slate-400 font-bold">used</span></div>
            <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                style={{ width: `${overallPct}%` }} 
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            {topCategories.map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white">{item.name}</span>
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">{Math.round(item.percentageUsed)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 shadow-lg ${item.status === 'over' ? 'bg-red-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min(100, item.percentageUsed)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 shadow-inner">
            <BarChart3 size={32} />
          </div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed px-4">
            No budgets configured.<br/>Set limits to track spending.
          </p>
        </div>
      )}
    </GlassCard>
  );
};
