"use client";

import React, { useState } from "react";
import { X, Plus, DollarSign, Wallet, Target } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { TransactionCategory, TRANSACTION_CATEGORIES } from "@/lib/store";

interface FundCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type?: any) => void;
  initialCategory?: TransactionCategory;
}

export function FundCategoryModal({ isOpen, onClose, showToast, initialCategory }: FundCategoryModalProps) {
  const { state, updateBudgetLimit, formatCurrency } = useAppStore();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Shopping");
  const [loading, setLoading] = useState(false);

  // Sync category when modal opens or initialCategory changes
  React.useEffect(() => {
    if (isOpen && initialCategory) {
      setCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      // Instead of adding a "fake" transaction, we update the budget limit directly
      const currentLimit = state.budgets[category]?.limit || 0;
      const newAmount = parseFloat(amount);
      
      await updateBudgetLimit(category, currentLimit + newAmount);
      
      showToast?.(`Successfully allocated ${formatCurrency(newAmount)} to ${category}`, "success");
      onClose();
      setAmount("");
    } catch (err) {
      console.error(err);
      showToast?.("Failed to update budget limit", "error");
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = TRANSACTION_CATEGORIES.filter(c => 
    !["Salary", "Business Income", "Refund", "Other Income"].includes(c)
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <form onSubmit={handleSubmit} className="relative bg-card border border-border-main w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border-main flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Plus size={20} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-main tracking-tight">Add to Budget</h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Fund a Category</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-border-main rounded-xl transition-all">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Select Category</label>
            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-hide">
              {expenseCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat as TransactionCategory)}
                  className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all text-left truncate
                    ${category === cat 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-border-main/20 border-border-main text-text-muted hover:border-primary/30'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Amount to Add</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">R</span>
              <input 
                required
                type="number" 
                step="0.01"
                placeholder="0.00"
                className="w-full bg-border-main/20 border border-border-main rounded-xl pl-10 pr-4 py-4 text-xl font-black text-text-main outline-none focus:border-primary/50 transition-all"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-[10px] font-medium text-text-muted px-1">
              This will increase the available funds for <span className="text-primary font-bold">{category}</span> this month.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-border-main/10 border-t border-border-main flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 bg-card border border-border-main text-text-main text-xs font-black rounded-xl hover:bg-border-main transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading || !amount}
            className="flex-[2] py-3.5 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-emerald-400 transition-all disabled:opacity-50"
          >
            {loading ? "Adding..." : `Add ${amount ? formatCurrency(parseFloat(amount)) : ''} to ${category}`}
          </button>
        </div>
      </form>
    </div>
  );
}
