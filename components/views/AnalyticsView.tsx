"use client";

import React, { RefObject } from "react";
import { TrendingUp, 
  ArrowUpRight, 
  PiggyBank, 
  Target, 
  Trophy, 
  Info, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles, 
  Layout, 
  ArrowRight,
  TrendingDown,
  Calendar,
  Zap,
  Briefcase,
  Flame,
  Search,
  Wallet
} from "lucide-react";
import { } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { ViewContainer } from "../ui/ViewContainer";
import { BudgetService } from "@/lib/services/BudgetService";


interface AnalyticsViewProps {
  chartRef: RefObject<HTMLCanvasElement | null>;
  donutRef?: RefObject<HTMLCanvasElement | null>;
  goals?: any[];
  netWorth?: number;
  totalSaved?: number;
  transactions?: any[];
  budgets?: any;
  userProfile?: any;
}

export function AnalyticsView({ 
    chartRef, 
    goals = [], 
    netWorth = 0, 
    totalSaved = 0,
    transactions = [],
    budgets = {},
    userProfile = {}
}: AnalyticsViewProps) {
  const { state, formatCurrency, lastSynced } = useAppStore();
  
  // Real-time Calculations
  const budgetSummary = BudgetService.getBudgetSummary(state, state.selectedMonth);
  const income = state.transactions
    .filter(t => {
      const d = new Date(t.date);
      const [year, month] = state.selectedMonth.split('-').map(Number);
      const start = new Date(year, month - 1, 1).getTime();
      const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();
      return d.getTime() >= start && d.getTime() <= end && t.amount > 0;
    })
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalSpent = budgetSummary.totalSpent;
  const moneySaved = Math.max(0, income - totalSpent);
  
  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargetAcrossGoals = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallGoalProgress = totalTargetAcrossGoals > 0 
    ? Math.min(100, Math.round((totalSavedAcrossGoals / totalTargetAcrossGoals) * 100))
    : 0;

  // Streak Calculation (Track Expenses)
  const getStreak = () => {
    const dates = [...new Set(transactions.map(t => new Date(t.date).toDateString()))].map(d => new Date(d).getTime());
    dates.sort((a, b) => b - a);
    let streak = 0;
    let curr = new Date().setHours(0,0,0,0);
    for (let i = 0; i < dates.length; i++) {
        if (dates[i] === curr || dates[i] === curr - 86400000) {
            streak++;
            curr = dates[i] - 86400000;
        } else break;
    }
    return streak;
  };
  const expenseStreak = getStreak();

  // Achievements Logic
  const getAchievements = () => {
      const list = [];
      if (moneySaved > 1000) list.push({ label: "Budget Master", sub: "Stayed well under budget this month", date: "Just now", color: "emerald", icon: <CheckCircle2 size={18} /> });
      if (goals.filter(g => g.currentAmount >= g.targetAmount).length > 0) list.push({ label: "Goal Getter", sub: "Completed a financial target", date: "Recently", color: "purple", icon: <Target size={18} /> });
      if (expenseStreak >= 7) list.push({ label: "Consistency King", sub: "Logged transactions for 7 days straight", date: "Recently", color: "amber", icon: <Zap size={18} /> });
      if (netWorth > 10000) list.push({ label: "Wealth Builder", sub: "Reached R10,000 net worth", date: "Recently", color: "blue", icon: <TrendingUp size={18} /> });
      return list;
  };
  const achievements = getAchievements();
  const unlockedAchievements = achievements.length;

  return (
    <ViewContainer className="flex flex-col pt-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-text-main tracking-tight">Progress</h1>
            {lastSynced && (
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-500 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>
          <p className="text-text-muted font-medium">Track your financial journey and celebrate your wins.</p>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Net Worth Growth</span>
            <span className="text-2xl font-black text-emerald-500 tracking-tight">{formatCurrency(netWorth)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                <ArrowUpRight size={10} />
                Based on your current balance
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <PiggyBank size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Money Saved</span>
            <span className="text-2xl font-black text-blue-500 tracking-tight">{formatCurrency(moneySaved)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 mt-1">
                <ArrowUpRight size={10} />
                Saved this month
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Target size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Goals Progress</span>
            <span className="text-2xl font-black text-purple-500 tracking-tight">{overallGoalProgress}%</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-purple-500 mt-1">
                <ArrowUpRight size={10} />
                Average across all targets
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Trophy size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Achievements Unlocked</span>
            <span className="text-2xl font-black text-amber-500 tracking-tight">{unlockedAchievements}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-1">
                <ArrowUpRight size={10} />
                {unlockedAchievements} total milestones
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Financial Health Journey */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-text-main tracking-tight">Financial Health Journey</h2>
                    <Info size={16} className="text-text-muted cursor-help" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-border-main/50 border border-border-main rounded-xl text-[10px] font-black text-text-main uppercase tracking-widest">
                    6 Months <ChevronDown size={14} />
                </button>
            </div>
            
            <div className="w-full h-[320px] relative mb-10">
                <div className="absolute top-0 right-0 z-10 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                    82
                </div>
                <canvas ref={chartRef}></canvas>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <TrendingUp size={24} />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-sm font-black text-text-main tracking-tight">Financial Health Insight</h4>
                    <p className="text-xs font-medium text-text-muted">Consistency in tracking and budgeting is the fastest way to improve your score.</p>
                </div>
            </div>
          </div>

          {/* Habits & Streaks */}
          <section className="space-y-6">
            <h2 className="text-lg font-black text-text-main tracking-tight px-2">Habits & Streaks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Track Expenses", count: expenseStreak, streak: expenseStreak > 0 ? "Amazing streak!" : "Start tracking today!", color: "emerald", icon: <Search size={18} /> },
                    { label: "Stay Under Budget", count: Math.round(totalSpent < income ? 21 : 5), streak: "Great discipline!", color: "purple", icon: <Briefcase size={18} /> },
                    { label: "Save Money", count: Math.round(moneySaved / 100), streak: "Consistency is key!", color: "amber", icon: <PiggyBank size={18} /> },
                    { label: "Goal Progress", count: overallGoalProgress, streak: "Target focused!", color: "blue", icon: <TrendingUp size={18} /> },
                ].map((habit, idx) => (
                    <div key={idx} className="bg-card border border-border-main p-6 rounded-[2rem] flex flex-col items-center text-center shadow-sm">
                        <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                            habit.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                            habit.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                            habit.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-blue-500/10 text-blue-500'
                        }`}>
                            {habit.icon}
                        </div>
                        <span className="text-xs font-black text-text-main uppercase tracking-widest opacity-60 mb-3">{habit.label}</span>
                        <div className="flex flex-col mb-1">
                            <span className="text-2xl font-black text-text-main">{habit.count}</span>
                            <span className="text-[10px] font-bold text-text-muted uppercase">day streak</span>
                        </div>
                        <p className="text-[10px] font-medium text-text-muted mb-4">{habit.streak}</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                <div key={d} className={`w-2 h-2 rounded-full ${d <= 5 ? 'bg-emerald-500' : 'bg-border-main'}`} />
                            ))}
                        </div>
                        <div className="flex justify-between w-full mt-2 px-1 text-[8px] font-black text-text-muted/40 uppercase">
                            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                        </div>
                    </div>
                ))}
            </div>
          </section>Section
        </div>

        {/* Right: Goals & Achievements */}
        <div className="flex flex-col gap-8">
          
          {/* Goals Progress Overview */}
          <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Goals Progress Overview</h3>
                <button className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                    View All Goals <ArrowRight size={14} />
                </button>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="88" cy="88" r="76" fill="transparent" stroke="#F1F5F9" strokeWidth="14" className="dark:stroke-white/5" />
                        <circle cx="88" cy="88" r="76" fill="transparent" stroke="#10B981" strokeWidth="14" strokeDasharray={2 * Math.PI * 76} strokeDashoffset={2 * Math.PI * 76 * (1 - overallGoalProgress / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-text-main">{overallGoalProgress}%</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Overall Progress</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {goals.slice(0, 4).map((goal, idx) => {
                    const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
                    return (
                    <div key={idx} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center text-2xl shadow-inner">🎯</div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-text-main tracking-tight">{goal.title}</span>
                                <span className="text-xs font-black text-text-muted opacity-60">{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-border-main rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-text-muted">{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</span>
                        </div>
                    </div>
                )})}
                {goals.length === 0 && (
                    <div className="flex flex-col items-center py-4 text-center">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-40">No goals set yet</p>
                    </div>
                )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Recent Achievements</h3>
                <button className="text-[10px] font-black text-primary hover:underline">View All</button>
            </div>

            <div className="flex flex-col gap-8">
                {achievements.map((badge, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            badge.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                            badge.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                            badge.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-blue-500/10 text-blue-500'
                        }`}>
                            {badge.icon}
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-text-main tracking-tight">{badge.label}</span>
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">{badge.date}</span>
                            </div>
                            <p className="text-[10px] font-medium text-text-muted truncate pr-2">{badge.sub}</p>
                        </div>
                    </div>
                ))}
                {achievements.length === 0 && (
                    <div className="flex flex-col items-center py-4 text-center">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-40">No achievements yet</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Callout */}
      <div className="mt-12 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute left-[-5%] top-[-100%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        
        <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <Sparkles size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <h3 className="text-xl font-black text-text-main tracking-tight">Keep going, {userProfile?.name?.split(' ')[0] || 'User'}! You're building a stronger financial future.</h3>
                <p className="text-sm font-medium text-text-muted">Your consistency today leads to freedom tomorrow.</p>
            </div>
        </div>
        
        <button className="relative z-10 px-8 py-4 bg-primary hover:bg-emerald-400 text-white font-black rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
            <Layout size={18} />
            View Insights Report
        </button>
      </div>
    </ViewContainer>
  );
}
