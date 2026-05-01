"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";

export function MonthSelector() {
  const { state, setSelectedMonth } = useAppStore();
  const [year, month] = /^\d{4}-\d{2}-\d{2}$/.test(state.selectedMonth)
    ? state.selectedMonth.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];
  const current = new Date(year, month - 1, 1);

  const handlePrev = () => {
    const prev = new Date(year, month - 2, 1);
    setSelectedMonth(formatDate(prev));
  };

  const handleNext = () => {
    const next = new Date(year, month, 1);
    setSelectedMonth(formatDate(next));
  };

  function formatDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const monthLabel = current.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center gap-2 bg-card border border-border-main rounded-xl p-1 shadow-sm">
      <button 
        onClick={handlePrev}
        className="p-2 hover:bg-border-main rounded-lg text-text-muted hover:text-text-main transition-all"
      >
        <ChevronLeft size={18} />
      </button>
      
      <div className="flex items-center gap-2 px-3 text-xs font-black text-text-main uppercase tracking-widest min-w-[140px] justify-center">
        <Calendar size={14} className="text-primary" />
        {monthLabel}
      </div>

      <button 
        onClick={handleNext}
        className="p-2 hover:bg-border-main rounded-lg text-text-muted hover:text-text-main transition-all"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
