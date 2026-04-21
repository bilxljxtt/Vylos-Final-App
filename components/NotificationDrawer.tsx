"use client";

import { useEffect, useState } from "react";
import { Bell, X, CheckCircle2, AlertCircle, TrendingUp, ShieldAlert, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Modal } from "./Modal";
import { formatMoney } from "@/lib/store";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  country?: string;
}

export function NotificationDrawer({ isOpen, onClose, userId, country }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  async function fetchNotifications() {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  }

  async function clearAll() {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);
    
    if (!error) {
      setNotifications([]);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "threshold": return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case "security": return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "bill": return <Calendar className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="flex flex-col h-full max-h-[70vh]">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-black text-text-muted uppercase tracking-widest">
            {notifications.length} Alerts Detected
          </p>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">
              Clear All
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 opacity-30">
              <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Syncing Alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-border-subtle flex items-center justify-center mx-auto opacity-50">
                <Bell className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-sm font-bold text-text-muted">You&apos;re all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 rounded-2xl border transition-all relative group ${
                  n.read ? "bg-card border-border-subtle" : "bg-primary/5 border-primary/20 shadow-sm"
                }`}
              >
                {!n.read && (
                   <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.read ? "bg-border-subtle" : "bg-white shadow-sm"
                  }`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black text-sm mb-1 ${n.read ? "text-text-main/70" : "text-text-main"}`}>
                      {n.title}
                    </h4>
                    <p className="text-xs font-medium text-text-muted leading-relaxed mb-3">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-text-muted/50 uppercase tracking-wider">
                        {new Date(n.created_at).toLocaleDateString()} · {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!n.read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
