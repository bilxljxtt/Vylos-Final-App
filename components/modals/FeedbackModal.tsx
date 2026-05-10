"use client";

import React, { useState } from "react";
import { X, Send, Smile, Frown, Meh, Sparkles, MessageCircle, Bug, Lightbulb, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAppStore } from "@/lib/AppContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: any) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, showToast }) => {
  const { sessionUser } = useAppStore();
  const [sentiment, setSentiment] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [category, setCategory] = useState("General Feedback");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const categories = [
    { id: "General Feedback", label: "General", icon: <MessageCircle size={14} /> },
    { id: "Bug", label: "Bug", icon: <Bug size={14} /> },
    { id: "Feature Request", label: "Feature", icon: <Lightbulb size={14} /> },
    { id: "Complaint", label: "Complaint", icon: <AlertCircle size={14} /> },
  ];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!sentiment) {
      showToast("Please select how you're feeling first!", "info");
      return;
    }
    if (!comment.trim()) {
      showToast("Please enter a short message.", "info");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert([{
        user_id: sessionUser?.id,
        rating: sentiment === "happy" ? 5 : sentiment === "neutral" ? 3 : 1,
        category,
        message: comment,
        status: 'new'
      }]);

      if (error) throw error;
      
      showToast("Thank you for your feedback! We're building Vylos for you.", "success");
      onClose();
      setSentiment(null);
      setComment("");
      setCategory("General Feedback");
    } catch (err: any) {
      showToast(`Failed to save feedback: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card border border-border-main w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-black text-text-main tracking-tight">App Feedback</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-border-main rounded-full transition-all">
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          <p className="text-sm font-medium text-text-muted mb-8 leading-relaxed">
            How's your experience with Vylos so far? We'd love to hear your thoughts and suggestions.
          </p>

          <div className="flex justify-center gap-6 mb-10">
            <button 
              onClick={() => setSentiment("sad")}
              className={`flex flex-col items-center gap-2 group transition-all ${sentiment === "sad" ? "scale-110" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${sentiment === "sad" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-red-500/10 text-red-500"}`}>
                <Frown size={32} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Not Great</span>
            </button>

            <button 
              onClick={() => setSentiment("neutral")}
              className={`flex flex-col items-center gap-2 group transition-all ${sentiment === "neutral" ? "scale-110" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${sentiment === "neutral" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-amber-500/10 text-amber-500"}`}>
                <Meh size={32} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Okay</span>
            </button>

            <button 
              onClick={() => setSentiment("happy")}
              className={`flex flex-col items-center gap-2 group transition-all ${sentiment === "happy" ? "scale-110" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${sentiment === "happy" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/10 text-primary"}`}>
                <Smile size={32} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Loving It</span>
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  category === cat.id 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : "bg-transparent border-border-main text-text-muted hover:border-border-strong"
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more... (optional)"
            className="w-full h-32 bg-border-main/30 border border-border-main focus:border-primary/50 rounded-2xl p-4 text-sm font-medium outline-none transition-all placeholder:text-text-muted/30 mb-8 resize-none"
          />

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Sending..." : <>Submit Feedback <Send size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};
