"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { VylosAvatar } from "@/components/ui/VylosAvatar";

interface V2ProfileCardProps {
  userName: string;
  email: string;
  avatarUrl?: string;
  xp?: number;
  streak?: number;
  onUpgrade: () => void;
  onXPClick?: () => void;
  tier?: string;
}

export const V2ProfileCard: React.FC<V2ProfileCardProps> = ({ 
  userName, email, avatarUrl, xp = 0, streak = 0, onUpgrade, onXPClick, tier = 'free'
}) => {
  const isFree = tier === 'free';
  return (
    <GlassCard p="p-8" className="flex flex-col relative group">
      {/* Premium Liquid Glass Effects */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
      
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center relative z-10 mb-8 pt-2">
        <div className="relative">
          {/* Avatar Glow Ring */}
          <div className="absolute inset-[-8px] rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <VylosAvatar 
            url={avatarUrl} 
            name={userName} 
            size="2xl" 
            className="border-[3px] border-white shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform duration-700 !rounded-full" 
          />
        </div>
        
        <div className="mt-6 text-center space-y-1">
          <h2 className="text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">{userName}</h2>
          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">{email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        <button 
          onClick={onUpgrade}
          className="w-full py-4 bg-slate-900/10 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-slate-900/20 dark:border-white/20 shadow-2xl shadow-black/5 dark:shadow-black/20 hover:bg-slate-900/20 dark:hover:bg-white/10 transition-all active:scale-[0.98] group/btn"
        >
          <span>{isFree ? 'Premium Beta Active' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`}</span>
          <div className="w-6 h-6 rounded-lg bg-blue-600 dark:bg-blue-500/30 flex items-center justify-center text-white border border-blue-500/30 dark:border-white/30 shadow-lg group-hover/btn:rotate-12 transition-transform">
            <Trophy size={12} fill="currentColor" />
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onXPClick}
            className="vylos-glass-soft p-5 border-white/20 flex flex-col items-center justify-center group/stat hover:bg-white/40 dark:hover:bg-white/5 transition-all active:scale-[0.95] outline-none vylos-focus-clean shadow-inner"
          >
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 group-hover/stat:text-blue-600 transition-colors">XP Points</span>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{xp.toLocaleString()}</span>
          </button>
          <div className="vylos-glass-soft p-5 border-white/20 flex flex-col items-center justify-center shadow-inner group/stat">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 group-hover/stat:text-blue-600 transition-colors">Streak</span>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{streak} <span className="text-[10px] text-slate-400 ml-0.5">Days</span></span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
