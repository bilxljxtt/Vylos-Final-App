"use client";

import React, { useState } from "react";
import { X, Target, Calendar, Tag, FileText, Palette, Smile } from "lucide-react";
import { TransactionCategory, TRANSACTION_CATEGORIES } from "@/lib/store";

export function TransactionModal({ txForm, setTxForm, setShowAddTx, handleAddTransaction, autocat }: any) {
  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const desc = e.target.value;
    const suggestedCat = autocat(desc, txForm.type);
    setTxForm((f: any) => ({ ...f, desc, cat: suggestedCat }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border-main rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500 ring-1 ring-border-strong/10">
        <h3 className="text-3xl font-black mb-8 tracking-tight text-text-main">Add Transaction</h3>
        <div className="space-y-6">
           <div className="flex bg-border-main/50 p-1.5 rounded-2xl border border-border-main">
              {["expense","income"].map(t=>(
                <button 
                  key={t} 
                  type="button"
                  onClick={() => {
                    const newType = t as "income" | "expense";
                    setTxForm((f: any) => ({ 
                      ...f, 
                      type: newType, 
                      cat: autocat(f.desc, newType) 
                    }));
                  }} 
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${txForm.type === t ? 'bg-bg text-text-main shadow-lg border border-border-main' : 'text-text-muted hover:text-text-main'}`}
                >
                  {t}
                </button>
              ))}
           </div>
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Description</label>
              <input 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none transition-all placeholder:text-text-muted/30" 
                value={txForm.desc} 
                onChange={handleDescChange} 
                placeholder="e.g. Checkers, Starbucks, Netflix..."
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Category</label>
                <select 
                  className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-4 py-4 text-sm font-bold text-text-main outline-none transition-all appearance-none"
                  value={txForm.cat}
                  onChange={e => setTxForm((f: any) => ({ ...f, cat: e.target.value as TransactionCategory }))}
                >
                  {TRANSACTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Date</label>
                <input 
                  className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-4 py-4 text-sm font-bold text-text-main outline-none transition-all" 
                  type="date"
                  value={txForm.date} 
                  onChange={e => setTxForm((f: any) => ({ ...f, date: e.target.value }))} 
                />
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Amount (R)</label>
              <input 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-xl font-black text-text-main outline-none transition-all" 
                type="number" 
                value={txForm.amount} 
                onChange={e => setTxForm((f: any) => ({ ...f, amount: e.target.value }))} 
                placeholder="0.00"
              />
           </div>

           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Notes (Optional)</label>
              <textarea 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none transition-all placeholder:text-text-muted/30 min-h-[80px] resize-none" 
                value={txForm.notes} 
                onChange={e => setTxForm((f: any) => ({ ...f, notes: e.target.value }))} 
                placeholder="Add details about this purchase..."
              />
           </div>

           <div className="flex gap-4 pt-4">
             <button type="button" className="flex-1 py-5 text-sm font-black text-text-muted hover:text-text-main transition-colors" onClick={() => setShowAddTx(false)}>Cancel</button>
             <button type="button" className="flex-1 py-5 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95" onClick={handleAddTransaction}>Save</button>
           </div>
        </div>
      </div>
    </div>
  );
}

export function GoalModal({ goalForm, setGoalForm, setShowAddGoal, handleAddGoal }: any) {
  const icons = ["🎯", "🛡️", "🚗", "🏠", "🏝️", "🎓", "💍", "🍼", "🚀"];
  const colors = ["#00D8A5", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border-main rounded-[3rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-500 ring-1 ring-border-strong/10 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black tracking-tight text-text-main">New Savings Goal</h3>
            <button onClick={() => setShowAddGoal(false)} className="p-2 hover:bg-border-main rounded-xl transition-all">
                <X size={20} className="text-text-muted" />
            </button>
        </div>

        <div className="space-y-8">
           {/* Basic Info */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Goal Title</label>
                 <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-text-main outline-none transition-all" 
                        value={goalForm.name} 
                        onChange={e => setGoalForm((f: any) => ({ ...f, name: e.target.value }))} 
                        placeholder="e.g. Dream House"
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Target Amount (R)</label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-text-muted">R</span>
                    <input 
                        className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl pl-10 pr-6 py-4 text-xl font-black text-text-main outline-none transition-all" 
                        type="number" 
                        value={goalForm.target} 
                        onChange={e => setGoalForm((f: any) => ({ ...f, target: e.target.value }))} 
                        placeholder="0.00"
                    />
                 </div>
              </div>
           </div>

           {/* Deadline & Category */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Deadline</label>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-text-main outline-none transition-all" 
                        type="date"
                        value={goalForm.deadline} 
                        onChange={e => setGoalForm((f: any) => ({ ...f, deadline: e.target.value }))} 
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Category</label>
                 <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <select 
                        className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-text-main outline-none transition-all appearance-none"
                        value={goalForm.category}
                        onChange={e => setGoalForm((f: any) => ({ ...f, category: e.target.value }))}
                    >
                        <option value="Savings">Savings</option>
                        <option value="Travel">Travel</option>
                        <option value="Property">Property</option>
                        <option value="Emergency">Emergency Fund</option>
                        <option value="Vehicle">Vehicle</option>
                        <option value="Other">Other</option>
                    </select>
                 </div>
              </div>
           </div>

           {/* Visual Customization */}
           <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 px-1">Icon & Color</label>
                <div className="flex flex-wrap gap-3 mb-4">
                    {icons.map(icon => (
                        <button 
                            key={icon}
                            onClick={() => setGoalForm((f: any) => ({ ...f, icon }))}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${goalForm.icon === icon ? 'bg-primary/20 border-2 border-primary' : 'bg-border-main/20 border border-border-main'}`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                        <button 
                            key={color}
                            onClick={() => setGoalForm((f: any) => ({ ...f, color }))}
                            className={`w-10 h-10 rounded-full transition-all ${goalForm.color === color ? 'ring-4 ring-offset-2 ring-primary scale-110' : 'scale-100'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
              </div>
           </div>

           {/* Notes */}
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Goal Notes</label>
              <div className="relative">
                 <FileText className="absolute left-4 top-4 text-text-muted" size={18} />
                 <textarea 
                    className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-text-main outline-none transition-all min-h-[100px]" 
                    value={goalForm.notes} 
                    onChange={e => setGoalForm((f: any) => ({ ...f, notes: e.target.value }))} 
                    placeholder="Why are you saving for this?"
                 />
              </div>
           </div>

           <div className="flex gap-4 pt-4">
             <button type="button" className="flex-1 py-5 text-sm font-black text-text-muted hover:text-text-main transition-colors" onClick={() => setShowAddGoal(false)}>Cancel</button>
             <button type="button" className="flex-1 py-5 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95" onClick={handleAddGoal}>Create Goal</button>
           </div>
        </div>
      </div>
    </div>
  );
}

export function BudgetModal({ budgetForm, setBudgetForm, setShowAddBudget, handleAddBudget }: any) {
  const categories = TRANSACTION_CATEGORIES.filter(c => !["Salary", "Business Income", "Refund", "Other Income"].includes(c));
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border-main rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500 ring-1 ring-border-strong/10">
        <h3 className="text-3xl font-black mb-8 tracking-tight text-text-main">Set Category Budget</h3>
        <div className="space-y-6">
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Category</label>
              <select 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none transition-all appearance-none"
                value={budgetForm.cat}
                onChange={e => setBudgetForm((f: any) => ({ ...f, cat: e.target.value }))}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Monthly Limit (R)</label>
              <input 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-xl font-black text-text-main outline-none transition-all" 
                type="number" 
                value={budgetForm.limit} 
                onChange={e => setBudgetForm((f: any) => ({ ...f, limit: e.target.value }))} 
              />
           </div>
           <div className="flex gap-4 pt-4">
             <button className="flex-1 py-5 text-sm font-black text-text-muted hover:text-text-main transition-colors" onClick={() => setShowAddBudget(false)}>Cancel</button>
             <button className="flex-1 py-5 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95" onClick={handleAddBudget}>Set Budget</button>
           </div>
        </div>
      </div>
    </div>
  );
}
