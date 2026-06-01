import React, { useState, useEffect } from "react";
import { X, Target, Calendar, Tag, FileText, Palette, Smile, Plus } from "lucide-react";
import { TransactionCategory, TRANSACTION_CATEGORIES } from "@/lib/store";
import { V2Select } from "./V2Select";
import { V2DatePicker } from "./V2DatePicker";
import { Portal } from "./Portal";
import { TransactionIcon } from "./TransactionIcon";
import { GoalIcon } from "./GoalIcon";

export function TransactionModal({ txForm, setTxForm, setShowAddTx, handleAddTransaction, autocat }: any) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddTx(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setShowAddTx]);

  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const desc = e.target.value;
    const suggestedCat = autocat(desc, txForm.type);
    setTxForm((f: any) => ({ ...f, desc, cat: suggestedCat }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddTransaction();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-xl cursor-pointer" 
          onClick={() => setShowAddTx(false)} 
        />
        <form 
          onSubmit={onSubmit}
          className="relative vylos-modal-glass rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Subtle top glow effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-text-main">Add Transaction</h3>
            <button type="button" onClick={() => setShowAddTx(false)} className="p-2 hover:bg-border-main rounded-xl transition-all vylos-focus">
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-2">
             <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-white/10">
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
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all vylos-focus ${txForm.type === t ? 'bg-white dark:bg-white/20 text-primary dark:text-white shadow-lg border border-white/20' : 'text-text-muted hover:text-text-main'}`}
                  >
                    {t}
                  </button>
                ))}
             </div>
             <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Description</label>
                  <input 
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none transition-all placeholder:text-text-muted/30 vylos-focus" 
                    value={txForm.desc} 
                    onChange={handleDescChange} 
                    placeholder="e.g. Checkers, Starbucks, Netflix..."
                    required
                  />
                </div>
                <div className="shrink-0 mb-1">
                  <TransactionIcon 
                    merchant={txForm.desc} 
                    category={txForm.cat} 
                    type={txForm.type}
                    size="md"
                  />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <V2Select 
                  label="Category"
                  value={txForm.cat}
                  onChange={v => setTxForm((f: any) => ({ ...f, cat: v as TransactionCategory }))}
                  options={TRANSACTION_CATEGORIES.map(c => ({ value: c, label: c }))}
                />
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Date</label>
                  <V2DatePicker 
                    value={txForm.date}
                    onChange={v => setTxForm((f: any) => ({ ...f, date: v }))}
                  />
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Amount (R)</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-2xl px-6 py-4 text-xl font-black text-text-main outline-none transition-all vylos-focus" 
                  type="number" 
                  step="0.01"
                  value={txForm.amount} 
                  onChange={e => setTxForm((f: any) => ({ ...f, amount: e.target.value }))} 
                  placeholder="0.00"
                  required
                />
             </div>

             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Notes (Optional)</label>
                <textarea 
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none transition-all placeholder:text-text-muted/30 min-h-[80px] resize-none vylos-focus" 
                  value={txForm.notes} 
                  onChange={e => setTxForm((f: any) => ({ ...f, notes: e.target.value }))} 
                  placeholder="Add details about this purchase..."
                />
             </div>
          </div>

          <div className="flex gap-4 pt-6 mt-2 border-t border-border-main/20 shrink-0">
            <button type="button" className="flex-1 py-4 text-sm font-black text-text-muted hover:text-text-main transition-colors vylos-focus rounded-xl" onClick={() => setShowAddTx(false)}>Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 vylos-focus">Save</button>
          </div>
        </form>
      </div>
    </Portal>
  );
}

export function GoalModal({ goalForm, setGoalForm, setShowAddGoal, handleAddGoal }: any) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddGoal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setShowAddGoal]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddGoal();
  };

  const icons = ["Target", "Shield", "Car", "Home", "Plane", "GraduationCap", "Heart", "Baby", "Rocket"];
  const colors = ["#00D8A5", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-xl cursor-pointer" 
          onClick={() => setShowAddGoal(false)} 
        />
        <form 
          onSubmit={onSubmit}
          className="relative vylos-modal-glass rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Subtle top glow effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-text-main">New Savings Goal</h3>
              <button type="button" onClick={() => setShowAddGoal(false)} className="p-2 hover:bg-border-main rounded-xl transition-all vylos-focus">
                  <X size={20} className="text-text-muted" />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-2">
             {/* Basic Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Goal Title</label>
                   <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input 
                          className="w-full bg-black/5 dark:bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-text-main outline-none transition-all vylos-focus" 
                          value={goalForm.name} 
                          onChange={e => setGoalForm((f: any) => ({ ...f, name: e.target.value }))} 
                          placeholder="e.g. Dream House"
                          required
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Target Amount (R)</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-text-muted">R</span>
                      <input 
                          className="w-full bg-black/5 dark:bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-2xl pl-10 pr-6 py-4 text-xl font-black text-text-main outline-none transition-all vylos-focus" 
                          type="number" 
                          value={goalForm.target} 
                          onChange={e => setGoalForm((f: any) => ({ ...f, target: e.target.value }))} 
                          placeholder="0.00"
                          required
                      />
                   </div>
                </div>
             </div>

             {/* Deadline & Category */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Deadline</label>
                   <V2DatePicker 
                     value={goalForm.deadline}
                     onChange={v => setGoalForm((f: any) => ({ ...f, deadline: v }))}
                   />
                </div>
                <V2Select 
                  label="Category"
                  value={goalForm.category}
                  onChange={v => setGoalForm((f: any) => ({ ...f, category: v }))}
                  options={[
                      { value: "Travel", label: "Travel" },
                      { value: "Property", label: "Property" },
                      { value: "Emergency", label: "Emergency Fund" },
                      { value: "Vehicle", label: "Vehicle" },
                      { value: "Other", label: "Other" },
                  ]}
                />
             </div>

             {/* Visual Customization */}
             <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 px-1">Icon & Colour</label>
                  <div className="flex flex-wrap gap-3 mb-4">
                      {icons.map(icon => (
                          <button 
                              key={icon}
                              type="button"
                              onClick={() => setGoalForm((f: any) => ({ ...f, icon }))}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all vylos-focus ${goalForm.icon === icon ? 'bg-primary/10 border border-primary text-primary' : 'bg-black/5 dark:bg-white/5 border border-white/10 text-text-muted'}`}
                          >
                              <GoalIcon iconName={icon} size={20} className={goalForm.icon === icon ? "text-primary" : "text-text-muted"} />
                          </button>
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                      {colors.map(color => (
                          <button 
                              key={color}
                              type="button"
                              onClick={() => setGoalForm((f: any) => ({ ...f, color }))}
                              className={`w-10 h-10 rounded-full transition-all vylos-focus ${goalForm.color === color ? 'ring-4 ring-offset-2 ring-primary scale-110' : 'scale-100'}`}
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
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-text-main outline-none transition-all min-h-[100px] vylos-focus" 
                      value={goalForm.notes} 
                      onChange={e => setGoalForm((f: any) => ({ ...f, notes: e.target.value }))} 
                      placeholder="Why are you saving for this?"
                   />
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-6 mt-2 border-t border-border-main/20 shrink-0">
            <button type="button" className="flex-1 py-4 text-sm font-black text-text-muted hover:text-text-main transition-colors vylos-focus rounded-xl" onClick={() => setShowAddGoal(false)}>Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 vylos-focus">Create Goal</button>
          </div>
        </form>
      </div>
    </Portal>
  );
}

export function BudgetModal({ budgetForm, setBudgetForm, setShowAddBudget, handleAddBudget }: any) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddBudget(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setShowAddBudget]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddBudget();
  };

  const categories = TRANSACTION_CATEGORIES.filter(c => !["Salary", "Business Income", "Refund", "Other Income"].includes(c));
  
  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-xl cursor-pointer" 
          onClick={() => setShowAddBudget(false)} 
        />
        <form 
          onSubmit={onSubmit}
          className="relative vylos-modal-glass rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Subtle top glow effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-text-main">Set Category Budget</h3>
            <button type="button" onClick={() => setShowAddBudget(false)} className="p-2 hover:bg-border-main rounded-xl transition-all vylos-focus">
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-2">
             <V2Select 
               label="Category"
               value={budgetForm.cat}
               onChange={v => setBudgetForm((f: any) => ({ ...f, cat: v }))}
               options={categories.map(c => ({ value: c, label: c }))}
             />
             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Monthly Limit (R)</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-2xl px-6 py-4 text-xl font-black text-text-main outline-none transition-all vylos-focus" 
                  type="number" 
                  value={budgetForm.limit} 
                  onChange={e => setBudgetForm((f: any) => ({ ...f, limit: e.target.value }))} 
                  required
                />
             </div>
          </div>

          <div className="flex gap-4 pt-6 mt-2 border-t border-border-main/20 shrink-0">
            <button type="button" className="flex-1 py-4 text-sm font-black text-text-muted hover:text-text-main transition-colors vylos-focus rounded-xl" onClick={() => setShowAddBudget(false)}>Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 vylos-focus">Set Budget</button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
