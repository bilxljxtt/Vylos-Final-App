"use client";

import React, { useState } from "react";
import { Plus, 
  Trash2, 
  Search, 
  Download, 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  MoreHorizontal, 
  ArrowRight,
  Filter,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Coffee,
  CreditCard,
  Building2,
  Car,
  ShoppingBag,
  Zap,
  Globe,
  Briefcase
} from "lucide-react";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { ViewContainer } from "../ui/ViewContainer";

interface TransactionsViewProps {
  transactions: any[];
  filterCat: string;
  setFilterCat: (cat: string) => void;
  setShowAddTx: (show: boolean) => void;
  deleteTx: (id: string) => void;
}

const MERCHANT_ICONS: Record<string, React.ReactNode> = {
  "Starbucks": <Coffee size={16} />,
  "Netflix": <Globe size={16} />,
  "Uber": <Car size={16} />,
  "Amazon": <ShoppingBag size={16} />,
  "Salary": <Briefcase size={16} />,
  "Freelance": <Briefcase size={16} />,
  "Electricity": <Zap size={16} />,
  "Rent": <Building2 size={16} />,
  "Dining": <Coffee size={16} />,
  "Grocery": <ShoppingBag size={16} />,
  "Interest": <Wallet size={16} />,
};

export const TransactionsView: React.FC<TransactionsViewProps> = ({ 
  transactions, 
  filterCat, 
  setFilterCat, 
  setShowAddTx, 
  deleteTx 
}) => {
  const { formatCurrency } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === "All" || t.category === filterCat;
    const matchesType = filterType === "All Types" || (filterType === "Expense" ? t.amount < 0 : t.amount > 0);
    return matchesSearch && matchesCat && matchesType;
  });

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const netCashFlow = totalIncome - totalExpense;

  return (
    <ViewContainer className="flex flex-col pt-8 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-text-main tracking-tight mb-2">Transactions</h1>
          <p className="text-text-muted font-medium">Track your spending, review your transactions, and stay in control.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border-main rounded-xl text-sm font-black text-text-main shadow-sm hover:border-border-strong transition-all">
                <Download size={18} className="text-text-muted" />
                Export
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border-main rounded-xl text-sm font-black text-text-main shadow-sm hover:border-border-strong transition-all">
                <Calendar size={18} className="text-text-muted" />
                Jun 1 - Jun 30, 2024
                <ChevronDown size={18} className="text-text-muted ml-2" />
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Income</span>
            <span className="text-xl font-black text-text-main tracking-tight">{formatCurrency(totalIncome)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                <ArrowUpRight size={10} />
                7.4% from May
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <TrendingDown size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Expenses</span>
            <span className="text-xl font-black text-text-main tracking-tight">{formatCurrency(totalExpense)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 mt-1">
                <ArrowUpRight size={10} className="rotate-90" />
                6.8% from May
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Net Cash Flow</span>
            <span className="text-xl font-black text-text-main tracking-tight">{formatCurrency(netCashFlow)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                <ArrowUpRight size={10} />
                9.6% from May
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <PieChart size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Transactions</span>
            <span className="text-xl font-black text-text-main tracking-tight">{transactions.length}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted mt-1">
                {transactions.filter(t=>t.amount<0).length} expenses • {transactions.filter(t=>t.amount>0).length} income
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Table Column */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border-main rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-primary/50 transition-all shadow-sm"
                    />
                </div>
                <button onClick={() => setFilterType(prev => prev === "All Types" ? "Expense" : prev === "Expense" ? "Income" : "All Types")} className="flex items-center gap-2 px-4 py-3 bg-card border border-border-main rounded-xl text-xs font-black text-text-main shadow-sm hover:border-border-strong transition-all">
                    {filterType} <ChevronDown size={14} className="text-text-muted" />
                </button>
                <button onClick={() => setShowAddTx(true)} className="flex items-center gap-2 px-4 py-3 bg-card border border-border-main rounded-xl text-xs font-black text-text-main shadow-sm hover:border-border-strong transition-all">
                    All Categories <ChevronDown size={14} className="text-text-muted" />
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border-main rounded-xl text-xs font-black text-text-main shadow-sm hover:border-border-strong transition-all">
                    All Accounts <ChevronDown size={14} className="text-text-muted" />
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border-main rounded-xl text-xs font-black text-text-main shadow-sm hover:border-border-strong transition-all">
                    <Filter size={16} className="text-text-muted" />
                    Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border-main rounded-[2.5rem] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-main">
                            <th className="pl-8 pr-4 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Date <ChevronDown size={10} className="inline ml-1" /></th>
                            <th className="px-4 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Description</th>
                            <th className="px-4 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Category</th>
                            <th className="px-4 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Account</th>
                            <th className="px-4 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Type <ChevronDown size={10} className="inline ml-1" /></th>
                            <th className="px-4 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Amount</th>
                            <th className="pl-4 pr-8 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main/30">
                        {filteredTxs.map((tx) => (
                            <tr key={tx.id} className="group hover:bg-border-main/20 transition-colors">
                                <td className="pl-8 pr-4 py-5 text-[11px] font-bold text-text-muted">
                                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-border-main/50 flex items-center justify-center text-text-main shadow-sm border border-border-main/50">
                                            {MERCHANT_ICONS[tx.merchant.split(' ')[0]] || <Building2 size={16} />}
                                        </div>
                                        <span className="text-xs font-black text-text-main tracking-tight">{tx.merchant}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-5">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tight
                                        ${tx.category === 'Food & Dining' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                                          tx.category === 'Income' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                                          tx.category === 'Entertainment' ? 'bg-purple-500/5 border-purple-500/10 text-purple-500' :
                                          tx.category === 'Shopping' ? 'bg-pink-500/5 border-pink-500/10 text-pink-500' :
                                          tx.category === 'Transport' ? 'bg-blue-500/5 border-blue-500/10 text-blue-500' :
                                          'bg-amber-500/5 border-amber-500/10 text-amber-500'}
                                    `}>
                                        {CATEGORY_METADATA[tx.category as TransactionCategory]?.icon}
                                        {tx.category}
                                    </div>
                                </td>
                                <td className="px-4 py-5 text-xs font-bold text-text-muted">
                                    {tx.amount > 0 ? "Checking Account" : "Vylos Card"}
                                </td>
                                <td className="px-4 py-5">
                                    <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase text-center w-16
                                        ${tx.amount < 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}
                                    `}>
                                        {tx.amount < 0 ? 'Expense' : 'Income'}
                                    </div>
                                </td>
                                <td className={`px-4 py-5 text-xs font-black tracking-tight
                                    ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}
                                `}>
                                    {formatCurrency(tx.amount)}
                                </td>
                                <td className="pl-4 pr-8 py-5 text-right">
                                    <button onClick={() => deleteTx(tx.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination */}
                <div className="px-8 py-6 border-t border-border-main flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted">Showing 1 to {filteredTxs.length} of {filteredTxs.length} transactions</span>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-border-main text-text-muted hover:bg-border-main transition-all"><ChevronLeft size={16} /></button>
                        <button className="w-8 h-8 rounded-lg bg-primary text-white text-[10px] font-black">1</button>
                        <button className="w-8 h-8 rounded-lg border border-border-main text-[10px] font-black text-text-muted hover:bg-border-main transition-all">2</button>
                        <button className="w-8 h-8 rounded-lg border border-border-main text-[10px] font-black text-text-muted hover:bg-border-main transition-all">3</button>
                        <button className="w-8 h-8 rounded-lg border border-border-main text-[10px] font-black text-text-muted hover:bg-border-main transition-all">5</button>
                        <button className="p-2 rounded-lg border border-border-main text-text-muted hover:bg-border-main transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
            
            {/* Spending by Category */}
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Spending by Category</h3>
                    <button className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                        View Report <ArrowRight size={14} />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-10">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="88" cy="88" r="76" fill="transparent" stroke="#F1F5F9" strokeWidth="14" className="dark:stroke-white/5" />
                            <circle cx="88" cy="88" r="76" fill="transparent" stroke="#10B981" strokeWidth="14" strokeDasharray={2 * Math.PI * 76} strokeDashoffset={2 * Math.PI * 76 * 0.38} strokeLinecap="round" />
                            <circle cx="88" cy="88" r="76" fill="transparent" stroke="#3B82F6" strokeWidth="14" strokeDasharray={2 * Math.PI * 76} strokeDashoffset={2 * Math.PI * 76 * 0.82} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-black text-text-main">{formatCurrency(totalExpense)}</span>
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Total Expenses</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { label: "Housing", pct: 38, color: "bg-emerald-500" },
                        { label: "Food & Dining", pct: 18, color: "bg-blue-500" },
                        { label: "Transportation", pct: 12, color: "bg-purple-500" },
                        { label: "Shopping", pct: 10, color: "bg-pink-500" },
                        { label: "Entertainment", pct: 7, color: "bg-amber-500" },
                        { label: "Bills & Utilities", pct: 7, color: "bg-yellow-500" },
                        { label: "Other", pct: 8, color: "bg-slate-400" },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                <span className="text-[10px] font-bold text-text-muted">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-black text-text-main">{item.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Spending */}
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Top Spending</h3>
                    <button className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight size={14} />
                    </button>
                </div>

                <div className="space-y-6">
                    {transactions.filter(t=>t.amount<0).sort((a,b)=>Math.abs(b.amount)-Math.abs(a.amount)).slice(0, 3).map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-border-main/50 flex items-center justify-center text-text-main">
                                    {MERCHANT_ICONS[tx.merchant.split(' ')[0]] || <Building2 size={18} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-text-main tracking-tight">{tx.merchant}</span>
                                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <span className="text-xs font-black text-text-main tracking-tight">-{formatCurrency(tx.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insight */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/10">
                        <Sparkles size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-black text-text-main">AI Insight</h3>
                </div>
                <p className="text-xs font-medium text-text-muted leading-relaxed mb-6 relative z-10">
                    You spent 18% more on dining out this month compared to last month.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-black text-primary hover:underline relative z-10 uppercase tracking-widest">
                    View Insight <ArrowRight size={14} />
                </button>
            </div>

        </div>
      </div>
    </ViewContainer>
  );
};
