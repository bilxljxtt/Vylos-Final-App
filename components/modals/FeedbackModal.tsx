"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, Star, MessageCircle, Bug, ShieldQuestion, Zap, Heart } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { createClient } from "@/utils/supabase/client";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "General Feedback", label: "General", icon: <MessageCircle size={14} /> },
  { id: "Bug Report", label: "Bug", icon: <Bug size={14} /> },
  { id: "Fix Request", label: "Fix", icon: <ShieldQuestion size={14} /> },
  { id: "Suggestion", label: "Suggestion", icon: <Zap size={14} /> },
  { id: "Review", label: "Review", icon: <Heart size={14} /> },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { state, sessionUser } = useAppStore();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("General Feedback");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      setName(state.userProfile?.name || "");
      setEmail(state.userProfile?.email || "");
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, state.userProfile, onClose]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast("Please provide a rating.", "info");
      return;
    }
    if (!message.trim()) {
      toast("Please enter your feedback message.", "info");
      return;
    }
    if (email && !validateEmail(email)) {
      toast("Please enter a valid email address.", "info");
      return;
    }
    
    setLoading(true);
    try {
      const feedbackData = {
        user_id: sessionUser?.id || null,
        name: name || "Anonymous",
        email: email || null,
        rating: rating,
        category: category,
        message: message.trim(),
        status: 'new'
      };

      const { error } = await supabase.from('feedback').insert([feedbackData]);

      if (error) {
        console.error("Supabase feedback error:", error);
        throw error;
      }
      
      toast("Thank you! Your feedback helps us build a better Vylos.", "success");
      onClose();
      // Reset form
      setRating(0);
      setMessage("");
      setCategory("General Feedback");
    } catch (err: any) {
      console.error("Feedback submission error detail:", err);
      const errorMsg = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
      toast(`Failed to send feedback: ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer" onClick={onClose} />
        
        <div className="relative vylos-modal-glass w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-8 pb-0 shrink-0 flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-text-main tracking-tight leading-none">Share Feedback</h3>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-2 block opacity-60">Help us improve</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition-all group active:scale-90">
              <X size={20} className="text-text-muted group-hover:text-text-main" />
            </button>
          </div>

          <div className="p-8 pt-6 overflow-y-auto flex-1 custom-scrollbar space-y-8">
            {/* User Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Your Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-2xl p-4 text-sm font-medium outline-none transition-all placeholder:text-text-muted/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-2xl p-4 text-sm font-medium outline-none transition-all placeholder:text-text-muted/20"
                />
              </div>
            </div>

            {/* Rating Section */}
            <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">Overall Experience</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-all hover:scale-125 active:scale-90"
                  >
                    <Star 
                      size={36} 
                      className={`transition-all duration-300 ${
                        (hoveredRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" 
                        : "text-white/10"
                      }`}
                      strokeWidth={(hoveredRating || rating) >= star ? 1.5 : 1}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-bold text-amber-400/80 mt-4 h-4">
                {rating === 1 ? "Disappointed" : 
                 rating === 2 ? "Could be better" : 
                 rating === 3 ? "It's okay" : 
                 rating === 4 ? "Great experience" : 
                 rating === 5 ? "Absolutely love it!" : ""}
              </span>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Feedback Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-bold tracking-tight transition-all border ${
                      category === cat.id 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Your Message <span className="text-primary">*</span></label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="w-full h-32 bg-white/5 border border-white/10 focus:border-primary/50 rounded-[2rem] p-5 text-sm font-medium outline-none transition-all placeholder:text-text-muted/20 resize-none custom-scrollbar"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 shrink-0">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 bg-primary hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <>Submit Feedback <Send size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
