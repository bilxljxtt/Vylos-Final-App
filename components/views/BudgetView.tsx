"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Plus, 
  HeartPulse, Sparkles, TrendingDown,
  Calendar, Shield, MoreHorizontal,
  Home, Utensils, Car, Zap, Heart, Divide
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { CATEGORY_METADATA, TransactionCategory, getMonthStart } from "@/lib/store";
import { BudgetService } from "@/lib/services/BudgetService";
import { VylosCalculations } from "@/lib/vylosCalculations";
import Chart from "chart.js/auto";
import { TransactionIcon } from "@/components/ui/TransactionIcon";
import { generateReminderOccurrences } from "@/lib/utils";

interface BudgetViewProps {
  setShowNewBudget: (show: boolean) => void;
  handleDeleteCategory: (cat: string) => void;
  onQuickAddTx?: (cat: TransactionCategory) => void;
  setShowFundCategory?: (show: boolean) => void;
  setShowHealthDetail?: (show: boolean) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ 
  setShowNewBudget, 
  handleDeleteCategory, 
  onQuickAddTx, 
  setShowFundCategory, 
  setShowHealthDetail 
}) => {
  const { state, setSelectedMonth, formatCurrency } = useAppStore();
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const donutInst = useRef<any>(null);
  const lineInst = useRef<any>(null);

  const selectedMonth = state.selectedMonth || getMonthStart();
  const budgetSummary = useMemo(() => BudgetService.calculateBudgetSummary({
    transactions: state.transactions,
    budgets: state.budgets,
    subscriptions: state.subscriptions,
    userProfile: { monthlyIncome: state.userProfile.monthlyIncome }
  } as any, selectedMonth), [state.transactions, state.budgets, state.subscriptions, state.userProfile.monthlyIncome, selectedMonth]);
  const { totalAllocated, totalSpent, totalRemaining, percentageUsed, categories } = budgetSummary;

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthDate = new Date(year, month - 1, 1);
  const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  };

  const daysLeft = useMemo(() => {
    const now = new Date();
    const [selYear, selMonth] = selectedMonth.split('-').map(Number);
    if (now.getFullYear() === selYear && now.getMonth() === selMonth - 1) {
      const endOfMonth = new Date(selYear, selMonth, 0);
      return Math.max(0, endOfMonth.getDate() - now.getDate());
    }
    return 0; // Past or future month
  }, [selectedMonth]);

  // Chart Data
  const catData = useMemo(() => categories
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5), [categories]); // Top 5 for the donut

  useEffect(() => {
    if (!donutRef.current) return;
    if (donutInst.current) donutInst.current.destroy();

    const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#94A3B8"];

    donutInst.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: catData.map(c => c.name),
        datasets: [{
          data: catData.map(c => c.spent),
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4,
          spacing: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${formatCurrency(context.parsed as number)}`;
              }
            }
          }
        }
      }
    });

    return () => { if (donutInst.current) donutInst.current.destroy(); };
  }, [catData, formatCurrency]);

  const { labels, planned, actual } = useMemo(() => 
    VylosCalculations.getPlannedVsActual({
      transactions: state.transactions,
      budgets: state.budgets
    } as any, selectedMonth), 
    [state.transactions, state.budgets, selectedMonth]
  );

  useEffect(() => {
    if (!lineRef.current) return;
    if (lineInst.current) lineInst.current.destroy();

    lineInst.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: labels.map(l => l.slice(8)), // Just the day number
        datasets: [
          {
            label: 'Planned',
            data: planned,
            borderColor: '#94A3B8',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'Actual',
            data: actual,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            pointRadius: 0,
            pointHitRadius: 10,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.parsed.y ?? 0)}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8', maxTicksLimit: 6 } },
          y: { 
            grid: { color: 'rgba(0,0,0,0.05)' }, 
            border: { display: false },
            ticks: { 
              font: { size: 10 }, 
              color: '#94A3B8',
              callback: (value) => formatCurrency(Number(value))
            } 
          }
        }
      }
    });

    return () => { if (lineInst.current) lineInst.current.destroy(); };
  }, [labels, planned, actual, formatCurrency]);

  // Removed local getIcon, using TransactionIcon instead

  const previousMonthDate = new Date(selectedMonth);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthStr = previousMonthDate.toISOString().slice(0, 10);
  const prevSummary = useMemo(() => BudgetService.calculateBudgetSummary({
    transactions: state.transactions,
    budgets: state.budgets,
    subscriptions: state.subscriptions,
    userProfile: { monthlyIncome: state.userProfile.monthlyIncome }
  } as any, previousMonthStr), [state.transactions, state.budgets, state.subscriptions, state.userProfile.monthlyIncome, previousMonthStr]);
  const budgetTrend = useMemo(() => prevSummary.totalAllocated > 0 
    ? ((totalAllocated - prevSummary.totalAllocated) / prevSummary.totalAllocated) * 100 
    : 0, [totalAllocated, prevSummary.totalAllocated]);

  // 1. Budget Health Calculations
  const overBudgetCategories = useMemo(() => {
    return categories.filter(c => c.status === 'over');
  }, [categories]);

  const { healthStatus, healthColor, healthDesc, healthBullets } = useMemo(() => {
    let status = "Good";
    let color = "text-emerald-500 dark:text-emerald-400";
    let desc = "You're on track to finish the month within budget.";
    
    if (overBudgetCategories.length > 0) {
      status = overBudgetCategories.length > 2 ? "Critical" : "Needs Attention";
      color = overBudgetCategories.length > 2 ? "text-red-500 dark:text-red-400 font-black" : "text-amber-500 dark:text-amber-400 font-black";
      desc = `You have exceeded your allocated limit in ${overBudgetCategories.length} categories.`;
    } else if (percentageUsed > 90) {
      status = "Warning";
      color = "text-amber-500 dark:text-amber-400 font-black";
      desc = "You have used more than 90% of your planned budget. Spend cautiously.";
    } else if (percentageUsed < 40 && totalSpent > 0) {
      status = "Excellent";
      color = "text-blue-500 dark:text-blue-400 font-black";
      desc = "Your spending is extremely efficient. Great budget control!";
    }

    const bullets = [];
    if (percentageUsed > 0) {
      bullets.push(`You have spent ${Math.round(percentageUsed)}% of your planned budget.`);
    } else {
      bullets.push("No spending has been recorded for this month yet.");
    }

    if (overBudgetCategories.length > 0) {
      bullets.push(`${overBudgetCategories.length} categories are over budget limit.`);
    } else {
      bullets.push("All categories are within their budget limits.");
    }

    if (totalRemaining > 0) {
      bullets.push(`${formatCurrency(totalRemaining)} remaining budget to allocate/spend.`);
    } else {
      bullets.push("You have no remaining budget left.");
    }

    return { healthStatus: status, healthColor: color, healthDesc: desc, healthBullets: bullets };
  }, [overBudgetCategories, percentageUsed, totalSpent, totalRemaining, formatCurrency]);

  // 2. Vylos Real Insights Calculations
  // Pace check
  const spendingPace = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = today.getFullYear() === year && today.getMonth() === month - 1 ? today.getDate() : daysInMonth;
    
    const dailyLimit = totalAllocated / daysInMonth;
    const dailySpent = totalSpent / currentDay;
    const diff = dailyLimit - dailySpent;

    return {
      dailyLimit,
      dailySpent,
      diff,
      isUnder: diff >= 0
    };
  }, [totalAllocated, totalSpent, year, month]);

  // Real Month Reminders and Bills Total
  const activeBillsTotal = useMemo(() => {
    const monthReminders = generateReminderOccurrences(state.reminders || [], state.reminderCompletions || [], year, month);
    return monthReminders
      .filter((r: any) => r.category === 'Bills' && r.status !== 'completed')
      .reduce((acc: number, r: any) => acc + (r.amount || 0), 0);
  }, [state.reminders, state.reminderCompletions, year, month]);

  // Real Category Recommendation
  const highestSpendingCat = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    const sorted = [...categories].sort((a, b) => b.spent - a.spent);
    return sorted[0].spent > 0 ? sorted[0] : null;
  }, [categories]);

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">Budget</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-white/10 p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
              <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
            </button>
            <span className="w-24 text-center text-sm font-bold text-slate-900 dark:text-white">{monthName}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
              <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          <button 
            onClick={() => setShowNewBudget(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[13px] font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <Sparkles size={16} />
            Manage Budgets
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Realistic Warning Banner */}
          {budgetSummary.isUnrealistic && (
            <div className="vylos-warning-card p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                <Divide size={24} className="rotate-45" />
              </div>
              <div className="flex-1">
                <h4 className="text-[13px] font-black text-amber-600 uppercase tracking-widest mb-1">Over-Allocation Warning</h4>
                <p className="text-[12px] font-medium leading-relaxed">
                  Your total budget allocation (<span className="font-bold">{formatCurrency(budgetSummary.totalAllocated)}</span>) exceeds your monthly income (<span className="font-bold">{formatCurrency(budgetSummary.monthlyIncome)}</span>). This setup may lead to debt accumulation. Consider reducing your limits.
                </p>
              </div>
            </div>
          )}
          
          {/* Total Budget Card */}
          <div className="vylos-glass-readable p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              
              <div className="flex flex-col gap-2 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white">Total Budget</span>
                  <button 
                    onClick={() => setShowNewBudget(true)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-blue-500 transition-colors"
                    title="Edit Budget limits"
                  >
                    <Sparkles size={14} />
                  </button>
                </div>
                <div className="text-[40px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  {formatCurrency(totalAllocated)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium text-slate-700">vs last month</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${budgetTrend >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'}`}>
                    {budgetTrend >= 0 ? <TrendingDown size={12} className="rotate-180" /> : <TrendingDown size={12} />}
                    {Math.abs(budgetTrend).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 flex-1 w-full lg:justify-end">
                {/* Circle Progress */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="40" className={`transition-all duration-1000 ${overBudgetCategories.length > 0 ? 'stroke-red-500' : 'stroke-blue-500'}`} strokeWidth="8" fill="none" strokeDasharray={`${Math.min(100, percentageUsed) * 2.51} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{Math.round(percentageUsed)}%</span>
                    <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Used</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5 flex-1 min-w-[240px] max-w-[340px] w-full">
                  <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Spent</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{formatCurrency(totalSpent)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Remaining</span>
                      <span className={`text-xl font-black leading-none mt-1 ${overBudgetCategories.length > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{formatCurrency(Math.max(0, totalRemaining))}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full">
                      <div className={`h-full rounded-full ${overBudgetCategories.length > 0 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, percentageUsed)}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 w-full">
                      <span>{Math.round(percentageUsed)}% of budget used</span>
                      <span>{daysLeft} days left</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Planned vs Actual */}
          <div className="vylos-glass-readable p-6 flex flex-col h-auto min-h-[360px]">
            <h3 className="text-[15px] font-black text-slate-900 dark:text-white mb-1">Planned vs. Actual</h3>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium mb-3 leading-relaxed">
              Track your total accumulated spending (Actual) day-by-day against your projected monthly budget limit (Planned) to ensure you don't run out of money before month-end.
            </p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-b-2 border-dashed border-slate-400" /><span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Planned</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-500" /><span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Actual</span></div>
            </div>
            <div className="flex-1 relative w-full min-h-[180px] pb-2">
              <canvas ref={lineRef} />
            </div>
          </div>

          {/* Budget by Category Table */}
          <div id="budget-by-category-table" className="vylos-glass-readable p-5 sm:p-8 scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white">Budget by Category</h3>
              <button 
                onClick={() => setShowNewBudget(true)}
                className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
              >
                <Sparkles size={12} />
                Edit Limits
              </button>
            </div>
            
            {/* Desktop Table View */}
            <div className="w-full overflow-x-auto no-scrollbar hidden sm:block">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-3 font-inter">Category</th>
                    <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-3 font-inter">Budget</th>
                    <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-3 font-inter">Spent</th>
                    <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-3 font-inter">Remaining</th>
                    <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-3 font-inter w-32">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => {
                    const pct = Math.min(100, cat.percentageUsed);
                    const isOver = cat.status === 'over';
                    return (
                      <tr key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <TransactionIcon merchant="" category={cat.name} size="sm" />
                            <span className="text-[13px] font-black text-slate-900 dark:text-white">{cat.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-4 text-[13px] font-bold text-slate-700">{formatCurrency(cat.allocated)}</td>
                        <td className="text-right py-4 text-[13px] font-bold text-slate-900 dark:text-white">{formatCurrency(cat.spent)}</td>
                        <td className={`text-right py-4 text-[13px] font-bold ${isOver ? 'text-red-500' : 'text-slate-700'}`}>
                          {isOver ? `-${formatCurrency(cat.spent - cat.allocated)} (Over)` : formatCurrency(cat.remaining)}
                        </td>
                        <td className="text-right py-4 align-middle">
                          <div className="flex items-center gap-3 justify-end">
                            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isOver ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`text-[11px] font-bold w-8 text-right ${isOver ? 'text-red-500 font-black' : 'text-slate-400'}`}>{Math.round(cat.percentageUsed)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden flex flex-col gap-4">
              {categories.map((cat, i) => {
                const pct = Math.min(100, cat.percentageUsed);
                const isOver = cat.status === 'over';
                return (
                  <div key={i} className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <TransactionIcon merchant="" category={cat.name} size="sm" />
                        <span className="text-[13px] font-black text-slate-900 dark:text-white">{cat.name}</span>
                      </div>
                      <span className={`text-[11px] font-bold ${isOver ? 'text-red-500 font-black' : 'text-slate-400'}`}>
                        {Math.round(cat.percentageUsed)}% Used
                      </span>
                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full">
                      <div className={`h-full rounded-full ${isOver ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[12px]">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Budget</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(cat.allocated)}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Spent</span>
                        <span className="font-bold text-slate-950 dark:text-slate-100">{formatCurrency(cat.spent)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
                        <span className={`font-bold ${isOver ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                          {isOver ? `-${formatCurrency(cat.spent - cat.allocated)}` : formatCurrency(cat.remaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => document.getElementById('budget-by-category-table')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-4 text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors hidden sm:block"
            >
              View all categories
            </button>
          </div>

        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Budget Health Card */}
          <div className="vylos-glass-readable p-6">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse size={16} className="text-emerald-500" />
              <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Budget Health</h3>
            </div>
            <div className={`text-2xl font-black tracking-tight leading-none mb-2 ${healthColor}`}>{healthStatus}</div>
            <p className="text-[13px] font-medium text-slate-700 leading-relaxed mb-6">
              {healthDesc}
            </p>

            <div className="flex flex-col gap-4 mb-6">
              {healthBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5"><HeartPulse size={14} className="text-emerald-500" /></div>
                  <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vylos Insights Card (Budget Summary) */}
          <div className="vylos-glass-readable p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-blue-500" />
              <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Budget Summary</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${overBudgetCategories.length > 0 || totalSpent > totalAllocated ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                  {overBudgetCategories.length > 0 || totalSpent > totalAllocated 
                    ? "You are over your monthly budget limits." 
                    : "You are within your monthly budget limits."}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] shrink-0" />
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                  {highestSpendingCat 
                    ? <span>Your highest category is <span className="font-bold text-slate-900 dark:text-white">{highestSpendingCat.name}</span>.</span>
                    : "No category spending recorded yet."}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${totalRemaining >= 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                  {totalRemaining >= 0 
                    ? <span>You have <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalRemaining)}</span> remaining.</span>
                    : <span>You are overspent by <span className="font-bold text-red-500">{formatCurrency(Math.abs(totalRemaining))}</span>.</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Top Spending Categories */}
          <div className="vylos-glass-readable p-6 flex flex-col h-auto min-h-[360px]">
            <h3 className="text-[15px] font-black text-slate-900 dark:text-white mb-6">Top Spending Categories</h3>
            <div className="flex items-center gap-6 flex-1">
              <div className="w-[120px] h-[120px] relative shrink-0">
                <canvas ref={donutRef} />
              </div>
              <div className="flex flex-col gap-2 flex-1 justify-center">
                {catData.map((cat, i) => {
                  const colors = ["bg-[#10B981]", "bg-[#3B82F6]", "bg-[#8B5CF6]", "bg-[#F59E0B]", "bg-[#94A3B8]"];
                  const pct = Math.round((cat.spent / totalSpent) * 100) || 0;
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-[10px] font-bold text-slate-400 w-6">{pct}%</span>
                        <span className="text-[11px] font-black text-slate-900 dark:text-white w-12">{formatCurrency(cat.spent)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Budget Actions */}
          <div className="vylos-glass-readable p-6 flex flex-col gap-4">
            <h3 className="text-[15px] font-black text-slate-900 dark:text-white">Budget Actions</h3>
            
            <div className="flex flex-col gap-3">
              <div 
                onClick={() => setShowFundCategory?.(true)}
                className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors border border-slate-100 dark:border-white/5 items-center"
              >
                <div className="w-8 h-8 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Divide size={16} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[12px] font-black text-slate-900 dark:text-white">Reallocate Budget</span>
                  <span className="text-[9px] font-medium text-slate-700 mt-0.5 leading-tight">Move funds between categories</span>
                </div>
              </div>

              <div 
                onClick={() => setShowNewBudget(true)}
                className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors border border-slate-100 dark:border-white/5 items-center"
              >
                <div className="w-8 h-8 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <MoreHorizontal size={16} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[12px] font-black text-slate-900 dark:text-white">Adjust Monthly Budget</span>
                  <span className="text-[9px] font-medium text-slate-700 mt-0.5 leading-tight">Update your total monthly budget</span>
                </div>
              </div>

              <div 
                onClick={() => setShowNewBudget(true)}
                className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors border border-slate-100 dark:border-white/5 items-center"
              >
                <div className="w-8 h-8 rounded-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Plus size={16} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[12px] font-black text-slate-900 dark:text-white">Create Category</span>
                  <span className="text-[9px] font-medium text-slate-700 mt-0.5 leading-tight">Add a new budget category</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
