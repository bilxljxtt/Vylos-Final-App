"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Tag, Clock, AlignLeft, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { Reminder } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";
import { V2DatePicker } from "@/components/ui/V2DatePicker";
import { V2TimePicker } from "@/components/ui/V2TimePicker";
import { Portal } from "@/components/ui/Portal";

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent?: Reminder | null;
}

const SegmentedControl = ({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: { label: string; value: string }[]; 
  value: string; 
  onChange: (val: any) => void 
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{label}</label>
    <div className="flex bg-border-main/20 p-1 rounded-2xl border border-border-main">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            value === opt.value 
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-border-main/50' 
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const STANDARD_CATEGORIES = [
  "Bills",
  "Subscriptions",
  "Savings",
  "Entertainment",
  "Health",
  "Other"
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" }
];

const RECURRING_OPTIONS = [
  { label: "Once-off", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" }
];

export function CalendarEventModal({ isOpen, onClose, editingEvent }: CalendarEventModalProps) {
  const { addReminder, updateReminder, deleteReminder } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Event",
    due_date: new Date().toISOString().split('T')[0],
    due_time: "12:00",
    priority: "medium" as Reminder["priority"],
    recurring: "none" as Reminder["recurring"],
    amount: "",
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || "",
        category: editingEvent.category,
        due_date: editingEvent.due_date,
        due_time: editingEvent.due_time || "12:00",
        priority: editingEvent.priority,
        recurring: editingEvent.recurring,
        amount: editingEvent.amount?.toString() || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "Event",
        due_date: new Date().toISOString().split('T')[0],
        due_time: "12:00",
        priority: "medium",
        recurring: "none",
        amount: "",
      });
    }
  }, [editingEvent?.id, isOpen]);

  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        status: editingEvent ? editingEvent.status : "pending" as const
      };

      const savePromise = (async () => {
        if (editingEvent) {
          await updateReminder(editingEvent.id, payload);
          console.log("Updated reminder:", payload);
          console.log("Reminder date field:", payload.due_date);
          toast("Event updated successfully", "success");
        } else {
          await addReminder(payload);
          console.log("Saved reminder:", payload);
          console.log("Reminder date field:", payload.due_date);
          toast("New event added to calendar", "success");
        }
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const err = new Error("Request timed out. Please check your connection and try again.");
          err.name = "AbortError";
          reject(err);
        }, 15000);
      });

      await Promise.race([savePromise, timeoutPromise]);
      onClose();
    } catch (err: any) {
      console.error("Calendar event save error:", err);
      if (err.name === 'AbortError') {
        toast("Request timed out. Please check your connection and try again.", "error");
      } else {
        toast(err.message || "Failed to save event. Please check your data and try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (!confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    try {
      await deleteReminder(editingEvent.id);
      toast("Event deleted successfully", "success");
      onClose();
    } catch (err: any) {
      console.error("Failed to delete event:", err);
      toast(err.message || "Failed to delete event", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer" onClick={onClose} />
        
        <form 
          onSubmit={handleSubmit} 
          className="relative vylos-glass-modal w-full max-w-5xl rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-500"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          {/* Modal Header */}
          <div className="px-5 py-6 sm:px-10 sm:py-8 border-b border-border-main flex items-center justify-between bg-primary/5 shrink-0">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/20 shrink-0">
                <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-text-main tracking-tight leading-tight">
                  {editingEvent ? "Edit Event" : "New Event"}
                </h2>
                <p className="text-[9px] sm:text-xs font-black text-text-muted uppercase tracking-wider sm:tracking-[0.2em] opacity-60">Organize your financial schedule</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2 sm:p-3 text-text-muted hover:text-text-main hover:bg-border-main/50 rounded-2xl transition-all"
            >
              <X className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
 
          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
              
              {/* Left Column */}
              <div className="space-y-6 sm:space-y-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Event Title</label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/40" size={20} />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., Rent Payment, Client Meeting"
                      className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-text-main outline-none focus:border-primary focus:bg-card transition-all shadow-inner"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Notes & Details</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-5 top-5 text-text-muted/40" size={20} />
                    <textarea 
                      rows={4}
                      placeholder="Add any specific details for this event..."
                      className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-text-main outline-none focus:border-primary focus:bg-card transition-all shadow-inner resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Event Date</label>
                    <V2DatePicker 
                      value={formData.due_date}
                      onChange={val => setFormData({...formData, due_date: val})}
                    />
                    <div className="px-5 py-3 bg-blue-600/10 dark:bg-primary/20 rounded-2xl border border-blue-600/20 dark:border-primary/30 flex items-center gap-3 self-start shadow-sm mt-2">
                       <CheckCircle2 size={16} className="text-blue-600 dark:text-primary" />
                       <span className="text-[12px] font-black text-blue-600 dark:text-primary uppercase tracking-[0.2em]">Targeting: {formData.due_date ? formatDate(formData.due_date) : "None"}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Event Time</label>
                    <V2TimePicker 
                      value={formData.due_time}
                      onChange={val => setFormData({...formData, due_time: val})}
                    />
                  </div>

                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 sm:space-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {STANDARD_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all text-left flex items-center justify-between group ${
                          formData.category === cat 
                            ? 'bg-blue-600/10 border-blue-600 text-blue-600 shadow-lg shadow-blue-600/5' 
                            : 'bg-border-main/5 border-border-main text-text-muted hover:border-border-strong hover:bg-border-main/10'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <div className={`w-2 h-2 rounded-full transition-all ${formData.category === cat ? 'bg-blue-600 scale-125' : 'bg-text-muted/20 group-hover:bg-text-muted/40'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-10">
                  <SegmentedControl 
                    label="Priority Level"
                    options={PRIORITY_OPTIONS}
                    value={formData.priority}
                    onChange={(val) => setFormData({...formData, priority: val})}
                  />
                  
                  <SegmentedControl 
                    label="Recurrence"
                    options={RECURRING_OPTIONS}
                    value={formData.recurring}
                    onChange={(val) => setFormData({...formData, recurring: val})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Associated Amount (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 font-black text-xl">R</span>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-14 pr-6 py-5 text-lg font-black text-text-main outline-none focus:border-blue-600 focus:bg-card transition-all shadow-inner"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-6 sm:px-10 sm:py-8 bg-border-main/10 border-t border-border-main flex flex-col sm:flex-row gap-3 sm:gap-5 shrink-0">
            {editingEvent && (
              <button 
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-3.5 sm:py-5 bg-red-600/10 border border-red-500/30 text-red-600 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
              >
                Delete Event
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 sm:py-5 bg-card border border-border-main text-text-muted font-black rounded-2xl hover:bg-border-main hover:text-text-main transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-3.5 sm:py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
            >
              {loading ? "Processing..." : (editingEvent ? "Update Event" : "Create Event")}
              {!loading && <CheckCircle2 size={20} strokeWidth={2.5} />}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
