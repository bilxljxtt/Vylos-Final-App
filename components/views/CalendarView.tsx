"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Home, Lightbulb, Smartphone, Music, TrendingUp, CreditCard as CreditCardIcon, Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { toDateKey, createLocalDate, getTransactionDateKey, formatDate, getReminderDerivedStatus, generateReminderOccurrences } from "@/lib/utils";
import { CalendarEventModal } from "@/components/modals/CalendarEventModal";
import { TransactionIcon } from "@/components/ui/TransactionIcon";

interface CalendarViewProps {
  setPage: (page: string) => void;
}

function generateSubscriptionOccurrences(
  subscriptions: any[],
  year: number,
  month: number // 0-indexed month (0-11)
): any[] {
  const occurrences: any[] = [];
  const monthStart = createLocalDate(year, month, 1);
  const monthEnd = createLocalDate(year, month + 1, 0);
  
  subscriptions.forEach(sub => {
    if (!sub.nextDue) return;
    
    // Parse nextDue as a local date
    const [ny, nm, nd] = sub.nextDue.split('T')[0].split('-').map(Number);
    const nextDueDate = createLocalDate(ny, nm - 1, nd);
    
    if (sub.frequency === "Weekly") {
      let current = createLocalDate(ny, nm - 1, nd);
      if (current > monthEnd) return;
      
      while (current < monthStart) {
        current.setDate(current.getDate() + 7);
      }
      
      while (current >= monthStart && current <= monthEnd) {
        occurrences.push({
          id: `${sub.id}-${toDateKey(current)}`,
          title: sub.name,
          category: sub.category || "Subscriptions",
          amount: sub.amount,
          due_date: toDateKey(current),
          type: "subscription"
        });
        current = createLocalDate(current.getFullYear(), current.getMonth(), current.getDate() + 7);
      }
    } else if (sub.frequency === "Monthly" || sub.frequency === "monthly") {
      if (year < ny || (year === ny && month < nm - 1)) {
        return;
      }
      
      const day = nd;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const targetDay = Math.min(day, lastDay);
      const occurrenceDate = createLocalDate(year, month, targetDay);
      
      occurrences.push({
        id: `${sub.id}-${toDateKey(occurrenceDate)}`,
        title: sub.name,
        category: sub.category || "Subscriptions",
        amount: sub.amount,
        due_date: toDateKey(occurrenceDate),
        type: "subscription"
      });
    } else if (sub.frequency === "Annual" || sub.frequency === "yearly") {
      if (year < ny || (year === ny && month < nm - 1)) {
        return;
      }
      
      if (month === nm - 1) {
        const day = nd;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const targetDay = Math.min(day, lastDay);
        const occurrenceDate = createLocalDate(year, month, targetDay);
        
        occurrences.push({
          id: `${sub.id}-${toDateKey(occurrenceDate)}`,
          title: sub.name,
          category: sub.category || "Subscriptions",
          amount: sub.amount,
          due_date: toDateKey(occurrenceDate),
          type: "subscription"
        });
      }
    }
  });
  
  return occurrences;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ setPage }) => {
  const { state, setSelectedMonth, formatCurrency } = useAppStore();
  const [activeTab, setActiveTab] = useState<"month" | "week" | "list">("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  
  // Local state for the viewed month (decoupled from global state to prevent resets)
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = state.selectedMonth.split('-').map(Number);
    return createLocalDate(y, m - 1, 1);
  });
  
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthStart = createLocalDate(year, month, 1);
  const monthEnd = createLocalDate(year, month + 1, 0);
  
  // Sun-Sat (0=Sun, 6=Sat)
  const startDay = monthStart.getDay();
  const numDays = monthEnd.getDate();

  const days = [];
  // Previous month padding
  for (let i = 0; i < startDay; i++) {
    const d = createLocalDate(year, month, 1 - (startDay - i));
    days.push({ date: d, dateKey: toDateKey(d), inMonth: false });
  }
  // Current month
  for (let i = 1; i <= numDays; i++) {
    const d = createLocalDate(year, month, i);
    days.push({ date: d, dateKey: toDateKey(d), inMonth: true, isToday: toDateKey(d) === toDateKey(new Date()) });
  }
  // Next month padding
  const totalCells = Math.ceil(days.length / 7) * 7;
  const paddingNeeded = totalCells - days.length;
  for (let i = 1; i <= paddingNeeded; i++) {
    const d = createLocalDate(year, month + 1, i);
    days.push({ date: d, dateKey: toDateKey(d), inMonth: false });
  }

  const formatMonthKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  };

  const prevMonth = () => {
    const prev = createLocalDate(year, month - 1, 1);
    setViewDate(prev);
  };
  
  const nextMonth = () => {
    const next = createLocalDate(year, month + 1, 1);
    setViewDate(next);
  };
  
  const goToday = () => {
    const today = new Date();
    const target = createLocalDate(today.getFullYear(), today.getMonth(), 1);
    setViewDate(target);
    setSelectedDay(today);
    setSelectedMonth(formatMonthKey(today));
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const visibleReminders = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const reminders = generateReminderOccurrences(state.reminders || [], state.reminderCompletions || [], year, month, 1);
    
    console.log("Viewed month:", viewDate);
    console.log("Visible reminders:", reminders);
    
    return reminders;
  }, [state.reminders, state.reminderCompletions, viewDate]);

  // Map state.transactions, visibleReminders and projected subscriptions to calendar events
  const calendarEvents = useMemo(() => {
    const events: Record<string, any[]> = {};

    state.transactions.forEach(t => {
      const key = getTransactionDateKey(t);
      if (!events[key]) events[key] = [];
      events[key].push({
        title: t.merchant || t.notes || 'Transaction',
        subtitle: t.category,
        amount: formatCurrency(t.amount),
        type: t.amount >= 0 ? 'income' : 'expense',
        dot: t.amount >= 0 ? 'bg-emerald-500' : 'bg-red-500'
      });
    });

    visibleReminders.forEach(r => {
      const key = r.due_date;
      if (!events[key]) events[key] = [];
      events[key].push({
        title: r.title,
        subtitle: r.category,
        amount: r.amount ? formatCurrency(r.amount) : '',
        type: 'reminder',
        dot: 'bg-blue-600',
        originalReminder: r
      });
    });

    const subOccurrences = generateSubscriptionOccurrences(state.subscriptions || [], year, month);
    subOccurrences.forEach(sub => {
      const key = sub.due_date;
      if (!events[key]) events[key] = [];
      events[key].push({
        title: sub.title,
        subtitle: sub.category,
        amount: sub.amount ? formatCurrency(-Math.abs(sub.amount)) : '',
        type: 'subscription',
        dot: 'bg-cyan-500'
      });
    });

    return events;
  }, [state.transactions, visibleReminders, state.subscriptions, year, month, formatCurrency]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDay);
    startOfWeek.setDate(selectedDay.getDate() - selectedDay.getDay());
    
    const daysArr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      daysArr.push(d);
    }
    return daysArr;
  }, [selectedDay]);

  const upcomingEvents = useMemo(() => {
    const viewStartStr = toDateKey(viewDate);
    const todayStr = toDateKey(new Date());

    return visibleReminders
      .filter(r => {
        const status = getReminderDerivedStatus(r);
        return status !== 'completed' && r.due_date >= viewStartStr;
      })
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 10)
      .map(r => ({
        date: r.due_date === todayStr ? 'Today' : formatDate(r.due_date),
        title: r.title,
        amount: r.amount ? formatCurrency(r.amount) : '',
        icon: <TransactionIcon merchant={r.title} category={r.category} size="sm" />,
        bg: "bg-white/5 dark:bg-white/5"
      }));
  }, [visibleReminders, formatCurrency, viewDate]);

  const getEventsForDay = (dateStr: string) => calendarEvents[dateStr] || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[850px] animate-in fade-in duration-500">
      
      {/* ─── Main Calendar Area ─── */}
      <div className="flex-1 vylos-glass-readable p-5 sm:p-8 flex flex-col relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Calendar Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 lg:mb-10 gap-6 relative z-10">
          <div className="flex flex-col">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Calendar</h2>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Financial Timeline & Tasks</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center bg-slate-100/50 dark:bg-white/5 rounded-2xl shadow-inner border border-slate-200 dark:border-white/10 p-1">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); prevMonth(); }} 
                className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all hover:shadow-sm"
              >
                <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
              <span className="w-32 sm:w-44 text-center text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">{monthName}</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); nextMonth(); }} 
                className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all hover:shadow-sm"
              >
                <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            <button 
              type="button"
              onClick={goToday} 
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm transition-all active:scale-95"
            >
              Today
            </button>

            <div className="flex items-center bg-slate-100/50 dark:bg-white/5 rounded-2xl shadow-inner border border-slate-200 dark:border-white/10 p-1">
              {[
                { id: "month", label: "Month" },
                { id: "week", label: "Week" },
                { id: "list", label: "List" }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 sm:px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button 
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setShowEventModal(true);
              }}
              className="flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
            >
              <Plus size={16} strokeWidth={3} />
              New Event
            </button>
          </div>
        </div>

        {/* Calendar Grid / Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative z-10">
          {activeTab === "month" && (
            <div className="flex-1 flex flex-col animate-in fade-in duration-500">
              {/* Days Header */}
              <div className="grid grid-cols-7 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="flex-1 grid grid-cols-7 gap-px bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-inner">
                {days.map((day, i) => {
                  const events = getEventsForDay(day.dateKey);
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDay(day.date)}
                      className={`bg-white/80 dark:bg-slate-900/40 p-1 sm:p-2 lg:p-4 min-h-[56px] sm:min-h-[110px] flex flex-col gap-1 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/5 group cursor-pointer
                        ${!day.inMonth ? 'opacity-30' : ''}
                        ${toDateKey(selectedDay) === day.dateKey ? 'ring-2 ring-inset ring-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`
                          text-[11px] sm:text-xs font-black w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg transition-all
                          ${day.isToday 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}
                        `}>
                          {day.date.getDate()}
                        </span>
                        {events.length > 0 && <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 hidden sm:inline">{events.length}</span>}
                      </div>
                      
                      {/* Desktop event names */}
                      <div className="hidden sm:flex flex-col gap-1 overflow-hidden flex-1">
                        {events.slice(0, 3).map((ev, j) => (
                          <div 
                            key={j} 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (ev.type === 'reminder') {
                                if (ev.originalReminder) {
                                  setEditingEvent(ev.originalReminder);
                                  setShowEventModal(true);
                                }
                              }
                            }}
                            className="flex items-center gap-1.5 p-1 rounded-md bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.dot}`} />
                            <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 truncate leading-tight">{ev.title}</span>
                          </div>
                        ))}
                        {events.length > 3 && (
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 mt-1">+{events.length - 3} more</span>
                        )}
                      </div>

                      {/* Mobile event dots */}
                      <div className="flex flex-wrap gap-0.5 mt-auto sm:hidden justify-center max-w-full">
                        {events.slice(0, 3).map((ev, j) => (
                          <div key={j} className={`w-1 h-1 rounded-full ${ev.dot}`} />
                        ))}
                        {events.length > 3 && (
                          <div className="w-1 h-1 rounded-full bg-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Day Agenda for Mobile */}
              <div className="sm:hidden mt-4 p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/20 dark:border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Agenda: {formatDate(toDateKey(selectedDay))}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{getEventsForDay(toDateKey(selectedDay)).length} Events</span>
                </div>
                <div className="flex flex-col gap-2">
                  {getEventsForDay(toDateKey(selectedDay)).length > 0 ? (
                    getEventsForDay(toDateKey(selectedDay)).map((ev, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (ev.type === 'reminder' && ev.originalReminder) {
                            setEditingEvent(ev.originalReminder);
                            setShowEventModal(true);
                          }
                        }}
                        className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.dot}`} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-black text-slate-900 dark:text-white truncate">{ev.title}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{ev.subtitle}</span>
                          </div>
                        </div>
                        <span className="text-[12px] font-black text-slate-900 dark:text-white shrink-0 ml-3">{ev.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[11px] font-bold text-slate-400 italic">
                      No events or transactions scheduled
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "week" && (
            <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Week of {formatDate(toDateKey(weekDays[0]))}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {weekDays.map((d, i) => {
                  const dKey = toDateKey(d);
                  const events = getEventsForDay(dKey);
                  const isToday = dKey === toDateKey(new Date());

                  return (
                    <div key={i} className={`p-6 rounded-[2rem] border flex flex-col md:flex-row gap-6 transition-all ${isToday ? 'bg-blue-600/5 border-blue-600/20 ring-1 ring-blue-600/10 shadow-lg shadow-blue-600/5' : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}>
                      <div className="flex flex-col items-center justify-center min-w-[100px] md:border-r border-slate-200 dark:border-white/10 md:pr-6">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{d.toLocaleDateString('default', { weekday: 'long' })}</span>
                        <span className={`text-3xl font-black ${isToday ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>{d.getDate()}</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-4">
                        {events.length > 0 ? (
                          events.map((ev, j) => (
                            <div 
                              key={j} 
                              onClick={() => {
                                if (ev.type === 'reminder') {
                                  if (ev.originalReminder) {
                                    setEditingEvent(ev.originalReminder);
                                    setShowEventModal(true);
                                  }
                                }
                              }}
                              className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-slate-100 dark:hover:border-white/5 shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ev.dot.replace('bg-', 'bg-').includes('emerald') ? 'bg-emerald-500/10 text-emerald-600' : ev.dot.includes('red') ? 'bg-red-500/10 text-red-600' : 'bg-blue-600/10 text-blue-600'}`}>
                                  {ev.type === 'reminder' ? <Clock size={18} /> : <CreditCardIcon size={18} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{ev.title}</span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ev.subtitle}</span>
                                </div>
                              </div>
                              <span className={`text-sm font-black ${ev.amount.includes('+') ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{ev.amount}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center py-6 text-slate-400/40 italic text-xs font-bold border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                            No events or transactions
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <div className="flex-1 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto pr-2 custom-scrollbar">
              {(() => {
                const year = viewDate.getFullYear();
                const month = viewDate.getMonth() + 1;
                const listReminders = generateReminderOccurrences(state.reminders || [], state.reminderCompletions || [], year, month);
                
                return listReminders.length > 0 ? listReminders
                  .sort((a, b) => a.due_date.localeCompare(b.due_date))
                  .map((r, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        setEditingEvent(r);
                        setShowEventModal(true);
                      }}
                      className="flex items-center justify-between p-5 bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CalendarIcon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{r.title}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{formatDate(r.due_date)} • {r.due_time || 'All Day'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{r.amount ? formatCurrency(r.amount) : '—'}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.category}</span>
                        </div>
                        {(() => {
                          const status = getReminderDerivedStatus(r);
                          return (
                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : status === 'overdue' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {status}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-slate-50/50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                        <CalendarIcon size={40} className="text-slate-300 opacity-50" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Your timeline is empty</h4>
                      <p className="text-sm font-medium text-slate-500 max-w-[280px] leading-relaxed">Stay organized by adding upcoming bills, goals, and important events.</p>
                      <button 
                        onClick={() => setShowEventModal(true)}
                        className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                      >
                        Create First Event
                      </button>
                    </div>
                  );
              })()}
            </div>
          )}
        </div>

      </div>

      {/* ─── Right Panel: Upcoming ─── */}
      <div className="w-full lg:w-[360px] flex flex-col gap-8">
        
        {/* Upcoming Events Card */}
        <div className="flex-1 vylos-glass-readable p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Timeline</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
               <TrendingUp size={16} />
            </div>
          </div>
          
          <div className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl ${ev.bg} dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-all duration-300`}>
                  {ev.icon}
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{ev.date}</span>
                  <span className="text-[14px] font-black text-slate-900 dark:text-white truncate leading-tight group-hover:text-blue-600 transition-colors">{ev.title}</span>
                  {ev.amount && <span className="text-[11px] font-black text-slate-500 mt-1">{ev.amount}</span>}
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-60">No upcoming tasks</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setPage("reminders")}
            className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            View All Reminders <ChevronRight size={14} />
          </button>
        </div>

        {/* Intelligence CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl transition-all group-hover:scale-150 duration-700" />
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
               <Lightbulb size={28} className="text-white animate-pulse" />
            </div>
            <h4 className="text-xl font-black text-white leading-tight mb-3">Maximize Your Wealth Consistency</h4>
            <p className="text-xs font-bold text-white/70 leading-relaxed mb-8">
              Users who schedule tasks are 3.5x more likely to reach their savings goals early.
            </p>
            <button 
              onClick={() => {
                setEditingEvent(null);
                setShowEventModal(true);
              }}
              className="mt-auto flex items-center justify-center gap-3 w-full py-4 bg-white text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={3} />
              Add Calendar Task
            </button>
          </div>
        </div>

      </div>

      <CalendarEventModal 
        isOpen={showEventModal} 
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(null);
        }} 
        editingEvent={editingEvent}
      />
    </div>
  );
};

