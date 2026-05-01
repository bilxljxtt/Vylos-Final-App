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
}

export const CircularHealthScore: React.FC<CircularHealthScoreProps> = ({ score }) => {
  return (
    <div className="dashboard-card flex items-center justify-between gap-8 h-full min-w-[320px]">
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-border-strong/50" />
            <circle
              cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
              strokeDasharray={175.8}
              strokeDashoffset={175.8 * (1 - score / 100)}
              className="text-primary transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-xl font-black text-text-main">{score}</div>
        </div>
        
        <div className="flex flex-col">
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Financial Health Score</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-primary uppercase">Excellent</span>
          </div>
        </div>
      </div>
      <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
        View Details <ChevronRight size={14} />
      </button>
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
