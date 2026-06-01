"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Sparkles, Send, Bot, User, Plus, 
  TrendingDown, Lightbulb, CheckCircle2, 
  Paperclip, ShieldCheck, ArrowRight, Activity
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { UserProfile, computeHealthScoreMetrics } from "@/lib/store";
import { Permissions } from "@/lib/permissions";
import { VylosCalculations } from "@/lib/vylosCalculations";
import { VylosAIService } from "@/lib/services/VylosAIService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  source?: string;
  layer?: number;
}

interface AIAdvisorViewProps {
  aiMessages: Message[];
  aiInput: string;
  setAiInput: (val: string) => void;
  sendAI: () => void;
  aiLoading: boolean;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  userProfile: UserProfile;
  setPage: (page: string) => void;
  setAiMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  dailyUsed?: number;
  monthlyUsed?: number;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({
  aiMessages, aiInput, setAiInput, sendAI, aiLoading, userProfile, setPage, setAiMessages,
  dailyUsed = 0, monthlyUsed = 0
}) => {
  const { state } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAccess = Permissions.canUseAIAdvisor(userProfile);

  const isDeveloper = userProfile.email === 'bilxljxtt10@gmail.com';
  const isFree = userProfile.subscription_tier === 'free';
  const limit = isFree ? 5 : Permissions.getAIMonthlyLimit(userProfile);
  const used = isFree ? dailyUsed : monthlyUsed;
  const remaining = isDeveloper ? 9999 : Math.max(0, limit - used);
  const isLimitReached = !isDeveloper && remaining <= 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const handleQuickPrompt = (prompt: string) => {
    if (isLimitReached || aiLoading) return;
    setAiInput(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLimitReached || aiLoading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAI();
    }
  };

  const prompts = [
    "Analyse my budget", 
    "How much have I saved?", 
    "What's my top expense?", 
    "Investment tips"
  ];

  const health = useMemo(() => computeHealthScoreMetrics(state), [state]);
  const insights = useMemo(() => VylosCalculations.getRecentInsights(state), [state]);

  // Visual Mockup specific messages if none exist (for design demonstration)
  const displayMessages: Message[] = aiMessages.length > 0 ? aiMessages : [
    { 
      id: "initial-assistant-msg",
      role: "assistant", 
      content: `Hello ${userProfile.name || 'there'}! I'm Vylos Intelligence. How can I help you with your finances today?`,
      timestamp: new Date().toISOString()
    },
  ];

  if (!hasAccess) {
    return null;
  }

  const preprocessContent = (text: string) => {
    return text.replace(/\[([^\|\]]+)\|([^\]]+)\]/g, "[$1](vylos-page://$2)");
  };

  const MarkdownRenderer = ({ content }: { content: string }) => {
    const preprocessed = preprocessContent(content);
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }: any) => {
            let targetPage = "";
            if (href) {
              const cleanHref = href
                .replace(/^(vylos-page:\/\/|\/)/, "")
                .replace(/\/$/, "")
                .toLowerCase();

              const pageMap: Record<string, string> = {
                goals: "goals",
                budget: "budget",
                transactions: "transactions",
                calendar: "calendar",
                reminders: "reminders",
                progress: "analytics",
                analytics: "analytics",
                dashboard: "dashboard",
                home: "dashboard",
                ai: "ai",
                advisor: "ai",
              };
              
              if (pageMap[cleanHref]) {
                targetPage = pageMap[cleanHref];
              }
            }

            if (targetPage) {
              return (
                <button 
                  onClick={() => setPage(targetPage)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 mx-1 mt-2 mb-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/40 text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white rounded-lg transition-all active:scale-95"
                >
                  {children} <ArrowRight size={14} />
                </button>
              );
            }
            if (href?.includes("download-statement")) {
              return (
                <button 
                  onClick={async () => {
                    try {
                      const blob = await VylosAIService.downloadStatement();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "vylos-statement.pdf";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (e: any) {
                      console.error("Failed to download statement:", e);
                      alert("Failed to download statement. Please check your connection and try again.");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 mx-1 mt-2 mb-1 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 text-[12px] font-black uppercase tracking-widest text-white rounded-lg transition-all active:scale-95 shadow-lg"
                >
                  {children} <ArrowRight size={14} />
                </button>
              );
            }
            return (
              <a href={href} {...props} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          }
        }}
      >
        {preprocessed}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full max-h-full">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">Vylos Intelligence</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {!isDeveloper && (
            <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl text-[12px] font-bold text-slate-500 dark:text-slate-400">
              {isFree ? (
                <span>Daily Limit: <strong className="text-primary">{remaining} / 5</strong> remaining</span>
              ) : (
                <span>Monthly Limit: <strong className="text-primary">{remaining} / {limit}</strong> remaining</span>
              )}
            </div>
          )}
          <button 
            onClick={() => setAiMessages([{
              id: "initial-assistant-msg",
              role: "assistant",
              content: `Hello ${userProfile.name || 'there'}! I'm Vylos Intelligence. How can I help you with your finances today?`,
              timestamp: new Date().toISOString()
            }])}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-blue-500 text-blue-600 rounded-2xl text-[13px] font-bold shadow-sm transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            New Chat
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 pb-4">
        
        {/* Left Column (Span 8) - Chat Interface */}
        <div className="lg:col-span-8 flex flex-col h-[600px] lg:h-full vylos-glass-readable shadow-2xl overflow-hidden relative">
          
          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar">
            {displayMessages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id || i} className={`flex gap-5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-lg border border-white/10
                    ${isUser ? 'bg-primary text-white shadow-primary/20' : 'bg-white/5 text-slate-600 dark:text-white/60'}`}>
                    {isUser ? <User size={24} /> : <Bot size={24} />}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className={`p-5 rounded-[1.75rem] text-[14px] font-bold leading-relaxed shadow-xl
                      ${isUser 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-white/5 border border-white/10 text-slate-900 dark:text-white/80 rounded-tl-sm markdown-content'}`}>
                      {isUser ? (
                        msg.content
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>
                    {!isUser && (msg.source || msg.layer !== undefined) && (process.env.NODE_ENV === "development" || Permissions.isPrivileged(userProfile)) && (
                      <div className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 opacity-60">
                        {msg.layer !== undefined && <span>Layer {msg.layer}</span>}
                        {msg.source && msg.layer !== undefined && <span>•</span>}
                        {msg.source && <span>Source: {msg.source.replace(/_/g, ' ')}</span>}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {aiLoading && (
              <div className="flex gap-5 max-w-[85%]">
                <div className="w-12 h-12 rounded-[1.25rem] bg-white/5 text-slate-600 dark:text-white/60 flex items-center justify-center shrink-0 border border-white/10">
                  <Bot size={24} className="animate-pulse" />
                </div>
                <div className="px-6 py-5 rounded-[1.75rem] bg-white/5 border border-white/10 text-slate-700 dark:text-white/60 rounded-tl-sm flex items-center gap-3 shadow-sm">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 bg-white/5 border-t border-white/10 shrink-0">
            {isLimitReached && (
              <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center justify-between">
                <span>You’re helping shape Vylos. Daily AI limit of 5 messages reached for today. Premium beta access is active!</span>
                {isFree && (
                  <button 
                    onClick={() => setPage("pricing")}
                    className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 transition-colors"
                  >
                    View Status
                  </button>
                )}
              </div>
            )}

            {/* Suggested Prompts */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-2 opacity-60">Suggested</span>
              {prompts.map(p => (
                <button 
                  key={p} 
                  onClick={() => handleQuickPrompt(p)}
                  disabled={isLimitReached}
                  className="px-4 py-2 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-white/60 hover:text-primary rounded-xl transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="relative flex items-center">
              <button className="absolute left-5 p-2 text-slate-400 hover:text-primary transition-colors" disabled={isLimitReached || aiLoading}>
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLimitReached || aiLoading}
                placeholder={isLimitReached ? "Daily AI message limit reached under Vylos Beta experience." : aiLoading ? "AI is processing your query..." : "Ask Vylos anything about your finances..."} 
                className="w-full pl-14 pr-16 py-5 bg-white/5 border border-white/10 rounded-2xl text-[14px] font-bold text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button 
                onClick={sendAI}
                disabled={aiLoading || !aiInput.trim() || isLimitReached}
                className="absolute right-2.5 p-3.5 bg-primary disabled:bg-slate-700 text-white rounded-xl shadow-xl shadow-primary/20 transition-all hover:bg-emerald-400 hover:-translate-y-0.5 active:scale-95 disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Quick Insights Card */}
          <div className="vylos-glass-readable p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles size={18} className="text-primary" />
              <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-900 dark:text-white opacity-80">Intelligence Feed</h3>
            </div>
            
            <div className="flex flex-col gap-5">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  onClick={() => insight.page && setPage(insight.page)}
                  className="flex items-start gap-5 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] shadow-sm group hover:bg-white/10 transition-all cursor-pointer hover:border-primary/40 active:scale-[0.98]"
                >
                  <div className={`w-11 h-11 rounded-[1.25rem] ${insight.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20'} border flex items-center justify-center shrink-0 mt-0.5`}>
                    {insight.type === 'warning' ? <TrendingDown size={22} /> : <Lightbulb size={22} />}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[14px] font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{insight.title}</h4>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-white/40 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Health Card */}
          <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/30 text-white relative overflow-hidden shrink-0 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <Activity size={18} className="text-white/80" />
              <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-white/80">Financial Health</h3>
            </div>

            <div className="flex items-end gap-3 mb-3 relative z-10">
              <span className="text-[52px] font-black tracking-tighter leading-none">{health.score}</span>
              <span className="text-xl font-bold text-white/40 mb-2">/ 100</span>
              <div className="ml-auto bg-white/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
                {health.label}
              </div>
            </div>

            <div className="h-2.5 bg-black/10 rounded-full overflow-hidden mb-6 relative z-10 shadow-inner">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: `${health.score}%` }} />
            </div>

            <p className="text-[13px] font-bold text-white/80 leading-relaxed mb-8 relative z-10">
              Vylos Intelligence considers your status <span className="text-white font-black">{health.label.toLowerCase()}</span>. {health.score > 70 ? 'Optimal efficiency detected.' : 'Opportunities for growth identified.'}
            </p>

            <button 
              onClick={() => setPage("analytics")}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-white/70 transition-all relative z-10"
            >
              Intelligence Report <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
