"use client";

import React from "react";
import { ShieldCheck, ArrowUpRight, TrendingUp, Info, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { VylosEngine } from "@/lib/vylosEngine";

interface HealthScoreWidgetProps {
  onDetailClick?: () => void;
}

export const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({ onDetailClick }) => {
  const { state } = useAppStore();
  const { backendHealthScore, isCalculatingHealthScore } = state;
  
  // Live reactive engine is the single source of truth to ensure consistency across views
  const engineOutput = React.useMemo(() => VylosEngine.run(state), [state]);
  
  const score = engineOutput.healthScore;
  const status = engineOutput.healthCategory;
  const lastUpdated = backendHealthScore?.calculated_at;

  const getHealthColor = (s: number) => {
    if (s >= 85) return "text-emerald-500";
    if (s >= 70) return "text-blue-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getHealthBg = (s: number) => {
    if (s >= 85) return "bg-emerald-500/10";
    if (s >= 70) return "bg-blue-500/10";
    if (s >= 40) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  const colorClass = getHealthColor(score);
  const bgClass = getHealthBg(score);

  return (
    <div 
      onClick={onDetailClick}
      className="vylos-glass-panel p-5 sm:p-6 md:p-8 lg:p-5 xl:p-6 flex flex-col gap-6 cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-all group border-white/40 shadow-2xl relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 blur-[60px] rounded-full opacity-30 ${bgClass.replace('/10', '/40')}`} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${bgClass} ${colorClass} shadow-inner`}>
            {isCalculatingHealthScore ? (
              <RefreshCw size={24} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <ShieldCheck size={24} strokeWidth={2.5} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Financial Health</h4>
              {isCalculatingHealthScore && (
                <span className="text-[9px] font-black text-blue-500 animate-pulse uppercase tracking-widest">Updating...</span>
              )}
            </div>
            <p className={`text-sm font-black uppercase tracking-widest mt-0.5 ${colorClass}`}>{status}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center gap-4 sm:gap-6 lg:gap-4 xl:gap-6 relative z-10 min-w-0">
        <div className="flex flex-col shrink-0">
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-none ${colorClass}`}>
              {score}
            </span>
            <span className="text-lg sm:text-xl lg:text-lg xl:text-xl font-bold text-slate-400 opacity-60">/100</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
           <div className="h-2 w-full bg-slate-200/30 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
             <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] ${score >= 70 ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-red-400'}`}
                style={{ width: `${score}%` }}
             />
           </div>
           <div className="flex flex-wrap justify-between items-center gap-1.5 px-1 min-w-0">
              <span className="text-[9px] xl:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Efficiency</span>
              <span className={`text-[9px] xl:text-[10px] font-black uppercase tracking-widest ${colorClass} truncate`}>{score}% Optimized</span>
           </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex flex-col gap-2 relative z-10">
        <div className="flex items-start gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-300 leading-relaxed">
            {isCalculatingHealthScore 
              ? "We're currently recalculating your score based on your recent activity."
              : "Your score is calculated based on budget utilization, savings consistency, and goal progress."
            }
          </p>
        </div>
        {lastUpdated && !isCalculatingHealthScore && (
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-7">
            Last updated: {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};
