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
import { } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { ViewContainer } from "../ui/ViewContainer";

interface AIAdvisorViewProps {
  aiMessages: any[];
  aiInput: string;
  setAiInput: (val: string) => void;
  sendAI: () => void;
  aiLoading: boolean;
  showToast: (msg: string, type?: any) => void;
  healthMetrics: any;
  spendByCat: Record<string, number>;
  totalSpend: number;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ 
  aiMessages, 
  aiInput, 
  setAiInput, 
  sendAI, 
  aiLoading,
  showToast,
  healthMetrics,
  spendByCat,
  totalSpend
}) => {
  const { formatCurrency } = useAppStore();
  // Use mock data for percentages and trends if not provided
  const score = healthMetrics?.score || 82;
  const label = healthMetrics?.label || "Excellent";

  const spendingData = Object.entries(spendByCat).map(([cat, amount]) => ({
    name: cat,
    value: amount,
    percent: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
    color: cat === "Housing" ? "#10B981" : 
           cat === "Food & Dining" ? "#3B82F6" : 
           cat === "Transportation" ? "#8B5CF6" : 
           cat === "Shopping" ? "#F43F5E" : 
           cat === "Entertainment" ? "#F59E0B" : "#94A3B8"
  })).sort((a, b) => b.value - a.value);

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
            <h1 className="text-3xl font-black text-text-main tracking-tight">Hi Alex! I'm your AI financial advisor.</h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-lg font-medium text-text-muted max-w-2xl leading-relaxed">
            I analyze your financial data to provide smart insights and personalized recommendations.
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
                {/* Rec 1 */}
                <div className="bg-card border border-border-main rounded-[2rem] p-6 flex flex-col group hover:border-border-strong transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                        <DollarSign size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-black text-text-main mb-2">Reduce Dining Expenses</h3>
                    <p className="text-[11px] font-medium text-text-muted leading-relaxed mb-6 flex-1">
                        You spent $324 on dining out this month. Consider reducing by 20% to save more.
                    </p>
                    <div className="bg-emerald-500/5 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg mb-4 inline-flex items-center gap-1.5 border border-emerald-500/10 self-start">
                        Potential savings: $65/month
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline">
                        View Details <ArrowRight size={14} />
                    </button>
                </div>

                {/* Rec 2 */}
                <div className="bg-card border border-border-main rounded-[2rem] p-6 flex flex-col group hover:border-border-strong transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                        <TrendingUp size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-black text-text-main mb-2">Increase Emergency Fund</h3>
                    <p className="text-[11px] font-medium text-text-muted leading-relaxed mb-6 flex-1">
                        You have 2.1 months of expenses saved. Aim for at least 6 months.
                    </p>
                    <div className="bg-indigo-500/5 text-indigo-500 text-[10px] font-bold px-3 py-1.5 rounded-lg mb-4 inline-flex items-center gap-1.5 border border-indigo-500/10 self-start">
                        Recommended: {formatCurrency(8500)}
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-black text-indigo-500 hover:underline">
                        View Details <ArrowRight size={14} />
                    </button>
                </div>

                {/* Rec 3 */}
                <div className="bg-card border border-border-main rounded-[2rem] p-6 flex flex-col group hover:border-border-strong transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                        <Smile size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-black text-text-main mb-2">Great Savings Rate!</h3>
                    <p className="text-[11px] font-medium text-text-muted leading-relaxed mb-6 flex-1">
                        You're saving 26% of your income. Keep it up! You're above average.
                    </p>
                    <div className="bg-amber-500/5 text-amber-500 text-[10px] font-bold px-3 py-1.5 rounded-lg mb-4 inline-flex items-center gap-1.5 border border-amber-500/10 self-start">
                        Keep going! 🚀
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-black text-amber-500 hover:underline">
                        View Details <ArrowRight size={14} />
                    </button>
                </div>
            </div>
          </section>

          {/* Spending Insights Section */}
          <section className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-text-main tracking-tight">Spending Insights</h2>
                <button className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline">
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
                        <h3 className="text-sm font-black text-text-main">AI Insight</h3>
                    </div>
                    <p className="text-sm font-medium text-text-muted leading-relaxed mb-6 relative z-10">
                        Your transportation costs are 15% higher than last month. Consider carpooling or public transport to save more.
                    </p>
                    <button className="flex items-center gap-2 text-xs font-black text-primary hover:underline relative z-10">
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
                    <button className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline">
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

                <p className="text-xs font-medium text-text-muted text-center leading-relaxed">
                    You're in great shape! Keep making smart financial decisions.
                </p>
            </div>

            {/* Ask AI Anything */}
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm flex flex-col">
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest mb-6 opacity-80">Ask AI Anything</h2>
                
                <div className="relative mb-8">
                    <input 
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
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1 opacity-50">Try asking:</span>
                    <button onClick={() => setAiInput("How can I reduce my expenses?")} className="w-full bg-border-main/30 border border-border-main hover:bg-border-main/50 transition-all rounded-xl p-3.5 flex items-center justify-between group">
                        <span className="text-[11px] font-bold text-text-muted group-hover:text-text-main transition-colors text-left">How can I reduce my expenses?</span>
                        <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => setAiInput("Is my savings on track?")} className="w-full bg-border-main/30 border border-border-main hover:bg-border-main/50 transition-all rounded-xl p-3.5 flex items-center justify-between group">
                        <span className="text-[11px] font-bold text-text-muted group-hover:text-text-main transition-colors text-left">Is my savings on track?</span>
                        <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => setAiInput("Should I invest more?")} className="w-full bg-border-main/30 border border-border-main hover:bg-border-main/50 transition-all rounded-xl p-3.5 flex items-center justify-between group">
                        <span className="text-[11px] font-bold text-text-muted group-hover:text-text-main transition-colors text-left">Should I invest more?</span>
                        <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                    </button>
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

                <button className="bg-card border border-border-main p-5 rounded-2xl flex items-center justify-between group hover:border-border-strong transition-all shadow-sm active:scale-[0.98]">
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
