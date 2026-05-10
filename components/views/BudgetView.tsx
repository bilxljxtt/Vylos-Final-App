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

interface BudgetViewProps {
  setShowNewBudget: (show: boolean) => void;
  handleDeleteCategory: (cat: string) => void;
  onQuickAddTx?: (cat: TransactionCategory) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ setShowNewBudget }) => {
  const { state, setSelectedMonth, formatCurrency } = useAppStore();
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const donutInst = useRef<any>(null);
  const lineInst = useRef<any>(null);

  const selectedMonth = state.selectedMonth || getMonthStart();
  const budgetSummary = useMemo(() => BudgetService.calculateBudgetSummary(state, selectedMonth), [state, selectedMonth]);
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
    VylosCalculations.getPlannedVsActual(state, selectedMonth), 
    [state, selectedMonth]
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
  const prevSummary = useMemo(() => BudgetService.calculateBudgetSummary(state, previousMonthStr), [state, previousMonthStr]);
  const budgetTrend = prevSummary.totalAllocated > 0 
    ? ((totalAllocated - prevSummary.totalAllocated) / prevSummary.totalAllocated) * 100 
    : 0;

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">Budget</h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">Plan smart. Spend wisely. Build your future.</p>
        </div>
        
        <div className="flex items-center gap-4">
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
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-blue-500 text-blue-600 rounded-2xl text-[13px] font-bold shadow-sm transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            New Budget
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Total Budget Card */}
          <div className="vylos-glass-readable p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-black text-slate-900 dark:text-white">Total Budget</span>
                <div className="text-[40px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  {formatCurrency(totalAllocated)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium text-slate-500">vs last month</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${budgetTrend >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'}`}>
                    {budgetTrend >= 0 ? <TrendingDown size={12} className="rotate-180" /> : <TrendingDown size={12} />}
                    {Math.abs(budgetTrend).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Circle Progress */}
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="40" className="stroke-blue-500 transition-all duration-1000" strokeWidth="8" fill="none" strokeDasharray={`${Math.min(100, percentageUsed) * 2.51} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{Math.round(percentageUsed)}%</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Used</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 min-w-[200px]">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Spent</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{formatCurrency(totalSpent)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Remaining</span>
                      <span className="text-xl font-black text-emerald-600 leading-none mt-1">{formatCurrency(Math.max(0, totalRemaining))}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, percentageUsed)}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{Math.round(percentageUsed)}% of budget used</span>
                      <span>{daysLeft} days left</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Budget by Category Table */}
          <div className="vylos-glass-readable p-8">
            <h3 className="text-[15px] font-black text-slate-900 dark:text-white mb-6">Budget by Category</h3>
            
            <div className="w-full overflow-x-auto no-scrollbar">
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
                        <td className="text-right py-4 text-[13px] font-bold text-slate-500">{formatCurrency(cat.allocated)}</td>
                        <td className="text-right py-4 text-[13px] font-bold text-slate-900 dark:text-white">{formatCurrency(cat.spent)}</td>
                        <td className={`text-right py-4 text-[13px] font-bold ${isOver ? 'text-red-500' : 'text-slate-500'}`}>
                          {isOver ? formatCurrency(cat.spent - cat.allocated) : formatCurrency(cat.remaining)}
                        </td>
                        <td className="text-right py-4 align-middle">
                          <div className="flex items-center gap-3 justify-end">
                            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 w-8 text-right">{Math.round(cat.percentageUsed)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <button className="mt-4 text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors">
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
            <div className="text-2xl font-black text-emerald-500 tracking-tight leading-none mb-2">Good</div>
            <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
              You're on track to finish the month within budget.
            </p>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><HeartPulse size={14} className="text-emerald-500" /></div>
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">You're spending 18% less than planned</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><HeartPulse size={14} className="text-emerald-500" /></div>
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">No categories are over budget</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><HeartPulse size={14} className="text-emerald-500" /></div>
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">Great job staying on track!</span>
              </div>
            </div>

            <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
              View full analysis <ChevronRight size={14} />
            </button>
          </div>

          {/* Vylos Insights Card */}
          <div className="vylos-glass-readable p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Vylos Insights</h3>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingDown size={20} />
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black text-slate-900 dark:text-white">Spending Pace</span>
                    <ChevronRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">You're spending $142 less per day than your monthly plan.</span>
                  <span className="text-[10px] font-bold text-blue-600 mt-1">View details →</span>
                </div>
              </div>

              <div className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-[14px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black text-slate-900 dark:text-white">Upcoming Bills</span>
                    <ChevronRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">You have $1,245 in bills coming up this month.</span>
                  <span className="text-[10px] font-bold text-blue-600 mt-1">View calendar →</span>
                </div>
              </div>

              <div className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-[14px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Shield size={20} />
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black text-slate-900 dark:text-white">Save More</span>
                    <ChevronRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">You could save $210 this month by reducing Entertainment.</span>
                  <span className="text-[10px] font-bold text-blue-600 mt-1">See recommendations →</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ─── Bottom Row Graphs & Actions ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Planned vs Actual */}
        <div className="vylos-glass-readable p-6 flex flex-col h-[320px]">
          <h3 className="text-[15px] font-black text-slate-900 dark:text-white mb-2">Planned vs. Actual</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-b-2 border-dashed border-slate-400" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Planned</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-500" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual</span></div>
          </div>
          <div className="flex-1 relative w-full h-full pb-2">
            <canvas ref={lineRef} />
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="vylos-glass-readable p-6 flex flex-col h-[320px]">
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
          <button className="mt-4 text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors text-left w-fit">
            View full breakdown
          </button>
        </div>

        {/* Budget Actions */}
        <div className="vylos-glass-readable p-6 flex flex-col h-[320px]">
          <h3 className="text-[15px] font-black text-slate-900 dark:text-white mb-4">Budget Actions</h3>
          
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors border border-slate-100 dark:border-white/5">
              <div className="w-8 h-8 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Divide size={16} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[12px] font-black text-slate-900 dark:text-white">Reallocate Budget</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">Move funds between categories</span>
              </div>
            </div>

            <div className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors border border-slate-100 dark:border-white/5">
              <div className="w-8 h-8 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <MoreHorizontal size={16} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[12px] font-black text-slate-900 dark:text-white">Adjust Monthly Budget</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">Update your total monthly budget</span>
              </div>
            </div>

            <div 
              onClick={() => setShowNewBudget(true)}
              className="flex gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors border border-slate-100 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Plus size={16} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[12px] font-black text-slate-900 dark:text-white">Create Category</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">Add a new budget category</span>
              </div>
            </div>
          </div>

          <button className="mt-2 text-[12px] font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
            View all actions <ChevronRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
};
