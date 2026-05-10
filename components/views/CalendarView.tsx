"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  X,
  Bell,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { BudgetService } from "@/lib/services/BudgetService";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { ViewContainer } from "../ui/ViewContainer";
import { toDateKey, createLocalDate, getTransactionDateKey, cleanMerchantName, parseDateKey } from "@/lib/utils";

export const CalendarView: React.FC = () => {
  const { state, setSelectedMonth, formatCurrency } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));
  const [showModal, setShowModal] = useState(false);

  // Sync internal view with global selectedMonth
  const currentDate = useMemo(() => {
    const [y, m] = state.selectedMonth.split('-').map(Number);
    return createLocalDate(y, m - 1, 1);
  }, [state.selectedMonth]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = state.selectedMonth;

  // Real data calculations
  const dailyMovement = useMemo(() => BudgetService.getDailyMovement(state, monthStr), [state, monthStr]);

  const monthStart = createLocalDate(year, month, 1);
  const monthEnd = createLocalDate(year, month + 1, 0);
  
  // Adjusted startDay for Mon-Sun (0=Mon, 6=Sun)
  let startDay = monthStart.getDay() - 1;
  if (startDay === -1) startDay = 6; 

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
    days.push({ date: d, dateKey: toDateKey(d), inMonth: true });
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
    const d = createLocalDate(year, month - 1, 1);
    setSelectedMonth(formatMonthKey(d));
  };

  const nextMonth = () => {
    const d = createLocalDate(year, month + 1, 1);
    setSelectedMonth(formatMonthKey(d));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get items for a specific day
  const getDayItems = (dateKey: string) => {
    const txs = state.transactions.filter(t => getTransactionDateKey(t) === dateKey);
    const subs = state.subscriptions.filter(s => s.nextDue === dateKey);
    return {
        transactions: txs,
        subscriptions: subs,
        totalItems: txs.length + subs.length
    };
  };

  // Chip Style Mapping
  const getChipStyle = (item: any, type: 'transaction' | 'subscription') => {
    if (type === 'subscription') {
      return "bg-acc-blue/10 text-acc-blue border-acc-blue/20 border-dashed border shadow-sm";
    }
    
    const cat = item.category as TransactionCategory;
    const amount = item.amount;
    
    if (amount > 0) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm";
    
    switch (cat) {
      case "Groceries":
      case "Eating Out":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm";
      case "Transport":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm";
      case "Shopping":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm";
      case "Bills":
      case "Rent / Housing":
      case "Health":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-sm";
      case "Entertainment":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-sm";
      default:
        return "bg-text-muted/10 text-text-muted border-border-main shadow-sm";
    }
  };

  const getEmoji = (item: any, type: 'transaction' | 'subscription') => {
    if (type === 'subscription') return "📱";
    const meta = CATEGORY_METADATA[item.category as TransactionCategory];
    return meta?.icon || "📦";
  };

  // Selected Day Details for Modal
  const detailData = useMemo(() => {
    if (!showModal) return null;
    const items = getDayItems(selectedDate);
    const incomeTotal = items.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenseTotal = items.transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const subTotal = items.subscriptions.reduce((s, b) => s + b.amount, 0);

    return {
      date: selectedDate,
      transactions: items.transactions,
      subscriptions: items.subscriptions,
      incomeTotal,
      expenseTotal,
      subTotal,
      netTotal: incomeTotal - expenseTotal - subTotal
    };
  }, [showModal, selectedDate, state.transactions, state.subscriptions]);

  return (
    <ViewContainer className="flex flex-col pt-8 pb-20 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Redesigned Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 mb-10 mt-2">
        <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-text-main tracking-tight">Financial Calendar</h1>
            <p className="text-text-muted font-medium text-sm">See your upcoming income, expenses, bills, and reminders.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-border-main/20 p-1.5 rounded-2xl border border-border-main min-w-[200px] justify-between shadow-sm">
                <button 
                  onClick={prevMonth} 
                  className="p-2 hover:bg-card hover:shadow-sm rounded-xl transition-all text-text-main"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-xs font-black text-text-main uppercase tracking-widest px-4">
                  {monthName} {year}
                </span>

                <button 
                  onClick={nextMonth} 
                  className="p-2 hover:bg-card hover:shadow-sm rounded-xl transition-all text-text-main"
                >
                  <ChevronRight size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="border border-border-main rounded-[2.5rem] shadow-sm overflow-hidden bg-card mx-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border-main">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{d}</div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 border-l border-t border-border-main">
          {days.map((dayObj, idx) => {
            const { date, dateKey, inMonth } = dayObj;
            const isTodayCell = toDateKey(new Date()) === dateKey;
            const isSelected = selectedDate === dateKey;
            const movement = dailyMovement[dateKey];
            const items = getDayItems(dateKey);
            const displayItems = [...items.transactions, ...items.subscriptions].slice(0, 4);
            const remainingCount = items.totalItems - displayItems.length;

            return (
              <div 
                key={idx}
                onClick={() => {
                  setSelectedDate(dateKey);
                  setShowModal(true);
                }}
                className={`
                  min-h-[160px] p-3 border-r border-b border-border-main flex flex-col gap-2 group transition-all cursor-pointer relative
                  ${!inMonth ? 'bg-bg/40' : 'bg-card hover:bg-bg/30'}
                  ${isSelected ? 'ring-2 ring-primary/40 bg-primary/5 z-10' : ''}
                `}
              >
                {/* Cell Header: Date & Net */}
                <div className="flex justify-between items-start">
                   <div className={`
                     w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all
                     ${isTodayCell ? 'bg-primary text-white shadow-lg shadow-primary/20' : inMonth ? 'text-text-main' : 'text-text-muted opacity-40'}
                     ${isSelected && !isTodayCell ? 'border-2 border-primary text-primary' : ''}
                   `}>
                     {date.getDate()}
                   </div>
                   
                   {movement && movement.net !== 0 && inMonth && (
                     <div className={`text-[10px] font-black tracking-tight ${movement.net > 0 ? 'text-emerald-500' : 'text-text-muted'}`}>
                        {movement.net > 0 ? '+' : ''}{formatCurrency(Math.round(movement.net)).replace(/\.00$/, '')}
                     </div>
                   )}
                </div>

                {/* Transaction Chips */}
                <div className="flex flex-col gap-1.5 overflow-hidden">
                   {displayItems.map((item, i) => {
                     const isSub = 'nextDue' in item;
                     return (
                        <div 
                          key={i} 
                          className={`
                            px-2 py-1.5 rounded-xl border flex items-center gap-2 transition-all group-hover:translate-x-0.5
                            ${getChipStyle(item, isSub ? 'subscription' : 'transaction')}
                          `}
                        >
                           <span className="text-xs">{getEmoji(item, isSub ? 'subscription' : 'transaction')}</span>
                           <div className="flex-1 min-w-0 flex flex-col">
                              <span className="text-[10px] font-bold truncate leading-tight capitalize">
                                {isSub ? item.name : cleanMerchantName(item.merchant || item.category)}
                              </span>
                              {!isSub && item.amount > 0 && <span className="text-[8px] opacity-80 font-black">+{formatCurrency(item.amount)}</span>}
                           </div>
                        </div>
                     );
                   })}
                   
                   {remainingCount > 0 && (
                      <div className="px-2 py-1 text-[9px] font-black text-text-muted uppercase tracking-widest text-center mt-1">
                        + {remainingCount} more
                      </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Detail Modal */}
      {showModal && detailData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-border-main w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-text-main tracking-tight">
                    {(() => {
                      const d = parseDateKey(selectedDate);
                      return d.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });
                    })()}
                  </h3>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Daily Summary</span>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-border-main rounded-2xl transition-all">
                <X size={24} className="text-text-muted" />
              </button>
            </div>

            <div className="p-8 pt-4">
               {/* Totals */}
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1">
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Income</span>
                     <span className="text-2xl font-black text-emerald-600">+{formatCurrency(detailData.incomeTotal)}</span>
                  </div>
                  <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1">
                     <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Spending</span>
                     <span className="text-2xl font-black text-rose-600">-{formatCurrency(detailData.expenseTotal + detailData.subTotal)}</span>
                  </div>
               </div>

               {/* Items List */}
               <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                  {[...detailData.transactions, ...detailData.subscriptions].length === 0 ? (
                    <div className="py-10 text-center opacity-40 flex flex-col items-center gap-3">
                       <CalendarIcon size={40} className="text-text-muted/30" />
                       <span className="text-xs font-black uppercase tracking-widest">No activity</span>
                    </div>
                  ) : (
                    <>
                      {detailData.transactions.map(tx => {
                        const isInc = tx.amount > 0;
                        return (
                          <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border-main group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-card border border-border-main flex items-center justify-center text-lg shadow-sm">
                                   {getEmoji(tx, 'transaction')}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-text-main capitalize">{cleanMerchantName(tx.merchant || tx.category)}</span>
                                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tx.category}</span>
                                </div>
                             </div>
                             <span className={`text-sm font-black ${isInc ? 'text-emerald-500' : 'text-text-main'}`}>
                                {isInc ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                             </span>
                          </div>
                        );
                      })}
                      {detailData.subscriptions.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between p-4 rounded-2xl bg-acc-blue/5 border border-acc-blue/10 group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-card border border-border-main flex items-center justify-center text-lg shadow-sm">
                                 📱
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-text-main">{sub.name}</span>
                                 <span className="text-[10px] font-bold text-acc-blue uppercase tracking-widest">Subscription</span>
                              </div>
                           </div>
                           <span className="text-sm font-black text-text-main">
                              -{formatCurrency(sub.amount)}
                           </span>
                        </div>
                      ))}
                    </>
                  )}
               </div>

               <div className={`mt-8 p-6 rounded-3xl flex items-center justify-between ${detailData.netTotal >= 0 ? 'bg-primary/10' : 'bg-border-main/40'}`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${detailData.netTotal >= 0 ? 'bg-primary text-white' : 'bg-text-muted/30 text-text-main'}`}>
                        {detailData.netTotal >= 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                     </div>
                     <span className="text-sm font-black text-text-main">Daily Net Balance</span>
                  </div>
                  <span className={`text-xl font-black ${detailData.netTotal >= 0 ? 'text-primary' : 'text-text-main'}`}>
                     {detailData.netTotal >= 0 ? '+' : ''}{formatCurrency(detailData.netTotal)}
                  </span>
               </div>
            </div>
          </div>
        </div>
      )}
    </ViewContainer>
  );
};
