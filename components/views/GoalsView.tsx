"use client";

import React from "react";
import { Plus, 
  Trash2, 
  Target, 
  Shield, 
  Car, 
  Plane, 
  Flag, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Pencil, 
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import { } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { ViewContainer } from "../ui/ViewContainer";

interface GoalsViewProps {
  goals: any[];
  setShowAddGoal: (show: boolean) => void;
  deleteGoal: (id: string) => void;
  ACCENT: string;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ 
  goals, 
  setShowAddGoal, 
  deleteGoal, 
  ACCENT 
}) => {
  const { formatCurrency } = useAppStore();
  // Stats calculation
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount && g.targetAmount > 0).length;
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const getStyleForGoal = (title: string = "") => {
    const t = title.toLowerCase();
    if (t.includes("emerg") || t.includes("fund") || t.includes("safe")) {
      return { icon: <Shield size={24} />, bg: "bg-emerald-500/10", text: "text-emerald-500", bar: "bg-emerald-500", img: "🛡️" };
    }
    if (t.includes("car") || t.includes("auto") || t.includes("vehicle")) {
      return { icon: <Car size={24} />, bg: "bg-blue-500/10", text: "text-blue-500", bar: "bg-blue-500", img: "🚗" };
    }
    if (t.includes("vacation") || t.includes("trip") || t.includes("japan") || t.includes("travel")) {
      return { icon: <Plane size={24} />, bg: "bg-emerald-500/10", text: "text-emerald-500", bar: "bg-emerald-500", img: "🏝️" };
    }
    if (t.includes("education") || t.includes("study") || t.includes("degree")) {
        return { icon: <Target size={24} />, bg: "bg-indigo-500/10", text: "text-indigo-500", bar: "bg-indigo-500", img: "🎓" };
    }
    if (t.includes("home") || t.includes("house") || t.includes("apartment") || t.includes("down payment")) {
        return { icon: <Target size={24} />, bg: "bg-amber-500/10", text: "text-amber-500", bar: "bg-amber-500", img: "🏠" };
    }
    return { icon: <Target size={24} />, bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", img: "🎯" };
  };

  return (
    <ViewContainer className="flex flex-col pt-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-text-main tracking-tight mb-2">Your Goals</h1>
          <p className="text-text-muted font-medium">Set goals, track progress, and achieve the life you want.</p>
        </div>
        <button 
          onClick={() => setShowAddGoal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-emerald-400 text-white font-bold rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          New Goal
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Goals */}
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Flag size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-text-main">{totalGoals}</span>
            </div>
            <span className="text-xs font-bold text-text-main uppercase tracking-widest opacity-60">Total Goals</span>
            <span className="text-[10px] font-medium text-text-muted mt-0.5">All goals you've created</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                className="text-border-main"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - overallProgress / 100)}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-black text-text-main">{overallProgress}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-text-main">Overall Progress</span>
            <span className="text-xs font-medium text-text-muted">You're on track!</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary mt-1">
                <TrendingUp size={10} />
                +12% from last month
            </div>
          </div>
        </div>

        {/* Goals Completed */}
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Trophy size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-text-main">{completedGoals}</span>
            <span className="text-xs font-bold text-text-main uppercase tracking-widest opacity-60">Goals Completed</span>
            <span className="text-[10px] font-medium text-text-muted mt-0.5">Keep up the great work!</span>
          </div>
        </div>

        {/* Total Saved */}
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Calendar size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-text-main tracking-tight">{formatCurrency(totalSaved)}</span>
            <span className="text-xs font-bold text-text-main uppercase tracking-widest opacity-60">Total Saved</span>
            <span className="text-[10px] font-medium text-text-muted mt-0.5">Across all goals</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Active Goals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-text-main tracking-tight">Active Goals</h3>
            <button className="text-xs font-bold text-primary hover:underline">View All</button>
          </div>

          <div className="flex flex-col gap-4">
            {goals.filter(g => g.currentAmount < g.targetAmount || g.targetAmount === 0).map((g: any) => {
              const pct = g.targetAmount > 0 ? Math.min(100, Math.round(g.currentAmount / g.targetAmount * 100)) : 0;
              const style = getStyleForGoal(g.title);
              
              return (
                <div key={g.id} className="bg-card border border-border-main p-6 rounded-[2rem] flex flex-col sm:flex-row sm:items-center gap-6 group hover:border-border-strong transition-all shadow-sm relative">
                  <button 
                    onClick={() => deleteGoal(g.id)} 
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-rose-500/10 z-10"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Left Visual */}
                  <div className={`w-20 h-20 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center text-4xl shadow-inner ${style.bg}`}>
                    {style.img}
                  </div>

                  {/* Goal Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-black text-text-main tracking-tight truncate">{g.title}</h4>
                      <span className={`text-lg font-black ${style.text}`}>{pct}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-text-muted opacity-80">
                        {g.title.toLowerCase().includes('vacation') ? 'Dream vacation in Tokyo' : 
                         g.title.toLowerCase().includes('car') ? '2024 Tesla Model 3' : 
                         g.title.toLowerCase().includes('down payment') ? 'For my first home' : 
                         g.title.toLowerCase().includes('education') ? "Master's degree" : 
                         'Your future target'}
                      </p>
                      <span className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">2 months left</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-2.5 w-full bg-border-main rounded-full overflow-hidden mb-3">
                      <div 
                        className={`absolute top-0 left-0 h-full ${style.bar} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-text-main">{formatCurrency(g.currentAmount)} <span className="text-text-muted font-bold opacity-40">saved</span></span>
                      <span className="text-sm font-black text-text-muted opacity-60">{formatCurrency(g.targetAmount)} <span className="text-text-muted font-bold opacity-40">goal</span></span>
                    </div>
                  </div>
                </div>
              );
            })}

            {goals.filter(g => g.currentAmount < g.targetAmount || g.targetAmount === 0).length === 0 && (
              <div className="border-2 border-dashed border-border-main rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-card/50">
                 <div className="w-16 h-16 rounded-full bg-border-main flex items-center justify-center mb-4">
                    <Flag size={24} className="text-text-muted" />
                 </div>
                 <h4 className="text-lg font-black text-text-main">Set Your First Target</h4>
                 <p className="text-sm font-medium text-text-muted mt-2 max-w-xs">
                    Start achieving your dreams by setting clear financial milestones.
                 </p>
                 <button 
                  onClick={() => setShowAddGoal(true)}
                  className="mt-6 px-8 py-3 bg-primary text-white font-black rounded-xl hover:bg-emerald-400 transition-all active:scale-95"
                 >
                    Create Goal
                 </button>
              </div>
            )}

            <button 
              onClick={() => setShowAddGoal(true)}
              className="w-full border border-dashed border-border-main rounded-2xl py-4 flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 transition-colors group"
            >
              <Plus size={18} strokeWidth={3} className="group-hover:scale-125 transition-transform" />
              Create New Goal
            </button>
          </div>
        </div>

        {/* Right Side: Panels */}
        <div className="flex flex-col gap-8">
          {/* Goal Milestones */}
          <div className="bg-card border border-border-main p-8 rounded-[2rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Goal Milestones</h3>
              <button className="text-[10px] font-black text-primary hover:underline">View All</button>
            </div>

            <div className="flex flex-col gap-8 relative pl-6">
              {/* Vertical Line */}
              <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-border-main" />

              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center text-white">
                  <CheckCircle2 size={8} strokeWidth={3} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-text-main">Vacation to Japan</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">May 15, 2024</span>
                </div>
                <p className="text-[11px] font-medium text-text-muted">Reached 25% of your goal</p>
              </div>

              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center text-white">
                  <CheckCircle2 size={8} strokeWidth={3} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-text-main">Down Payment</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">May 10, 2024</span>
                </div>
                <p className="text-[11px] font-medium text-text-muted">Reached 50% of your goal</p>
              </div>

              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center text-white">
                  <CheckCircle2 size={8} strokeWidth={3} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-text-main">New Car</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Apr 28, 2024</span>
                </div>
                <p className="text-[11px] font-medium text-text-muted">Reached 10% of your goal</p>
              </div>

              <div className="relative flex flex-col gap-1 opacity-60">
                <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-border-main border-4 border-card" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-text-main">Education Fund</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">In 22 days</span>
                </div>
                <p className="text-[11px] font-medium text-text-muted">Next milestone: 30%</p>
              </div>
            </div>
          </div>

          {/* AI Goal Insight */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-emerald-500/10 group-hover:scale-125 transition-transform duration-700">
                <Sparkles size={120} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Sparkles size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest">AI Goal Insight</h3>
            </div>
            <p className="text-sm font-medium text-text-muted leading-relaxed mb-6">
                You're doing great! Based on your income and spending, you're on track to achieve all your goals 2 months ahead of schedule.
            </p>
            <button className="flex items-center gap-2 text-sm font-black text-primary hover:underline">
                View Recommendation <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-text-main uppercase tracking-widest px-2 opacity-80">Quick Actions</h3>
            
            <button className="bg-card border border-border-main p-5 rounded-2xl flex items-center justify-between group hover:border-border-strong transition-all shadow-sm active:scale-[0.98]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Pencil size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-text-main">Edit Goals</span>
                        <span className="text-[10px] font-medium text-text-muted">Update your goals and targets</span>
                    </div>
                </div>
                <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="bg-card border border-border-main p-5 rounded-2xl flex items-center justify-between group hover:border-border-strong transition-all shadow-sm active:scale-[0.98]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <DollarSign size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-text-main">Add Contribution</span>
                        <span className="text-[10px] font-medium text-text-muted">Add money to any goal</span>
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
