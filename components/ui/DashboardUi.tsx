"use client";

import React from "react";
import { ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown, 
  Star,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Wallet,
  ArrowRight
} from "lucide-react";
import { } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  sublabel?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  trend, 
  trendPositive, 
  sublabel,
  icon,
  iconBg
}) => {
  const { formatCurrency } = useAppStore();
  return (
    <div className="dashboard-card group">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
          <div className="text-2xl font-black text-text-main tracking-tight">{value}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {trend && (
          <div className={`flex items-center gap-1.5 text-xs font-bold ${trendPositive ? "text-primary" : "text-red-500"}`}>
            {trendPositive ? <ArrowUp size={14} strokeWidth={3} /> : <ArrowDown size={14} strokeWidth={3} />}
            <span>{trend}</span>
          </div>
        )}
        {sublabel && (
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{sublabel}</span>
        )}
      </div>
    </div>
  );
};

interface CircularHealthScoreProps {
  score: number;
  category: string;
  onClick?: () => void;
}

export const CircularHealthScore: React.FC<CircularHealthScoreProps> = ({ score, category, onClick }) => {
  const getStatusColor = () => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="dashboard-card flex items-center justify-between gap-8 h-full min-w-[320px] bg-card border-border-main">
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-border-strong/30" />
            <circle
              cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
              strokeDasharray={175.8}
              strokeDashoffset={175.8 * (1 - score / 100)}
              className={`${getStatusColor()} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-xl font-black text-text-main">{score}</div>
        </div>
        
        <div className="flex flex-col">
          <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Financial Health</div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black uppercase ${getStatusColor()}`}>{category}</span>
          </div>
        </div>
      </div>
      <button 
        onClick={onClick}
        className="text-primary font-black text-xs flex items-center gap-1 hover:underline uppercase tracking-tight"
      >
        Details <ChevronRight size={14} />
      </button>
    </div>
  );
};

export const InsightCard: React.FC<{ 
  severity: 'positive' | 'neutral' | 'warning' | 'critical'; 
  reason: string; 
  action: string; 
  buttonLabel?: string; 
  onClick?: () => void;
}> = ({ severity, reason, action, buttonLabel, onClick }) => {
  const colors = {
    positive: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    neutral: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    critical: "bg-red-500/10 border-red-500/20 text-red-500",
  };

  return (
    <div className={`p-6 rounded-3xl border ${colors[severity]} flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-4 last:mb-0`}>
      <div className="flex flex-col gap-1.5">
        <h4 className="text-xs font-black uppercase tracking-widest opacity-80">{reason}</h4>
        <p className="text-sm font-bold text-text-main leading-snug">{action}</p>
      </div>
      {buttonLabel && (
        <button 
          onClick={onClick}
          className="shrink-0 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export const TransactionItem = ({ icon, title, date, amount, color }: any) => {
  const { formatCurrency } = useAppStore();
  return (
    <div className="flex items-center gap-4 py-3 group cursor-pointer border-b border-border-main last:border-0">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-text-main truncate tracking-tight">{title}</div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{date}</div>
      </div>
      <div className={`text-sm font-black tracking-tight ${amount > 0 ? "text-primary" : "text-text-main"}`}>
        {formatCurrency(amount)}
      </div>
    </div>
  );
};

export const BillItem = ({ icon, title, date, amount }: any) => {
  const { formatCurrency } = useAppStore();
  return (
    <div className="flex items-center gap-4 py-4 group cursor-pointer border-b border-border-main last:border-0">
      <div className="w-10 h-10 rounded-2xl bg-border-main flex items-center justify-center text-text-muted transition-all group-hover:bg-bg-mint group-hover:text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-text-main truncate tracking-tight">{title}</div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{date}</div>
      </div>
      <div className="text-sm font-black text-text-main tracking-tight">
        {formatCurrency(-Math.abs(amount))}
      </div>
    </div>
  );
};
