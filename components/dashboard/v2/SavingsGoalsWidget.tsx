"use client";

import React from "react";
import { Plus, Target } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface SavingsGoalsWidgetProps {
  goals: any[];
  formatCurrency: (val: number) => string;
  onAddGoal: () => void;
  onViewAll?: () => void;
}

export const SavingsGoalsWidget: React.FC<SavingsGoalsWidgetProps> = ({ 
  goals, formatCurrency, onAddGoal, onViewAll
}) => {
  const activeGoals = goals.filter(g => g.status !== 'Completed');
  const displayGoals = activeGoals.length > 0 ? activeGoals : goals; // Fallback to all if somehow everything is completed or empty

  return (
    <GlassCard p="p-8" className="flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter">Savings Goals</h4>
        <div className="flex items-center gap-4">
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          )}
          <button 
            onClick={onAddGoal}
            className="bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-8 flex-1">
        {goals.length > 0 ? displayGoals.map((goal, i) => {
          const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
          return (
            <div key={i} className="flex gap-5 group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 shadow-xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                {goal.icon || "💰"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-[13px] font-black text-slate-900 dark:text-white truncate">{goal.title}</h5>
                  <span className="text-[11px] font-black text-slate-500">{pct}%</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 mb-3 truncate">
                  <span className="text-slate-900 dark:text-white">{formatCurrency(goal.currentAmount)}</span> / {formatCurrency(goal.targetAmount)}
                </p>
                <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-emerald-500 shadow-lg transition-all duration-1000`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
              <Target size={32} />
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
              No active goals.<br/>Dream big and start saving.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
