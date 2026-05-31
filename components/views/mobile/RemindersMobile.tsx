"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, Plus, CheckCircle2, Clock, Calendar, Bell, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { MobilePageHeader } from "../../ui/MobilePageHeader";
import { VylosCalculations } from "@/lib/vylosCalculations";
import { getReminderDerivedStatus, getSouthAfricanNow, generateReminderOccurrences } from "@/lib/utils";

interface RemindersMobileProps {
  setShowAddReminder: (show: boolean) => void;
  setPage: (page: string) => void;
}

export const RemindersMobile: React.FC<RemindersMobileProps> = ({
  setShowAddReminder,
  setPage
}) => {
  const { state, formatCurrency, updateReminder, toggleReminderCompletion } = useAppStore();
  const [activeTab, setActiveTab] = useState("All");

  const todayStr = getSouthAfricanNow().dateKey;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const reminders = useMemo(() => {
    return generateReminderOccurrences(state.reminders || [], state.reminderCompletions || [], currentYear, currentMonth);
  }, [state.reminders, state.reminderCompletions, currentYear, currentMonth]);

  const filteredReminders = useMemo(() => {
    return reminders.filter((r: any) => {
      const derivedStatus = getReminderDerivedStatus(r);
      if (activeTab === "Completed") return derivedStatus === "completed";
      if (derivedStatus === "completed" && activeTab !== "Completed") return false;
      
      if (activeTab === "All") return true;
      if (activeTab === "Due Today") return r.due_date === todayStr;
      if (activeTab === "Upcoming") return derivedStatus === "upcoming";
      if (activeTab === "Overdue") return derivedStatus === "overdue";
      return true;
    });
  }, [reminders, activeTab, todayStr]);

  const handleComplete = async (reminder: any) => {
    try {
      if (reminder.recurring && reminder.recurring !== 'none') {
        await toggleReminderCompletion(
          reminder.id, 
          reminder.occurrence_year || currentYear, 
          reminder.occurrence_month || currentMonth
        );
      } else {
        await updateReminder(reminder.id, { 
          status: reminder.status === 'completed' ? 'pending' : 'completed', 
          completed_at: reminder.status === 'completed' ? undefined : new Date().toISOString() 
        });
      }
    } catch (err) {
      console.error("Failed to update reminder status", err);
    }
  };

  const tabs = ["All", "Today", "Overdue", "Upcoming", "Completed"];

  return (
    <div className="w-full flex flex-col gap-5 pb-24 max-w-md mx-auto px-1 animate-in fade-in duration-500">
      {/* Header */}
      <MobilePageHeader
        title="Reminders"
        onBack={() => setPage("dashboard")}
        rightAction={
          <button 
            onClick={() => setShowAddReminder(true)}
            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
            aria-label="Add Reminder"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        }
      />

      {/* Swipeable Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const apiTab = tab === "Today" ? "Due Today" : tab;
          const isActive = activeTab === apiTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(apiTab)}
              className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                ${isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/15" 
                  : "bg-white/55 dark:bg-white/5 mobile-muted border border-slate-300 dark:border-white/15"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Checklist List */}
      <div className="flex flex-col gap-3">
        {filteredReminders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredReminders.map((r: any, i: number) => {
              const derivedStatus = getReminderDerivedStatus(r);
              const isToday = r.due_date === todayStr;
              const isOverdue = derivedStatus === 'overdue';
              const isCompleted = derivedStatus === 'completed';

              const tagColor = isCompleted ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20' :
                               isOverdue ? 'text-rose-700 bg-rose-500/10 border-rose-500/20' : 
                               isToday ? 'text-red-700 bg-red-500/10 border-red-500/20' : 
                               'text-amber-700 bg-amber-500/10 border-amber-500/20';

              const statusLabel = isCompleted ? 'Completed' : isOverdue ? 'Overdue' : isToday ? 'Today' : 'Upcoming';

              return (
                <div 
                  key={r.id || i} 
                  onClick={() => handleComplete(r)}
                  className="vylos-glass-readable p-4 rounded-2xl border border-white/25 shadow-sm flex items-center justify-between group cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 text-white shadow-md' 
                          : 'bg-white/30 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-4.5 h-4.5 rounded-full border-2 border-current" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[12px] font-black truncate leading-snug ${isCompleted ? 'mobile-muted opacity-60 line-through' : 'mobile-subheading'}`}>
                        {r.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold mobile-muted">{r.due_date}</span>
                        <span className="text-[8px] text-slate-300">•</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${tagColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <span className="text-[12px] font-black mobile-heading text-right">
                      {formatCurrency(r.amount || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="vylos-glass-readable p-10 rounded-3xl border border-white/25 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 shadow-inner">
              <Bell size={24} />
            </div>
            <span className="text-[11px] font-black mobile-label uppercase tracking-widest">All clear</span>
            <p className="text-[10px] font-bold mobile-muted mt-1">No reminders found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
