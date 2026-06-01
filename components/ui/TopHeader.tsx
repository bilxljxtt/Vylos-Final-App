"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, BellDot, CheckCircle, AlertTriangle, Info, X, Trash2, Grid3x3, LayoutGrid, Zap } from "lucide-react";
import { MonthSelector } from "./MonthSelector";
import { useAppStore } from "@/lib/AppContext";
import { formatRelativeTime } from "@/lib/utils";
import { VylosAvatar } from "./VylosAvatar";

export const TopHeader: React.FC<{
  page: string;
  title: string;
  setPage: (page: string) => void;
  userProfile?: any;
}> = ({ page, title, setPage, userProfile }) => {
  const { state, markAllNotificationsAsRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userProfile?.name
    ? userProfile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
  };

  return (
    <header className="bg-bg flex items-center justify-between px-6 h-14 shrink-0 z-30 relative">
      {/* Left: Logo + Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center overflow-hidden shrink-0">
            <Zap size={18} fill="currentColor" className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Vylos</span>
        </div>
        <span className="text-white/60 text-xs font-medium hidden sm:block ml-1">
          Track. Understand. Improve. Grow.
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        {/* Month selector for relevant pages */}
        {(page === "dashboard" || page === "budget") && (
          <div className="mr-2">
            <MonthSelector />
          </div>
        )}

        {/* Bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative
            ${showNotifications ? "bg-white/25 text-white" : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"}
          `}
        >
          {state.unreadNotificationCount > 0 ? <BellDot size={18} /> : <Bell size={18} />}
          {state.unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-transparent" />
          )}
        </button>

        {/* User avatar */}
        <VylosAvatar 
          size="sm" 
          className="border-2 border-white/30 cursor-pointer hover:bg-white/30 transition-all" 
        />

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-0 mt-3 glass-menu w-[320px] p-0 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 relative">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Notifications</h3>
              
              {state.unreadNotificationCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-blue-400 transition-colors"
                >
                  Mark all read
                </button>
              )}

              {/* Inline Confirmation */}
              {showConfirm && (
                <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <CheckCircle size={14} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">All caught up</span>
                </div>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2">
              {state.notificationList.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {state.notificationList.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 flex gap-4 hover:bg-white/10 rounded-[1.25rem] transition-all relative group/item border border-transparent hover:border-white/5 ${!n.read ? "bg-white/5 shadow-sm" : "opacity-40"}`}
                    >
                      <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center shrink-0 shadow-lg
                        ${n.type === "success" ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20" :
                          n.type === "warning" ? "bg-amber-500/20 text-amber-500 border border-amber-500/20" :
                          "bg-primary/20 text-primary border border-primary/20"}
                      `}>
                        {n.type === "success" ? <CheckCircle size={18} /> :
                         n.type === "warning" ? <AlertTriangle size={18} /> :
                         <Info size={18} />}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[13px] font-black truncate ${!n.read ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>{n.title}</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-white/40 leading-tight line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/40 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-[1.75rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 dark:text-white/10 shadow-inner">
                    <Bell size={32} strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-60">Status: Clear</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
