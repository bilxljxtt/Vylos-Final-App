"use client";

import React from "react";
import { X, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface HealthDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    score: number;
    label: string;
    breakdown: {
      spending: number;
      savings: number;
      budget: number;
      goals: number;
    };
    stats: {
      savingsRate: number;
      budgetUtilization: number;
      runwayMonths: number;
    };
    explanation?: string;
  };
}

export function HealthDetailModal({ isOpen, onClose, metrics }: HealthDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border-main w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-border-main flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <span className="text-2xl font-black">{metrics.score}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-text-main tracking-tight">Financial Health Breakdown</h2>
              <p className="text-sm font-medium text-emerald-500">{metrics.label} Status</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border-main rounded-xl transition-all">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Score Pillars */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Score Pillars</h3>
              {[
                { label: "Liquidity (Q)", val: metrics.breakdown.savings, color: "blue", icon: <TrendingUp size={14} /> },
                { label: "Debt Ratio (D)", val: metrics.breakdown.budget, color: "red", icon: <ArrowDownRight size={14} /> },
                { label: "Consistency (C)", val: metrics.breakdown.spending, color: "emerald", icon: <CheckCircle2 size={14} /> },
                { label: "Goal Velocity (G)", val: metrics.breakdown.goals, color: "purple", icon: <TrendingUp size={14} /> },
              ].map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                    <div className="flex items-center gap-1.5 opacity-60">
                      {p.icon}
                      {p.label}
                    </div>
                    <span className={`text-${p.color}-500`}>{p.val}/25</span>
                  </div>
                  <div className="h-1.5 w-full bg-border-main rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${p.color}-500 rounded-full transition-all duration-1000 delay-${i * 100}`} 
                      style={{ width: `${(p.val / 25) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Key Statistics */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Key Performance Indicators</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl bg-border-main/20 border border-border-main">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Savings Rate</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black text-text-main">{metrics.stats.savingsRate}%</span>
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <ArrowUpRight size={10} /> Good
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-border-main/20 border border-border-main">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Budget Utilization</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black text-text-main">{metrics.stats.budgetUtilization}%</span>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      <ArrowUpRight size={10} /> Target
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-border-main/20 border border-border-main">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Emergency Runway</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black text-text-main">{metrics.stats.runwayMonths} Mo</span>
                    <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                      <Info size={10} /> Healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Analysis</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Info size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-text-main uppercase tracking-tight">Intelligence Engine Insight</h4>
                  <p className="text-[11px] font-medium text-text-muted">{metrics.explanation || "No major changes in your financial behaviour."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-border-main/20 border-t border-border-main">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-[0.98]"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
