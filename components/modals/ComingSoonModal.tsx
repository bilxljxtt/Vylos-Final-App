"use client";

import React, { useState } from "react";
import { X, Sparkles, Send, Bell, CheckCircle2 } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
  title?: string;
}

export function ComingSoonModal({ isOpen, onClose, source = "billing_upgrade", title = "Coming Soon" }: ComingSoonModalProps) {
  const { state, sessionUser } = useAppStore();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const [email, setEmail] = useState(state.userProfile?.email || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('billing_interest')
        .insert([
          { 
            user_id: sessionUser?.id,
            email,
            message,
            source
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      toast("We've added you to the waitlist!", "success");
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage("");
      }, 2500);
    } catch (err: any) {
      toast(err.message || "Failed to join waitlist", "error");
    }
    setLoading(false);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer" onClick={onClose} />
        
        <div className="relative vylos-modal-glass w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh]">
          {/* Subtle top glow effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="p-8 sm:p-10 relative overflow-y-auto flex-1 custom-scrollbar">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-main hover:bg-border-main/50 rounded-xl transition-all z-20"
            >
              <X size={20} />
            </button>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-bounce-subtle">
                    <Sparkles size={40} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-text-main tracking-tight">{title}</h2>
                    <p className="text-sm font-medium text-text-muted max-w-[300px]">
                      Plan upgrades and billing will be available soon. Join the waitlist to get notified.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Your Email Address</label>
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-border-main/20 border border-border-main rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none focus:border-primary/50 transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Message (Optional)</label>
                    <textarea 
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what features you're looking for..."
                      className="w-full bg-border-main/20 border border-border-main rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none focus:border-primary/50 transition-all shadow-inner resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                >
                  {loading ? "Joining..." : "Notify Me"}
                  {!loading && <Bell size={18} />}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center text-center py-10 gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-black text-text-main tracking-tight">You're on the list!</h2>
                  <p className="text-sm font-medium text-text-muted">
                    Thanks for your interest. We'll let you know as soon as the {title.toLowerCase()} features are ready.
                  </p>
                </div>
                <div className="w-12 h-1 bg-emerald-500/20 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
