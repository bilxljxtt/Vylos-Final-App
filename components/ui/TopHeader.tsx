import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X, Trash2 } from "lucide-react";
import { MonthSelector } from "./MonthSelector";
import { useAppStore } from "@/lib/AppContext";
import { formatRelativeTime } from "@/lib/utils";


export const TopHeader: React.FC<{ 
  page: string;
  title: string; 
  setPage: (page: string) => void;
  userProfile?: any;
}> = ({ page, title, setPage, userProfile }) => {
  const { state, deleteNotification, markAllNotificationsAsRead } = useAppStore();
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
        {page === "dashboard" && <MonthSelector />}
        
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all relative
            ${showNotifications ? 'bg-primary border-primary text-white' : 'border-border-main text-text-muted hover:text-text-main hover:bg-border-main'}
          `}
        >
          <Bell size={20} />
          {state.unreadNotificationCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-bg" />
          )}
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
            
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              {state.notificationList.length > 0 ? (
                <div className="flex flex-col">
                  {state.notificationList.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-5 border-b border-border-main/50 flex gap-4 hover:bg-border-main/20 transition-colors cursor-pointer relative group/item
                        ${!n.read ? 'bg-primary/5' : ''}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        ${n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                          n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-blue-500/10 text-blue-500'}
                      `}>
                        {n.type === 'success' ? <CheckCircle size={20} /> : 
                         n.type === 'warning' ? <AlertTriangle size={20} /> : 
                         <Info size={20} />}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-text-main truncate pr-4">{n.title}</span>
                          <span className="text-[9px] font-bold text-text-muted shrink-0">
                            {n.created_at ? formatRelativeTime(new Date(n.created_at)) : "just now"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-text-muted leading-relaxed truncate-2-lines pr-6">
                          {n.message}
                        </p>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all bg-card rounded-lg border border-border-main shadow-sm"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>

                      {!n.read && (
                        <div className="absolute top-5 left-12 w-2 h-2 bg-primary rounded-full border-2 border-bg" />
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
              <button 
                onClick={() => markAllNotificationsAsRead()}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                disabled={state.unreadNotificationCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
