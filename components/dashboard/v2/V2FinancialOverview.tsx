"use client";

import React, { useMemo } from "react";
import { ChevronDown, ArrowUpRight, BarChart3, TrendingUp, Wallet, ShieldCheck, Trophy } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { V2Popover } from "@/components/ui/V2Popover";
import { useAppStore } from "@/lib/AppContext";
import { VylosCalculations } from "@/lib/vylosCalculations";

interface V2FinancialOverviewProps {
  income: number;
  netWorth: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  formatCurrency: (val: number) => string;
}

export const V2FinancialOverview: React.FC<V2FinancialOverviewProps> = ({ 
  income, netWorth, selectedMonth, onMonthChange, formatCurrency 
}) => {
  const { state } = useAppStore();

  const months = React.useMemo(() => {
    const res = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const iso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-01`;
      const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      res.push({ iso, label });
    }
    return res;
  }, []);

  const currentLabel = useMemo(() => {
    return months.find(m => m.iso === selectedMonth.slice(0, 7) + "-01")?.label || 
    new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [months, selectedMonth]);

  const stats = useMemo(() => VylosCalculations.getMonthStats({ transactions: state.transactions, budgets: state.budgets, goals: state.goals } as any, selectedMonth), [state.transactions, state.budgets, state.goals, selectedMonth]);
  const prevMonth = useMemo(() => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  }, [selectedMonth]);
  const prevStats = useMemo(() => VylosCalculations.getMonthStats({ transactions: state.transactions, budgets: state.budgets, goals: state.goals } as any, prevMonth), [state.transactions, state.budgets, state.goals, prevMonth]);

  const growth = useMemo(() => prevStats.netWorth > 0 ? ((stats.netWorth - prevStats.netWorth) / prevStats.netWorth) * 100 : 0, [stats.netWorth, prevStats.netWorth]);
  
  const cashFlowTrend = useMemo(() => {
    const rawTrend = VylosCalculations.getCashFlowTrend({ transactions: state.transactions, budgets: state.budgets, goals: state.goals } as any, 6);
    const maxVal = Math.max(...rawTrend.map(Math.abs), 100);
    return rawTrend.map(v => Math.max(10, Math.min(100, (v / maxVal) * 100)));
  }, [state.transactions, state.budgets, state.goals]);

  const allocation = useMemo(() => VylosCalculations.getAllocationPercentages({ transactions: state.transactions, budgets: state.budgets, goals: state.goals } as any, selectedMonth), [state.transactions, state.budgets, state.goals, selectedMonth]);

  return (
    <div className="vylos-glass-readable p-8 md:p-12 flex flex-col relative w-full h-full min-h-[500px] mb-12">
      {/* Background Accent Wrapper */}
      <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-400/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Financial Overview</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Real-time Intelligence Active</span>
          </div>
        </div>
        <V2Popover
          trigger={
            <button className="vylos-glass-popup-visible px-5 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 border-white/30 bg-white/15 dark:bg-white/10 shadow-lg">
              {currentLabel} <ChevronDown size={14} className="text-primary" />
            </button>
          }
        >
          <div className="w-72 overflow-hidden">
            <div className="p-4 border-b border-white/10 mb-2 px-6 bg-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analysis Period</span>
            </div>
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2">
              {months.map((m) => (
                <button
                  key={m.iso}
                  onClick={() => {
                    onMonthChange(m.iso);
                  }}
                  className={`glass-option mb-1 ${selectedMonth.startsWith(m.iso.slice(0, 7)) ? 'active' : 'text-slate-600 dark:text-white/70'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectedMonth.startsWith(m.iso.slice(0, 7)) ? 'bg-white' : 'bg-slate-300 dark:bg-white/20'}`} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </V2Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 flex-1 relative z-10">
        {/* Balance & Charts */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Total Balance */}
            <div className="flex flex-col">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-4">Net Worth / Liquidity</p>
              <div className="flex items-baseline gap-1">
                <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  {formatCurrency(netWorth).split('.')[0]}
                </span>
                <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                  .{formatCurrency(netWorth).split('.')[1] || "00"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <div className={`flex items-center gap-2 ${growth >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'} px-4 py-2 rounded-2xl text-[12px] font-black shadow-inner border border-white/10`}>
                  <ArrowUpRight size={16} strokeWidth={3} className={growth < 0 ? 'rotate-90' : ''} />
                  <span>{growth >= 0 ? '+' : ''}{growth.toFixed(2)}%</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">vs Previous Month</span>
              </div>
            </div>

            {/* Cash Flow Bars */}
            <div className="flex flex-col bg-white/40 dark:bg-black/20 p-8 rounded-[32px] border border-white/40 dark:border-white/10 shadow-inner">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cash Flow Index</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stats.cashFlowIndex)}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <BarChart3 size={24} />
                </div>
              </div>
              <div className="flex items-end gap-3 h-28">
                {cashFlowTrend.map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/5 rounded-full relative group overflow-hidden h-full">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary to-cyan-400 rounded-full transition-all duration-1000 group-hover:from-blue-400 group-hover:to-cyan-300 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Spending Allocation */}
        <div className="md:col-span-5 lg:col-span-4 border-l border-slate-200/20 pl-12 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Monthly Allocation</p>
          </div>
          <div className="flex flex-col gap-10">
            <div className="relative w-44 h-44 mx-auto">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="4" />
                {allocation.needs + allocation.wants > 0 ? (
                  <>
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray={`${allocation.needs} 100`} strokeLinecap="round" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#06B6D4" strokeWidth="4" strokeDasharray={`${allocation.wants} 100`} strokeDashoffset={`-${allocation.needs}`} strokeLinecap="round" />
                  </>
                ) : (
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeWidth="4" strokeDasharray="1 4" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {allocation.needs + allocation.wants > 0 ? (allocation.needs >= allocation.wants ? "Needs" : "Wants") : "No Data"}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {allocation.needs + allocation.wants > 0 ? `${Math.max(allocation.needs, allocation.wants)}%` : "0%"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                  <span className="text-[12px] font-black text-slate-600 dark:text-slate-400">Needs</span>
                </div>
                <span className="text-[12px] font-black text-slate-900 dark:text-white">{allocation.needs}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  <span className="text-[12px] font-black text-slate-600 dark:text-slate-400">Wants</span>
                </div>
                <span className="text-[12px] font-black text-slate-900 dark:text-white">{allocation.wants}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row of Overview: Small Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14 relative z-10">
        {[
          { label: "Portfolio", val: formatCurrency(stats.portfolioTotal), trend: growth >= 0 ? "Expanding" : "Declining", color: growth >= 0 ? "text-blue-500" : "text-amber-500", icon: <TrendingUp size={20} /> },
          { label: "Net Worth", val: formatCurrency(stats.netWorth), trend: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`, color: "text-indigo-500", icon: <Wallet size={20} /> },
          { label: "Savings", val: formatCurrency(stats.totalSaved), trend: "Accumulating", color: "text-emerald-500", icon: <ShieldCheck size={20} /> },
          { label: "Goals", val: `${stats.activeGoalsCount} Active`, trend: "Tracking", color: "text-amber-500", icon: <Trophy size={20} /> }
        ].map((stat, i) => (
          <div key={i} className="vylos-glass-soft p-6 flex flex-col gap-3 group hover:scale-[1.03] active:scale-95 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-white dark:bg-white/10 shadow-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</span>
              <p className={`text-[10px] font-black ${stat.color} mt-1.5 uppercase tracking-widest`}>{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

