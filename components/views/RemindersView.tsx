"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, Calendar, Clock, CheckCircle2, MoreHorizontal, 
  CreditCard, Zap, Wifi, PlaySquare, Music, ShieldCheck,
  Target, Car, Filter, ChevronLeft, ChevronRight, Plus,
  Activity
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { VylosCalculations } from "@/lib/vylosCalculations";
import { toDateKey, createLocalDate, parseDateKey } from "@/lib/utils";
import { TransactionIcon } from "@/components/ui/TransactionIcon";

interface RemindersViewProps {
  setShowAddReminder: (show: boolean) => void;
}

export function RemindersView({ setShowAddReminder }: RemindersViewProps) {
  const { state, formatCurrency, updateReminder } = useAppStore();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Calendar View State
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const summary = useMemo(() => VylosCalculations.getRemindersSummary(state), [state]);
  const reminders = state.reminders || [];
  const { getReminderDerivedStatus } = require("@/lib/utils");
  
  const saNow = require("@/lib/utils").getSouthAfricanNow();
  const todayStr = saNow.dateKey;
  
  const filteredReminders = reminders.filter(r => {
    const derivedStatus = getReminderDerivedStatus(r);
    
    if (selectedDate) return r.due_date === selectedDate;
    if (activeTab === "Completed") return derivedStatus === "completed";
    if (derivedStatus === "completed" && activeTab !== "Completed") return false;
    
    if (activeTab === "All") return true;
    if (activeTab === "Due Today") return r.due_date === todayStr;
    if (activeTab === "Upcoming") return derivedStatus === "upcoming";
    if (activeTab === "Overdue") return derivedStatus === "overdue";
    if (activeTab === "This Week") {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().slice(0, 10);
        return r.due_date >= todayStr && r.due_date <= nextWeekStr;
    }
    return true;
  });

  const handleComplete = async (id: string) => {
    try {
      await updateReminder(id, { 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      });
    } catch (err) {
      console.error("Failed to complete reminder", err);
    }
  };

  const getIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('bill') || c.includes('card')) return { bg: 'bg-blue-600', icon: <CreditCard size={14} className="text-white"/> };
    if (c.includes('utilit') || c.includes('zap')) return { bg: 'bg-amber-500', icon: <Zap size={14} className="text-white"/> };
    if (c.includes('sav')) return { bg: 'bg-emerald-500', icon: <ShieldCheck size={14} className="text-white"/> };
    if (c.includes('subs') || c.includes('play')) return { bg: 'bg-red-600', icon: <PlaySquare size={14} className="text-white"/> };
    return { bg: 'bg-purple-500', icon: <Activity size={14} className="text-white"/> };
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">Reminders</h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">Stay on top of bills, goals, and important financial to-dos.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 vylos-glass-readable backdrop-blur-md rounded-xl text-[12px] font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white/10 dark:hover:bg-slate-800 transition-colors !rounded-xl !p-2.5">
            This Month <ChevronRight size={14} className="rotate-90" />
          </button>
          <button 
            onClick={() => setShowAddReminder(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-bold shadow-md transition-colors"
          >
            <Plus size={16} /> New Reminder
          </button>
        </div>
      </div>

      {/* ─── Top Row (5 Cards) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: "Due Today", val: summary.dueTodayCount, sub: formatCurrency(summary.dueTodayAmount), subColor: "text-red-500", icon: <Calendar size={18}/>, color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
          { title: "Upcoming", val: summary.upcomingCount, sub: formatCurrency(summary.upcomingAmount), subColor: "text-amber-500", icon: <Clock size={18}/>, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
          { title: "Overdue", val: summary.overdueCount, sub: formatCurrency(summary.overdueAmount), subColor: "text-rose-600", icon: <Bell size={18}/>, color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10" },
          { title: "Completed", val: summary.completedCount, sub: "This Month", subColor: "text-slate-400", icon: <CheckCircle2 size={18}/>, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
          { title: "Total Active", val: summary.dueTodayCount + summary.upcomingCount + summary.overdueCount, sub: formatCurrency(summary.dueTodayAmount + summary.upcomingAmount + summary.overdueAmount), subColor: "text-slate-500", icon: <CreditCard size={18}/>, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" }
        ].map((card, i) => (
          <div key={i} className="vylos-glass-readable p-5 flex flex-col justify-between items-center text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">{card.title}</span>
            <span className="text-[22px] font-black text-slate-900 dark:text-white leading-none mb-1">{card.val}</span>
            <span className={`text-[11px] font-bold ${card.subColor}`}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ─── Middle Row (3 Cards) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Upcoming Bills */}
        <div className="vylos-glass-readable p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[14px] font-black text-slate-900 dark:text-white">Upcoming Bills</span>
            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-500 transition-colors" onClick={() => setActiveTab("Upcoming")}>View all</button>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {reminders.filter(r => r.category === 'Bills' && r.status !== 'completed').slice(0, 3).map((r, i) => {
              const iconInfo = getIcon(r.category);
              return (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <TransactionIcon merchant={r.title} category={r.category} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{r.title}</span>
                      <span className="text-[9px] font-medium text-slate-500 dark:text-white/40">{r.description || r.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{r.due_date}</span>
                      <span className="text-[9px] font-medium text-slate-500 opacity-60">Upcoming</span>
                    </div>
                    <span className="text-[12px] font-black w-14 text-slate-900 dark:text-white">{formatCurrency(r.amount || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[11px] font-black text-slate-600 dark:text-white/40">Total Upcoming</span>
            <span className="text-[14px] font-black text-slate-900 dark:text-white">{formatCurrency(reminders.filter(r => r.category === 'Bills' && r.status !== 'completed').reduce((sum, r) => sum + (r.amount || 0), 0))}</span>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="vylos-glass-readable p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[14px] font-black text-slate-900 dark:text-white">Subscriptions</span>
            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-500 transition-colors" onClick={() => setActiveTab("Upcoming")}>View all</button>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {reminders.filter(r => r.category === 'Subscriptions' && r.status !== 'completed').slice(0, 3).map((r, i) => {
              const iconInfo = getIcon(r.category);
              return (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <TransactionIcon merchant={r.title} category={r.category} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{r.title}</span>
                      <span className="text-[9px] font-medium text-slate-500 dark:text-white/40">{r.description || r.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{r.due_date}</span>
                      <span className="text-[9px] font-medium text-slate-500 opacity-60">Upcoming</span>
                    </div>
                    <span className="text-[12px] font-black w-14 text-slate-900 dark:text-white">{formatCurrency(r.amount || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[11px] font-black text-slate-600 dark:text-white/40">Total Upcoming</span>
            <span className="text-[14px] font-black text-slate-900 dark:text-white">{formatCurrency(reminders.filter(r => r.category === 'Subscriptions' && r.status !== 'completed').reduce((sum, r) => sum + (r.amount || 0), 0))}</span>
          </div>
        </div>

        {/* Savings Reminders */}
        <div className="vylos-glass-readable p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[14px] font-black text-slate-900 dark:text-white">Savings Reminders</span>
            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-500 transition-colors" onClick={() => setActiveTab("Upcoming")}>View all</button>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {reminders.filter(r => r.category === 'Savings' && r.status !== 'completed').slice(0, 3).map((r, i) => {
              const iconInfo = getIcon(r.category);
              return (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <TransactionIcon merchant={r.title} category={r.category} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{r.title}</span>
                      <span className="text-[9px] font-medium text-slate-500 dark:text-white/40">{r.description || r.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{r.due_date}</span>
                      <span className="text-[9px] font-medium text-slate-500 opacity-60">Upcoming</span>
                    </div>
                    <span className="text-[12px] font-black w-14 text-slate-900 dark:text-white">{formatCurrency(r.amount || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[11px] font-black text-slate-600 dark:text-white/40">Total Upcoming</span>
            <span className="text-[14px] font-black text-slate-900 dark:text-white">{formatCurrency(reminders.filter(r => r.category === 'Savings' && r.status !== 'completed').reduce((sum, r) => sum + (r.amount || 0), 0))}</span>
          </div>
        </div>

      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-12">
        
        {/* All Reminders List */}
        <div className="lg:col-span-8 vylos-glass-readable p-6 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <span className="text-[16px] font-black text-slate-900 dark:text-white tracking-tight">Active Reminders</span>
            <div className="flex items-center gap-2">
              <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
                {['All', 'Due Today', 'Overdue', 'Upcoming', 'This Week', 'Completed'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/60'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-h-[400px]">
            {filteredReminders.length > 0 ? filteredReminders.map((r, i) => {
              const iconInfo = getIcon(r.category);
              const derivedStatus = getReminderDerivedStatus(r);
              const isToday = r.due_date === todayStr;
              const isOverdue = derivedStatus === 'overdue';
              const isCompleted = derivedStatus === 'completed';
              
              const tagC = isCompleted ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' :
                          isOverdue ? 'text-rose-600 bg-rose-500/10 border border-rose-500/20' : 
                          isToday ? 'text-red-500 bg-red-500/10 border border-red-500/20' : 
                          'text-amber-500 bg-amber-500/10 border border-amber-500/20';
              
              const tag = isCompleted ? 'Completed' : isOverdue ? 'Overdue' : isToday ? 'Due Today' : 'Upcoming';

              return (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/10 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleComplete(r.id); }}
                      className={`w-11 h-11 rounded-[1.25rem] flex items-center justify-center shrink-0 transition-all shadow-sm ${r.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white/5 dark:bg-white/5 border border-white/10 text-slate-400 hover:bg-primary hover:text-white hover:border-primary'}`}
                    >
                      {r.status === 'completed' ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-[14px] font-black transition-colors ${r.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{r.title}</span>
                      <span className="text-[11px] font-medium text-slate-500 opacity-60">{r.description || r.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col text-right w-20">
                      <span className="text-[12px] font-black text-slate-900 dark:text-white">{isToday ? 'Today' : r.due_date}</span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest w-24 text-center ${tagC}`}>
                      {tag}
                    </div>
                    <span className="text-[15px] font-black text-slate-900 dark:text-white w-20 text-right">{formatCurrency(r.amount || 0)}</span>
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-16">
                 <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 dark:text-white/10 mb-6 shadow-inner">
                    <Bell size={40} strokeWidth={1.5} />
                 </div>
                 <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                    No active tasks found<br/>
                    <span className="opacity-40">Filters applied: {activeTab}</span>
                 </p>
              </div>
            )}
          </div>
          <button className="mt-8 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:text-blue-400 transition-colors text-left" onClick={() => setActiveTab("All")}>View all reminders</button>
        </div>

        {/* Calendar Widget */}
        <div className="lg:col-span-4 vylos-glass-readable p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[16px] font-black text-slate-900 dark:text-white tracking-tight">Calendar</span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white/60">
                {calendarViewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-6 text-center mb-10">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{d}</span>
            ))}
            
            {(() => {
              const year = calendarViewDate.getFullYear();
              const month = calendarViewDate.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const cells = [];
              
              for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
              
              const todayKey = toDateKey(new Date());
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dKey = toDateKey(date);
                const isToday = dKey === todayKey;
                const isSelected = dKey === selectedDate;
                
                const dayReminders = reminders.filter(r => r.due_date === dKey);
                const hasBills = dayReminders.some(r => r.category === 'Bills');
                const hasSubs = dayReminders.some(r => r.category === 'Subscriptions');
                const hasRent = dayReminders.some(r => r.category === 'Rent / Housing');
                const hasOther = dayReminders.some(r => !['Bills', 'Subscriptions', 'Rent / Housing'].includes(r.category));

                cells.push(
                  <div 
                    key={day} 
                    onClick={() => setSelectedDate(selectedDate === dKey ? null : dKey)}
                    className="flex flex-col items-center justify-start h-12 gap-1.5 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] font-black transition-all ${
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 
                      isToday ? 'bg-primary/10 border border-primary/20 text-primary' : 
                      'text-slate-700 dark:text-white/60 group-hover:bg-white/10 group-hover:text-primary'
                    }`}>
                      {day}
                    </div>
                    <div className="flex gap-0.5">
                      {hasBills && <div className="w-1 h-1 rounded-full bg-red-500" />}
                      {hasSubs && <div className="w-1 h-1 rounded-full bg-purple-500" />}
                      {hasRent && <div className="w-1 h-1 rounded-full bg-blue-500" />}
                      {hasOther && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                );
              }
              return cells;
            })()}
          </div>

          <div className="flex flex-wrap justify-between items-center mt-auto pt-6 border-t border-white/10 gap-3">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"/><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Bills</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"/><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Subs</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Rent</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Other</span></div>
          </div>
        </div>

      </div>

    </div>
  );
}
