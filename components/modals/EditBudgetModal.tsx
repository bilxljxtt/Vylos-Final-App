"use client";

import React, { useState, useEffect } from "react";
import { X, DollarSign, PieChart, Plus, Trash2, Info, Layout, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { TransactionCategory, TRANSACTION_CATEGORIES } from "@/lib/store";

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_CATEGORIES: TransactionCategory[] = [
  "Groceries", "Eating Out", "Transport", "Bills", "Rent / Housing", "Subscriptions", "Shopping", "Entertainment", "Health"
];

export function EditBudgetModal({ isOpen, onClose }: EditBudgetModalProps) {
  const { state, updateBudgets, updateProfile, formatCurrency } = useAppStore();
  const [income, setIncome] = useState(state.userProfile.monthlyIncome || 0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize budgets from state
  useEffect(() => {
    if (isOpen) {
      const bObj: Record<string, number> = {};
      // Use existing categories from state.budgets first
      Object.entries(state.budgets).forEach(([cat, b]) => {
        if (b.type === 'limit') bObj[cat] = b.limit || 0;
      });

      // Ensure initial set exists
      INITIAL_CATEGORIES.forEach(cat => {
        if (bObj[cat] === undefined) bObj[cat] = 0;
      });

      setBudgets(bObj);
      setIncome(state.userProfile.monthlyIncome || 0);
      
      const currentTotal = Object.values(bObj).reduce((a, b) => a + b, 0);
      setTotalBudget(currentTotal);
    }
  }, [isOpen, state.budgets, state.userProfile.monthlyIncome]);

  if (!isOpen) return null;

  const handleUpdateLimit = (cat: string, val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setBudgets(prev => ({ ...prev, [cat]: num }));
  };

  const handleAddCategory = () => {
    const name = prompt("Enter category name:");
    if (name) {
      // Validate category name matches available or is custom
      setBudgets(prev => ({ ...prev, [name]: 0 }));
    }
  };

  const handleRemoveCategory = (cat: string) => {
    const newB = { ...budgets };
    delete newB[cat];
    setBudgets(newB);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Update Income if changed
      if (income !== state.userProfile.monthlyIncome) {
        await updateProfile({ monthlyIncome: income });
      }

      // 2. Update Budgets
      await updateBudgets(budgets);
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const currentCategoriesTotal = Object.values(budgets).reduce((a, b) => a + b, 0);
  const exceedsTotal = totalBudget > 0 && currentCategoriesTotal > totalBudget;
  const remainingBudget = Math.max(0, totalBudget - currentCategoriesTotal);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <form onSubmit={handleSubmit} className="relative bg-card border border-border-main w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-border-main flex items-center justify-between bg-emerald-500/5 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <PieChart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-main tracking-tight">Financial Plan</h2>
              <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest">Edit Income & Budgets</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-border-main rounded-xl transition-all">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Income & Total Budget Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                Monthly Income
              </h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">R</span>
                <input 
                  type="number" 
                  step="1"
                  placeholder="0"
                  className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-text-main outline-none focus:border-primary/50 transition-all"
                  value={income || ""}
                  onChange={e => setIncome(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                <PieChart size={16} className="text-primary" />
                Total Monthly Budget
              </h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">R</span>
                <input 
                  required
                  type="number" 
                  step="1"
                  placeholder="0"
                  className="w-full bg-border-main/20 border border-border-main rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-text-main outline-none focus:border-primary/50 transition-all"
                  value={totalBudget || ""}
                  onChange={e => setTotalBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                <Layout size={16} className="text-primary" />
                Category Allocation
              </h3>
              <button 
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 hover:bg-primary/10 transition-all"
              >
                <Plus size={14} strokeWidth={3} />
                Add Category
              </button>
            </div>

            {exceedsTotal && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-amber-500 animate-in fade-in slide-in-from-top-1">
                <AlertTriangle size={18} className="shrink-0" />
                <p className="text-[11px] font-bold">Category budgets exceed your total budget by {formatCurrency(currentCategoriesTotal - totalBudget)}.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(budgets).map(([cat, limit]) => (
                <div key={cat} className="bg-border-main/10 border border-border-main rounded-2xl p-4 flex flex-col gap-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-text-main truncate max-w-[120px]">{cat}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted opacity-50">R</span>
                    <input 
                      type="number"
                      step="1"
                      className="w-full bg-bg border border-border-main rounded-xl pl-8 pr-3 py-2 text-sm font-black text-text-main outline-none focus:border-primary/50 transition-all"
                      value={limit || ""}
                      onChange={e => handleUpdateLimit(cat, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Banner */}
          <div className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${exceedsTotal ? 'bg-red-500/10 border-red-500/20' : 'bg-primary/5 border-primary/20'}`}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Unallocated Budget</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black tracking-tight ${remainingBudget < 0 ? 'text-red-500' : 'text-text-main'}`}>
                  {formatCurrency(remainingBudget)}
                </span>
                <span className="text-xs font-bold text-text-muted">Remaining</span>
              </div>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Categories Total</span>
              <span className="text-xl font-black text-text-main tracking-tight">{formatCurrency(currentCategoriesTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-border-main/20 border-t border-border-main flex gap-4 flex-shrink-0">
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
            {loading ? "Saving Plan..." : "Save Financial Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}
