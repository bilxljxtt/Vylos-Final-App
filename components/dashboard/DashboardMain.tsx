import { TransactionItem, InsightCard } from "../ui/DashboardUi";
import { cleanMerchantName } from "@/lib/utils";
import { 
  CATEGORY_METADATA, 
  TransactionCategory } from "@/lib/store";
import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/AppContext";
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  DollarSign, 
  PieChart, 
  Target, 
  Sparkles,
  ChevronDown,
  Info,
  Calendar,
  Zap,
  Globe,
  Plus,
  Wallet,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  AlertCircle,
  FileText,
  Activity,
  Heart,
  Frown,
  HelpCircle,
  ClipboardCheck,
  X,
  Flag,
  BarChart3,
  Trophy,
  Layout
} from "lucide-react";
import { ViewContainer } from "../ui/ViewContainer";

interface DashboardMainProps {
  income: number;
  expense: number;
  netWorth: number;
  savingsRate: number;
  transactions: any[];
  goals: any[];
  subscriptions?: any[];
  chartRef: React.RefObject<HTMLCanvasElement | null>;
  donutRef?: React.RefObject<HTMLCanvasElement | null>;
  setPage: (page: string) => void;
  trends?: { incomeTrend: number; expenseTrend: number; netWorthTrend: number; };
  chartStats?: { avgMonthlySpend: number; lowestMonthSpend: number; highestMonthSpend: number; };
  spendByCat?: Record<string, number>;
  setShowHealthDetail: (show: boolean) => void;
  setShowAddReminder: (show: boolean) => void;
  healthScore: number;
  engineOutput: any;
  userName?: string;
  setShowNewBudget: (show: boolean) => void;
  onQuickAddTx?: (cat: TransactionCategory) => void;
}

export const DashboardMain: React.FC<DashboardMainProps> = ({
  income,
  expense,
  netWorth,
  savingsRate,
  transactions,
  goals,
  subscriptions = [],
  chartRef,
  donutRef,
  setPage,
  trends = { incomeTrend: 0, expenseTrend: 0, netWorthTrend: 0 },
  chartStats = { avgMonthlySpend: 0, lowestMonthSpend: 0, highestMonthSpend: 0 },
  spendByCat = {},
  setShowHealthDetail,
  setShowAddReminder,
  healthScore,
  engineOutput,
  userName,
  setShowNewBudget,
  onQuickAddTx
}) => {
  const { formatCurrency, lastSynced } = useAppStore();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const updateGreeting = () => {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Africa/Johannesburg',
          hour: 'numeric',
          hour12: false
        });
        const saHour = parseInt(formatter.format(new Date()));
        
        if (saHour >= 5 && saHour < 12) setGreeting("Good morning");
        else if (saHour >= 12 && saHour < 17) setGreeting("Good afternoon");
        else setGreeting("Good evening");
      } catch (e) {
        // Fallback to local time if Intl fails
        const localHour = new Date().getHours();
        if (localHour >= 5 && localHour < 12) setGreeting("Good morning");
        else if (localHour >= 12 && localHour < 17) setGreeting("Good afternoon");
        else setGreeting("Good evening");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const recentTxs = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  const hasIncome = income > 0;
  const hasBudgets = Object.keys(spendByCat).length > 0;
  const hasTransactions = transactions.length > 0;
  const hasGoals = goals.length > 0;

  return (
    <ViewContainer className="flex flex-col gap-10 pt-4 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-text-main tracking-tight">
          {greeting}, {userName?.split(' ')[0] || 'User'}! 👋
        </h2>
        <p className="text-sm font-bold text-text-muted">Here's your financial overview for today.</p>
      </div>

      {/* 1. HERO HEALTH SCORE CARD */}
      <section className="bg-card border border-border-main rounded-3xl p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-12">
          {/* Left: Score */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-widest">Your Financial Health</h4>
            <div className="flex flex-col items-center lg:items-start">
              <div className="flex items-baseline gap-2">
                <span className={`text-8xl font-black ${healthScore >= 80 ? 'text-emerald-500' : healthScore >= 60 ? 'text-blue-500' : healthScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{healthScore}</span>
              </div>
              <span className="text-sm font-bold text-text-muted mt-1">out of 100</span>
              <div className={`mt-6 px-6 py-2 rounded-full border flex items-center justify-center 
                ${healthScore >= 80 ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 
                  healthScore >= 60 ? 'bg-blue-50 border-blue-100 text-blue-500' : 
                  healthScore >= 40 ? 'bg-amber-50 border-amber-100 text-amber-500' : 
                  'bg-red-50 border-red-100 text-red-500'}`}
              >
                <span className="text-xs font-black uppercase tracking-widest">{engineOutput.healthCategory}</span>
              </div>
            </div>
          </div>

          {/* Middle: Explanation & CTA */}
          <div className="flex flex-col gap-6">
            <div>
                <h4 className="text-lg font-black text-text-main mb-2">
                  {healthScore >= 80 ? "Your score is excellent" : 
                   healthScore >= 60 ? "Your score is good" : 
                   healthScore >= 40 ? "Your score needs attention" : "Your score is low"}
                </h4>
                <p className="text-sm font-medium text-text-muted leading-relaxed">
                   {healthScore >= 80 ? "You’re in a strong financial position. Keep maintaining your budget, savings, and goals." : 
                    healthScore >= 60 ? "You’re doing well, but there are still a few areas you can improve." : 
                    healthScore >= 40 ? "Some parts of your finances need work. Review your budget, savings, or goals." : 
                    "Your financial setup or spending habits need attention."}
                </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setPage(healthScore >= 80 ? "analytics" : healthScore >= 60 ? "analytics" : healthScore >= 40 ? "budget" : "settings")}
                className="w-full py-4 bg-[#00A86B] hover:bg-[#00925d] text-white font-black rounded-xl shadow-lg shadow-[#00A86B]/20 transition-all flex items-center justify-center"
              >
                {healthScore >= 80 ? "View Breakdown" : 
                 healthScore >= 60 ? "Improve Score" : 
                 healthScore >= 40 ? "Review Issues" : "Fix This Now"}
              </button>
              <button 
                onClick={() => setShowHealthDetail(true)}
                className="flex items-center justify-center gap-1 text-xs font-black text-[#00A86B] hover:underline transition-colors"
              >
                See score details <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="hidden lg:flex items-center justify-center">
             <div className="relative w-40 h-48 bg-bg rounded-2xl border-4 border-border-main p-6 flex flex-col gap-4 shadow-inner">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-border-main rounded-md" />
                <div className="flex items-center gap-3">
                   <X className="text-red-500" size={20} strokeWidth={3} />
                   <div className="h-2 w-full bg-border-main rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                   <X className="text-red-500" size={20} strokeWidth={3} />
                   <div className="h-2 w-full bg-border-main rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                   <X className="text-red-500" size={20} strokeWidth={3} />
                   <div className="h-2 w-full bg-border-main rounded-full" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. GET STARTED */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-text-main">Get started</h3>
            <button className="flex items-center gap-1 text-[11px] font-black text-[#00A86B] uppercase tracking-widest hover:underline">
                Why these steps? <HelpCircle size={14} />
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 1, label: "Add Income", title: "Add Income", sub: "Tell us how much you earn.", done: hasIncome, icon: Wallet, color: "text-emerald-500", page: "settings" },
            { id: 2, label: "Create Budget", title: "Create Budget", sub: "Plan how you want to spend.", done: hasBudgets, icon: PieChart, color: "text-purple-500", page: "budget" },
            { id: 3, label: "Add Transaction", title: "Add Transaction", sub: "Track your money easily.", done: hasTransactions, icon: FileText, color: "text-blue-500", page: "transactions" },
            { id: 4, label: "Set Goal", title: "Set a Goal", sub: "Choose something to save for.", done: hasGoals, icon: Flag, color: "text-amber-500", page: "goals" }
          ].map(item => (
            <div key={item.id} className="relative bg-card border border-border-main rounded-3xl p-8 flex flex-col items-center text-center gap-4 transition-all hover:border-primary/30 group shadow-sm">
                <div className={`absolute top-4 left-4 w-6 h-6 rounded-full ${item.done ? 'bg-primary' : 'bg-primary/20'} flex items-center justify-center text-[10px] font-black text-white`}>
                    {item.id}
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon size={36} />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-black text-text-main">{item.title}</h4>
                    <p className="text-[11px] font-medium text-text-muted leading-relaxed">{item.sub}</p>
                </div>
                <button 
                  onClick={() => {
                    if (item.id === 1) setShowNewBudget(true);
                    else setPage(item.page);
                  }}
                  className={`mt-2 w-full py-2.5 rounded-xl border border-border-main text-text-main text-[10px] font-black uppercase tracking-widest hover:bg-border-main transition-all ${item.done ? 'bg-primary/10' : ''}`}
                >
                  {item.label}
                </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AT A GLANCE */}
      <section className="flex flex-col gap-6">
        <h3 className="text-lg font-black text-text-main">At a glance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Spend card */}
            <div className="bg-card border border-border-main rounded-3xl p-10 flex items-center gap-8 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Wallet size={40} />
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">You can spend today</span>
                        <button 
                            onClick={() => setShowNewBudget(true)}
                            className="p-2 hover:bg-border-main rounded-xl transition-all text-text-muted hover:text-primary"
                        >
                            <Layout size={16} />
                        </button>
                    </div>
                    <span className="text-4xl font-black text-emerald-500 tracking-tight truncate">{hasIncome && hasBudgets ? formatCurrency(engineOutput.dailySpendingLimit) : "R0"}</span>
                    <p className="text-[11px] font-medium text-text-muted mt-1 leading-relaxed">Set up income and budget to see your daily limit.</p>
                </div>
            </div>
            {/* Survive card */}
            <div className="bg-card border border-border-main rounded-3xl p-10 flex items-center gap-8 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <Calendar size={40} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">You can survive for</span>
                    <span className="text-4xl font-black text-purple-500 tracking-tight">{hasIncome && engineOutput.burnRateMonths > 0 ? `${engineOutput.burnRateMonths} months` : "0.0 months"}</span>
                    <p className="text-[11px] font-medium text-text-muted mt-1 leading-relaxed">Add savings and expenses to see your runway.</p>
                </div>
            </div>
            {/* Bills Card */}
            <div className="bg-card border border-border-main rounded-3xl p-10 flex items-center gap-8 shadow-sm group cursor-pointer hover:border-primary/50 transition-all" onClick={() => onQuickAddTx?.("Bills" as any)}>
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                    <CreditCard size={40} />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">Monthly Bills</span>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                    </div>
                    <span className="text-4xl font-black text-blue-500 tracking-tight">{formatCurrency(spendByCat["Bills"] || 0)}</span>
                    <p className="text-[11px] font-medium text-text-muted mt-1 leading-relaxed">Click to quickly add a bill.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. VYLOS INSIGHTS */}
      <section className="flex flex-col gap-6">
        <h3 className="text-lg font-black text-text-main">Vylos insights</h3>
        <div className="flex flex-col gap-3">
          {engineOutput.insights?.map((insight: any, idx: number) => (
            <button 
                key={idx}
                onClick={() => setPage(insight.page)}
                className="bg-card border border-border-main rounded-2xl p-5 flex items-center justify-between group hover:border-border-strong transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                  ${insight.severity === 'critical' ? 'text-red-500 bg-red-500/10' : 
                    insight.severity === 'warning' ? 'text-amber-500 bg-amber-500/10' : 
                    'text-blue-500 bg-blue-500/10'}`}
                >
                  {insight.severity === 'critical' ? <AlertCircle size={24} /> : 
                   insight.severity === 'warning' ? <AlertTriangle size={24} /> : 
                   <Info size={24} />}
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-sm font-black text-text-main">{insight.reason}</h4>
                  <p className="text-[11px] font-medium text-text-muted mt-0.5">{insight.action}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Recent transactions */}
         <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-text-muted" />
                <h3 className="text-lg font-black text-text-main">Recent transactions</h3>
              </div>
              <button onClick={() => setPage("transactions")} className="text-[10px] font-black text-[#00A86B] uppercase tracking-widest hover:underline">View all</button>
            </div>
            <div className="bg-card border border-border-main rounded-3xl p-10 flex flex-col items-center justify-center min-h-[300px] text-center gap-6 shadow-sm">
               {recentTxs.length > 0 ? (
                 <div className="w-full flex flex-col">
                    {recentTxs.map((tx: any) => (
                        <TransactionItem 
                            key={tx.id}
                            title={cleanMerchantName(tx.merchant)}
                            date={(() => {
                              const [y, m, d] = tx.date.split('-').map(Number);
                              return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            })()}
                            amount={tx.amount}
                            icon={CATEGORY_METADATA[tx.category as TransactionCategory]?.icon}
                            color={CATEGORY_METADATA[tx.category as TransactionCategory]?.color}
                        />
                    ))}
                 </div>
               ) : (
                 <>
                    <div className="w-16 h-16 rounded-full bg-border-main/20 flex items-center justify-center text-text-muted/30">
                        <FileText size={32} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-lg font-black text-text-main">No transactions yet</h4>
                        <p className="text-xs font-medium text-text-muted">Add your first transaction to get started.</p>
                    </div>
                    <button 
                        onClick={() => setPage("transactions")}
                        className="px-8 py-3.5 bg-[#00A86B] hover:bg-[#00925d] text-white font-black rounded-xl shadow-lg shadow-[#00A86B]/20 transition-all text-xs"
                    >
                        Add Transaction
                    </button>
                 </>
               )}
            </div>
         </section>

         {/* Goals Progress */}
         <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-text-muted" />
                <h3 className="text-lg font-black text-text-main">Goals progress</h3>
              </div>
              <button onClick={() => setPage("goals")} className="text-[10px] font-black text-[#00A86B] uppercase tracking-widest hover:underline">View all</button>
            </div>
            <div className="bg-card border border-border-main rounded-3xl p-8 flex flex-col gap-6 min-h-[300px] shadow-sm">
               {goals.length > 0 ? (
                 <div className="flex flex-col gap-6">
                    {goals.slice(0, 3).map((g: any) => {
                        const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                        return (
                            <div key={g.id} className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                                            {g.icon || "🎯"}
                                        </div>
                                        <span className="text-sm font-black text-text-main truncate max-w-[120px]">{g.title}</span>
                                    </div>
                                    <span className="text-sm font-black text-primary">{pct}%</span>
                                </div>
                                <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000" 
                                        style={{ width: `${pct}%` }} 
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-text-muted">
                                    <span>{formatCurrency(g.currentAmount)} saved</span>
                                    <span>{formatCurrency(g.targetAmount)} target</span>
                                </div>
                            </div>
                        );
                    })}
                    <button 
                        onClick={() => setPage("goals")}
                        className="mt-2 w-full py-3 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        Review all targets
                    </button>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-border-main/20 flex items-center justify-center text-text-muted/30">
                        <Flag size={32} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-lg font-black text-text-main">No goals set</h4>
                        <p className="text-xs font-medium text-text-muted">Achieve your dreams by setting targets.</p>
                    </div>
                    <button 
                        onClick={() => setPage("goals")}
                        className="px-8 py-3.5 bg-primary hover:bg-emerald-400 text-white font-black rounded-xl shadow-lg shadow-primary/20 transition-all text-xs"
                    >
                        Set Your First Goal
                    </button>
                 </div>
               )}
            </div>
         </section>

         {/* Spending overview */}
         <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Activity size={20} className="text-text-muted" />
                <h3 className="text-lg font-black text-text-main">Spending overview</h3>
              </div>
              <button onClick={() => setPage("analytics")} className="text-[10px] font-black text-[#00A86B] uppercase tracking-widest hover:underline">View report</button>
            </div>
            <div className="bg-card border border-border-main rounded-3xl p-10 flex flex-col items-center justify-center min-h-[300px] text-center gap-6 shadow-sm">
                {hasTransactions ? (
                    <div className="w-full h-full relative">
                        <canvas ref={chartRef}></canvas>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-border-main/20 flex items-center justify-center text-text-muted/30">
                            <BarChart3 size={32} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-lg font-black text-text-main">No spending data yet</h4>
                            <p className="text-xs font-medium text-text-muted">Add transactions to see where your money goes.</p>
                        </div>
                        <button 
                            onClick={() => setPage("transactions")}
                            className="px-8 py-3.5 bg-[#00A86B] hover:bg-[#00925d] text-white font-black rounded-xl shadow-lg shadow-[#00A86B]/20 transition-all text-xs"
                        >
                            Add Transaction
                        </button>
                    </>
                )}
            </div>
         </section>
      </div>

      {/* Bottom Banner */}
      <section className="bg-card border border-border-main rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#00A86B] flex items-center justify-center text-white shrink-0">
            <Trophy size={32} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-base font-black text-text-main">Keep going!</h4>
            <p className="text-xs font-bold text-text-muted mt-1">Small steps today lead to a better tomorrow.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 w-full lg:w-auto">
          {/* Current level */}
          <div className="flex flex-col gap-1 items-center lg:items-start min-w-[120px]">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Current level</span>
            <span className="text-2xl font-black text-[#00A86B]">Starter</span>
          </div>

          {/* XP Progress */}
          <div className="flex-1 lg:min-w-[280px] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-black text-text-muted uppercase tracking-widest">
              <span>XP Progress</span>
              <span className="text-text-main">{Math.round(engineOutput.xp).toLocaleString()} / 5,000 XP</span>
            </div>
            <div className="h-3 w-full bg-border-main rounded-full overflow-hidden">
                <div className="h-full bg-[#00A86B] transition-all duration-1000" style={{ width: `${Math.min(100, (engineOutput.xp / 5000) * 100)}%` }} />
            </div>
          </div>

          {/* Next level */}
          <div className="flex flex-col gap-1 items-center lg:items-start min-w-[120px]">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Next level</span>
            <div className="flex flex-col">
                <span className="text-base font-black text-text-main">Builder</span>
                <span className="text-[10px] font-bold text-text-muted">3,500 XP to go</span>
            </div>
          </div>
        </div>
      </section>
    </ViewContainer>
  );
};
