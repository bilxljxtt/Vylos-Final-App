"use client";

import React, { useEffect, useState } from "react";
import { History, Zap, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDate } from "@/lib/utils";

export function XPHistoryTable() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchXP() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('xp_events')
        .select('id, description, event_type, created_at, base_xp, multiplier, final_xp')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    }

    fetchXP();
  }, []);

  if (loading) return <div className="h-48 flex items-center justify-center text-text-muted text-sm font-bold animate-pulse">Loading XP history...</div>;

  if (events.length === 0) return (
    <div className="bg-bg/50 border border-border-main border-dashed p-12 rounded-[2rem] flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-border-main/20 flex items-center justify-center text-text-muted mb-4">
        <History size={24} />
      </div>
      <p className="text-sm font-bold text-text-muted">No XP events recorded yet. Start taking financial actions to earn XP!</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between p-6 bg-card border border-border-main rounded-2xl hover:border-primary/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Zap size={18} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-sm font-black text-text-main tracking-tight">{event.description || event.event_type}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock size={12} className="text-text-muted" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{formatDate(event.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-tight">Base: {event.base_xp} XP</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-tight">Mult: {event.multiplier}x</span>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-sm">
              <span className="text-sm font-black tracking-tight">+{event.final_xp} XP</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
