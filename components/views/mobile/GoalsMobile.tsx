"use client";

import React, { useMemo } from "react";
import { ChevronLeft, Plus, Target, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { GoalIcon } from "@/components/ui/GoalIcon";
import { MobilePageHeader } from "../../ui/MobilePageHeader";

interface GoalsMobileProps {
  goals: any[];
  setShowAddGoal: (show: boolean) => void;
  deleteGoal: (id: string) => void;
  showToast: (msg: string, type: "success" | "info" | "warning" | "error") => void;
  setPage: (page: string) => void;
}

export const GoalsMobile: React.FC<GoalsMobileProps> = ({
  goals,
  setShowAddGoal,
  deleteGoal,
  showToast,
  setPage
}) => {
  const { formatCurrency } = useAppStore();

  const activeGoals = useMemo(() => goals.filter(g => g.status !== "Completed"), [goals]);
  const displayGoals = activeGoals.length > 0 ? activeGoals : goals;

  const totalSaved = useMemo(() => {
    return goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  }, [goals]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the goal "${title}"?`)) {
      deleteGoal(id);
      showToast(`Goal "${title}" deleted`, "info");
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-24 max-w-md mx-auto px-1 animate-in fade-in duration-500">
      {/* Header */}
      <MobilePageHeader
        title="Savings Goals"
        onBack={() => setPage("dashboard")}
        rightAction={
          <button 
            onClick={() => setShowAddGoal(true)}
            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
            aria-label="Add Savings Goal"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        }
      />

      {/* Goal Summary Card */}
      <div className="vylos-glass-readable p-5 rounded-3xl border border-white/20 shadow-md flex items-center justify-between min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-black mobile-muted uppercase tracking-widest">Total Saved Overall</span>
          <span className="text-xl font-black mobile-heading tracking-tighter mt-1 whitespace-nowrap truncate leading-none">
            {formatCurrency(totalSaved)}
          </span>
        </div>
        <div className="flex flex-col items-end min-w-0">
          <span className="text-[9px] font-black mobile-muted uppercase tracking-widest">Active Goals</span>
          <span className="text-sm font-black text-blue-700 dark:text-blue-400 tracking-tighter mt-1 whitespace-nowrap truncate leading-none">
            {activeGoals.length} Active
          </span>
        </div>
      </div>

      {/* Goals List */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-black mobile-label uppercase tracking-widest px-1">Goal Status</span>
        
        {displayGoals.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayGoals.map((goal, i) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              
              return (
                <div key={goal.id || i} className="vylos-glass-readable p-5 rounded-3xl border border-white/25 shadow-md flex flex-col gap-4 relative min-w-0">
                  <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/10 shadow flex items-center justify-center shrink-0">
                        <GoalIcon iconName={goal.icon || "Target"} size={22} className="text-blue-500" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-[13px] font-black mobile-subheading leading-tight truncate">
                          {goal.title}
                        </h4>
                        {goal.targetDate && (
                          <span className="text-[9px] font-bold mobile-muted mt-1 uppercase tracking-wider">
                            By {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(goal.id, goal.title)}
                      className="p-2 bg-slate-200/50 hover:bg-red-500/10 hover:text-red-500 text-slate-600 dark:text-slate-400 rounded-lg transition-colors shrink-0"
                      aria-label="Delete Goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex justify-between items-baseline text-[11px] font-bold mobile-muted">
                      <span className="text-[12px] font-black mobile-heading">
                        {formatCurrency(goal.currentAmount)}
                        <span className="text-slate-500 dark:text-slate-400 font-medium"> / {formatCurrency(goal.targetAmount)}</span>
                      </span>
                      <span className="text-blue-700 dark:text-blue-400 font-black">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 shadow-sm ${pct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="vylos-glass-readable p-8 rounded-3xl border border-white/25 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 shadow-inner">
              <Target size={24} />
            </div>
            <span className="text-[11px] font-black mobile-label uppercase tracking-widest">No goals defined</span>
            <p className="text-[10px] font-bold mobile-muted mt-1">Add a goal to start saving for specific targets.</p>
          </div>
        )}
      </div>
    </div>
  );
};
