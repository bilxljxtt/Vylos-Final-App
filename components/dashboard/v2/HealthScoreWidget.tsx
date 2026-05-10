"use client";

import React from "react";
import { ShieldCheck, ArrowUpRight, TrendingUp, Info } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { VylosEngine } from "@/lib/vylosEngine";

interface HealthScoreWidgetProps {
  onDetailClick?: () => void;
}

export const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({ onDetailClick }) => {
  const { state } = useAppStore();
  const engineOutput = VylosEngine.run(state);
  const score = engineOutput.healthScore;
  const status = engineOutput.healthCategory;

  const getHealthColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-blue-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getHealthBg = (s: number) => {
    if (s >= 80) return "bg-emerald-500/10";
    if (s >= 60) return "bg-blue-500/10";
    if (s >= 40) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  const colorClass = getHealthColor(score);
  const bgClass = getHealthBg(score);

  return (
    <div 
      onClick={onDetailClick}
      className="vylos-glass-panel p-8 flex flex-col gap-6 cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-all group border-white/40 shadow-2xl relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 blur-[60px] rounded-full opacity-30 ${bgClass.replace('/10', '/40')}`} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${bgClass} ${colorClass} shadow-inner`}>
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Financial Health</h4>
            <p className={`text-sm font-black uppercase tracking-widest mt-0.5 ${colorClass}`}>{status}</p>
          </div>
        </div>
        <button className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 text-slate-400 group-hover:text-primary transition-colors">
          <ArrowUpRight size={20} />
        </button>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={`text-6xl font-black tracking-tighter ${colorClass}`}>
              {score}
            </span>
            <span className="text-xl font-bold text-slate-400 opacity-60">/100</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
           <div className="h-2 w-full bg-slate-200/30 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
             <div 
               className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] ${score >= 60 ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-red-400'}`}
               style={{ width: `${score}%` }}
             />
           </div>
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${colorClass}`}>{score}% Optimized</span>
           </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex items-start gap-3 opacity-80 group-hover:opacity-100 transition-opacity relative z-10">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-300 leading-relaxed">
          Your score is calculated based on budget utilization, savings consistency, and goal progress. 
          <span className="text-primary ml-1">View breakdown →</span>
        </p>
      </div>
    </div>
  );
};
