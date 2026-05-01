"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Clock,
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarCheck,
  MoreVertical,
  Activity
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { BudgetService } from "@/lib/services/BudgetService";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { ViewContainer } from "../ui/ViewContainer";

export const CalendarView: React.FC = () => {
  const { state, setSelectedMonth, formatCurrency } = useAppStore();
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  // Sync internal view with global selectedMonth
  const currentDate = useMemo(() => {
    const [y, m, d] = state.selectedMonth.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  }, [state.selectedMonth]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = state.selectedMonth;

  // Real data calculations
  const monthSummary = useMemo(() => BudgetService.getMonthFinancialSummary(state, monthStr), [state, monthStr]);
  const dailyMovement = useMemo(() => BudgetService.getDailyMovement(state, monthStr), [state, monthStr]);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const startDay = (monthStart.getDay() + 6) % 7; // Mon-Sun
  const numDays = monthEnd.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push({ date: new Date(year, month, 1 - (startDay - i)), inMonth: false });
  }
  for (let i = 1; i <= numDays; i++) {
    days.push({ date: new Date(year, month, i), inMonth: true });
  }

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  };

  const prevMonth = () => setSelectedMonth(formatDate(new Date(year, month - 1, 1)));
  const nextMonth = () => setSelectedMonth(formatDate(new Date(year, month + 1, 1)));
  const goToday = () => {
    const today = new Date();
    setSelectedMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get selected day details
  const detailData = useMemo(() => {
    if (!selectedDayDetail) return null;
    const dateStr = selectedDayDetail;
    const txs = state.transactions.filter(t => (t.date || t.createdAt || "").startsWith(dateStr));
    const subs = state.subscriptions.filter(s => s.nextDue === dateStr);
    
    const incomeTotal = txs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = txs.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const subTotal = subs.reduce((sum, s) => sum + s.amount, 0);

    return {
      date: dateStr,
      transactions: txs,
      subscriptions: subs,
      incomeTotal,
      expenseTotal,
      subTotal,
      netTotal: incomeTotal - expenseTotal - subTotal
    };
  }, [selectedDayDetail, state.transactions, state.subscriptions]);

  return (
    <ViewContainer className="flex flex-col gap-8 pt-4 pb-20 max-w-[1400px] mx-auto bg-bg">
      {/* Real Monthly Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
         <div className="bg-card border border-border-main p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-500">
               <TrendingUp size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Monthly Income</span>
            </div>
            <span className="text-2xl font-black text-text-main">{formatCurrency(monthSummary.totalIncome)}</span>
         </div>
         <div className="bg-card border border-border-main p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-500">
               <TrendingDown size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Monthly Expenses</span>
            </div>
            <span className="text-2xl font-black text-text-main">{formatCurrency(monthSummary.totalExpenses)}</span>
         </div>
         <div className="bg-card border border-border-main p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-500">
               <Wallet size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Remaining Budget</span>
            </div>
            <span className="text-2xl font-black text-text-main">{formatCurrency(monthSummary.remainingBudget)}</span>
         </div>
         <div className="bg-card border border-border-main p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
               <Clock size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Upcoming Bills</span>
            </div>
            <span className="text-2xl font-black text-text-main">{monthSummary.upcomingPaymentsCount} Payments</span>
         </div>
      </div>

      {/* Navigation & Month Selector */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-text-main tracking-tight">{monthName} {year}</h2>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Financial Cashflow Calendar</span>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border-main p-1.5 rounded-2xl">
          <button onClick={prevMonth} className="p-2 hover:bg-border-main rounded-xl transition-all text-text-main"><ChevronLeft size={20} /></button>
          <button onClick={goToday} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl transition-all">Today</button>
          <button onClick={nextMonth} className="p-2 hover:bg-border-main rounded-xl transition-all text-text-main"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border-main rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pb-2">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-border-main/20 border border-border-main/20 rounded-2xl overflow-hidden shadow-inner">
          {days.map((dayObj, idx) => {
            const { date, inMonth } = dayObj;
            const dateStr = date.toISOString().slice(0, 10);
            const isToday = new Date().toDateString() === date.toDateString();
            const movement = dailyMovement[dateStr];
            
            // Subs for this day
            const daySubs = state.subscriptions.filter(s => s.nextDue === dateStr);
            const subTotal = daySubs.reduce((sum, s) => sum + s.amount, 0);

            return (
              <div 
                key={idx} 
                onClick={() => inMonth && setSelectedDayDetail(dateStr)}
                className={`bg-card min-h-[140px] p-4 flex flex-col justify-between group transition-all hover:bg-primary/5 cursor-pointer relative ${!inMonth ? 'opacity-20 pointer-events-none' : ''} ${isToday ? 'ring-2 ring-primary ring-inset z-10' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-black ${isToday ? 'text-primary' : 'text-text-muted/60'}`}>{date.getDate()}</span>
                  {movement?.net !== 0 && (
                     <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg ${movement?.net > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       {movement?.net > 0 ? '+' : ''}{Math.round(movement?.net)}
                     </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {movement?.income > 0 && (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[9px] font-bold truncate">+{formatCurrency(movement.income)} Income</span>
                    </div>
                  )}
                  {movement?.expense > 0 && (
                    <div className="flex items-center gap-1 text-rose-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-[9px] font-bold truncate">-{formatCurrency(movement.expense)} Expense</span>
                    </div>
                  )}
                  {subTotal > 0 && (
                    <div className="flex items-center gap-1 text-indigo-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-[9px] font-bold truncate">-{formatCurrency(subTotal)} Sub</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Day Modal */}
      {selectedDayDetail && detailData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border-main w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-border-main flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarCheck size={28} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-text-main tracking-tight">
                    {new Date(selectedDayDetail).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Daily Cashflow Details</span>
                </div>
              </div>
              <button onClick={() => setSelectedDayDetail(null)} className="p-3 hover:bg-border-main rounded-2xl transition-all">
                <X size={24} className="text-text-muted" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
              {/* Daily Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Total Income</span>
                  <span className="text-lg font-black text-text-main">+{formatCurrency(detailData.incomeTotal)}</span>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Total Expenses</span>
                  <span className="text-lg font-black text-text-main">-{formatCurrency(detailData.expenseTotal + detailData.subTotal)}</span>
                </div>
                <div className={`${detailData.netTotal >= 0 ? 'bg-primary/5 border-primary/10' : 'bg-rose-500/5 border-rose-500/10'} border p-5 rounded-2xl flex flex-col gap-1`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${detailData.netTotal >= 0 ? 'text-primary' : 'text-rose-600'}`}>Net Total</span>
                  <span className="text-lg font-black text-text-main">{detailData.netTotal >= 0 ? '+' : ''}{formatCurrency(detailData.netTotal)}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-6">
                {detailData.transactions.length === 0 && detailData.subscriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                    <Activity size={48} />
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No financial activity for this day</p>
                  </div>
                ) : (
                  <>
                    {detailData.transactions.map(tx => {
                      const meta = CATEGORY_METADATA[tx.category] || { icon: "📦", color: "#607D8B" };
                      const isIncome = tx.amount > 0;
                      return (
                        <div key={tx.id} className="flex items-center justify-between group hover:bg-border-main/20 p-3 rounded-2xl transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-border-main flex items-center justify-center text-xl">
                              {meta.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-text-main">{tx.merchant}</span>
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tx.category}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {detailData.subscriptions.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between group hover:bg-border-main/20 p-3 rounded-2xl transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl">
                            📱
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-text-main">{sub.name}</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Subscription</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-rose-500">
                            -{formatCurrency(sub.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ViewContainer>
  );
};
