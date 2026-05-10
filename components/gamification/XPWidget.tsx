"use client";

import React from "react";
import { Sparkles, Trophy, Flame, Zap, ChevronRight, TrendingUp } from "lucide-react";
import { XPService } from "@/lib/services/XPService";

interface XPWidgetProps {
  profile: any;
}

export function XPWidget({ profile }: XPWidgetProps) {
  const { totalXp = 0, currentStreak = 0, xpMultiplier = 1.0, dailyConsistencyScore = 0 } = profile;
  const { current, next, progress, needed } = XPService.calculateRank(totalXp);

  return (
    <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex flex-col gap-6 relative z-10">
        {/* Top: Rank & Total XP */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
              <Trophy size={28} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xl font-black text-text-main tracking-tight">{current.name}</h3>
                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">Rank {current.id}</span>
              </div>
              <p className="text-sm font-bold text-text-muted opacity-80">{totalXp.toLocaleString()} Total XP Earned</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
              <Flame size={16} fill="currentColor" />
              <span className="text-xs font-black uppercase tracking-widest">{currentStreak} Day Streak</span>
            </div>
          </div>
        </div>

        {/* Middle: Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Progress to {next?.name || "Max Rank"}</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{progress}% Complete</span>
          </div>
          <div className="h-4 w-full bg-bg rounded-full border border-border-main p-0.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          {next && (
            <p className="text-[10px] font-bold text-text-muted text-center italic">
              Only <span className="text-primary">{needed.toLocaleString()} XP</span> needed for next rank
            </p>
          )}
        </div>

        {/* Bottom: Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg/50 border border-border-main/50 p-4 rounded-2xl flex flex-col gap-1 items-center justify-center group/stat hover:border-primary/30 transition-all">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-tight">Multiplier</span>
            <div className="flex items-center gap-1.5 text-primary">
              <Zap size={14} fill="currentColor" strokeWidth={2.5} />
              <span className="text-sm font-black tracking-tight">{xpMultiplier.toFixed(1)}x</span>
            </div>
          </div>
          <div className="bg-bg/50 border border-border-main/50 p-4 rounded-2xl flex flex-col gap-1 items-center justify-center group/stat hover:border-primary/30 transition-all">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-tight">Consistency</span>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <TrendingUp size={14} strokeWidth={3} />
              <span className="text-sm font-black tracking-tight">{Math.round(dailyConsistencyScore)}%</span>
            </div>
          </div>
          <div className="bg-bg/50 border border-border-main/50 p-4 rounded-2xl flex flex-col gap-1 items-center justify-center group/stat hover:border-primary/30 transition-all">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-tight">Consistency</span>
            <div className={`
              text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
              ${dailyConsistencyScore >= 75 ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"}
            `}>
              {dailyConsistencyScore >= 75 ? "Met" : "Pending"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
