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
  setPage: (page: string) => void;
  trends?: { incomeTrend: number; expenseTrend: number; netWorthTrend: number; };
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
  deleteTx,
  setPage,
  trends = { incomeTrend: 0, expenseTrend: 0, netWorthTrend: 0 }
}) => {
  const { lastSynced, formatCurrency, updateTransaction, addMerchantRule } = useAppStore();
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

  const spendByCat = transactions.filter(t => t.amount < 0).reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const totalSpend = Object.values(spendByCat).reduce((a, b) => a + b, 0);
  const spendingBreakdown = Object.entries(spendByCat).map(([label, amount]) => {
    const meta = CATEGORY_METADATA[label as TransactionCategory] || { icon: "💳", color: "#546E7A" };
    return {
      label,
      amount,
      pct: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
      color: meta.color,
      icon: meta.icon
    };
  }).sort((a, b) => b.amount - a.amount);

  const handleExport = () => {
    const headers = ["Date", "Merchant", "Category", "Amount"];
    const rows = filteredTxs.map(tx => [
      tx.date,
      `"${tx.merchant.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Vylos_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ViewContainer className="flex flex-col pt-8 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-text-main tracking-tight">Transactions</h1>
            {lastSynced && (
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-500 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>
          <p className="text-text-muted font-medium">Track your spending, review your transactions, and stay in control.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowAddTx(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-95"
            >
                <Plus size={18} />
                Add Transaction
            </button>
            <button 
                onClick={() => setPage("import")}
                className="flex items-center gap-2 px-6 py-3 bg-card border border-border-main rounded-xl text-sm font-black text-text-main shadow-sm hover:border-border-strong transition-all"
            >
                <Sparkles size={18} className="text-primary" />
                Import
            </button>
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-card border border-border-main rounded-xl text-sm font-black text-text-main shadow-sm hover:border-border-strong transition-all"
            >
                <Download size={18} className="text-text-muted" />
                Export
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
            {trends.incomeTrend !== 0 && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${trends.incomeTrend > 0 ? 'text-emerald-500' : 'text-red-500'} mt-1`}>
                    <ArrowUpRight size={10} className={trends.incomeTrend < 0 ? 'rotate-90' : ''} />
                    {Math.abs(trends.incomeTrend).toFixed(1)}% vs prev. month
                </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <TrendingDown size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Expenses</span>
            <span className="text-xl font-black text-text-main tracking-tight">{formatCurrency(totalExpense)}</span>
            {trends.expenseTrend !== 0 && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${trends.expenseTrend < 0 ? 'text-emerald-500' : 'text-red-500'} mt-1`}>
                    <ArrowUpRight size={10} className={trends.expenseTrend > 0 ? 'rotate-0' : 'rotate-90'} />
                    {Math.abs(trends.expenseTrend).toFixed(1)}% vs prev. month
                </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border-main p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Net Cash Flow</span>
            <span className="text-xl font-black text-text-main tracking-tight">{formatCurrency(netCashFlow)}</span>
            {trends.netWorthTrend !== 0 && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${trends.netWorthTrend > 0 ? 'text-emerald-500' : 'text-red-500'} mt-1`}>
                    <ArrowUpRight size={10} className={trends.netWorthTrend < 0 ? 'rotate-90' : ''} />
                    {Math.abs(trends.netWorthTrend).toFixed(1)}% vs prev. month
                </div>
            )}
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
                <button onClick={() => setFilterCat(filterCat === "All" ? "Food & Dining" : "All")} className="flex items-center gap-2 px-4 py-3 bg-card border border-border-main rounded-xl text-xs font-black text-text-main shadow-sm hover:border-border-strong transition-all">
                    {filterCat === "All" ? "All Categories" : filterCat} <ChevronDown size={14} className="text-text-muted" />
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
                        {filteredTxs.map((tx) => {
                            const meta = CATEGORY_METADATA[tx.category as TransactionCategory] || { icon: "💳", color: "#546E7A" };
                            return (
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
                                        <div className="relative group/cat">
                                            <select 
                                                className={`appearance-none cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-primary/20 transition-all
                                                    ${tx.amount > 0 ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-border-main/20 border-border-main text-text-main'}
                                                `}
                                                style={tx.amount < 0 ? { borderColor: `${meta.color}33`, color: meta.color, backgroundColor: `${meta.color}11` } : {}}
                                                value={tx.category}
                                                onChange={async (e) => {
                                                    const newCat = e.target.value as TransactionCategory;
                                                    await updateTransaction(tx.id, { category: newCat });
                                                    
                                                    // Ask to save as rule
                                                    if (confirm(`Always categorize "${tx.merchant}" as ${newCat}?`)) {
                                                        await addMerchantRule({
                                                            merchant_keyword: tx.merchant,
                                                            category: newCat
                                                        });
                                                    }
                                                }}
                                            >
                                                {Object.keys(CATEGORY_METADATA).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
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
                            );
                        })}
                        {filteredTxs.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-text-muted/50">
                                        <CreditCard size={48} strokeWidth={1} />
                                        <span className="text-sm font-black uppercase tracking-widest">No transactions yet</span>
                                        <p className="text-xs font-medium">Add your first transaction to start tracking your money.</p>
                                        <button 
                                            onClick={() => setShowAddTx(true)}
                                            className="mt-4 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                                        >
                                            Add Transaction
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {filteredTxs.length > 0 && (
                    <div className="px-8 py-6 border-t border-border-main flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-muted">Showing 1 to {filteredTxs.length} of {filteredTxs.length} transactions</span>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-border-main text-text-muted hover:bg-border-main transition-all disabled:opacity-20" disabled><ChevronLeft size={16} /></button>
                            <button className="w-8 h-8 rounded-lg bg-primary text-white text-[10px] font-black">1</button>
                            <button className="p-2 rounded-lg border border-border-main text-text-muted hover:bg-border-main transition-all disabled:opacity-20" disabled><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
            
            {/* Spending by Category */}
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest opacity-80">Spending by Category</h3>
                    <button onClick={() => setFilterCat("All")} className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                        View Report <ArrowRight size={14} />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-10">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="88" cy="88" r="76" fill="transparent" stroke="#F1F5F9" strokeWidth="14" className="dark:stroke-white/5" />
                            {spendingBreakdown.slice(0, 3).map((item, i) => {
                                // Simplified donut segments
                                const offset = spendingBreakdown.slice(0, i).reduce((a, b) => a + b.pct, 0);
                                return (
                                    <circle 
                                        key={i}
                                        cx="88" cy="88" r="76" fill="transparent" 
                                        stroke={item.color} 
                                        strokeWidth="14" 
                                        strokeDasharray={2 * Math.PI * 76} 
                                        strokeDashoffset={2 * Math.PI * 76 * (1 - item.pct / 100)} 
                                        strokeLinecap="round"
                                        style={{ transform: `rotate(${offset * 3.6}deg)`, transformOrigin: 'center' }}
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-black text-text-main">{formatCurrency(totalExpense)}</span>
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Total Expenses</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {spendingBreakdown.slice(0, 7).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-bold text-text-muted">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-black text-text-main">{item.pct}%</span>
                        </div>
                    ))}
                    {spendingBreakdown.length === 0 && (
                        <p className="text-[10px] font-bold text-text-muted text-center py-4 uppercase opacity-50">No spending data</p>
                    )}
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
                <button onClick={() => setShowAddTx(true)} className="flex items-center gap-2 text-[10px] font-black text-primary hover:underline relative z-10 uppercase tracking-widest">
                    View Insight <ArrowRight size={14} />
                </button>
            </div>

        </div>
      </div>
    </ViewContainer>
  );
};
