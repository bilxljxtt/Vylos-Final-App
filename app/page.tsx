"use client";

import { useState, useMemo, useEffect } from "react";
import { Bell, Plus, Search, Filter, Trash2, TrendingUp, Wallet, X, CalendarCheck, BrainCircuit } from "lucide-react";
import CashFlowChart from "@/components/charts/CashFlowChart";
import TrendsChart from "@/components/charts/TrendsChart";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import { AIRecommendation } from "@/lib/ai/FinancialAdvisor";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import {
  computeLiquidBalance,
  computeHealthScoreMetrics,
  computeTotalBudgetSpent,
  computeTotalBudgetLimit,
  formatMoney,
  TransactionCategory,
} from "@/lib/store";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { ImportTransactionsModal } from "@/components/import/ImportTransactionsModal";
import { Upload, BellDot } from "lucide-react";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { useTranslation } from "@/lib/i18n";

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
  const { state, addTransaction, deleteTransaction, addSubscription, deleteSubscription, sessionUser, isAuthLoaded } = useAppStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDueFilter, setShowDueFilter] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // New transaction form
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    category: "Other" as TransactionCategory,
    amount: "",
    type: "expense" as "income" | "expense",
  });

  const [subForm, setSubForm] = useState({
    name: "",
    category: "Subscriptions",
    frequency: "Monthly" as "Monthly" | "Annual" | "Weekly",
    nextDue: new Date().toISOString().split("T")[0],
    amount: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Computed
  const balance = useMemo(() => computeLiquidBalance(state), [state]);
  const healthMetrics = useMemo(() => computeHealthScoreMetrics(state), [state]);
  const score = healthMetrics.score;
  const totalSpent = useMemo(() => state.transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0), [state.transactions]);
  const totalLimit = useMemo(() => computeTotalBudgetLimit(state.budgets), [state.budgets]);
  const budgetPct  = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
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
  const chartData = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    return sorted.map((t) => {
      running += t.amount;
      return { name: new Date(t.date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }), balance: running };
    });
  }, [filteredTransactions]);
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter((t) => t.amount < 0).forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);
  const today = new Date().toISOString().split("T")[0];
  const soonDue = useMemo(() =>
    state.subscriptions.filter((s) => {
      const diff = (new Date(s.nextDue).getTime() - new Date(today).getTime()) / 86400000;
      return diff >= 0 && diff <= 7;
    }),
    [state.subscriptions, today]
  );
  
  // Prevent hydration mismatch by blocking render until mounted on client
  useEffect(() => {
    setIsMounted(true);
    if (sessionUser) {
      loadAIInsights();
    }
  }, [sessionUser]);

  async function loadAIInsights() {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      const data = await response.json();
      if (data.summary) setAiSummary(data.summary);
      if (data.recommendations) setRecommendations(data.recommendations);
    } catch (err) {
      console.error("AI Insights Error:", err);
    } finally {
      setAiLoading(false);
    }
  }

  if (!isMounted || !isAuthLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border-main border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // ─── LANDING PAGE (UNAUTHENTICATED) ─────────────────────────────────────────
  if (!sessionUser) {
    return (
      <div className="w-full flex-1 flex flex-col lg:flex-row h-screen bg-bg relative overflow-hidden transition-colors duration-300">
        {/* Left Side: Branding & Hero */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:pl-24 xl:pl-32 pt-20 pb-12 z-10">
          {/* Logo */}
          <div className="absolute top-10 left-8 sm:left-12 lg:left-24 xl:left-32">
            <BrandLogo size="md" />
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-text-main mb-6 leading-[1.1] tracking-tight">
              Master Your Money.<br />
              <span className="text-primary">Build Your Future.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-muted mb-12 max-w-lg leading-relaxed">
              The intelligent finance companion that helps you budget, set goals, and grow with confidence.
            </p>

            {/* Features Row */}
            <div className="flex flex-wrap gap-8 md:gap-12 mb-14">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <span className="text-xl">💰</span>
                </div>
                <h4 className="font-bold text-text-main text-sm">Smart Tracking</h4>
                <p className="text-xs text-text-muted">See where you stand.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-1">
                  <span className="text-xl">✨</span>
                </div>
                <h4 className="font-bold text-text-main text-sm">AI Guidance</h4>
                <p className="text-xs text-text-muted">Make smarter decisions.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1">
                  <span className="text-xl">📈</span>
                </div>
                <h4 className="font-bold text-text-main text-sm">Real Progress</h4>
                <p className="text-xs text-text-muted">Watch yourself grow.</p>
              </div>
            </div>

            {/* CTA */}
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-10 py-4 bg-primary hover:bg-opacity-90 transition-all text-white font-bold rounded-2xl shadow-lg shadow-primary/20 text-lg group"
            >
              Get Started
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Mockup Graphic */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-sidebar/50">
          <div className="relative w-[85%] aspect-[12/9] rounded-[3rem] border border-border-main bg-card shadow-2xl overflow-hidden transform translate-x-12 rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
            {/* Simulated App Screenshot / Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
            
            {/* Content Placeholder */}
            <div className="absolute inset-0 p-8 flex flex-col gap-6 opacity-40">
              <div className="h-8 w-1/3 bg-border-main rounded-full" />
              <div className="flex gap-4">
                <div className="h-32 flex-1 bg-border-main rounded-3xl" />
                <div className="h-32 flex-1 bg-border-main rounded-3xl" />
              </div>
              <div className="h-48 w-full bg-border-main rounded-3xl" />
            </div>

            {/* Floating Detail */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-card border border-border-main rounded-full shadow-xl flex items-center justify-center flex-col gap-2 scale-110">
              <div className="text-primary text-4xl font-black">82</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Health Score</div>
            </div>
          </div>

          {/* Decorative Blooms */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>
      </div>
    );
  }

  // Score label
  const scoreLabel = healthMetrics.label;
  const scoreColor =
    score >= 76 ? "text-emerald-500" : score >= 51 ? "text-yellow-500" : score >= 26 ? "text-amber-500" : "text-red-500";

  async function handleAddTransaction() {
    if (!txForm.merchant.trim() || !txForm.amount) return toast("Please fill all fields", "error");
    const amt = parseFloat(txForm.amount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid amount", "error");
    
    setIsLoading(true);
    try {
      await addTransaction({
        date: txForm.date,
        merchant: txForm.merchant.trim(),
        category: txForm.category,
        amount: txForm.type === "expense" ? -amt : amt,
      });
      toast(`Transaction added: ${txForm.merchant}`, "success");
      setShowTxModal(false);
      setTxForm({ date: new Date().toISOString().split("T")[0], merchant: "", category: "Other", amount: "", type: "expense" });
    } catch (err: any) {
      toast(err.message || "Failed to save transaction.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddSubscription() {
    if (!subForm.name.trim() || !subForm.amount) return toast("Please fill all fields", "error");
    const amt = parseFloat(subForm.amount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid amount", "error");
    
    setIsLoading(true);
    try {
      await addSubscription({ name: subForm.name.trim(), category: subForm.category, frequency: subForm.frequency, nextDue: subForm.nextDue, amount: amt });
      toast(`Subscription added: ${subForm.name}`, "success");
      setShowSubModal(false);
      setSubForm({ name: "", category: "Subscriptions", frequency: "Monthly", nextDue: new Date().toISOString().split("T")[0], amount: "" });
    } catch (err: any) {
      toast(err.message || "Failed to save subscription.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isMounted) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-text-main flex items-center gap-2">
            {t("welcome")}, {state.userProfile.name ? state.userProfile.name.split(" ")[0] : "Alex"}! <span>👋</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">{t("overview")}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 rounded-full bg-card border border-border-main flex items-center justify-center text-text-muted hover:text-primary transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {state.unreadNotificationCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-card" />
            )}
          </button>
          
          {/* Health Score Small Badge */}
          <div className="flex items-center gap-3 bg-card border border-border-main px-4 py-2 rounded-full shadow-sm cursor-pointer hover:bg-border-subtle transition-colors">
            <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center font-bold text-sm ${
              score >= 76 ? "border-emerald-500 text-emerald-500" : score >= 51 ? "border-yellow-500 text-yellow-500" : "border-red-500 text-red-500"
            }`}>
              {score}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Financial Health Score</span>
              <span className={`text-sm font-bold ${scoreColor}`}>{scoreLabel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── SMART ADVISOR ─────────────────────────────────────────── */}
      <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BrainCircuit className="w-40 h-40 text-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-text-main tracking-tight">Smart AI Advisor</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Personalized Insights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {aiLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-primary/10 rounded-full w-3/4" />
                  <div className="h-4 bg-primary/10 rounded-full w-1/2" />
                </div>
              ) : (
                <p className="text-lg font-medium text-text-main leading-relaxed italic">
                  &quot;{aiSummary || "Hold on, I'm analyzing your latest transactions to give you the best advice..."}&quot;
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="bg-card border border-border-main p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-primary uppercase tracking-wider">{rec.type}</span>
                    <div className="w-1 h-1 rounded-full bg-border-main" />
                    <span className="text-[10px] font-bold text-text-muted">Impact: {rec.impactScore}/10</span>
                  </div>
                  <h4 className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">{rec.title}</h4>
                </div>
              ))}
              {aiLoading && [1, 2].map(i => <div key={i} className="h-20 bg-card/50 rounded-2xl animate-pulse" />)}
            </div>
          </div>
        </div>
      </section>
      {/* ── 3 CARDS GRID ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* Monthly Income */}
        <div className="bg-card border border-border-main rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-text-muted text-xs font-semibold mb-1">Monthly Income</p>
          <h3 className="text-2xl font-bold text-text-main mb-3">{formatMoney(state.userProfile.monthlyIncome || 0, state.userProfile.country)}</h3>
          <p className="text-[11px] font-bold text-text-muted">Expected this month</p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-card border border-border-main rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-text-muted text-xs font-semibold mb-1">Monthly Expenses</p>
          <h3 className="text-2xl font-bold text-text-main mb-3">{formatMoney(totalSpent, state.userProfile.country)}</h3>
          <p className={`text-[11px] font-bold flex items-center gap-1 ${totalSpent > (state.userProfile.monthlyIncome || 0) * 0.8 ? "text-amber-500" : "text-emerald-500"}`}>
            <TrendingUp className="w-3 h-3" /> {(state.userProfile.monthlyIncome || 0) > 0 ? Math.round((totalSpent / (state.userProfile.monthlyIncome || 1)) * 100) : 0}% of income
          </p>
        </div>

        {/* Savings Rate */}
        <div className="bg-card border border-border-main rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-text-muted text-xs font-semibold mb-1">Savings Rate</p>
          <h3 className="text-2xl font-bold text-text-main mb-3">
            {healthMetrics.savingsRate === "High" ? "26%" : healthMetrics.savingsRate === "Moderate" ? "12%" : "4%"}
          </h3>
          <p className="text-[11px] font-bold text-primary flex items-center gap-1">
            ✦ On track to goal
          </p>
        </div>
      </section>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends & Cash Flow */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-sm border border-border-main transition-colors">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-main">Financial Trends</h3>
              <p className="text-sm text-text-muted">Income vs Expenses over the last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-text-muted uppercase">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-[10px] font-bold text-text-muted uppercase">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <TrendsChart />
          </div>
        </div>

        {/* Recent Transactions Panel */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border-main flex flex-col transition-colors max-h-[350px] overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-main">Recent Transactions</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {filteredTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg border border-border-main flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:border-primary/50 transition-colors">
                    {/* Add visual icon placeholder map based on name */}
                    <span className="text-lg opacity-80">{tx.category === "Dining Out" || tx.category === "Groceries" ? "🍔" : tx.category === "Subscriptions" ? "📺" : tx.category === "Transport" ? "🚗" : "💳"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{tx.merchant}</span>
                    <span className="text-xs font-semibold text-text-muted">{new Date(tx.date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-500" : "text-text-main"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatMoney(tx.amount, state.userProfile.country)}
                </span>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <p className="text-sm font-medium text-text-muted text-center py-6">No recent transactions</p>
            )}
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
              <h3 className="text-xl font-bold text-text-main">{t("transactions")}</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("search")}
                    className="pl-9 pr-4 py-2 bg-card rounded-full border border-border-main text-sm text-text-main focus:outline-none w-40 shadow-sm transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border-main text-text-main rounded-full text-sm font-semibold shadow-sm hover:bg-border-subtle transition-colors"
                >
                  <Upload className="w-4 h-4" /> Import
                </button>
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
                  <div className="flex justify-center gap-4 mt-3">
                    <button onClick={() => setShowTxModal(true)} className="text-sm font-bold text-primary hover:opacity-80">
                      + Add manually
                    </button>
                    <button onClick={() => setShowImportModal(true)} className="text-sm font-bold text-text-muted hover:text-text-main flex items-center gap-1.5 transition-colors">
                      <Upload className="w-4 h-4" /> Import Statement
                    </button>
                  </div>
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
                          {tx.amount >= 0 ? "+" : ""}{formatMoney(tx.amount, state.userProfile.country)}
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
                          <td className="py-3.5 font-bold text-text-main">{formatMoney(sub.amount, state.userProfile.country)}</td>
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
                        <span className="text-xs font-bold text-primary">{Math.floor(pct)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-border-main rounded-full overflow-hidden mb-1.5">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs font-semibold text-text-muted">
                        {formatMoney(g.currentAmount, state.userProfile.country)} / {formatMoney(g.targetAmount, state.userProfile.country)}
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
                  {formatMoney(state.goals.reduce((s, g) => s + g.currentAmount, 0), state.userProfile.country)}
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
                <p className="text-xs font-semibold text-text-muted">{formatMoney(totalSpent, state.userProfile.country)} spent</p>
                <p className="text-xs font-semibold text-text-muted">{formatMoney(totalLimit, state.userProfile.country)} limit</p>
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
          <button onClick={handleAddTransaction} disabled={isLoading}
            className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-full text-sm transition-opacity shadow-sm">
            {isLoading ? "Saving..." : "Add Transaction"}
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
          <button onClick={handleAddSubscription} disabled={isLoading}
            className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-full text-sm transition-opacity shadow-sm">
            {isLoading ? "Saving..." : "Add Subscription"}
          </button>
        </div>
      </Modal>

      {/* Notifications Drawer */}
      <NotificationDrawer 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        userId={sessionUser.id}
        country={state.userProfile.country}
      />

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
      {/* Import Transactions Modal */}
      <ImportTransactionsModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
}
