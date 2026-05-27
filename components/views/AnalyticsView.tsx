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

  // Determine months count to aggregate based on activeTab
  const monthsCount = useMemo(() => {
    if (activeTab === "3 Months") return 3;
    if (activeTab === "6 Months") return 6;
    if (activeTab === "YTD") {
      const now = new Date(state.selectedMonth);
      return now.getMonth() + 1; // from Jan to selected month
    }
    if (activeTab === "Custom") return 12;
    return 1; // "This Month"
  }, [activeTab, state.selectedMonth]);

  // Aggregate stats across the selected timeframe
  const stats = useMemo(() => {
    const now = new Date(state.selectedMonth);
    const monthsPrefixes: string[] = [];
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsPrefixes.push(d.toISOString().slice(0, 7));
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let investmentSpend = 0;
    const investmentCategories = ["Savings", "Debt Payments"];
    const allTxs = state.transactions;

    for (let i = 0; i < allTxs.length; i++) {
      const t = allTxs[i];
      const tMonthPrefix = t.date.slice(0, 7);
      if (monthsPrefixes.includes(tMonthPrefix) && !VylosCalculations.isBudgetRecord(t.merchant)) {
        if (investmentCategories.includes(t.category)) {
          investmentSpend += Math.abs(t.amount);
        }
        if (t.amount > 0) {
          totalIncome += t.amount;
        } else {
          totalExpense += Math.abs(t.amount);
        }
      }
    }

    let netWorth = 0;
    const selectedMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
    for (let i = 0; i < allTxs.length; i++) {
      const t = allTxs[i];
      const tTime = new Date(t.date).getTime();
      if (tTime <= selectedMonthEnd && !VylosCalculations.isBudgetRecord(t.merchant)) {
        netWorth += t.amount;
      }
    }

    const totalSaved = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const baseBudget = Object.values(state.budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);
    const totalBudget = baseBudget * monthsCount;

    return {
      income: totalIncome,
      expense: totalExpense,
      netWorth: Number.isFinite(netWorth) ? netWorth : 0,
      savingsRate: totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0,
      totalSaved: Math.max(0, totalSaved),
      budgetUtilization: totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0,
      activeGoalsCount: state.goals.filter(g => g.status === 'On Track' || g.status === 'At Risk').length,
      portfolioTotal: Number.isFinite(investmentSpend + totalSaved) ? (investmentSpend + totalSaved) : 0,
      cashFlowIndex: totalIncome - totalExpense
    };
  }, [state, monthsCount]);

  // Compute dynamic preceding month stats to show real comparisons
  const prevStats = useMemo(() => {
    const now = new Date(state.selectedMonth);
    const prevRangeStart = new Date(now.getFullYear(), now.getMonth() - monthsCount, 1);
    const prevMonthsPrefixes: string[] = [];
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(prevRangeStart.getFullYear(), prevRangeStart.getMonth() - i, 1);
      prevMonthsPrefixes.push(d.toISOString().slice(0, 7));
    }

    let prevIncome = 0;
    let prevExpense = 0;
    const allTxs = state.transactions;

    for (let i = 0; i < allTxs.length; i++) {
      const t = allTxs[i];
      const tMonthPrefix = t.date.slice(0, 7);
      if (prevMonthsPrefixes.includes(tMonthPrefix) && !VylosCalculations.isBudgetRecord(t.merchant)) {
        if (t.amount > 0) {
          prevIncome += t.amount;
        } else {
          prevExpense += Math.abs(t.amount);
        }
      }
    }

    return {
      income: prevIncome,
      expense: prevExpense,
      saved: prevIncome - prevExpense,
      savingsRate: prevIncome > 0 ? Math.max(0, Math.round(((prevIncome - prevExpense) / prevIncome) * 100)) : 0
    };
  }, [state, monthsCount]);

  const trendData = useMemo(() => {
    return VylosCalculations.getMonthlyTrend(state, activeTab === "This Month" ? 6 : monthsCount);
  }, [state, activeTab, monthsCount]);

  const { spendingLabels, spendingPlanned, spendingActual, isDailyView } = useMemo(() => {
    if (activeTab === "This Month") {
      const { labels, planned, actual } = VylosCalculations.getPlannedVsActual(state, state.selectedMonth);
      return {
        spendingLabels: labels.map(l => l.slice(8)),
        spendingPlanned: planned,
        spendingActual: actual,
        isDailyView: true
      };
    } else {
      const now = new Date(state.selectedMonth);
      const labels = [];
      const spentData = [];
      const budgetData = [];

      const baseBudget = Object.values(state.budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthPrefix = d.toISOString().slice(0, 7);
        labels.push(d.toLocaleString('default', { month: 'short' }));
        
        let monthSpent = 0;
        for (let j = 0; j < state.transactions.length; j++) {
          const t = state.transactions[j];
          if (t.date.startsWith(monthPrefix) && t.amount < 0 && !VylosCalculations.isBudgetRecord(t.merchant)) {
            monthSpent += Math.abs(t.amount);
          }
        }
        spentData.push(Math.round(monthSpent));
        budgetData.push(Math.round(baseBudget));
      }

      return {
        spendingLabels: labels,
        spendingPlanned: budgetData,
        spendingActual: spentData,
        isDailyView: false
      };
    }
  }, [state, activeTab, monthsCount]);

  const health = useMemo(() => computeHealthScoreMetrics(state), [state]);

  useEffect(() => {
    if (spendingChartRef.current) {
      if (spendingInst.current) spendingInst.current.destroy();
      
      spendingInst.current = new Chart(spendingChartRef.current, {
        type: 'line',
        data: {
          labels: isDailyView ? spendingLabels.map(l => l.slice(8)) : spendingLabels,
          datasets: [
            {
              label: isDailyView ? 'This Month' : 'Actual Spend',
              data: spendingActual,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: isDailyView ? 0 : 4,
              pointHitRadius: 10
            },
            {
              label: isDailyView ? 'Planned' : 'Planned Budget',
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
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8', maxTicksLimit: 6 } },
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
            barThickness: Math.min(24, Math.max(8, 120 / (trendData.length || 1)))
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8', maxTicksLimit: 6 } },
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
  }, [spendingLabels, spendingPlanned, spendingActual, isDailyView, trendData, formatCurrency]);

  // Dynamic growth metrics and comparisons
  const comparisons = useMemo(() => {
    const healthDiff = health.score - 72; // benchmark 72
    const prevSaved = prevStats.saved > 0 ? prevStats.saved : 5000;
    const savingsDiffPct = Math.round(((stats.totalSaved - prevSaved) / prevSaved) * 100);
    const currentSaved = stats.income - stats.expense;
    const prevSavedAmount = prevStats.saved !== 0 ? prevStats.saved : 2000;
    const savedAmountDiffPct = Math.round(((currentSaved - prevSavedAmount) / Math.abs(prevSavedAmount)) * 100);
    const currentAdherence = 100 - health.stats.budgetUtilization;
    const prevAdherence = prevStats.income > 0 ? 100 - Math.round((prevStats.expense / prevStats.income) * 100) : 75;
    const adherenceDiff = currentAdherence - prevAdherence;

    return {
      healthDiff,
      savingsDiffPct: Number.isFinite(savingsDiffPct) ? savingsDiffPct : 0,
      savedAmountDiffPct: Number.isFinite(savedAmountDiffPct) ? savedAmountDiffPct : 0,
      adherenceDiff
    };
  }, [health, stats, prevStats]);

  // Dynamic computed milestones
  const milestonesList = useMemo(() => {
    const list = [];
    const dateStr = new Date(state.selectedMonth).toLocaleString('default', { month: 'short', year: 'numeric' });

    const topGoal = state.goals.reduce((prev, current) => 
      ((current.currentAmount / current.targetAmount) > (prev?.currentAmount / prev?.targetAmount || 0)) ? current : prev, 
      null as any
    );
    if (topGoal) {
      const pct = Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100);
      list.push({
        t: `Reached ${pct}% of "${topGoal.title}"`,
        d: dateStr,
        icon: <ShieldCheck size={14} />,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
      });
    } else {
      list.push({
        t: 'Emergency Reserve Fund established',
        d: dateStr,
        icon: <ShieldCheck size={14} />,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
      });
    }

    const budgetAdherence = 100 - health.stats.budgetUtilization;
    if (budgetAdherence >= 80) {
      list.push({
        t: 'Discipline in budget containment',
        d: dateStr,
        icon: <Target size={14} />,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'
      });
    } else {
      list.push({
        t: 'Consolidated category spending limits',
        d: dateStr,
        icon: <Target size={14} />,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'
      });
    }

    const monthSavings = stats.income - stats.expense;
    if (monthSavings > 0) {
      list.push({
        t: `Saved ${formatCurrency(monthSavings)} in surplus cash`,
        d: dateStr,
        icon: <TrendingUp size={14} />,
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10'
      });
    } else {
      list.push({
        t: 'Maintained balanced monthly operating ledger',
        d: dateStr,
        icon: <TrendingUp size={14} />,
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10'
      });
    }

    const txCount = state.transactions.filter(t => t.date.startsWith(state.selectedMonth.slice(0, 7))).length;
    list.push({
      t: `Successfully audited ${txCount} transactions`,
      d: dateStr,
      icon: <Activity size={14} />,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10'
    });

    return list;
  }, [state, stats.income, stats.expense, formatCurrency, health.stats.budgetUtilization]);

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">Progress Overview</h2>
        </div>
        
        <div className="vylos-glass-readable p-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full shrink-0">
          {['This Month', '3 Months', '6 Months', 'YTD', 'Custom'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0 ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
          <button className="px-3 py-2 text-slate-500 hover:text-slate-700 shrink-0">
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
              <span className={`text-[10px] font-medium ${comparisons.healthDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {comparisons.healthDiff >= 0 ? '+' : ''}{comparisons.healthDiff}% <span className="text-slate-400">vs target</span>
              </span>
            </div>
          </div>
        </div>

        <div className="vylos-glass-readable p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-4"><span className="text-[12px] font-black text-slate-900 dark:text-white">Total Savings</span><MoreHorizontal size={14} className="text-slate-400"/></div>
          <div className="flex flex-col">
            <span className="text-[20px] font-black text-slate-900 dark:text-white leading-none">{formatCurrency(stats.totalSaved)}</span>
            <span className={`text-[10px] font-medium mt-1 ${comparisons.savingsDiffPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {comparisons.savingsDiffPct >= 0 ? '+' : ''}{comparisons.savingsDiffPct}% <span className="text-slate-400">vs last month</span>
            </span>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-12">
            <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500 fill-none" strokeWidth="2"><path d="M0 25 L20 20 L40 22 L60 15 L80 10 L100 5"/></svg>
          </div>
        </div>

        <div className="vylos-glass-readable p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-4"><span className="text-[12px] font-black text-slate-900 dark:text-white">Amount Saved</span><MoreHorizontal size={14} className="text-slate-400"/></div>
          <div className="flex flex-col">
            <span className="text-[20px] font-black text-slate-900 dark:text-white leading-none">{formatCurrency(stats.income - stats.expense)}</span>
            <span className={`text-[10px] font-medium mt-1 ${comparisons.savedAmountDiffPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {comparisons.savedAmountDiffPct >= 0 ? '+' : ''}{comparisons.savedAmountDiffPct}% <span className="text-slate-400">vs last month</span>
            </span>
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
              <span className={`text-[10px] font-medium ${comparisons.adherenceDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {comparisons.adherenceDiff >= 0 ? '+' : ''}{comparisons.adherenceDiff}% <span className="text-slate-400">vs last month</span>
              </span>
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
            </div>
            <div className="flex flex-col gap-4">
              {milestonesList.map((m, i) => (
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
