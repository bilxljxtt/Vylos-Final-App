"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, Calendar, Tag, Clock, Flag, Repeat, AlignLeft, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { Reminder } from "@/lib/store";
import { useToast } from "@/components/Toast";

import { formatDate } from "@/lib/utils";
import { V2DatePicker } from "@/components/ui/V2DatePicker";
import { V2TimePicker } from "@/components/ui/V2TimePicker";
import { Portal } from "@/components/ui/Portal";

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingReminder?: Reminder | null;
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
    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-50">{label}</label>
    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-white/10">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all vylos-focus ${
            value === opt.value 
              ? 'bg-white dark:bg-white/20 text-primary dark:text-white shadow-xl border border-white/20' 
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export function RemindersModal({ isOpen, onClose, editingReminder }: RemindersModalProps) {
  const { addReminder, updateReminder } = useAppStore();
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
    category: "Bills",
    due_date: new Date().toISOString().split('T')[0],
    due_time: "",
    priority: "medium" as Reminder["priority"],
    recurring: "none" as Reminder["recurring"],
    amount: "",
    customCategory: ""
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingReminder) {
      const standardCategories = [
        "Bills",
        "Subscriptions",
        "Rent / Housing",
        "Transport",
        "Health",
        "Other"
      ];
      const isStandard = standardCategories.includes(editingReminder.category);

      setFormData({
        title: editingReminder.title,
        description: editingReminder.description || "",
        category: isStandard ? editingReminder.category : "Other",
        due_date: editingReminder.due_date,
        due_time: editingReminder.due_time || "",
        priority: editingReminder.priority,
        recurring: editingReminder.recurring,
        amount: editingReminder.amount?.toString() || "",
        customCategory: isStandard ? "" : editingReminder.category
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "Bills",
        due_date: new Date().toISOString().split('T')[0],
        due_time: "",
        priority: "medium",
        recurring: "none",
        amount: "",
        customCategory: ""
      });
    }
  }, [editingReminder, isOpen]);

  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast("Please enter a task name", "error");
      return;
    }
    if (!formData.due_date) {
      toast("Please select a due date", "error");
      return;
    }

    setLoading(true);

    try {
      const finalCategory = formData.category;
      
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: finalCategory,
        due_date: formData.due_date,
        due_time: formData.due_time || null, // Optional
        priority: formData.priority,
        recurring: formData.recurring,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        status: editingReminder ? editingReminder.status : "pending"
      };

      if (editingReminder) {
        await updateReminder(editingReminder.id, payload);
        toast("Task updated successfully", "success");
      } else {
        await addReminder(payload);
        toast("New financial task established", "success");
      }
      onClose();
    } catch (err: any) {
      console.error("Reminder save error:", err);
      toast(err.message || "Failed to save task", "error");
    } finally {
      setLoading(false);
    }
  };

  const standardCategories = [
    "Bills",
    "Subscriptions",
    "Rent / Housing",
    "Transport",
    "Health",
    "Other"
  ];

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" }
  ];

  const recurringOptions = [
    { label: "Once-off", value: "none" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" }
  ];

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer" onClick={onClose} />
        
        <form onSubmit={handleSubmit} className="relative vylos-glass-modal w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-500">
          {/* Subtle top glow effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          {/* Modal Header */}
          <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-primary/5 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                <Bell size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-text-main tracking-tight leading-tight">
                  {editingReminder ? "Edit Financial Task" : "New Financial Task"}
                </h2>
                <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Intelligence-driven reminders</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-3 text-text-muted hover:text-text-main hover:bg-white/10 rounded-2xl transition-all vylos-focus"
              aria-label="Close modal"
            >
              <X size={28} />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-transparent">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Left Column: Logistics */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Task Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/40" size={20} />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., Quarterly Tax Payment"
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-text-main outline-none focus:border-primary focus:bg-white/10 transition-all shadow-inner vylos-focus"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Additional Context</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-5 top-5 text-text-muted/40" size={20} />
                    <textarea 
                      rows={4}
                      placeholder="Add specific details or instructions for this task..."
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-text-main outline-none focus:border-primary focus:bg-white/10 transition-all shadow-inner resize-none vylos-focus"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Due Date <span className="text-red-500">*</span></label>
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
                    <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Reminder Time (Optional)</label>
                    <V2TimePicker 
                      value={formData.due_time}
                      placeholder="Select time"
                      onChange={val => setFormData({...formData, due_time: val})}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Classification */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Category <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {standardCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all text-left flex items-center justify-between group vylos-focus ${
                          formData.category === cat 
                            ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' 
                            : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <div className={`w-2 h-2 rounded-full transition-all ${formData.category === cat ? 'bg-primary scale-125' : 'bg-text-muted/20 group-hover:bg-text-muted/40'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-10">
                  <SegmentedControl 
                    label="Priority Level"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(val) => setFormData({...formData, priority: val})}
                  />
                  
                  <SegmentedControl 
                    label="Recurrence Pattern"
                    options={recurringOptions}
                    value={formData.recurring}
                    onChange={(val) => setFormData({...formData, recurring: val})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-main uppercase tracking-widest ml-1 opacity-80">Estimated Amount (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">R</span>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-lg font-black text-text-main outline-none focus:border-primary focus:bg-white/10 transition-all shadow-inner vylos-focus"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-10 py-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex flex-col sm:flex-row gap-5 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-white/5 border border-white/10 text-text-muted font-black rounded-2xl hover:bg-white/10 hover:text-text-main transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs vylos-focus"
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/20 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 vylos-focus"
            >
              {loading ? "Establishing..." : (editingReminder ? "Update Task" : "Establish Reminder")}
              {!loading && <CheckCircle2 size={20} strokeWidth={2.5} />}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
