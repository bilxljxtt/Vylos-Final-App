"use client";

import React from "react";
import { 
  Trophy, Zap, Target, Flame, 
  ChevronRight, Star, Shield, 
  ArrowUpRight, Info, X
} from "lucide-react";
import { XPService, RANKS, XP_CONFIG } from "@/lib/services/XPService";
import { useAppStore } from "@/lib/AppContext";

interface XPSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XPSystemModal: React.FC<XPSystemModalProps> = ({ isOpen, onClose }) => {
  const { state } = useAppStore();
  const profile = state.userProfile;
  const xp = profile.totalXp || 0;
  const { current, next, progress, needed } = XPService.calculateRank(xp);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" 
        onClick={onClose}
      />
      
      <div className="vylos-glass-modal w-full max-w-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                <Trophy size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Vylos XP System</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Consistency Level: {Math.round(profile.dailyConsistencyScore || 0)}%</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Current Status */}
              <div className="flex flex-col gap-6">
                {/* Rank Card */}
                <div className="vylos-glass-soft p-6 border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Rank</span>
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                      Rank {current.id}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{current.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-black text-primary">{xp.toLocaleString()}</span>
                    <span className="text-sm font-bold text-slate-400">XP Total</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span>Progress to {next?.name || "Max Rank"}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 mt-2">
                      {next ? `${needed.toLocaleString()} XP needed for next rank` : "You have reached the highest rank!"}
                    </p>
                  </div>
                </div>

                {/* Streak & Multiplier Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="vylos-glass-soft p-5 border-white/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                      <Flame size={16} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Streak</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{profile.currentStreak || 0}</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Days consistent</p>
                  </div>
                  <div className="vylos-glass-soft p-5 border-white/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-indigo-500 mb-1">
                      <ArrowUpRight size={16} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bonus</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{profile.xpMultiplier?.toFixed(1) || "1.0"}x</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">XP Multiplier</p>
                  </div>
                </div>
              </div>

              {/* Right Column: How to earn */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 mb-2">Earning Intelligence</h4>
                
                {[
                  { icon: <Zap size={14} />, label: "Daily Dashboard Review", xp: 15, color: "text-blue-500" },
                  { icon: <Target size={14} />, label: "Add Financial Transaction", xp: 20, color: "text-emerald-500" },
                  { icon: <Shield size={14} />, label: "Update Budget Limits", xp: 25, color: "text-indigo-500" },
                  { icon: <Star size={14} />, label: "Reach 3-Day Streak", xp: 100, color: "text-amber-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-[20px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-white/5 ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-[12px] font-black text-primary">+{item.xp} XP</span>
                  </div>
                ))}

                <div className="mt-4 p-5 rounded-[24px] bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Info size={16} className="text-primary mt-0.5" />
                    <div>
                      <h5 className="text-[12px] font-black text-primary uppercase tracking-widest">Pro Tip</h5>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-white/60 mt-1 leading-relaxed">
                        Maintaining a 7-day streak increases your XP multiplier by 0.1x permanently, up to a max of 2.2x.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Ranking Roadmap */}
            <div className="mt-12">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 mb-6">Ranking Roadmap</h4>
              <div className="flex flex-col gap-3">
                {RANKS.map((rank) => (
                  <div 
                    key={rank.id} 
                    className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${
                      current.id === rank.id 
                        ? 'bg-primary/10 border-primary/40 shadow-xl shadow-primary/5' 
                        : rank.id < current.id 
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                          : 'bg-white/5 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        current.id === rank.id ? 'bg-primary text-white shadow-lg' : 
                        rank.id < current.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'
                      }`}>
                        {rank.id < current.id ? <CheckCircleIcon /> : <span className="text-xs font-black">{rank.id}</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[14px] font-black ${current.id === rank.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                          {rank.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {rank.minXp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                    {current.id === rank.id && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-white dark:bg-white/10 px-3 py-1.5 rounded-full shadow-sm">
                        Current Rank
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/10 bg-white/5 flex justify-center">
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              Continue Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
