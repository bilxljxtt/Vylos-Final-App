"use client";

import React, { useState } from "react";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { 
  Wallet, TrendingUp, Clock, Target, CalendarDays, Plus, 
  Home, Utensils, Car, ShoppingBag, Music, Heart, MoreHorizontal, 
  ChevronRight, ChevronDown, TrendingDown
} from "lucide-react";
import { ToastType } from "../Toast";
import { ViewContainer } from "../ui/ViewContainer";

interface BudgetViewProps {
  budgets: Record<string, { limit: number }>;
  spendByCat: Record<string, number>;
  donutRef: React.RefObject<HTMLCanvasElement | null>;
  updateBudgetLimit: (cat: string, limit: number) => void;
  showToast: (msg: string, type?: ToastType) => void;
  savingsRate?: number;
}

const getStyleForCategory = (cat: string) => {
  switch(cat) {
    case "Bills":
    case "Housing": 
      return { icon: <Home size={22} strokeWidth={2.5} />, bg: "bg-emerald-500/10", text: "text-emerald-500", bar: "bg-emerald-500" };
    case "Food & Dining": 
      return { icon: <Utensils size={22} strokeWidth={2.5} />, bg: "bg-blue-500/10", text: "text-blue-500", bar: "bg-blue-500" };
    case "Transport": 
      return { icon: <Car size={22} strokeWidth={2.5} />, bg: "bg-purple-500/10", text: "text-purple-500", bar: "bg-purple-500" };
    case "Shopping": 
      return { icon: <ShoppingBag size={22} strokeWidth={2.5} />, bg: "bg-pink-500/10", text: "text-pink-500", bar: "bg-pink-500" };
    case "Entertainment": 
      return { icon: <Music size={22} strokeWidth={2.5} />, bg: "bg-orange-500/10", text: "text-orange-500", bar: "bg-orange-500" };
    case "Health": 
      return { icon: <Heart size={22} strokeWidth={2.5} />, bg: "bg-amber-500/10", text: "text-amber-500", bar: "bg-amber-500" };
    default: 
      return { icon: <MoreHorizontal size={22} strokeWidth={2.5} />, bg: "bg-text-muted/10", text: "text-text-muted", bar: "bg-text-muted" };
  }
}

export const BudgetView: React.FC<BudgetViewProps> = ({ 
  budgets, 
  spendByCat, 
  donutRef, 
  updateBudgetLimit, 
  showToast,
  savingsRate = 0
}) => {
  const { formatCurrency } = useAppStore();
  const [editing, setEditing] = useState<string | null>(null);

  const totalSpent = Object.values(spendByCat).reduce((a,b) => a+b, 0);
  const totalLimit = Object.values(budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);
  const remaining = Math.max(0, totalLimit - totalSpent);
  
  const spentPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const remainPct = totalLimit > 0 ? 100 - spentPct : 100;

  return (
    <ViewContainer className="flex flex-col pt-4">
      {/* Top Controller Row */}
      <div className="flex items-center justify-between mb-8 pl-2">
         <div /> {/* Placeholder for left side alignment since header is above */}
         <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 text-sm font-bold text-text-main bg-card hover:bg-border-main transition-colors px-5 py-2.5 rounded-xl border border-border-main shadow-sm tracking-tight">
              <CalendarDays size={18} className="text-text-muted" strokeWidth={2.5} />
              June 2024
              <ChevronDown size={16} className="text-text-muted ml-2" strokeWidth={2.5} />
            </button>
            <button className="px-5 py-2.5 bg-primary hover:bg-emerald-400 text-white font-bold text-sm tracking-tight rounded-xl shadow-sm shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
              <Plus size={18} strokeWidth={3} />
              New Budget
            </button>
         </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
         {/* Total Budget */}
         <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
               <Wallet size={24} strokeWidth={2.5} className="text-primary" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Total Budget</span>
               <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{formatCurrency(totalLimit)}</span>
               <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">Monthly Budget</span>
            </div>
         </div>
         {/* Total Spent */}
         <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
               <TrendingUp size={24} strokeWidth={2.5} className="text-blue-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Total Spent</span>
               <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{formatCurrency(totalSpent)}</span>
               <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">{spentPct}% of budget</span>
            </div>
         </div>
         {/* Remaining */}
         <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
               <Clock size={24} strokeWidth={2.5} className="text-amber-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Remaining</span>
               <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{formatCurrency(remaining)}</span>
               <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">{remainPct}% remaining</span>
            </div>
         </div>
         {/* Savings Rate */}
         <div className="bg-card border border-border-main rounded-2xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
               <Target size={24} strokeWidth={2.5} className="text-purple-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-semibold text-text-muted tracking-tight mb-0.5">Savings Rate</span>
               <span className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{savingsRate}%</span>
               <span className="text-xs font-semibold text-text-muted uppercase tracking-widest mt-1">On track to goal</span>
            </div>
         </div>
      </div>

      {/* Massive Detail Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 pb-10">
         
         {/* Left Side: Overview Box */}
         <div className="bg-card border border-border-main p-8 rounded-2xl shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-black text-text-main tracking-tight">Budget Overview</h3>
               <button className="flex items-center gap-2 text-xs font-bold text-text-main bg-border-main hover:bg-border-strong transition-colors px-3 py-1.5 rounded-lg border border-border-main">
                 This Month
                 <ChevronDown size={14} className="text-text-muted" strokeWidth={3} />
               </button>
            </div>
            
            <div className="flex flex-col xl:flex-row items-center gap-10 xl:gap-8 mb-10 mt-4 flex-1 justify-center">
               {/* Left Donut */}
               <div className="relative w-[220px] aspect-square flex-shrink-0 mx-auto">
                  <canvas ref={donutRef}></canvas>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                     <div className="text-3xl font-black text-text-main tracking-tight leading-none">
                        ${Math.round(totalSpent).toLocaleString()}
                     </div>
                     <div className="text-xs font-bold text-text-muted mt-1.5 opacity-80">
                        of ${Math.round(totalLimit).toLocaleString()}
                     </div>
                  </div>
               </div>

               {/* Right Legends List */}
               <div className="flex flex-col gap-4 w-full">
                  {Object.entries(CATEGORY_METADATA).filter(([c]) => c !== "Income").map(([cat, meta]) => {
                     const spent = spendByCat[cat] || 0;
                     const pct = totalSpent > 0 ? Math.round((spent/totalSpent)*100) : 0;
                     if (spent === 0) return null;

                     return (
                       <div key={cat} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: meta.color }} />
                            <span className="text-[13px] font-bold text-text-main tracking-tight">{cat}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[13px] font-black text-text-main w-16 text-right">{formatCurrency(spent)}</span>
                            <span className="text-[11px] font-bold text-text-muted w-8 text-right opacity-60">{pct}%</span>
                          </div>
                       </div>
                     )
                  })}
               </div>
            </div>

            {/* Assessment Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 flex items-center justify-between px-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                     <TrendingUp size={20} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm font-black text-text-main tracking-tight leading-tight">You've spent {spentPct}% of your budget. Keep it up!</span>
                     <span className="text-xs font-bold text-text-muted mt-0.5">{formatCurrency(remaining)} remaining for the rest of the month.</span>
                  </div>
               </div>
               <ChevronRight size={18} className="text-text-muted/50" />
            </div>
         </div>

         {/* Right Side: Detailed Category View */}
         <div className="bg-card border border-border-main p-8 rounded-2xl shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-end mb-8 pt-1">
               <h3 className="text-lg font-black text-text-main tracking-tight">Budget by Category</h3>
               <div className="flex gap-10">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Spent</span>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest pl-2">Budget</span>
                  <span className="w-4"></span> {/* Spacer for chevron */}
               </div>
            </div>

            <div className="flex flex-col gap-8 flex-1">
               {Object.entries(CATEGORY_METADATA).filter(([c]) => c !== "Income").map(([cat, meta]) => {
                  const spent = spendByCat[cat] || 0;
                  const limit = budgets[cat]?.limit || 0;
                  if (limit === 0 && spent === 0) return null;
                  
                  const catPct = limit > 0 ? Math.min(100, Math.round((spent/limit)*100)) : 0;
                  const style = getStyleForCategory(cat);

                  return (
                     <div key={cat} className="flex items-center gap-6 group">
                        {/* Icon Node */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                           {style.icon}
                        </div>
                        
                        {/* Progress Tracker */}
                        <div className="flex-1 flex flex-col justify-center">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[14px] font-black text-text-main tracking-tight leading-none">{cat}</span>
                              <span className="text-[12px] font-bold text-text-muted">{catPct}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-border-main rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${style.bar} rounded-full transition-all duration-1000`} 
                                style={{ width: `${catPct}%` }}
                              />
                           </div>
                        </div>

                        {/* Values Grid */}
                        <div className="flex items-center gap-8 pl-4">
                           <span className="text-[14px] font-bold text-text-main w-16 text-right tracking-tight">{formatCurrency(spent)}</span>
                           <span className="text-[14px] font-medium text-text-muted w-16 text-right tracking-tight">{formatCurrency(limit)}</span>
                           <ChevronRight size={16} className="text-text-muted opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

      </div>
    </ViewContainer>
  );
};
