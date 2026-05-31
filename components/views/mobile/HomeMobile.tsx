"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CreditCard, Wallet, Target, Sparkles, Calendar, Bell, 
  Settings, ShieldCheck, ArrowUpRight, TrendingUp, Plus, User 
} from "lucide-react";
import { VylosAvatar } from "@/components/ui/VylosAvatar";
import { VylosCalculations } from "@/lib/vylosCalculations";
import { useAppStore } from "@/lib/AppContext";

interface HomeMobileProps {
  income: number;
  expense: number;
  netWorth: number;
  savingsRate: number;
  transactions: any[];
  goals: any[];
  budgetSummary?: any;
  healthScore: number;
  userName?: string;
  userProfile?: any;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  formatCurrency: (val: number) => string;
  setPage: (page: string) => void;
  onXPClick: () => void;
  onHealthClick: () => void;
}

export const HomeMobile: React.FC<HomeMobileProps> = ({
  income,
  expense,
  netWorth,
  savingsRate,
  transactions,
  goals,
  budgetSummary,
  healthScore,
  userName,
  userProfile,
  selectedMonth,
  formatCurrency,
  setPage,
  onXPClick,
  onHealthClick
}) => {
  const { state } = useAppStore();
  const [greeting, setGreeting] = useState("Good afternoon");
  
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const firstName = userName?.split(" ")[0] || "User";
  const xp = userProfile?.totalXp || 0;
  const streak = userProfile?.currentStreak || 0;

  const currentStats = useMemo(() => {
    return VylosCalculations.getMonthStats({ 
      transactions: state.transactions, 
      budgets: state.budgets, 
      goals: state.goals 
    } as any, selectedMonth);
  }, [state.transactions, state.budgets, state.goals, selectedMonth]);

  const allocation = useMemo(() => {
    return VylosCalculations.getAllocationPercentages({ 
      transactions: state.transactions, 
      budgets: state.budgets, 
      goals: state.goals 
    } as any, selectedMonth);
  }, [state.transactions, state.budgets, state.goals, selectedMonth]);

  // Quick summary line based on current situation
  const summaryInsight = useMemo(() => {
    const cashFlow = currentStats.income - currentStats.expense;
    if (cashFlow < 0) {
      return `Spending is outstripping income by ${formatCurrency(Math.abs(cashFlow))} this month. Adjust limits.`;
    }
    if (allocation.needs > 50) {
      return `Needs are at ${allocation.needs}%. Try allocating a bit more to goals.`;
    }
    return `You've saved ${formatCurrency(currentStats.totalSaved)} this month. Keep it up!`;
  }, [currentStats, allocation, formatCurrency]);

  const getHealthColor = (s: number) => {
    if (s >= 85) return "text-emerald-500";
    if (s >= 70) return "text-blue-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getHealthBg = (s: number) => {
    if (s >= 85) return "bg-emerald-500/10";
    if (s >= 70) return "bg-blue-500/10";
    if (s >= 40) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  const healthColor = getHealthColor(healthScore);
  const healthBg = getHealthBg(healthScore);

  const navTiles = [
    { 
      label: "Activity", 
      sub: "Transactions history", 
      icon: <CreditCard size={20} />, 
      page: "transactions",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    { 
      label: "Budgeting", 
      sub: "Track categories", 
      icon: <Wallet size={20} />, 
      page: "budget",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
    },
    { 
      label: "Savings Goals", 
      sub: "Monitor goals", 
      icon: <Target size={20} />, 
      page: "goals",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    { 
      label: "AI Advisor", 
      sub: "Ask financial questions", 
      icon: <Sparkles size={20} />, 
      page: "ai",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    },
    { 
      label: "Calendar", 
      sub: "Agenda & bills", 
      icon: <Calendar size={20} />, 
      page: "calendar",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    { 
      label: "Reminders", 
      sub: "Bills schedule", 
      icon: <Bell size={20} />, 
      page: "reminders",
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-20 max-w-md mx-auto px-1 animate-in fade-in duration-500">
      {/* 1. Header */}
      <div className="flex items-center justify-between py-2">
        <div className="flex flex-col">
          <span className="text-xl font-black text-blue-700 dark:text-blue-400 tracking-tighter uppercase">VYLOS</span>
          <span className="text-[9px] font-black uppercase mobile-muted tracking-[0.25em]">Intelligence Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPage("settings")}
            className="w-9 h-9 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/15 flex items-center justify-center text-slate-800 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
          
          <button 
            onClick={onXPClick}
            className="flex items-center gap-1.5 p-1 pr-3 bg-white/55 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            <VylosAvatar url={userProfile?.avatarUrl} name={userName || "User"} size="sm" className="!w-7 !h-7 !rounded-full border border-white" />
            <span className="text-[10px] font-black mobile-subheading">{xp.toLocaleString()} XP</span>
          </button>
        </div>
      </div>

      {/* 2. Welcome & Greeting Summary */}
      <div className="vylos-glass-readable p-5 rounded-3xl flex flex-col border border-white/25 shadow-xl">
        <span className="text-[11px] font-black mobile-label uppercase tracking-widest">{greeting}</span>
        <h2 className="text-2xl font-black mobile-heading tracking-tight mt-1">{firstName}</h2>
        <p className="text-[11px] font-bold mobile-body mt-2.5 leading-relaxed">
          {summaryInsight}
        </p>
      </div>

      {/* 3. Available Net Worth & Health Score Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Net Worth */}
        <div className="vylos-glass-readable p-4 rounded-3xl flex flex-col border border-white/25 shadow-lg min-w-0">
          <span className="text-[9px] font-black mobile-label uppercase tracking-widest truncate">Net Liquidity</span>
          <span className="text-lg font-black mobile-heading tracking-tighter mt-1 whitespace-nowrap truncate leading-none">
            {formatCurrency(netWorth).split('.')[0]}
            <span className="text-xs font-bold mobile-muted">.{formatCurrency(netWorth).split('.')[1] || "00"}</span>
          </span>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
              <ArrowUpRight size={10} strokeWidth={3} /> Active
            </span>
          </div>
        </div>

        {/* Financial Health Score */}
        <div 
          onClick={onHealthClick}
          className="vylos-glass-readable p-4 rounded-3xl flex flex-col border border-white/25 shadow-lg cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors min-w-0"
        >
          <span className="text-[9px] font-black mobile-label uppercase tracking-widest truncate">Health Index</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-black tracking-tighter leading-none ${healthColor}`}>{healthScore}</span>
            <span className="text-[10px] font-bold mobile-muted">/100</span>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg ${healthBg} ${healthColor} truncate`}>
              {userProfile?.userType === 'small_business' ? "PRO" : "OPTIMIZED"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Navigation Cards Grid */}
      <div className="flex flex-col gap-3 mt-1">
        <span className="text-[10px] font-black mobile-label uppercase tracking-widest px-1">Financial Tools</span>
        <div className="grid grid-cols-2 gap-4">
          {navTiles.map((tile, i) => (
            <button
              key={i}
              onClick={() => setPage(tile.page)}
              className="vylos-glass-readable p-4 rounded-3xl border border-white/25 shadow-md flex flex-col items-start text-left hover:scale-[1.02] active:scale-[0.98] transition-all group min-w-0"
            >
              <div className={`p-2.5 rounded-2xl ${tile.color} border shrink-0 transition-transform group-hover:scale-115`}>
                {tile.icon}
              </div>
              <span className="text-xs font-black mobile-subheading mt-3 truncate w-full">{tile.label}</span>
              <span className="text-[9px] font-bold mobile-muted mt-1 leading-snug truncate w-full">{tile.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Quick Mobile Actions Pinned Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] max-w-sm flex items-center justify-around p-3 bg-white/40 dark:bg-black/60 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.25)] rounded-full">
        <button 
          onClick={() => setPage("ai")}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Sparkles size={14} />
          <span>Ask Advisor</span>
        </button>
        <div className="w-px h-6 bg-slate-300/30 dark:bg-white/10" />
        <button 
          onClick={() => setPage("transactions")}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20"
        >
          <Plus size={14} strokeWidth={3} />
          <span>Activity</span>
        </button>
      </div>
    </div>
  );
};
