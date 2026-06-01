"use client";

import React, { useState, useEffect } from "react";
import { V2Header } from "./v2/V2Header";
import { V2ProfileCard } from "./v2/V2ProfileCard";
import { V2FinancialOverview } from "./v2/V2FinancialOverview";
import { RecentTransactionsWidget } from "./v2/RecentTransactionsWidget";
import { BudgetControlWidget } from "./v2/BudgetControlWidget";
import { SavingsGoalsWidget } from "./v2/SavingsGoalsWidget";
import { AIAdvisorWidget } from "./v2/AIAdvisorWidget";
import { HealthScoreWidget } from "./v2/HealthScoreWidget";
import { V2ShortcutDock } from "./v2/V2ShortcutDock";
import { 
  Rocket, Target, Shield, Sparkles, 
  ChevronRight, ArrowRight, Activity, BarChart3, MessageCircle 
} from "lucide-react";
import { GlassCard } from "./v2/GlassCard";
import { useToast } from "@/components/Toast";
import { Permissions } from "@/lib/permissions";

interface DashboardV3Props {
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
  onShowFeedback: () => void;
}

export const DashboardV3: React.FC<DashboardV3Props> = ({
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
  onMonthChange,
  formatCurrency,
  setPage,
  onXPClick,
  onHealthClick,
  onShowFeedback
}) => {
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("Good afternoon");
  const canUseAI = Permissions.canUseAIAdvisor(userProfile);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const showToast = (msg: string, type: "success" | "info" | "warning" | "error" = "info") => {
    toast(msg, type);
  };

  const firstName = userName?.split(" ")[0] || "User";

  const getPersonalizedInsight = () => {
    const type = userProfile?.userType;
    const goal = userProfile?.main_money_goal;
    const challenge = userProfile?.biggest_money_challenge;

    if (type === 'small_business' || type === 'side_hustle') {
      return {
        title: "Business Growth Insight",
        message: "You mentioned tracking business money. Use the 'Business' category for transactions to see them in your tax-ready reports.",
        icon: <Rocket size={20} className="text-blue-500" />
      };
    }
    if (goal === 'save' || goal === 'emergency') {
      return {
        title: "Savings Momentum",
        message: "Your focus is saving. Setting a monthly savings goal of just 10% can significantly improve your financial health score.",
        icon: <Target size={20} className="text-emerald-500" />
      };
    }
    if (challenge === 'overspending') {
      return {
        title: "Spending Guard",
        message: "To help with overspending, set budget limits for 'Entertainment' and 'Dining'—Vylos will alert you at 80% capacity.",
        icon: <Shield size={20} className="text-amber-500" />
      };
    }
    return {
      title: canUseAI ? "Vylos Intelligence" : "Financial Overview",
      message: `Welcome ${firstName}! Start by importing your first transaction to see your personalized health score grow.`,
      icon: <Sparkles size={20} className="text-blue-500" />
    };
  };

  const insight = getPersonalizedInsight();

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-8 relative z-10 pb-24">
      
      {/* Personalized Welcome Banner */}
      <div className="vylos-glass-readable !p-6 !rounded-[2rem] border-white/20 shadow-xl flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
          {insight.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{insight.title}</h4>
          <p className="text-[11px] font-bold text-slate-600 dark:text-white/60 leading-relaxed">{insight.message}</p>
        </div>
        <button 
          onClick={() => setPage(canUseAI ? "ai" : "pricing")}
          className="px-6 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-blue-600/20"
        >
          {canUseAI ? "Ask AI" : "Upgrade"}
        </button>
      </div>

      {/* Top Row: Profile & Overview Mega-Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch h-full">
        
        {/* Profile Column (Left) */}
        <div className="lg:col-span-3 flex flex-col gap-6 md:gap-8 h-full">
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            <V2ProfileCard 
              userName={userName || "Vylos User"}
              email={userProfile?.email || "Connect your account"}
              avatarUrl={userProfile?.avatarUrl}
              xp={userProfile?.totalXp || 0}
              streak={userProfile?.currentStreak || 0}
              tier={userProfile?.subscription_tier}
              onUpgrade={() => setPage("pricing")}
              onXPClick={onXPClick}
            />
            <div className="flex-1">
              <HealthScoreWidget onDetailClick={onHealthClick} />
            </div>
          </div>
        </div>

        {/* Financial Overview Mega Card (Right) */}
        <div className="lg:col-span-9 flex h-full">
          <V2FinancialOverview 
            income={income}
            netWorth={netWorth}
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Middle Row: 4 Column Widget Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${canUseAI ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-6 md:gap-8`}>
        <RecentTransactionsWidget 
          transactions={transactions} 
          formatCurrency={formatCurrency}
          onViewAll={() => setPage("transactions")}
        />
        <BudgetControlWidget 
          summary={budgetSummary}
          formatCurrency={formatCurrency}
          onViewAll={() => setPage("budget")}
          selectedMonth={selectedMonth}
        />
        <SavingsGoalsWidget 
          goals={goals}
          formatCurrency={formatCurrency}
          onAddGoal={() => setPage("goals")}
          onViewAll={() => setPage("goals")}
        />
        {canUseAI && (
          <div className="hidden md:block">
            <AIAdvisorWidget 
              firstName={firstName}
              onAnalyze={() => setPage("ai")}
              formatCurrency={formatCurrency}
            />
          </div>
        )}
      </div>

      {/* Mobile-only Feedback Card */}
      <div className="block md:hidden mt-2 animate-in fade-in duration-500">
        <button 
          onClick={onShowFeedback}
          className="w-full text-left focus:outline-none"
        >
          <GlassCard p="p-5" className="flex items-center justify-between border-white/20 hover:border-blue-500/40 transition-all !rounded-[2rem]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Send Feedback</h4>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Help us improve the Vylos experience</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </GlassCard>
        </button>
      </div>

    </div>
  );
};
