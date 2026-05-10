"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, Trash2, Target, Shield, Car, Plane, Flag, Trophy, 
  Calendar, TrendingUp, Sparkles, Pencil, DollarSign,
  ChevronRight, CheckCircle2, Clock, AlertCircle, Info, MoreHorizontal
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { ViewContainer } from "../ui/ViewContainer";
import { Goal, GoalContribution } from "@/lib/store";
import { VylosEngine } from "@/lib/vylosEngine";

interface GoalsViewProps {
  goals: Goal[];
  setShowAddGoal: (show: boolean) => void;
  deleteGoal: (id: string) => void;
  showToast: (msg: string, type?: any) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ 
  goals, 
  setShowAddGoal, 
  deleteGoal, 
  showToast
}) => {
  const { state, formatCurrency, lastSynced, addGoalContribution, updateGoal } = useAppStore();
  const [showContribution, setShowContribution] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Real Calculations ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount && g.targetAmount > 0).length;
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).length;

    return { totalGoals, totalSaved, totalTarget, overallProgress, completedGoals, activeGoals };
  }, [goals]);

  // Generate Milestones from contributions and progress
  const milestones = useMemo(() => {
    return goals
      .flatMap(g => {
        const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        const m = [];
        if (pct >= 100) m.push({ title: g.title, text: "Goal Achieved! 🏆", date: "Just now", completed: true });
        else if (pct >= 50) m.push({ title: g.title, text: "Halfway there!", date: "Keep going", completed: true });
        return m;
      })
      .slice(0, 4);
  }, [goals]);

  const handleAddContribution = async () => {
    if (!showContribution || !contributionAmount || isNaN(parseFloat(contributionAmount))) return;
    setIsSubmitting(true);
    try {
      await addGoalContribution({
        goalId: showContribution,
        amount: parseFloat(contributionAmount),
        date: new Date().toISOString(),
        notes: "Manual contribution"
      });
      showToast("Contribution saved!", "success");
      setShowContribution(null);
      setContributionAmount("");
    } catch (error: any) {
      console.error("Contribution save failed:", error);
      showToast(`Failed to save contribution: ${error.message || 'Unknown error'}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkComplete = async (goal: Goal) => {
    try {
      await updateGoal(goal.id, { currentAmount: goal.targetAmount, status: "Completed" });
      showToast(`${goal.title} marked as completed!`, "success");
    } catch (err) {
      showToast("Failed to update goal.", "error");
    }
  };

  const getGoalStatus = (goal: Goal) => {
    if (goal.currentAmount >= goal.targetAmount) return { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    
    // Feasibility check
    const remaining = goal.targetAmount - goal.currentAmount;
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const monthsDiff = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
    const months = Math.max(1, monthsDiff);
    
    const required = remaining / months;
    const income = state.userProfile.monthlyIncome || 0;
    
    if (required > income * 0.5) return { label: "At Risk", color: "text-red-500", bg: "bg-red-500/10" };
    if (required > income * 0.2) return { label: "Behind", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: "On Track", color: "text-primary", bg: "bg-primary/10" };
  };

  const getStyleForGoal = (goal: Goal) => {
    const t = goal.title.toLowerCase();
    if (t.includes("emerg") || t.includes("fund")) return { img: "🛡️", color: "#10B981" };
    if (t.includes("car") || t.includes("travel")) return { img: "🚗", color: "#3B82F6" };
    if (t.includes("home") || t.includes("house")) return { img: "🏠", color: "#F59E0B" };
    return { img: goal.icon || "🎯", color: goal.color || "#00D8A5" };
  };

  return (
    <ViewContainer className="flex flex-col pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-text-main tracking-tight">Financial Goals</h1>
            {lastSynced && (
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
              </div>
            )}
          </div>
          <p className="text-text-muted font-medium">Tracking {stats.activeGoals} active goals and {stats.completedGoals} achievements.</p>
        </div>
        <button 
          onClick={() => setShowAddGoal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          New Goal
        </button>
      </div>

      {/* Real Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Target size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-text-main">{stats.totalGoals}</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active Goals</span>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Trophy size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-text-main">{stats.completedGoals}</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Goals Completed</span>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <TrendingUp size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-text-main">{stats.overallProgress}%</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Progress</span>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <DollarSign size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-text-main tracking-tight">{formatCurrency(stats.totalSaved)}</span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Saved</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black text-text-main tracking-tight pl-2">Active Targets</h3>
          
          <div className="flex flex-col gap-4">
            {goals.length === 0 ? (
              <div className="bg-card/50 border-2 border-dashed border-border-main rounded-[2.5rem] p-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-border-main/20 flex items-center justify-center text-text-muted/30 mb-6">
                  <Target size={40} />
                </div>
                <h4 className="text-xl font-black text-text-main mb-2">No Goals Yet</h4>
                <p className="text-sm font-medium text-text-muted max-w-xs mb-8">Start saving for your dreams. Set a goal and track your progress in real-time.</p>
                <button onClick={() => setShowAddGoal(true)} className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-400 transition-all">Create First Goal</button>
              </div>
            ) : (
              goals.map(g => {
                const pct = g.targetAmount > 0 ? Math.min(100, Math.round(g.currentAmount / g.targetAmount * 100)) : 0;
                const status = getGoalStatus(g);
                const style = getStyleForGoal(g);
                const isCompleted = g.currentAmount >= g.targetAmount;

                return (
                  <div key={g.id} className="bg-card border border-border-main p-8 rounded-[2.5rem] group hover:border-border-strong transition-all shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                      {/* Visual */}
                      <div 
                        className="w-24 h-24 rounded-[2rem] flex-shrink-0 flex items-center justify-center text-5xl shadow-inner border border-white/5"
                        style={{ backgroundColor: `${style.color}15` }}
                      >
                        {style.img}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-text-main tracking-tight truncate">{g.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteGoal(g.id)} className="p-2 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-5">
                          <p className="text-sm font-medium text-text-muted opacity-70">
                            {g.notes || "Saving for a better future"}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                            <Calendar size={12} />
                            {new Date(g.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-text-main">{formatCurrency(g.currentAmount)} <span className="text-text-muted font-bold opacity-40">saved</span></span>
                            <span className="text-sm font-black text-text-main">{pct}%</span>
                          </div>
                          <div className="h-3 w-full bg-border-main rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                              style={{ width: `${pct}%`, backgroundColor: isCompleted ? '#10B981' : style.color }}
                            />
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex gap-6">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Target</span>
                              <span className="text-sm font-black text-text-main">{formatCurrency(g.targetAmount)}</span>
                            </div>
                            <div className="flex flex-col border-l border-border-main pl-6">
                              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Left to save</span>
                              <span className="text-sm font-black text-text-main">{formatCurrency(Math.max(0, g.targetAmount - g.currentAmount))}</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {!isCompleted && (
                              <button 
                                onClick={() => handleMarkComplete(g)}
                                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all"
                              >
                                Done
                              </button>
                            )}
                            <button 
                              onClick={() => setShowContribution(g.id)}
                              className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-95"
                            >
                              Add Contribution
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* AI Insights Card */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700">
              <Sparkles size={140} />
            </div>
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Vylos Insight</h3>
            </div>
            <p className="text-sm font-medium text-text-muted leading-relaxed mb-8 relative">
              {goals.length === 0 
                ? "Start by setting your first financial goal. Users with clear targets save 2x more on average."
                : stats.overallProgress > 90 
                ? "Incredible work! You're in the final stretch. Keep that momentum until the finish line."
                : "Your savings velocity is strong. Based on current trends, you'll reach your next milestone in 3 weeks."}
            </p>
            <button onClick={() => setShowAddGoal(true)} className="flex items-center gap-2 text-xs font-black text-primary hover:underline relative">
              Review Strategy <ChevronRight size={16} />
            </button>
          </div>

          {/* Milestones Panel */}
          <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-8">Goal Milestones</h3>
            <div className="space-y-8 relative pl-6">
              {milestones.length > 0 && <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-border-main" />}
              {milestones.length > 0 ? milestones.map((m, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-4 border-card flex items-center justify-center ${m.completed ? 'bg-emerald-500' : 'bg-border-main'}`}>
                    <CheckCircle2 size={8} className="text-white" strokeWidth={4} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-main leading-tight">{m.title}</span>
                    <span className="text-[10px] font-bold text-text-muted mt-1">{m.text}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center py-6 text-center text-text-muted/40">
                   <Clock size={32} strokeWidth={1} className="mb-2" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">No milestones yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Tips Panel */}
          <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Info size={18} className="text-primary" />
              <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest">Savings Tip</h3>
            </div>
            <p className="text-[11px] font-medium text-text-muted leading-relaxed">
              Try the <span className="font-black text-text-main">50/30/20 rule</span>: 50% for needs, 30% for wants, and 20% directly into these goals.
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Modal */}
      {showContribution && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-card border border-border-main w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <DollarSign size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-text-main">Add Contribution</h3>
              <p className="text-sm font-medium text-text-muted mt-2">
                Boost your <strong>{goals.find(g => g.id === showContribution)?.title}</strong> goal.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-2 block">Amount to Deposit</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-text-muted">R</span>
                  <input 
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full bg-border-main/20 border border-border-main rounded-2xl py-5 pl-12 pr-6 text-2xl font-black text-text-main focus:border-primary transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowContribution(null)} className="flex-1 py-4 text-sm font-black text-text-muted hover:text-text-main">Cancel</button>
                <button 
                  onClick={handleAddContribution}
                  disabled={isSubmitting || !contributionAmount}
                  className="flex-2 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ViewContainer>
  );
};
