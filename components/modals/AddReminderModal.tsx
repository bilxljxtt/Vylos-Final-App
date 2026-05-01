"use client";

import React, { useState } from "react";
import { X, Bell, Calendar, DollarSign, Tag, Repeat } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddReminderModal({ isOpen, onClose }: AddReminderModalProps) {
  const { addReminder } = useAppStore();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "Bills",
    repeat: "None"
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addReminder({
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        repeat: formData.repeat === "None" ? undefined : formData.repeat
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <form onSubmit={handleSubmit} className="relative bg-card border border-border-main w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-border-main flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-main tracking-tight">Add New Reminder</h2>
              <p className="text-xs font-medium text-text-muted uppercase tracking-widest">Bills & Payments</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-border-main rounded-xl transition-all">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Reminder Title</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                required
                type="text" 
                placeholder="Rent, Electricity, Gym..."
                className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-text-main outline-none focus:border-primary/50 transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  required
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-text-main outline-none focus:border-primary/50 transition-all"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  required
                  type="date" 
                  className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-text-main outline-none focus:border-primary/50 transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Category</label>
              <select 
                className="w-full bg-border-main/20 border border-border-main rounded-2xl px-4 py-4 text-sm font-black text-text-main outline-none focus:border-primary/50 transition-all appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Bills">Bills</option>
                <option value="Groceries">Groceries</option>
                <option value="Eating Out">Eating Out</option>
                <option value="Transport">Transport</option>
                <option value="Rent / Housing">Rent / Housing</option>
                <option value="Education">Education</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Frequency</label>
              <div className="relative">
                <Repeat className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                <select 
                  className="w-full bg-border-main/20 border border-border-main rounded-2xl px-4 py-4 text-sm font-black text-text-main outline-none focus:border-primary/50 transition-all appearance-none"
                  value={formData.repeat}
                  onChange={e => setFormData({...formData, repeat: e.target.value})}
                >
                  <option value="None">Once-off</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-border-main/20 border-t border-border-main flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-card border border-border-main text-text-main font-black rounded-2xl hover:bg-border-main transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-2 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Reminder"}
          </button>
        </div>
      </form>
    </div>
  );
}
