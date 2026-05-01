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

interface AnalyticsViewProps {
  chartRef: RefObject<HTMLCanvasElement | null>;
  donutRef?: RefObject<HTMLCanvasElement | null>;
  goals?: any[];
  netWorth?: number;
  totalSaved?: number;
}

export function AnalyticsView({ chartRef, goals = [], netWorth = 0, totalSaved = 0 }: AnalyticsViewProps) {
  const { formatCurrency } = useAppStore();
  // Stats
  const overallGoalProgress = 64; // Mock as per design
  const completedGoals = 3; // Mock as per design
  const unlockedAchievements = 8; // Mock as per design

  return (
    <ViewContainer className="flex flex-col pt-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-text-main tracking-tight mb-2">Progress</h1>
          <p className="text-text-muted font-medium">Track your financial journey and celebrate your wins.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border-main rounded-xl text-sm font-black text-text-main shadow-sm hover:border-border-strong transition-all">
          <Calendar size={18} className="text-text-muted" />
          This Month
          <ChevronDown size={18} className="text-text-muted ml-2" />
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Net Worth Growth</span>
            <span className="text-2xl font-black text-emerald-500 tracking-tight">{formatCurrency(1250.75)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                <ArrowUpRight size={10} />
                5.2% from last month
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <PiggyBank size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Money Saved</span>
            <span className="text-2xl font-black text-blue-500 tracking-tight">{formatCurrency(2450)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 mt-1">
                <ArrowUpRight size={10} />
                12.8% from last month
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Target size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Goals Progress</span>
            <span className="text-2xl font-black text-purple-500 tracking-tight">64%</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-purple-500 mt-1">
                <ArrowUpRight size={10} />
                8% from last month
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
                2 new this month
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
                    <h4 className="text-sm font-black text-text-main tracking-tight">Great progress! Your financial health score has improved by 18 points.</h4>
                    <p className="text-xs font-medium text-text-muted">Keep up the good habits to reach your goals.</p>
                </div>
            </div>
          </div>

          {/* Habits & Streaks */}
          <section className="space-y-6">
            <h2 className="text-lg font-black text-text-main tracking-tight px-2">Habits & Streaks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Track Expenses", count: 28, streak: "Amazing! Keep it up!", color: "emerald", icon: <Search size={18} /> },
                    { label: "Stay Under Budget", count: 17, streak: "Great job! You're on fire!", color: "purple", icon: <Briefcase size={18} /> },
                    { label: "Save Money", count: 12, streak: "Consistency is key!", color: "amber", icon: <PiggyBank size={18} /> },
                    { label: "Invest Regularly", count: 8, streak: "Building your future!", color: "blue", icon: <TrendingUp size={18} /> },
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
                        <circle cx="88" cy="88" r="76" fill="transparent" stroke="#10B981" strokeWidth="14" strokeDasharray={2 * Math.PI * 76} strokeDashoffset={2 * Math.PI * 76 * 0.36} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-text-main">64%</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Overall Progress</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {[
                    { label: "Vacation to Japan", amount: "$1,850 of $5,000", pct: 37, icon: "🏝️" },
                    { label: "New Car", amount: "$3,240 of $25,000", pct: 13, icon: "🚗" },
                    { label: "Down Payment", amount: "$18,500 of $50,000", pct: 37, icon: "🏠" },
                    { label: "Education Fund", amount: "$2,860 of $10,000", pct: 29, icon: "🎓" },
                ].map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center text-2xl shadow-inner">{goal.icon}</div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-text-main tracking-tight">{goal.label}</span>
                                <span className="text-xs font-black text-text-muted opacity-60">{goal.pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-border-main rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${goal.pct}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-text-muted">{goal.amount}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Recent Achievements</h3>
                <button className="text-[10px] font-black text-primary hover:underline">View All</button>
            </div>

            <div className="flex flex-col gap-8">
                {[
                    { label: "Budget Master", sub: "Stayed under budget for 3 months straight", date: "Jun 15, 2024", color: "emerald", icon: <CheckCircle2 size={18} /> },
                    { label: "Goal Getter", sub: "Completed 2 goals", date: "Jun 10, 2024", color: "purple", icon: <Target size={18} /> },
                    { label: "Saving Streak", sub: "Saved money for 30 days straight", date: "Jun 5, 2024", color: "amber", icon: <Flame size={18} /> },
                    { label: "Wealth Builder", sub: "Increased net worth by 10%", date: "May 28, 2024", color: "blue", icon: <TrendingUp size={18} /> },
                ].map((badge, idx) => (
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
                <h3 className="text-xl font-black text-text-main tracking-tight">Keep going, Alex! You're building a stronger financial future.</h3>
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
