"use client";

import React, { useState } from "react";
import { 
  Bell, BellDot, ChevronDown, User, Settings, LogOut, 
  CheckCircle2, Info, Shield, Zap, Inbox, Trash2, MessageCircle 
} from "lucide-react";
import { V2Popover } from "@/components/ui/V2Popover";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { VylosLogo } from "@/components/ui/VylosLogo";

interface V2HeaderProps {
  firstName: string;
  avatarUrl?: string;
  onPageChange: (page: string) => void;
  onShowFeedback: () => void;
}

export const V2Header: React.FC<V2HeaderProps> = ({ firstName, avatarUrl, onPageChange, onShowFeedback }) => {
  const { state, markAllNotificationsAsRead, deleteNotification } = useAppStore();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const notificationList = state.notificationList || [];
  const unreadCount = state.unreadNotificationCount || 0;

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllNotificationsAsRead();
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2000);
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      toast("Notification dismissed", "info");
    } catch (err) {
      toast("Failed to dismiss notification", "error");
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      await deleteNotification(notif.id);
      toast(`Cleared notification: ${notif.title}`, "info");
    } catch (err) {
      console.error("Failed to clear notification on click:", err);
    }
  };

  return (
    <header className="w-full pt-12 pb-4 relative z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex flex-col items-start -ml-2 md:-ml-4">
          <div className="select-none relative z-10 transform group-hover:scale-105 transition-all duration-500 ease-out drop-shadow-2xl">
            <VylosLogo size="large" />
          </div>
        </div>

        {/* Right: Actions Bar */}
        <div className="flex items-center gap-3 relative z-10">
          {/* Feedback Button */}
          <button 
            onClick={onShowFeedback}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 border border-white/5 bg-white/5 group"
            title="Send Feedback"
          >
            <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Feedback</span>
          </button>

          {/* Notification Popover */}
          <V2Popover
            trigger={
              <button className="flex items-center gap-4 px-6 py-2.5 rounded-full text-white hover:bg-blue-500/20 transition-all active:scale-95 relative bg-blue-500/10 border border-white/10 shadow-xl group">
                <div className="relative">
                  {unreadCount > 0 ? <BellDot size={20} className="group-hover:rotate-12 transition-transform text-primary" /> : <Bell size={20} className="group-hover:rotate-12 transition-transform opacity-70" />}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">Activity Center</span>
              </button>
            }
          >
            <div className="w-[380px] overflow-hidden vylos-glass-popup border-white/20 shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 relative">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white/60 opacity-80">Notifications</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageChange("activity");
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-blue-500 transition-colors text-left"
                  >
                    View All Activity →
                  </button>
                </div>
                
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-blue-400 transition-colors"
                  >
                    Mark all read
                  </button>
                )}

                {/* Inline Confirmation */}
                {showConfirm && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300 z-[20]">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">All caught up</span>
                  </div>
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto py-2 custom-scrollbar bg-transparent">
                {notificationList.length > 0 ? (
                  notificationList.map((notif: any) => (
                    <div 
                      key={notif.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notif);
                      }}
                      className={`relative px-4 py-4 hover:bg-white/10 transition-all cursor-pointer group rounded-2xl mx-3 mb-2 border flex items-center gap-4 ${!notif.read ? 'vylos-glass-notification-card shadow-lg ring-1 ring-primary/20' : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'}`}
                    >
                      {/* Left Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${!notif.read ? 'bg-white/20 border-primary/40 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                        {notif.type === 'warning' ? <Info size={16} className="text-amber-500" /> : 
                        notif.type === 'success' ? <Zap size={16} className="text-emerald-500" /> : 
                        <Zap size={16} className="text-blue-500" />}
                      </div>

                      {/* Middle Content */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={`text-[12px] font-black leading-tight tracking-tight truncate pr-8 ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{notif.title}</span>
                        <p className={`text-[10px] font-bold mt-1 leading-relaxed line-clamp-1 ${!notif.read ? 'text-slate-700 dark:text-white/70' : 'text-slate-500 dark:text-white/40'}`}>
                          {notif.message?.replace(/\[SID:[^\]]+\]/, '').trim() || ""}
                        </p>
                        <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest mt-1.5">{new Date(notif.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                      </div>

                      {/* Right Actions */}
                      <div className="flex flex-col items-center justify-between h-10 shrink-0">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                        )}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteNotification(notif.id, e);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 -mr-1"
                          title="Dismiss"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 dark:text-white/10 mb-4 shadow-inner">
                      <Inbox size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-loose">
                      All caught up!<br/>
                      <span className="opacity-40">Zero notifications</span>
                    </p>
                  </div>
                )}
              </div>
              
            </div>
          </V2Popover>
        </div>
      </div>
    </header>
  );
};
