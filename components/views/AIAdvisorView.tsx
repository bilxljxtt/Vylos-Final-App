"use client";

import React from "react";
import { Bot, 
  Sparkles, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Smile, 
  DollarSign,
  ChevronRight, 
  MessageSquare,
  Zap,
  Target,
  PieChart,
  Layout,
  Briefcase,
  ExternalLink,
  Plus,
  Settings,
  Bell
} from "lucide-react";
import { VylosEngine } from "@/lib/vylosEngine";
import { useAppStore } from "@/lib/AppContext";
import { ViewContainer } from "../ui/ViewContainer";

interface AIAdvisorViewProps {
  aiMessages: any[];
  aiInput: string;
  setAiInput: (val: string) => void;
  sendAI: () => void;
  aiLoading: boolean;
  showToast: (msg: string, type?: any) => void;
  healthMetrics: import("@/lib/store").HealthScoreMetrics;
  spendByCat: Record<string, number>;
  totalSpend: number;
  goals: any[];
  setPage: (page: string) => void;
  setShowHealthDetail: (show: boolean) => void;
  setAiMessages: React.Dispatch<React.SetStateAction<any[]>>;
  isPro?: boolean;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ 
  aiMessages, 
  aiInput, 
  setAiInput, 
  sendAI, 
  aiLoading,
  showToast,
  healthMetrics,
  setAiMessages,
  spendByCat,
  totalSpend,
  goals,
  setPage,
  setShowHealthDetail,
  isPro = false
}) => {
  const { formatCurrency, lastSynced, state } = useAppStore();
  const chatInputRef = React.useRef<HTMLInputElement>(null);
  const score = healthMetrics?.score || 0;
  const label = healthMetrics?.label || "Good";
  const breakdown = healthMetrics?.breakdown || { spending: 0, savings: 0, budget: 0, goals: 0 };
  const stats = healthMetrics?.stats || { runwayMonths: 0, budgetUtilization: 0, savingsRate: 0 };

  const spendingData = Object.entries(spendByCat).map(([cat, amount]) => ({
    name: cat,
    value: amount,
    percent: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
    color: cat.includes("Food") ? "#3B82F6" : 
           cat.includes("Transport") ? "#8B5CF6" : 
           cat.includes("Shopping") ? "#F43F5E" : 
           cat.includes("Entertain") ? "#F59E0B" : "#94A3B8"
  })).sort((a, b) => b.value - a.value);

  const getDynamicRecs = () => {
    const recs = [];
    const engine = VylosEngine.run(state);
    
    // Rec 1: Health / Insight
    recs.push({
        title: `${engine.healthCategory} Health`,
        text: engine.insightSummary,
        benefit: `Score: ${engine.healthScore}/100`,
        icon: <ShieldCheck size={20} strokeWidth={2.5} />,
        color: engine.healthScore >= 60 ? "text-emerald-500" : "text-amber-500",
        bg: engine.healthScore >= 60 ? "bg-emerald-500/10" : "bg-amber-500/10"
    });

    // Rec 2: Burn Rate
    recs.push({
        title: "Survival Runway",
        text: `You have ${engine.burnRateMonths} months of runway. Your status is ${engine.burnRateCategory}.`,
        benefit: engine.burnRateMonths >= 6 ? "Secure" : "Build Buffer",
        icon: <TrendingUp size={20} strokeWidth={2.5} />,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
    });

    // Rec 3: Goal Feasibility
    recs.push({
        title: "Goal Feasibility",
        text: engine.goalRecommendation,
        benefit: engine.goalFeasibilityStatus,
        icon: <Target size={20} strokeWidth={2.5} />,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    });

    return recs;
  };

  const dynamicRecs = getDynamicRecs();

  if (!isPro) {
      return (
        <ViewContainer className="flex flex-col items-center justify-center pt-20 relative overflow-hidden min-h-[80vh]">
            <div className="absolute inset-0 bg-bg/40 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 animate-pulse">
                    <Zap size={48} className="text-primary" fill="currentColor" />
                </div>
                <h1 className="text-4xl font-black text-text-main tracking-tight mb-4">Vylos AI is Locked</h1>
                <p className="text-text-muted font-medium text-center max-w-md leading-relaxed mb-10">
                    Unlock the full power of Vylos Intelligence. Get personalized recommendations, daily spending limits, and goal optimization.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                        onClick={() => setPage("pricing")}
                        className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Sparkles size={18} />
                        Upgrade to Pro
                    </button>
                    <button 
                        onClick={() => setPage("dashboard")}
                        className="px-10 py-4 bg-card border border-border-main text-text-muted font-black rounded-2xl hover:bg-border-main transition-all active:scale-95"
                    >
                        Return Home
                    </button>
                </div>
            </div>

            {/* Blurred Content Background */}
            <div className="w-full opacity-20 pointer-events-none filter blur-md">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                    <div className="lg:col-span-2 h-96 bg-card rounded-[2.5rem]" />
                    <div className="h-96 bg-card rounded-[2.5rem]" />
                </div>
            </div>
        </ViewContainer>
      );
  }

  if (totalSpend === 0 && goals.length === 0) {
      return (
        <ViewContainer className="flex flex-col items-center justify-center pt-20">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                <Bot size={48} className="text-primary animate-bounce" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-black text-text-main tracking-tight mb-4">Awaiting Financial Data...</h1>
            <p className="text-text-muted font-medium text-center max-w-md leading-relaxed mb-10">
                I'm ready to analyze your finances, but I need some data first! Add transactions, set goals, or connect your accounts to unlock AI insights.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-95"
            >
                Refresh Data
            </button>
        </ViewContainer>
      );
  }

  return (
    <ViewContainer className="flex flex-col pt-8 pb-12">
      {/* Header Banner */}
      <div className="bg-card border border-border-main rounded-[2.5rem] p-10 mb-10 flex flex-col md:flex-row items-center gap-10 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 relative z-10 border border-primary/20">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Bot size={48} className="text-primary" strokeWidth={1.5} />
            </div>
        </div>
        
        <div className="flex flex-col relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-text-main tracking-tight">Vylos Advisor</h1>
            {lastSynced && (
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-500 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>
          <p className="text-lg font-medium text-text-muted max-w-2xl leading-relaxed">
            I analyze your financial data to provide deterministic insights and personalized recommendations.
          </p>
        </div>

        <div className="hidden lg:flex flex-1 justify-end items-center gap-6 relative z-10">
            <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-1.5 bg-border-main rounded-full overflow-hidden">
                    <div className="h-2/3 bg-primary rounded-full w-full" />
                </div>
                <TrendingUp size={16} className="text-primary" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-1.5 bg-border-main rounded-full overflow-hidden">
                    <div className="h-1/2 bg-primary rounded-full w-full" />
                </div>
                <Sparkles size={16} className="text-emerald-500" />
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-border-main border-t-primary border-r-primary flex items-center justify-center">
                <PieChart size={24} className="text-text-muted" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Top Recommendations */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Top Recommendations</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-muted">Updated just now</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {dynamicRecs.map((rec, idx) => (
                    <div key={idx} className="bg-card border border-border-main rounded-[2rem] p-6 flex flex-col group hover:border-border-strong transition-all shadow-sm">
                        <div className={`w-12 h-12 rounded-xl ${rec.bg} flex items-center justify-center ${rec.color} mb-6 group-hover:scale-110 transition-transform`}>
                            {rec.icon}
                        </div>
                        <h3 className="text-sm font-black text-text-main mb-2">{rec.title}</h3>
                        <p className="text-[11px] font-medium text-text-muted leading-relaxed mb-6 flex-1">
                            {rec.text}
                        </p>
                        <div className={`${rec.bg} ${rec.color} text-[10px] font-bold px-3 py-1.5 rounded-lg mb-4 inline-flex items-center gap-1.5 border border-emerald-500/10 self-start`}>
                            {rec.benefit}
                        </div>
                        <button 
                            onClick={() => showToast(`Deep analysis for ${rec.title} is being processed.`, "info")}
                            className={`flex items-center gap-1.5 text-xs font-black ${rec.color} hover:underline`}
                        >
                            View Details <ArrowRight size={14} />
                        </button>
                    </div>
                ))}
            </div>
          </section>

          {/* Spending Insights Section */}
          <section className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-text-main tracking-tight">Spending Insights</h2>
                <button 
                    onClick={() => setPage("analytics")}
                    className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
                >
                    View Report <ArrowRight size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Doughnut Visual */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-52 h-52 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="104" cy="104" r="90" fill="transparent" stroke="#F1F5F9" strokeWidth="24" className="dark:stroke-white/5" />
                            {/* Simple segment display */}
                            <circle cx="104" cy="104" r="90" fill="transparent" stroke="#10B981" strokeWidth="24" strokeDasharray={2 * Math.PI * 90} strokeDashoffset={2 * Math.PI * 90 * 0.62} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-text-main">{formatCurrency(totalSpend || 3847)}</span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Spent</span>
                            <span className="text-[10px] font-medium text-text-muted">This Month</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 flex-1 w-full">
                        {spendingData.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-bold text-text-muted">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-text-main">{formatCurrency(item.value)}</span>
                                    <span className="text-[10px] font-bold text-text-muted w-8 text-right">{item.percent}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insight Box */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 relative group overflow-hidden">
                    <Sparkles className="absolute -right-4 -bottom-4 text-emerald-500/5 group-hover:scale-125 transition-transform duration-700" size={100} />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Sparkles size={20} strokeWidth={2.5} />
                        </div>
                    <h3 className="text-sm font-black text-text-main">Vylos Analysis</h3>
                    </div>
                    <p className="text-sm font-medium text-text-muted leading-relaxed mb-6 relative z-10">
                        {VylosEngine.run(state).insightSummary}
                    </p>
                    <button 
                        onClick={() => chatInputRef.current?.focus()}
                        className="flex items-center gap-2 text-xs font-black text-primary hover:underline relative z-10"
                    >
                        View Suggestions <ChevronRight size={14} />
                    </button>
                </div>
            </div>
          </section>

          {/* Bottom Banner */}
          <div className="bg-emerald-500/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-emerald-500/10">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Layout size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-text-main">Want even better insights?</h3>
                    <p className="text-sm font-medium text-text-muted opacity-80">Connect your accounts to get deeper AI analysis and personalized recommendations.</p>
                </div>
            </div>
            <button className="px-8 py-3.5 bg-primary hover:bg-emerald-400 text-white font-black rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
                <ShieldCheck size={18} />
                Connect Accounts
            </button>
          </div>
        </div>

        {/* Right Side Column */}
        <div className="space-y-8">
            
            {/* Financial Health Score */}
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-10">
                    <h2 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Financial Health Score</h2>
                    <button 
                        onClick={() => setShowHealthDetail(true)}
                        className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline"
                    >
                        View Details <ChevronRight size={14} />
                    </button>
                </div>

                <div className="relative w-48 h-32 flex flex-col items-center justify-end overflow-hidden mb-6">
                    <svg className="w-full h-48 transform translate-y-12">
                        <circle cx="96" cy="96" r="80" fill="transparent" stroke="#F1F5F9" strokeWidth="12" strokeDasharray={Math.PI * 80} strokeDashoffset={0} strokeLinecap="round" className="dark:stroke-white/5" />
                        <circle cx="96" cy="96" r="80" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray={Math.PI * 80} strokeDashoffset={Math.PI * 80 * (1 - score / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black text-text-main">{score}</span>
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{label}</span>
                    </div>
                </div>

                <div className="space-y-4 w-full px-2">
                    {[
                        { label: "Spending Discipline", val: breakdown.spending },
                        { label: "Savings Rate", val: breakdown.savings },
                        { label: "Budget Adherence", val: breakdown.budget },
                        { label: "Goal Progress", val: breakdown.goals }
                    ].map((item, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                <span>{item.label}</span>
                                <span>{item.val}/25</span>
                            </div>
                            <div className="h-1.5 bg-border-main rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${(item.val / 25) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ask AI Anything */}
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm flex flex-col">
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest mb-6 opacity-80">Ask AI Anything</h2>
                
                <div className="relative mb-8">
                    <input 
                        ref={chatInputRef}
                        type="text" 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendAI()}
                        placeholder="Ask me about your finances..."
                        className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-card transition-all rounded-xl px-4 py-4 text-xs font-bold outline-none placeholder:text-text-muted/40 pr-12"
                    />
                    <button 
                        onClick={sendAI}
                        disabled={aiLoading}
                        className="absolute right-2 top-2 bottom-2 w-10 bg-primary hover:bg-emerald-400 text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Zap size={14} strokeWidth={3} fill="currentColor" />
                    </button>
                </div>

                <div className="space-y-3">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1 opacity-50">Quick Analysis:</span>
                    {[
                        "Why did my health score drop?",
                        "What should I fix first?",
                        "Am I overspending?",
                        "Can I afford my goal?",
                        "How long can I survive if income stops?"
                    ].map(q => (
                        <button 
                            key={q}
                            onClick={() => {
                                const engine = VylosEngine.run(state);
                                let answer = "";
                                if (q.includes("health score")) answer = VylosEngine.explainHealthScoreChange(engine.healthScore, engine.healthScore, { Q: 0, D: 0, C: 0, G: 0 });
                                else if (q.includes("fix first")) answer = engine.insightSummary;
                                else if (q.includes("overspending")) answer = engine.dailySpendingLimit > 0 ? `Your daily limit is ${formatCurrency(engine.dailySpendingLimit)}. ${engine.insightSummary}` : "Set up a budget to track spending.";
                                else if (q.includes("afford my goal")) answer = engine.goalRecommendation;
                                else if (q.includes("survive")) answer = `Based on your liquid savings, you can survive for ${engine.burnRateMonths} months.`;
                                
                                setAiMessages(prev => [...prev, { role: "user", content: q }, { role: "assistant", content: answer }]);
                            }} 
                            className="w-full bg-border-main/30 border border-border-main hover:bg-border-main/50 transition-all rounded-xl p-3.5 flex items-center justify-between group"
                        >
                            <span className="text-[11px] font-bold text-text-muted group-hover:text-text-main transition-colors text-left">{q}</span>
                            <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest px-2 opacity-80">Quick Actions</h3>
                
                <button className="bg-card border border-border-main p-5 rounded-2xl flex items-center justify-between group hover:border-border-strong transition-all shadow-sm active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Settings size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-black text-text-main">Create Budget Plan</span>
                            <span className="text-[10px] font-medium text-text-muted">Let AI create a personalized budget for you</span>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="bg-card border border-border-main p-5 rounded-2xl flex items-center justify-between group hover:border-border-strong transition-all shadow-sm active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Layout size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-black text-text-main">Analyze Subscriptions</span>
                            <span className="text-[10px] font-medium text-text-muted">Find and manage unused subscriptions</span>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                    onClick={() => showToast("AI Recommendation Engine is analyzing your risk profile...", "info")}
                    className="bg-card border border-border-main p-5 rounded-2xl flex items-center justify-between group hover:border-border-strong transition-all shadow-sm active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <TrendingUp size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-black text-text-main">Investment Recommendation</span>
                            <span className="text-[10px] font-medium text-text-muted">Get AI-powered investment suggestions</span>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

        </div>
      </div>
    </ViewContainer>
  );
};
