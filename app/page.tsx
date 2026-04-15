"use client";

import { useState, useMemo } from "react";
import { Bell, Plus, Search, Filter, Trash2, TrendingUp, Wallet, X, CalendarCheck } from "lucide-react";
import CashFlowChart from "@/components/charts/CashFlowChart";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import {
  computeNetWorth,
  computeHealthScore,
  computeTotalBudgetSpent,
  computeTotalBudgetLimit,
  formatZAR,
  TransactionCategory,
} from "@/lib/store";
import Link from "next/link";

const CATEGORIES: TransactionCategory[] = [
  "Utilities","Emergency Fund","Side Hustle","Dining Out","Subscriptions",
  "Groceries","Transport","Shopping","Entertainment","Housing","Bills","Other",
];

function getDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export default function Dashboard() {
  const { state, addTransaction, deleteTransaction, addSubscription, deleteSubscription } = useAppStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDueFilter, setShowDueFilter] = useState(false);

  // New transaction form
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    category: "Other" as TransactionCategory,
    amount: "",
    type: "expense" as "income" | "expense",
  });

  // New subscription form
  const [subForm, setSubForm] = useState({
    name: "",
    category: "Subscriptions",
    frequency: "Monthly" as "Monthly" | "Annual" | "Weekly",
    nextDue: new Date().toISOString().split("T")[0],
    amount: "",
  });

  // Computed
  const netWorth   = useMemo(() => computeNetWorth(state.transactions), [state.transactions]);
  const score      = useMemo(() => computeHealthScore(state), [state]);
  const totalSpent = useMemo(() => computeTotalBudgetSpent(state.budgets), [state.budgets]);
  const totalLimit = useMemo(() => computeTotalBudgetLimit(state.budgets), [state.budgets]);
  const budgetPct  = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  // Score label
  const scoreLabel =
    score >= 750 ? "Excellent" : score >= 650 ? "Good" : score >= 550 ? "Fair" : "Needs Attention";
  const scoreColor =
    score >= 750 ? "text-emerald-500" : score >= 650 ? "text-amber-500" : score >= 550 ? "text-amber-500" : "text-red-500";

  // Default to 30 days
  const cutoff = getDaysAgo(30);

  const filteredTransactions = useMemo(() =>
    state.transactions.filter((t) => {
      const matchesTime = t.date >= cutoff;
      const matchesSearch =
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchesTime && matchesSearch;
    }),
    [state.transactions, cutoff, search]
  );

  // Chart data
  const chartData = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    return sorted.map((t) => {
      running += t.amount;
      return { name: new Date(t.date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }), balance: running };
    });
  }, [filteredTransactions]);

  // Pie chart data
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter((t) => t.amount < 0).forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Due-soon subscriptions
  const today = new Date().toISOString().split("T")[0];
  const soonDue = useMemo(() =>
    state.subscriptions.filter((s) => {
      const diff = (new Date(s.nextDue).getTime() - new Date(today).getTime()) / 86400000;
      return diff >= 0 && diff <= 7;
    }),
    [state.subscriptions, today]
  );

  function handleAddTransaction() {
    if (!txForm.merchant.trim() || !txForm.amount) return toast("Please fill all fields", "error");
    const amt = parseFloat(txForm.amount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid amount", "error");
    addTransaction({
      date: txForm.date,
      merchant: txForm.merchant.trim(),
      category: txForm.category,
      amount: txForm.type === "expense" ? -amt : amt,
    });
    toast(`Transaction added: ${txForm.merchant}`, "success");
    setShowTxModal(false);
    setTxForm({ date: new Date().toISOString().split("T")[0], merchant: "", category: "Other", amount: "", type: "expense" });
  }

  function handleAddSubscription() {
    if (!subForm.name.trim() || !subForm.amount) return toast("Please fill all fields", "error");
    const amt = parseFloat(subForm.amount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid amount", "error");
    addSubscription({ name: subForm.name.trim(), category: subForm.category, frequency: subForm.frequency, nextDue: subForm.nextDue, amount: amt });
    toast(`Subscription added: ${subForm.name}`, "success");
    setShowSubModal(false);
    setSubForm({ name: "", category: "Subscriptions", frequency: "Monthly", nextDue: new Date().toISOString().split("T")[0], amount: "" });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Financial Command</h1>
          <p className="text-text-muted font-medium mt-1">
            Welcome back, <span className="font-bold text-primary">{state.userProfile.name}</span>. Your systems are live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2.5 bg-card border border-border-main rounded-full text-text-muted shadow-sm hover:bg-border-subtle transition-colors"
          >
            <Bell className="w-4 h-4" />
            {soonDue.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-card rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* ── HEALTH SCORE HERO ──────────────────────────────────────────── */}
      <section className="bg-card border border-border-main rounded-[2.5rem] p-10 flex items-center justify-between shadow-sm relative overflow-hidden transition-colors">
        <div className="relative z-10 space-y-2">
          <p className="text-text-muted uppercase tracking-widest text-xs font-bold font-mono">FINANCIAL HEALTH SCORE</p>
          <h2 className="text-6xl font-black text-text-main">{score}</h2>
          <p className={`font-semibold flex items-center gap-2 ${scoreColor}`}>
            {scoreLabel} <TrendingUp className="w-4 h-4" />
          </p>
        </div>
        <div className="relative z-10 text-right space-y-2">
          <p className="text-text-muted tracking-wide text-sm font-medium">Total Net Worth</p>
          <h3 className={`text-4xl font-bold ${netWorth >= 0 ? "text-text-main" : "text-red-500"}`}>
            {formatZAR(netWorth)}
          </h3>
        </div>
      </section>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-sm border border-border-main transition-colors">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-text-main">Net Cash Flow</h3>
            <p className="text-sm text-text-muted">Cumulative balance</p>
          </div>
          <div className="h-[260px] w-full mt-4">
            <CashFlowChart data={chartData.length > 0 ? chartData : undefined} />
          </div>
        </div>

        {/* Pie */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border-main flex flex-col transition-colors">
          <h3 className="text-lg font-bold text-text-main text-center mb-2">Expenses by Category</h3>
          <div className="h-[180px] w-full flex items-center justify-center">
            <ExpensePieChart data={pieData.length > 0 ? pieData : undefined} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold">
            {(pieData.length > 0 ? pieData : []).slice(0, 4).map((d, i) => {
              const colors = ["bg-amber-400","bg-primary","bg-rose-500","bg-violet-500"];
              return (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                  <span className="text-text-muted">{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DATA ROW ────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Transactions + Subscriptions */}
        <div className="lg:col-span-2 space-y-8">

          {/* Transactions */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h3 className="text-xl font-bold text-text-main">Transactions</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 bg-card rounded-full border border-border-main text-sm text-text-main focus:outline-none w-40 shadow-sm transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowTxModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-full text-sm font-semibold shadow-sm transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border-main transition-colors overflow-hidden">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-text-muted font-medium">No transactions found</p>
                  <button onClick={() => setShowTxModal(true)} className="mt-3 text-sm font-bold text-primary hover:opacity-80">
                    + Add your first transaction
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    <tr>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Merchant</th>
                      <th className="pb-4 text-center">Category</th>
                      <th className="pb-4 text-right">Amount</th>
                      <th className="pb-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="group hover:bg-border-subtle transition-colors">
                        <td className="py-3.5 font-medium text-text-muted text-xs">
                          {new Date(tx.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                        </td>
                        <td className="py-3.5 font-semibold text-text-main">{tx.merchant}</td>
                        <td className="py-3.5 text-center">
                          <span className="inline-flex bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full text-xs">
                            {tx.category}
                          </span>
                        </td>
                        <td className={`py-3.5 font-bold text-right ${tx.amount >= 0 ? "text-emerald-500" : "text-text-main"}`}>
                          {tx.amount >= 0 ? "+" : ""}{formatZAR(tx.amount)}
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => setDeleteId(tx.id)}
                            className="opacity-50 hover:opacity-100 text-text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Subscriptions */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h3 className="text-xl font-bold text-text-main">Recurring Subscriptions</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDueFilter(!showDueFilter)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold shadow-sm transition-all ${
                    showDueFilter
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "bg-card border-border-main text-text-main hover:bg-border-subtle"
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Due Soon
                  {soonDue.length > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                      {soonDue.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowSubModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border-main transition-colors overflow-hidden">
              {state.subscriptions.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-text-muted font-medium">No subscriptions tracked yet</p>
                  <button onClick={() => setShowSubModal(true)} className="mt-3 text-sm font-bold text-primary hover:opacity-80">
                    + Add a subscription
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    <tr>
                      <th className="pb-4">Service</th>
                      <th className="pb-4">Frequency</th>
                      <th className="pb-4">Next Due</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {(showDueFilter ? soonDue : state.subscriptions).map((sub) => {
                      const diff = Math.ceil((new Date(sub.nextDue).getTime() - Date.now()) / 86400000);
                      return (
                        <tr key={sub.id} className="group hover:bg-border-subtle transition-colors">
                          <td className="py-3.5">
                            <p className="font-bold text-text-main">{sub.name}</p>
                            <p className="text-xs text-text-muted">{sub.category}</p>
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide">
                              {sub.frequency}
                            </span>
                          </td>
                          <td className="py-3.5 font-medium text-text-muted text-xs">
                            {new Date(sub.nextDue).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                            {diff >= 0 && diff <= 7 && (
                              <span className="ml-2 text-amber-500 font-bold">{diff === 0 ? "Today!" : `${diff}d`}</span>
                            )}
                          </td>
                          <td className="py-3.5 font-bold text-text-main">{formatZAR(sub.amount)}</td>
                          <td className="py-3.5 text-center">
                            <button
                              onClick={() => setDeleteSubId(sub.id)}
                              className="opacity-50 hover:opacity-100 text-text-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Side Widgets */}
        <div className="space-y-6">

          {/* Savings Goals */}
          <div className="bg-card rounded-[2rem] p-6 shadow-sm border border-border-main transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black tracking-widest text-text-muted uppercase">Savings Goals</h3>
              <div className="p-1.5 bg-border-subtle rounded-full text-primary">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3">
              {state.goals.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">No goals yet</p>
              ) : (
                state.goals.map((g) => {
                  const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                  return (
                    <div key={g.id} className="bg-border-subtle/50 rounded-2xl p-3 border border-border-subtle">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-text-main text-sm">{g.title}</h4>
                        <span className="text-xs font-bold text-primary">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-border-main rounded-full overflow-hidden mb-1.5">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs font-semibold text-text-muted">
                        {formatZAR(g.currentAmount)} / {formatZAR(g.targetAmount)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted mb-1">Total Saved</p>
                <h3 className="text-3xl font-bold text-text-main">
                  {formatZAR(state.goals.reduce((s, g) => s + g.currentAmount, 0))}
                </h3>
              </div>
              <Link href="/goals" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity">
                Details →
              </Link>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="bg-card rounded-[2rem] p-6 shadow-sm border border-border-main transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black tracking-widest text-text-muted uppercase">Budget Progress</h3>
              <div className="p-1.5 bg-border-subtle rounded-full text-primary">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-text-main">Monthly Budget</p>
                <p className={`font-bold text-sm ${budgetPct > 90 ? "text-red-500" : budgetPct > 70 ? "text-amber-500" : "text-primary"}`}>
                  {budgetPct}% Used
                </p>
              </div>
              <div className="w-full bg-border-subtle h-3 rounded-full overflow-hidden my-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs font-semibold text-text-muted">{formatZAR(totalSpent)} spent</p>
                <p className="text-xs font-semibold text-text-muted">{formatZAR(totalLimit)} limit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODALS ─────────────────────────────────────────────────────── */}

      {/* Add Transaction Modal */}
      <Modal isOpen={showTxModal} onClose={() => setShowTxModal(false)} title="Add Transaction">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTxForm({ ...txForm, type: t })}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${
                  txForm.type === t
                    ? t === "expense" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                    : "bg-border-subtle text-text-muted hover:text-text-main hover:bg-border-main"
                }`}
              >
                {t === "expense" ? "Expense" : "Income"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Date</label>
            <input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Merchant / Description</label>
            <input type="text" value={txForm.merchant} onChange={(e) => setTxForm({ ...txForm, merchant: e.target.value })}
              placeholder="e.g. Checkers, Salary"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Category</label>
            <select value={txForm.category} onChange={(e) => setTxForm({ ...txForm, category: e.target.value as TransactionCategory })}
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Amount (R)</label>
            <input type="number" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
              placeholder="0.00" min="0"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <button onClick={handleAddTransaction}
            className="w-full py-3 bg-primary hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity shadow-sm">
            Add Transaction
          </button>
        </div>
      </Modal>

      {/* Add Subscription Modal */}
      <Modal isOpen={showSubModal} onClose={() => setShowSubModal(false)} title="Add Subscription">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Service Name</label>
            <input type="text" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              placeholder="e.g. Netflix"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Frequency</label>
            <select value={subForm.frequency} onChange={(e) => setSubForm({ ...subForm, frequency: e.target.value as "Monthly" | "Annual" | "Weekly" })}
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
              <option>Monthly</option><option>Annual</option><option>Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Next Due Date</label>
            <input type="date" value={subForm.nextDue} onChange={(e) => setSubForm({ ...subForm, nextDue: e.target.value })}
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Amount (R)</label>
            <input type="number" value={subForm.amount} onChange={(e) => setSubForm({ ...subForm, amount: e.target.value })}
              placeholder="0.00" min="0"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium text-text-main bg-bg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <button onClick={handleAddSubscription}
            className="w-full py-3 bg-primary hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity shadow-sm">
            Add Subscription
          </button>
        </div>
      </Modal>

      {/* Notifications Drawer */}
      <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Notifications">
        {soonDue.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-border-subtle flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <p className="text-text-muted font-medium">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {soonDue.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <CalendarCheck className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-text-main text-sm">{sub.name} due soon</p>
                  <p className="text-xs text-text-muted">{formatZAR(sub.amount)} on {new Date(sub.nextDue).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Transaction Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) { deleteTransaction(deleteId); toast("Transaction deleted", "info"); }
        }}
        title="Delete Transaction"
        message="Remove this transaction? This cannot be undone."
      />

      {/* Delete Subscription Confirm */}
      <ConfirmDialog
        isOpen={!!deleteSubId}
        onClose={() => setDeleteSubId(null)}
        onConfirm={() => {
          if (deleteSubId) { deleteSubscription(deleteSubId); toast("Subscription removed", "info"); }
        }}
        title="Remove Subscription"
        message="Stop tracking this subscription?"
      />
    </div>
  );
}
