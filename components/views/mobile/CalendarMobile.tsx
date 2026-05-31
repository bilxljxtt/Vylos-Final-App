"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Bell, ShieldCheck, Clock } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { MobilePageHeader } from "../../ui/MobilePageHeader";
import { formatDate, generateReminderOccurrences } from "@/lib/utils";

interface CalendarMobileProps {
  setPage: (page: string) => void;
}

export const CalendarMobile: React.FC<CalendarMobileProps> = ({ setPage }) => {
  const { state, formatCurrency } = useAppStore();
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = state.selectedMonth.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const agendaItems = useMemo(() => {
    const listReminders = generateReminderOccurrences(
      state.reminders || [], 
      state.reminderCompletions || [], 
      year, 
      month + 1
    );
    
    return listReminders.sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [state.reminders, state.reminderCompletions, year, month]);

  return (
    <div className="w-full flex flex-col gap-5 pb-24 max-w-md mx-auto px-1 animate-in fade-in duration-500">
      {/* Header */}
      <MobilePageHeader
        title="Financial Calendar"
        onBack={() => setPage("dashboard")}
      />

      {/* Month Switcher Bar */}
      <div className="vylos-glass-readable p-4 rounded-3xl border border-white/20 shadow-md flex items-center justify-between">
        <button 
          onClick={prevMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors mobile-muted hover:text-blue-700 dark:hover:text-blue-400"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <span className="text-sm font-black mobile-heading tracking-tight">{monthName}</span>
        <button 
          onClick={nextMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors mobile-muted hover:text-blue-700 dark:hover:text-blue-400"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Agenda Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black mobile-label uppercase tracking-widest">Monthly Agenda</span>
          <span className="text-[9px] font-bold mobile-muted bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded">
            {agendaItems.length} Events
          </span>
        </div>

        {agendaItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {agendaItems.map((item, i) => {
              const isOverdue = item.status === 'overdue';
              const isCompleted = item.status === 'completed';
              
              const itemTypeColor = item.category === 'Bills' ? 'text-rose-600 bg-rose-500/10' :
                                    item.category === 'Subscriptions' ? 'text-purple-600 bg-purple-500/10' :
                                    'text-blue-600 bg-blue-500/10';

              return (
                <div key={item.id || i} className="vylos-glass-readable p-4 rounded-2xl border border-white/25 shadow-sm flex items-center justify-between transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 ${itemTypeColor}`}>
                      {item.category === 'Bills' ? <Bell size={16} /> : item.category === 'Subscriptions' ? <Clock size={16} /> : <Calendar size={16} />}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-black mobile-subheading truncate leading-snug">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold mobile-muted">{formatDate(item.due_date)}</span>
                        <span className="text-[8px] text-slate-300 dark:text-white/10">•</span>
                        <span className="text-[9px] font-bold mobile-body uppercase tracking-wide truncate max-w-[80px]">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 shrink-0 ml-3">
                    <span className="text-[12px] font-black mobile-heading">
                      {item.amount ? formatCurrency(item.amount) : "—"}
                    </span>
                    {isCompleted ? (
                      <span className="text-[8px] font-black text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Paid</span>
                    ) : (
                      <span className="text-[8px] font-black mobile-muted bg-slate-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded uppercase">Unpaid</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="vylos-glass-readable p-10 rounded-3xl border border-white/25 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 shadow-inner">
              <Calendar size={24} />
            </div>
            <span className="text-[11px] font-black mobile-label uppercase tracking-widest">Agenda Clear</span>
            <p className="text-[10px] font-bold mobile-muted mt-1">No scheduled bills or transactions for this month.</p>
          </div>
        )}
      </div>
    </div>
  );
};
