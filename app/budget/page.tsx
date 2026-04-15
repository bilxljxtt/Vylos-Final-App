"use client";

import { useState, useMemo } from "react";
import { Pencil, Download, Lightbulb, TrendingUp, ShoppingCart, Repeat, Target, Home, Film, Car, ShoppingBag, Droplet, Receipt, Utensils, ShieldAlert, CheckSquare, X } from "lucide-react";
import { BudgetCard } from "@/components/BudgetCard";
import { Modal } from "@/components/Modal";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { computeTotalBudgetSpent, computeTotalBudgetLimit, formatZAR } from "@/lib/store";
import { LucideIcon } from "lucide-react";

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

  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");

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

  function handleSaveLimit() {
    if (!editCategory) return;
    const val = parseFloat(newLimit);
    if (isNaN(val) || val < 0) return toast("Enter a valid limit", "error");
    updateBudgetLimit(editCategory, val);
    toast(`${editCategory} limit updated to ${formatZAR(val)}`, "success");
    setEditCategory(null);
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return toast("Category name required", "error");
    const val = parseFloat(newCatLimit);
    if (isNaN(val) || val < 0) return toast("Enter a valid limit", "error");
    updateBudgetLimit(newCatName.trim(), val);
    toast(`${newCatName} category created`, "success");
    setShowAddCat(false);
    setNewCatName("");
    setNewCatLimit("");
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">

      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">Strategic Calibration</h1>
          <p className="text-text-muted font-medium mt-2 max-w-xl">
            Optimize your capital allocation. Click any card&apos;s limit to update it, or use AI to recalibrate.
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
            <h3 className="text-xl font-bold text-white">AI Budget Advisor</h3>
            <p className="text-indigo-300 text-sm">Real-time analysis based on your current data</p>
          </div>
        </div>

        <div className="relative z-10 bg-card rounded-3xl p-6 shadow-sm space-y-4">
          {variance >= 0 ? (
            <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-lg text-emerald-600">
                  Positive Variance: +{formatZAR(variance)}
                </h4>
              </div>
              <p className="text-emerald-600/80 font-medium text-sm mb-3">You are spending less than budgeted — great discipline!</p>
              <p className="text-text-muted text-sm">
                Total budget: <strong className="text-text-main">{formatZAR(totalLimit)}</strong> &nbsp;·&nbsp; Spent so far: <strong className="text-text-main">{formatZAR(totalSpent)}</strong>
              </p>
            </div>
          ) : (
            <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h4 className="font-bold text-lg text-red-600">Over Budget: {formatZAR(Math.abs(variance))}</h4>
              </div>
              <p className="text-red-500/80 font-medium text-sm">You have exceeded your total monthly budget. Review your limits.</p>
            </div>
          )}

          {topSpend && (
            <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <p className="font-bold text-primary text-sm">
                  Highest spend category: <strong>{topSpend[0]}</strong> ({formatZAR(topSpend[1].spent)})
                </p>
              </div>
              {topSpend[1].spent > topSpend[1].limit ? (
                <p className="text-text-muted text-sm">⚠️ This category is <strong className="text-text-main">over its limit</strong>. Consider adjusting.</p>
              ) : (
                <p className="text-text-muted text-sm">This is currently within budget — keep monitoring it.</p>
              )}
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
            Current limit: <strong className="text-text-main">{editCategory ? formatZAR(state.budgets[editCategory]?.limit ?? 0) : ""}</strong>
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
          <button onClick={handleSaveLimit} className="w-full py-3 bg-primary hover:opacity-90 transition-opacity text-white font-bold rounded-full text-sm">
            Update Limit
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
