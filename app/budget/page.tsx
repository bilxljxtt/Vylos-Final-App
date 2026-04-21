"use client";

import { useState, useMemo, useEffect } from "react";
import { Pencil, Download, Lightbulb, TrendingUp, ShoppingCart, Repeat, Target, Home, Film, Car, ShoppingBag, Droplet, Receipt, Utensils, ShieldAlert, CheckSquare, X } from "lucide-react";
import { BudgetCard } from "@/components/BudgetCard";
import { Modal } from "@/components/Modal";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { computeTotalBudgetSpent, computeTotalBudgetLimit, formatMoney } from "@/lib/store";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Groceries: ShoppingCart,
  Subscriptions: Repeat,
  Savings: Target,
  Entertainment: Film,
  Housing: Home,
  Transport: Car,
  Shopping: ShoppingBag,
  Utilities: Droplet,
  Bills: Receipt,
  "Dining Out": Utensils,
  "Emergency Fund": ShieldAlert,
  M5: Target,
};

const LINKED_CATEGORIES = ["Emergency Fund","M5"];

export default function Budget() {
  const { state, updateBudgetLimit } = useAppStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{ evaluation: string; suggestion: string; score: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    loadAIAdvice();
  }, []);

  async function loadAIAdvice() {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "budget", 
          data: { budgets: state.budgets, totalSpent, totalLimit } 
        }),
      });
      const data = await response.json();
      if (!data.error) {
        setAiAdvice(data);
      }
    } catch (err) {
      console.error("AI Budget Advice Error:", err);
    } finally {
      setAiLoading(false);
    }
  }

  const allocCategories = useMemo(() => {
    return Object.keys(state.budgets).filter(
      (c) => state.budgets[c].type === "limit" && !LINKED_CATEGORIES.includes(c)
    );
  }, [state.budgets]);

  const totalSpent = useMemo(() => computeTotalBudgetSpent(state.budgets), [state.budgets]);
  const totalLimit = useMemo(() => computeTotalBudgetLimit(state.budgets), [state.budgets]);
  const variance   = totalLimit - totalSpent;
  const topSpend   = useMemo(() => {
    return Object.entries(state.budgets)
      .filter(([, b]) => b.type === "limit")
      .sort(([, a], [, b]) => b.spent - a.spent)[0];
  }, [state.budgets]);

  function openEdit(category: string) {
    setNewLimit(String(state.budgets[category]?.limit ?? ""));
    setEditCategory(category);
  }

  async function handleSaveLimit() {
    if (!editCategory) return;
    const val = parseFloat(newLimit);
    if (isNaN(val) || val < 0) return toast("Enter a valid limit", "error");
    setIsLoading(true);
    try {
      await updateBudgetLimit(editCategory, val);
      toast(`${editCategory} limit updated to ${formatMoney(val, state.userProfile.country)}`, "success");
      setEditCategory(null);
    } catch (err: any) {
      toast(err.message || "Failed to update budget limit.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return toast("Category name required", "error");
    const val = parseFloat(newCatLimit);
    if (isNaN(val) || val < 0) return toast("Enter a valid limit", "error");
    setIsLoading(true);
    try {
      await updateBudgetLimit(newCatName.trim(), val);
      toast(`${newCatName} category created`, "success");
      setShowAddCat(false);
      setNewCatName("");
      setNewCatLimit("");
    } catch (err: any) {
      toast(err.message || "Failed to add category.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function handleExportCSV() {
    const rows = [["Category","Spent","Limit","Type","% Used"]];
    Object.entries(state.budgets).forEach(([cat, b]) => {
      const pct = b.limit > 0 ? ((b.spent / b.limit) * 100).toFixed(1) : "0";
      rows.push([cat, String(b.spent), String(b.limit), b.type, pct + "%"]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "vylos_budget.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Budget exported as CSV", "success");
  }

  const allocCount = allocCategories.length;

  if (!isMounted) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">

      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">{t("budgets")}</h1>
          <p className="text-text-muted font-medium mt-2 max-w-xl">
            {t("overview")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border-main rounded-full text-sm font-semibold text-primary shadow-sm hover:bg-border-subtle transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* AI BUDGET ADVISOR */}
      <section className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[2rem] pt-8 px-8 pb-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Advisor</h3>
            <p className="text-indigo-300 text-sm">Real-time analysis powered by Vylos AI</p>
          </div>
        </div>

        <div className="relative z-10 bg-card rounded-3xl p-6 shadow-sm space-y-4 min-h-[200px] flex flex-col justify-center">
          {aiLoading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-text-muted text-sm font-bold animate-pulse uppercase tracking-widest">Calibrating Strategy...</p>
            </div>
          ) : aiAdvice ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h4 className="font-bold text-lg text-text-main">Strategic Evaluation</h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Discipline Score</span>
                    <span className="text-2xl font-black text-primary">{aiAdvice.score}</span>
                  </div>
               </div>
               
               <p className="text-text-main font-medium text-sm leading-relaxed">&quot;{aiAdvice.evaluation}&quot;</p>
               
               <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Tactical Reallocation</span>
                  </div>
                  <p className="text-sm font-bold text-text-main leading-relaxed">{aiAdvice.suggestion}</p>
               </div>

               <div className="flex items-center gap-4 text-[11px] text-text-muted font-bold uppercase tracking-wider px-2">
                  <span>Total Budget: {formatMoney(totalLimit, state.userProfile.country)}</span>
                  <span>·</span>
                  <span>Spent: {formatMoney(totalSpent, state.userProfile.country)}</span>
               </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">Select budget data to begin AI calibration.</p>
              <button onClick={loadAIAdvice} className="mt-4 text-xs font-black text-primary uppercase tracking-widest hover:underline">Retry Analysis</button>
            </div>
          )}
        </div>

        <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ALLOCATION PROTOCOL */}
      <section>
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <h3 className="text-2xl font-black text-text-main tracking-tight">Allocation Protocol</h3>
          <span className="text-xs font-bold bg-card px-3 py-1 rounded-full text-text-muted shadow-sm border border-border-main">
            {allocCount} Categories
          </span>
          <button onClick={() => setShowAddCat(true)} className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
            + Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allocCategories.map((cat) => {
            const b = state.budgets[cat];
            if (!b) return null;
            const Icon = CATEGORY_ICONS[cat] ?? Target;
            return (
              <BudgetCard
                key={cat}
                title={cat}
                icon={Icon}
                amountSpent={b.spent}
                amountLimit={b.limit}
                type={b.type}
                onEditLimit={() => openEdit(cat)}
              />
            );
          })}
        </div>
      </section>

      {/* LINKED FINANCIAL TARGETS */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-black text-text-main tracking-tight">Linked Financial Targets</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LINKED_CATEGORIES.map((cat) => {
            const b = state.budgets[cat];
            if (!b) return null;
            const Icon = CATEGORY_ICONS[cat] ?? Target;
            return (
              <BudgetCard
                key={cat}
                title={cat}
                icon={Icon}
                amountSpent={b.spent}
                amountLimit={b.limit}
                type={b.type}
                onEditLimit={() => openEdit(cat)}
              />
            );
          })}
        </div>
      </section>

      {/* Edit Limit Modal */}
      <Modal isOpen={!!editCategory} onClose={() => setEditCategory(null)} title={`Edit ${editCategory} Limit`} maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-text-muted font-medium">
            Current limit: <strong className="text-text-main">{editCategory ? formatMoney(state.budgets[editCategory]?.limit ?? 0, state.userProfile.country) : ""}</strong>
          </p>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">New Limit (R)</label>
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="0.00"
              min="0"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={handleSaveLimit} disabled={isLoading} className="w-full py-3 bg-primary disabled:opacity-50 hover:opacity-90 transition-opacity text-white font-bold rounded-full text-sm">
            {isLoading ? "Saving..." : "Update Limit"}
          </button>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={showAddCat} onClose={() => setShowAddCat(false)} title="Add Category" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Category Name</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Vacation"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Monthly Limit (R)</label>
            <input
              type="number"
              value={newCatLimit}
              onChange={(e) => setNewCatLimit(e.target.value)}
              placeholder="0.00"
              min="0"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={handleAddCategory} className="w-full py-3 bg-primary hover:opacity-90 transition-opacity text-white font-bold rounded-full text-sm">
            Create Category
          </button>
        </div>
      </Modal>
    </div>
  );
}
