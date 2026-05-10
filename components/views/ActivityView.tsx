"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, BellDot, CheckCircle2, Trash2, 
  Info, Zap, Inbox, Filter, Search,
  Calendar, ArrowLeft, MoreHorizontal,
  Clock, Shield
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";

export function ActivityView() {
  const { state, markAllNotificationsAsRead, deleteNotification } = useAppStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");

  const notifications = state.notificationList || [];
  
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesFilter = filter === "all" || !n.read;
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                           n.message.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, search]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast("All notifications marked as read", "success");
    } catch (err) {
      toast("Failed to update notifications", "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      toast("Notification removed", "info");
    } catch (err) {
      toast("Failed to delete notification", "error");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Info size={18} className="text-amber-500" />;
      case 'success': return <Zap size={18} className="text-emerald-500" />;
      default: return <Bell size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Activity Center</h2>
          <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 mt-2">Manage your alerts, system updates, and financial intelligence.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary/20 transition-all shadow-sm active:scale-95"
            >
              <CheckCircle2 size={16} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search activity history..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/50 transition-all shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 flex bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          <button 
            onClick={() => setFilter("all")}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "all" ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/60'}`}
          >
            All History
          </button>
          <button 
            onClick={() => setFilter("unread")}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "unread" ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/60'}`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="vylos-glass-readable p-4 min-h-[500px] flex flex-col gap-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all hover:translate-x-1 ${
                !notif.read 
                  ? 'vylos-glass-notification-card shadow-xl shadow-primary/5' 
                  : 'bg-white/5 border-white/5 opacity-80 hover:opacity-100 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                  !notif.read ? 'bg-white/20 border-primary/30 shadow-lg' : 'bg-white/5 border-white/10'
                }`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className={`text-[15px] font-black tracking-tight truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />}
                  </div>
                  <p className={`text-[13px] font-medium mt-1.5 leading-relaxed truncate md:whitespace-normal ${!notif.read ? 'text-slate-700 dark:text-white/70' : 'text-slate-500 dark:text-white/40'}`}>
                    {notif.message?.replace(/\[SID:[^\]]+\]/, '').trim() || ""}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                     <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                        <Clock size={12} />
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
                        <Calendar size={12} />
                        {formatDate(notif.created_at)}
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-6">
                <button 
                  onClick={(e) => handleDelete(notif.id, e)}
                  className="w-11 h-11 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-500/20"
                  aria-label="Delete notification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 dark:text-white/10 mb-8 shadow-inner">
              <Inbox size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white/80 mb-2">No active notifications</h3>
            <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 max-w-[280px] leading-relaxed">
              Your Activity Center is currently empty. We'll alert you here for any important updates.
            </p>
            {filter === "unread" && (
              <button 
                onClick={() => setFilter("all")}
                className="mt-8 text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:text-blue-400 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
