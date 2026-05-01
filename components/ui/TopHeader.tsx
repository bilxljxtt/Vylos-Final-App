import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { MonthSelector } from "./MonthSelector";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Budget Alert', message: 'You have reached 80% of your Groceries budget.', time: '2 hours ago', type: 'warning', read: false },
  { id: '2', title: 'Goal Reached', message: 'Congratulations! You reached your Emergency Fund goal.', time: '5 hours ago', type: 'success', read: false },
  { id: '3', title: 'New Insight', message: 'Vylos found a way for you to save R500 more this month.', time: '1 day ago', type: 'info', read: true },
];

export const TopHeader: React.FC<{ 
  title: string; 
  setPage: (page: string) => void;
  userProfile?: any;
}> = ({ title, setPage, userProfile }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-bg/80 sticky top-0 z-20 backdrop-blur-md border-b border-border-main">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-3xl font-black text-text-main tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <MonthSelector />
        
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all relative
            ${showNotifications ? 'bg-primary border-primary text-white' : 'border-border-main text-text-muted hover:text-text-main hover:bg-border-main'}
          `}
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-bg" />
        </button>

        {showNotifications && (
          <div className="absolute top-full right-0 mt-3 w-[360px] bg-card border border-border-main rounded-[2rem] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border-main flex items-center justify-between">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Notifications</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {MOCK_NOTIFICATIONS.length > 0 ? (
                <div className="flex flex-col">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-5 border-b border-border-main/50 flex gap-4 hover:bg-border-main/20 transition-colors cursor-pointer relative
                        ${!n.read ? 'bg-primary/5' : ''}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        ${n.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 
                          n.type === 'warning' ? 'bg-amber-100 text-amber-500' : 
                          'bg-blue-100 text-blue-500'}
                      `}>
                        {n.type === 'success' ? <CheckCircle size={20} /> : 
                         n.type === 'warning' ? <AlertTriangle size={20} /> : 
                         <Info size={20} />}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-text-main">{n.title}</span>
                          <span className="text-[10px] font-bold text-text-muted">{n.time}</span>
                        </div>
                        <p className="text-xs font-medium text-text-muted leading-relaxed truncate-2-lines">
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-border-main/30 flex items-center justify-center text-text-muted/30">
                    <Bell size={32} />
                  </div>
                  <p className="text-sm font-bold text-text-muted">All caught up!</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-border-main/10 text-center">
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
