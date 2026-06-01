"use client";

import React from "react";
import { Sparkles, Zap } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface AIAdvisorWidgetProps {
  firstName: string;
  onAnalyze: () => void;
  formatCurrency: (val: number) => string;
}

export const AIAdvisorWidget: React.FC<AIAdvisorWidgetProps> = ({ 
  firstName, onAnalyze, formatCurrency 
}) => {
  return (
    <GlassCard p="p-8" className="flex flex-col relative overflow-hidden">
      {/* Soft glow in corner */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg">
            <Sparkles size={22} fill="currentColor" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter">Vylos AI</h4>
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <h5 className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-tight mb-3">Hi, {firstName}!</h5>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-400 leading-relaxed mb-8">
          Based on your activity, I've identified several ways to optimize your wealth and increase your monthly savings rate.
        </p>

        <div className="vylos-glass-soft p-6 text-slate-900 dark:text-white shadow-2xl border-white/40 group hover:bg-white/40 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-500/30">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Smart Insight</span>
          </div>
          <p className="text-[13px] font-black leading-snug mb-6 text-slate-700 dark:text-slate-300">
            Analyzing your spending habits to find hidden leaks and automated savings opportunities.
          </p>
          <button 
            onClick={onAnalyze}
            className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary/20 border border-white/20"
          >
            Run Intelligence Scan
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
