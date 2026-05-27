"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, Target, Shield, Car, Plane, Rocket,
  TrendingUp, Sparkles, ChevronRight, CheckCircle2, 
  MoreHorizontal, DollarSign, Lightbulb, Calendar, AlertCircle
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { Goal } from "@/lib/store";
import { V2Select } from "../ui/V2Select";
import { formatDate } from "@/lib/utils";
import { VylosCalculations } from "@/lib/vylosCalculations";
import { GoalIcon } from "../ui/GoalIcon";

interface GoalsViewProps {
  goals: Goal[];
  setShowAddGoal: (show: boolean) => void;
  deleteGoal: (id: string) => void;
  showToast: (msg: string, type?: any) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ 
  goals, setShowAddGoal, deleteGoal, showToast
}) => {
  const { state, formatCurrency, addGoalContribution } = useAppStore();
  const [activeFilter, setActiveFilter] = useState("All Goals");
  const [sortBy, setSortBy] = useState("Progress");

  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [panelLoading, setPanelLoading] = useState(false);

  const filters = ["All Goals", "In Progress", "Completed"];

  const stats = useMemo(() => {
    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount && g.targetAmount > 0).length;
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).length;
    return { totalSaved, totalTarget, overallProgress, completedGoals, activeGoals };
  }, [goals]);

  const monthStats = useMemo(() => VylosCalculations.getMonthStats({
    transactions: state.transactions,
    budgets: state.budgets,
    goals: state.goals
  } as any, state.selectedMonth), [state.transactions, state.budgets, state.goals, state.selectedMonth]);
  const availableMonthly = useMemo(() => monthStats.income - monthStats.expense, [monthStats]); // Monthly Surplus

  const displayGoals = useMemo(() => {
    let filtered = [...goals];
    if (activeFilter === "In Progress") filtered = filtered.filter(g => g.currentAmount < g.targetAmount);
    if (activeFilter === "Completed") filtered = filtered.filter(g => g.currentAmount >= g.targetAmount);

    return filtered.sort((a, b) => {
      if (sortBy === "Progress") {
        const pA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
        const pB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
        return pB - pA;
      }
      if (sortBy === "Deadline" || sortBy === "Target Date") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "Target Amount" || sortBy === "Amount") {
        return b.targetAmount - a.targetAmount;
      }
      if (sortBy === "Recently Added") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "CompletedFirst") {
        const isCompA = a.currentAmount >= a.targetAmount ? 1 : 0;
        const isCompB = b.currentAmount >= b.targetAmount ? 1 : 0;
        return isCompB - isCompA;
      }
      return 0;
    });
  }, [goals, activeFilter, sortBy]);

  const totalMonthlyNeeded = useMemo(() => {
    return goals.reduce((acc, g) => {
      if (g.currentAmount >= g.targetAmount) return acc;
      const remaining = g.targetAmount - g.currentAmount;
      const now = new Date();
      const deadline = new Date(g.deadline);
      let months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
      if (months < 1) months = 1;
      return acc + (remaining / months);
    }, 0);
  }, [goals]);

  const isUnrealistic = useMemo(() => totalMonthlyNeeded > availableMonthly && monthStats.income > 0, [totalMonthlyNeeded, availableMonthly, monthStats.income]);

  // Optimized contributions lookup
  const contributionsMap = useMemo(() => {
    const currentMonthPrefix = state.selectedMonth.slice(0, 7);
    const map: Record<string, number> = {};
    const contributions = state.goalContributions;
    for (let i = 0; i < contributions.length; i++) {
      const c = contributions[i];
      if (c.date.startsWith(currentMonthPrefix)) {
        map[c.goalId] = (map[c.goalId] || 0) + c.amount;
      }
    }
    return map;
  }, [state.goalContributions, state.selectedMonth]);


  const getGoalStatus = (goal: any) => {
    if (goal.currentAmount >= goal.targetAmount) return { label: "Completed", color: "text-green-600", dot: "bg-green-500" };
    return { label: "On track", color: "text-emerald-600", dot: "bg-emerald-500" };
  };

  const getMonthlyContribution = (goal: any) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const now = new Date();
    const deadline = new Date(goal.deadline);
    let months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
    if (months < 1) months = 1;
    return remaining / months;
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('emergency') || t.includes('shield')) return <Shield size={24} className="text-white" />;
    if (t.includes('vacation') || t.includes('travel')) return <Plane size={24} className="text-white" />;
    if (t.includes('business') || t.includes('startup')) return <Rocket size={24} className="text-white" />;
    if (t.includes('car') || t.includes('vehicle')) return <Car size={24} className="text-white" />;
    return <Target size={24} className="text-white" />;
  };

  const getIconBg = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('emergency')) return "bg-emerald-500 shadow-emerald-500/30";
    if (t.includes('vacation')) return "bg-amber-500 shadow-amber-500/30";
    if (t.includes('business')) return "bg-purple-600 shadow-purple-600/30";
    if (t.includes('car')) return "bg-blue-600 shadow-blue-600/30";
    return "bg-blue-500 shadow-blue-500/30";
  };

  const formatMonthYear = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">Goals</h2>
        </div>
        
        <button 
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all border border-blue-400/20 active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          New Goal
        </button>
      </div>

      {/* ─── Filters & Sort ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-[14px] text-[13px] font-bold whitespace-nowrap transition-all ${
                activeFilter === f 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-transparent' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="w-48 shrink-0">
          <V2Select 
            value={sortBy} 
            onChange={setSortBy} 
            options={[
              { value: "Deadline", label: "Sort by: Deadline" },
              { value: "Progress", label: "Sort by: Progress" },
              { value: "Target Amount", label: "Sort by: Target Amount" },
              { value: "Recently Added", label: "Sort by: Recently Added" },
              { value: "CompletedFirst", label: "Sort by: Completed/In Progress" }
            ]} 
          />
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* Left Column (Span 8) - Goals List */}
        <div id="goals-list-section" className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {displayGoals.length === 0 ? (
              <div className="vylos-glass-readable p-12 flex flex-col items-center justify-center text-center gap-6 border border-slate-200/60 dark:border-white/10 rounded-[2rem] shadow-xl">
                <div className="w-16 h-16 rounded-[22px] bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <Target size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">No Goals Found</h4>
                  <p className="text-[13px] font-medium text-slate-500 mt-1.5 max-w-sm">
                    {activeFilter === "All Goals" 
                      ? "Start planning for what matters most. Create your first goal today!" 
                      : `You don't have any goals under the "${activeFilter}" filter.`}
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddGoal(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-[13px] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all"
                >
                  Add New Goal
                </button>
              </div>
            ) : (
              displayGoals.map((goal, i) => {
                const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                const status = getGoalStatus(goal);
                const monthlyNeeded = getMonthlyContribution(goal);
                const monthlyContributed = contributionsMap[goal.id] || 0;
                const suggested = monthlyNeeded;

                const isGoalUnrealistic = monthlyNeeded > availableMonthly && goal.currentAmount < goal.targetAmount;

                return (
                  <div key={i} className="vylos-glass-readable p-5 sm:p-8 flex flex-col gap-6 group hover:scale-[1.01] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                      {/* Goal Info & Progress */}
                      <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-2xl ${getIconBg(goal.title)}`}>
                          <GoalIcon iconName={goal.icon || "Target"} size={24} className="text-white" />
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{goal.title}</h3>
                            <span className="text-sm font-black text-emerald-500 ml-4">{pct}%</span>
                          </div>
                          
                          <div className="flex items-end gap-1 mb-4">
                            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{formatCurrency(goal.currentAmount)}</span>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">of {formatCurrency(goal.targetAmount)}</span>
                          </div>
                          
                          <div className="h-3 bg-white/10 dark:bg-black/20 rounded-full overflow-hidden mb-4 border border-white/10">
                            <div className="h-full bg-gradient-to-r from-emerald-50 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: `${pct}%` }} />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Target: {formatMonthYear(goal.deadline)}</span>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                              <div className={`w-2 h-2 rounded-full ${status.dot} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="hidden md:block w-px h-32 bg-white/10" />
                      <div className="md:hidden h-px w-full bg-white/10" />

                      {/* Stats & Actions Container */}
                      <div className="flex flex-col gap-4 w-full md:w-56 shrink-0">
                        {/* Contributions & Suggestions */}
                        <div className="flex flex-col sm:flex-row md:flex-col justify-between gap-3 sm:gap-4 w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/10">
                              <DollarSign size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Contributed</span>
                              <span className="text-[13px] font-black text-slate-900 dark:text-white mt-0.5">{formatCurrency(monthlyContributed)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                              <TrendingUp size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recommended</span>
                              <div className="flex items-end gap-0.5 mt-0.5">
                                <span className="text-[13px] font-black text-slate-900 dark:text-white">{formatCurrency(suggested)}</span>
                                <span className="text-[9px] font-bold text-slate-400 mb-0.5">/mo</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex gap-2 w-full mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePanel(activePanel === `${goal.id}-add` ? null : `${goal.id}-add`);
                              setAmountInput("");
                              setNotesInput("");
                            }}
                            className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-center"
                          >
                            + Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePanel(activePanel === `${goal.id}-sub` ? null : `${goal.id}-sub`);
                              setAmountInput("");
                              setNotesInput("");
                            }}
                            className="flex-1 py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-center"
                          >
                            - Subtract
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Contribution Form Panel */}
                    {activePanel && activePanel.startsWith(goal.id) && (
                      <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">
                          {activePanel.endsWith("-add") ? "Add Contribution to Goal" : "Subtract Contribution from Goal"}
                        </h4>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const amt = parseFloat(amountInput);
                            if (isNaN(amt) || amt <= 0) {
                              showToast("Please enter a valid positive amount", "error");
                              return;
                            }
                            setPanelLoading(true);
                            try {
                              const finalAmt = activePanel.endsWith("-add") ? amt : -amt;
                              await addGoalContribution({
                                goalId: goal.id,
                                amount: finalAmt,
                                date: new Date().toISOString().split("T")[0],
                                notes: notesInput || (activePanel.endsWith("-add") ? "Manual addition" : "Manual subtraction")
                              });
                              showToast(
                                activePanel.endsWith("-add") 
                                  ? "Added contribution successfully!" 
                                  : "Subtracted contribution successfully!",
                                "success"
                              );
                              setActivePanel(null);
                              setAmountInput("");
                              setNotesInput("");
                            } catch (err: any) {
                              console.error("Failed to add contribution:", err);
                              showToast(err.message || "Failed to add contribution", "error");
                            } finally {
                              setPanelLoading(false);
                            }
                          }}
                          className="flex flex-col sm:flex-row gap-4 items-end"
                        >
                          <div className="flex-1 flex flex-col gap-2 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (R)</label>
                            <input
                              required
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="0.00"
                              value={amountInput}
                              onChange={(e) => setAmountInput(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm"
                            />
                          </div>
                          
                          <div className="flex-[2] flex flex-col gap-2 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes / Description (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g., Monthly bonus, unexpected expense"
                              value={notesInput}
                              onChange={(e) => setNotesInput(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm"
                            />
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setActivePanel(null);
                                setAmountInput("");
                                setNotesInput("");
                              }}
                              className="px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={panelLoading}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all disabled:opacity-50"
                            >
                              {panelLoading ? "Saving..." : "Confirm"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Realistic Goal feasibility Warning Banner */}
                    {isGoalUnrealistic && (
                      <div className="vylos-warning-card p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <h5 className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-0.5">Feasibility Alert</h5>
                          <p className="text-[11px] font-medium leading-relaxed text-slate-900/90 dark:text-slate-200">
                            This goal may be difficult to reach by the selected deadline. You would need to save around <span className="font-bold text-slate-950 dark:text-white">{formatCurrency(monthlyNeeded)}</span> per month, which is higher than your current available monthly cash flow.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Realistic Warning Banner */}
          {isUnrealistic && (
            <div className="vylos-warning-card p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-[13px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Realistic Projection Warning</h4>
                <p className="text-[12px] font-medium leading-relaxed text-slate-900/90 dark:text-slate-200">
                  Your combined goals require <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalMonthlyNeeded)}</span> per month, but your current surplus is <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(availableMonthly)}</span>. Consider extending deadlines or reducing target amounts to maintain financial stability.
                </p>
              </div>
            </div>
          )}

          {/* Goals Summary Card */}
          <div className="vylos-glass-readable p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blue-600" />
                <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Goals Summary</h3>
              </div>
              <button 
                onClick={() => setShowAddGoal(true)}
                className="text-slate-400 hover:text-blue-500 transition-colors"
                title="Add New Goal"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-500">Total Saved</span>
                <span className="text-[32px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{formatCurrency(stats.totalSaved)}</span>
              </div>
              <div className="flex flex-col items-end gap-1 mt-1">
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  <TrendingUp size={12} />
                  8.6%
                </div>
                <span className="text-[9px] font-medium text-slate-400">vs last month</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stats.overallProgress}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Across {displayGoals.length} goals</span>
                <span>{stats.overallProgress}% complete</span>
              </div>
            </div>
          </div>

          {/* On Track Card */}
          <div className="vylos-glass-readable p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-black text-emerald-600">On Track</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-none">
                {goals.filter(g => g.currentAmount >= g.targetAmount || getGoalStatus(g).label === "On track").length} of {goals.length}
              </span>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Great job! You're on track to achieve all your goals.
              </p>
            </div>
          </div>

          {/* Smart Tip Card */}
          <div className="vylos-glass-readable p-6 relative overflow-hidden">
            <div className="flex flex-col relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-amber-500 fill-amber-500" />
                <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Smart tip</h3>
              </div>
              <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Increase your monthly contribution by <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(Math.max(100, totalMonthlyNeeded * 0.1))}</span> to reach your goals sooner.
              </p>
              <button 
                onClick={() => showToast(`Saving an extra ${formatCurrency(Math.max(100, totalMonthlyNeeded * 0.1))} per month will help you achieve your goals 4.2 months earlier!`, "info")}
                className="text-[11px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors w-fit"
              >
                See impact <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Upcoming Targets Card */}
          <div className="vylos-glass-readable p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={16} className="text-slate-600 dark:text-slate-400" />
              <h3 className="text-[13px] font-black text-slate-900 dark:text-white">Upcoming Targets</h3>
            </div>
            
            <div className="flex flex-col gap-5 flex-1">
              {displayGoals.slice(0, 3).map((goal, i) => {
                const now = new Date();
                const deadline = new Date(goal.deadline);
                const daysDiff = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)));
                let timeStr = `${daysDiff} days`;
                if (daysDiff > 30) timeStr = `${Math.floor(daysDiff / 30)} months`;
                
                return (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-slate-900 dark:text-white mb-0.5 group-hover:text-blue-600 transition-colors">{goal.title}</span>
                      <span className="text-[10px] font-medium text-slate-500">{formatMonthYear(goal.deadline)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                      {timeStr}
                    </span>
                  </div>
                )
              })}
            </div>

            <button 
              onClick={() => {
                document.getElementById("goals-list-section")?.scrollIntoView({ behavior: 'smooth' });
                showToast("Viewing all targets in your goals list", "info");
              }}
              className="mt-6 text-[11px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View all targets <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
