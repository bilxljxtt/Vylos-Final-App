"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { 
  Download, ChevronDown, TrendingUp, TrendingDown, 
  Target, ShieldCheck, Activity, ArrowRight, Wallet, Sparkles, Filter, MoreHorizontal
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { computeHealthScoreMetrics } from "@/lib/store";
import { VylosCalculations } from "@/lib/vylosCalculations";
import Chart from "chart.js/auto";

interface AnalyticsViewProps {
  netWorth?: number;
  totalSaved?: number;
  transactions?: any[];
  budgets?: any;
  goals?: any[];
  userProfile?: any;
  chartRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function AnalyticsView({ netWorth = 124500, chartRef }: AnalyticsViewProps) {
  const { state, formatCurrency } = useAppStore();
  const spendingChartRef = useRef<HTMLCanvasElement | null>(null);
  const savingsChartRef = useRef<HTMLCanvasElement | null>(null);
  const spendingInst = useRef<any>(null);
  const savingsInst = useRef<any>(null);

  const [activeTab, setActiveTab] = useState("This Month");

  const stats = useMemo(() => VylosCalculations.getMonthStats(state, state.selectedMonth), [state]);
  const trendData = useMemo(() => VylosCalculations.getMonthlyTrend(state), [state]);
  const { labels: spendingLabels, planned: spendingPlanned, actual: spendingActual } = useMemo(() => 
    VylosCalculations.getPlannedVsActual(state, state.selectedMonth), 
    [state]
  );

  const health = useMemo(() => computeHealthScoreMetrics(state), [state]);

  useEffect(() => {
    if (spendingChartRef.current) {
      if (spendingInst.current) spendingInst.current.destroy();
      
      spendingInst.current = new Chart(spendingChartRef.current, {
        type: 'line',
        data: {
          labels: spendingLabels.map(l => l.slice(8)),
          datasets: [
            {
              label: 'This Month',
              data: spendingActual,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHitRadius: 10
            },
            {
              label: 'Planned',
              data: spendingPlanned,
              borderColor: '#94A3B8',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.4,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { 
              grid: { color: 'rgba(0,0,0,0.05)' }, 
              border: { display: false },
              ticks: { font: { size: 10 }, color: '#94A3B8', callback: (value) => formatCurrency(Number(value)) }
            }
          }
        }
      });
    }

    if (savingsChartRef.current) {
      if (savingsInst.current) savingsInst.current.destroy();
      savingsInst.current = new Chart(savingsChartRef.current, {
        type: 'bar',
        data: {
          labels: trendData.map(t => t.month),
          datasets: [{
            data: trendData.map(t => t.netWorth),
            backgroundColor: '#10B981',
            borderRadius: 4,
            barThickness: 24
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { 
              grid: { color: 'rgba(0,0,0,0.05)' }, 
              border: { display: false },
              ticks: { font: { size: 10 }, color: '#94A3B8', callback: (value) => formatCurrency(Number(value)) }
            }
          }
        }
      });
    }

    return () => {
      if (spendingInst.current) spendingInst.current.destroy();
      if (savingsInst.current) savingsInst.current.destroy();
    };
  }, [spendingLabels, spendingPlanned, spendingActual, trendData, formatCurrency]);

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">Progress Overview</h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">Your financial journey at a glance.</p>
        </div>
        
        <div className="vylos-glass-readable p-1.5 flex items-center gap-2">
          {['This Month', '3 Months', '6 Months', 'YTD', 'Custom'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
          <button className="px-3 py-2 text-slate-500 hover:text-slate-700">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* ─── Top Row (5 Cards) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        <div className="vylos-glass-readable p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4"><span className="text-[12px] font-black text-slate-900 dark:text-white">Overall Progress</span><MoreHorizontal size={14} className="text-slate-400"/></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-r-emerald-100 dark:border-r-slate-800" />
            <div className="flex flex-col">
              <span className="text-[20px] font-black text-slate-900 dark:text-white leading-none">{health.score}%</span>
              <span className="text-[11px] font-bold text-emerald-600">{health.label}</span>
              <span className="text-[10px] font-medium text-emerald-500">+8% <span className="text-slate-400">vs last month</span></span>
            </div>
          </div>
        </div>

        <div className="vylos-glass-readable p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-4"><span className="text-[12px] font-black text-slate-900 dark:text-white">Total Savings</span><MoreHorizontal size={14} className="text-slate-400"/></div>
          <div className="flex flex-col">
            <span className="text-[20px] font-black text-slate-900 dark:text-white leading-none">{formatCurrency(stats.totalSaved)}</span>
            <span className="text-[10px] font-medium text-emerald-500 mt-1">+12.5% <span className="text-slate-400">vs last month</span></span>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-12">
            <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500 fill-none" strokeWidth="2"><path d="M0 25 L20 20 L40 22 L60 15 L80 10 L100 5"/></svg>
          </div>
        </div>

        <div className="vylos-glass-readable p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-4"><span className="text-[12px] font-black text-slate-900 dark:text-white">Amount Saved</span><MoreHorizontal size={14} className="text-slate-400"/></div>
          <div className="flex flex-col">
            <span className="text-[20px] font-black text-slate-900 dark:text-white leading-none">{formatCurrency(stats.income - stats.expense)}</span>
            <span className="text-[10px] font-medium text-blue-500 mt-1">{stats.savingsRate}% <span className="text-slate-400">of income</span></span>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-12">
            <svg viewBox="0 0 100 30" className="w-full h-full stroke-blue-500 fill-none" strokeWidth="2"><path d="M0 25 L20 18 L40 20 L60 12 L80 15 L100 8"/></svg>
          </div>
        </div>

        <div className="vylos-glass-readable p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4"><span className="text-[12px] font-black text-slate-900 dark:text-white">Budget Adherence</span><MoreHorizontal size={14} className="text-slate-400"/></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-b-purple-100 dark:border-b-slate-800" />
            <div className="flex flex-col">
              <span className="text-[20px] font-black text-slate-900 dark:text-white leading-none">{100 - health.stats.budgetUtilization}%</span>
              <span className="text-[11px] font-bold text-purple-600">Good</span>
              <span className="text-[10px] font-medium text-emerald-500">+6% <span className="text-slate-400">vs last month</span></span>
            </div>
          </div>
        </div>

        <div className="vylos-glass-readable p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4"><span className="text-[12px] font-black text-slate-900 dark:text-white">Goals On Track</span><MoreHorizontal size={14} className="text-slate-400"/></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-l-amber-100 dark:border-l-slate-800" />
            <div className="flex flex-col">
              <span className="text-[20px] font-black text-slate-900 dark:text-white leading-none">{state.goals.filter(g => g.status === 'On Track').length} of {state.goals.length}</span>
              <span className="text-[11px] font-bold text-amber-600">{state.goals.length > 0 ? Math.round((state.goals.filter(g => g.status === 'On Track').length / state.goals.length) * 100) : 0}%</span>
              <span className="text-[10px] font-medium text-slate-400">on track</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Middle Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Spending Trend */}
        <div className="lg:col-span-5 vylos-glass-readable p-6 flex flex-col h-[320px]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <span className="text-[14px] font-black text-slate-900 dark:text-white mb-2">Spending Trend</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/><span className="text-[11px] font-bold text-slate-500">This Month</span></div>
                <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 border-b-2 border-dashed border-slate-400"/><span className="text-[11px] font-bold text-slate-500">Planned</span></div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium text-slate-400">Total Spending</span>
              <span className="text-[18px] font-black text-slate-900 dark:text-white leading-none mt-1">{formatCurrency(stats.expense)}</span>
            </div>
          </div>
          <div className="flex-1 relative w-full"><canvas ref={spendingChartRef} /></div>
        </div>

        {/* Savings Growth */}
        <div className="lg:col-span-4 vylos-glass-readable p-6 flex flex-col h-[320px]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-[14px] font-black text-slate-900 dark:text-white mb-2">Net Worth Growth</span>
              <div className="flex items-end gap-2">
                <span className="text-[18px] font-black text-slate-900 dark:text-white leading-none">{formatCurrency(stats.netWorth)}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative w-full pt-4"><canvas ref={savingsChartRef} /></div>
        </div>

        {/* Key Insights & Milestones Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="lg:col-span-3 vylos-glass-readable p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="text-[12px] font-black text-blue-600">Key Insights</span>
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">AI-powered summary</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar">
              {VylosCalculations.getRecentInsights(state).map((insight, idx) => (
                <div key={idx} className={`flex gap-3 ${insight.type === 'warning' ? 'bg-red-50 dark:bg-red-500/10' : insight.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-blue-50 dark:bg-blue-500/10'} p-3 rounded-2xl`}>
                  {insight.type === 'warning' ? <Activity size={16} className="text-red-600 shrink-0 mt-0.5" /> : insight.type === 'success' ? <Target size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{insight.title}</span>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-snug">{insight.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-12">
        
        {/* Goal Performance */}
        <div className="lg:col-span-4 vylos-glass-readable p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[14px] font-black text-slate-900 dark:text-white">Goal Performance</span>
            <button className="text-[11px] font-bold text-blue-600">View all</button>
          </div>
          <div className="flex flex-col gap-5">
            {state.goals.slice(0, 4).map((g, i) => {
              const p = Math.round((g.currentAmount / g.targetAmount) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-lg">{g.icon || '🎯'}</div>
                  <div className="flex flex-col flex-1 gap-1.5">
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-slate-900 dark:text-white leading-tight">{g.title}</span>
                        <span className="text-[10px] font-medium text-slate-500"><span className="font-bold text-emerald-600">{formatCurrency(g.currentAmount)}</span> of {formatCurrency(g.targetAmount)}</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{p}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-blue-500 rounded-full`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Performance */}
        <div className="lg:col-span-4 vylos-glass-readable p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[14px] font-black text-slate-900 dark:text-white">Budget Performance</span>
            <button className="text-[11px] font-bold text-blue-600">View all</button>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[12px] font-black text-slate-900 dark:text-white">Overall Budget</span>
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-black text-slate-900 dark:text-white">{health.stats.budgetUtilization}%</span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${health.stats.budgetUtilization}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {Object.entries(state.budgets).slice(0, 5).map(([name, b], i) => {
              const spent = VylosCalculations.getSpendingByCategory(state, state.selectedMonth)[name] || 0;
              const p = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center"><Activity size={10} className="text-slate-500" /></div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-slate-500">{formatCurrency(spent)} of {formatCurrency(b.limit)}</span>
                      <span className="text-[11px] font-black text-slate-900 dark:text-white w-6 text-right">{p}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-emerald-500 rounded-full`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Toward Targets & Milestones combined right col */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="vylos-glass-readable p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[14px] font-black text-slate-900 dark:text-white">Milestones</span>
              <button className="text-[11px] font-bold text-blue-600">View all</button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { t: 'Reached 75% of Emergency Fund', d: 'May 20, 2024', icon: <ShieldCheck size={14}/>, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
                { t: '3 Consecutive No-Spend Weeks', d: 'May 15, 2024', icon: <Target size={14}/>, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
                { t: 'Saved $3,000 this month', d: 'May 10, 2024', icon: <TrendingUp size={14}/>, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
                { t: 'Stuck to budget 4 weeks in a row', d: 'May 5, 2024', icon: <Activity size={14}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' }
              ].map((m, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.color}`}>{m.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">{m.t}</span>
                    <span className="text-[9px] font-medium text-slate-500 mt-0.5">{m.d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
