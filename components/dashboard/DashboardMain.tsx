"use client";

import React from "react";
import { StatCard, 
  CircularHealthScore, 
  TransactionItem, 
  BillItem 
} from "../ui/DashboardUi";
import { 
  CATEGORY_METADATA, 
  TransactionCategory } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  DollarSign, 
  PieChart, 
  Target, 
  Sparkles,
  ChevronDown,
  Info,
  Calendar,
  Zap,
  Globe,
  Plus,
  Wallet,
  ArrowDown,
  ArrowUp,
  ArrowRight
} from "lucide-react";
import { ViewContainer } from "../ui/ViewContainer";

interface DashboardMainProps {
  income: number;
  expense: number;
  netWorth: number;
  savingsRate: number;
  transactions: any[];
  goals: any[];
  chartRef: React.RefObject<HTMLCanvasElement | null>;
  donutRef?: React.RefObject<HTMLCanvasElement | null>;
  setPage: (page: string) => void;
}

export const DashboardMain: React.FC<DashboardMainProps> = ({
  income,
  expense,
  netWorth,
  savingsRate,
  transactions,
  goals,
  chartRef,
  donutRef,
  setPage
}) => {
  const { formatCurrency } = useAppStore();
  const healthScore = 82; // Static for now as per design
  const recentTxs = transactions.slice(0, 5);
  
  // Mock upcoming bills as per design
  const upcomingBills = [
    { id: "1", title: "Rent Payment", date: "Jun 30, 2024", amount: 1200, icon: <Calendar size={18} /> },
    { id: "2", title: "Electricity Bill", date: "Jul 02, 2024", amount: 120.50, icon: <Zap size={18} /> },
    { id: "3", title: "Internet Bill", date: "Jul 05, 2024", amount: 60.00, icon: <Globe size={18} /> },
  ];

  return (
    <ViewContainer className="flex flex-col gap-8 pt-2 pb-10">
      {/* Header Row: Greeting & Health Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-2">
            Good morning, Alex! <span className="animate-bounce">👋</span>
          </h2>
          <p className="text-sm font-bold text-text-muted mt-1 uppercase tracking-widest">Here's your financial overview for today.</p>
        </div>
        <CircularHealthScore score={healthScore} />
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Net Worth" 
          value={formatCurrency(netWorth)} 
          trend="5.2% from last month" 
          trendPositive={true} 
          icon={<Wallet className="w-5 h-5 text-primary" />}
          iconBg="bg-bg-mint"
        />
        <StatCard 
          label="Monthly Income" 
          value={formatCurrency(income)} 
          sublabel="June 2024" 
          icon={<DollarSign className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard 
          label="Monthly Expenses" 
          value={formatCurrency(expense)} 
          trend="7.4% of income" 
          trendPositive={false} 
          icon={<CreditCard className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-500/10"
        />
        <StatCard 
          label="Savings Rate" 
          value={`${savingsRate}%`} 
          trend="On track to goal"
          trendPositive={true}
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Spending Overview & Budget/Goals */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Spending Overview */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Spending Overview</h3>
                <Info size={14} className="text-text-muted cursor-help" />
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black text-text-muted bg-border-main hover:bg-border-strong transition-colors px-3 py-2 rounded-xl border border-border-main uppercase tracking-widest">
                This Month <ChevronDown size={14} />
              </button>
            </div>
            <div className="w-full relative h-[300px]">
              <canvas ref={chartRef}></canvas>
            </div>
            {/* Chart Sub-stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border-main">
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Avg. Monthly Spend</div>
                <div className="text-lg font-black text-text-main tracking-tight">$3,247.45</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Lowest Month</div>
                <div className="text-lg font-black text-text-main tracking-tight flex items-center gap-2">
                  $2,350.20 <ArrowDown size={16} className="text-primary" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Highest Month</div>
                <div className="text-lg font-black text-text-main tracking-tight flex items-center gap-2">
                  $4,320.50 <ArrowUp size={16} className="text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Budget Summary & Savings Goal Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Budget Summary */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Budget Summary</h3>
                <button onClick={() => setPage("budget")} className="text-[10px] font-bold text-primary uppercase hover:underline">View Budget</button>
              </div>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <canvas ref={donutRef}></canvas>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-lg font-black text-text-main">$3,847</span>
                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">of $5,200</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                   {[
                    { label: "Housing", amount: 1500, pct: 38, color: "bg-primary" },
                    { label: "Food & Dining", amount: 687, pct: 18, color: "bg-acc-blue" },
                    { label: "Transportation", amount: 456, pct: 12, color: "bg-acc-purple" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="font-bold text-text-muted">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-text-main">${item.amount}</span>
                        <span className="font-bold text-text-muted w-6 text-right">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings Goal */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Savings Goal</h3>
                <button onClick={() => setPage("goals")} className="text-[10px] font-bold text-primary uppercase hover:underline">View Goals</button>
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-bg-mint flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-text-main">Emergency Fund</div>
                  <div className="text-xs font-bold text-text-muted">$8,500 of $10,000</div>
                  <div className="w-full h-2 bg-border-main rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: "85%" }} />
                  </div>
                </div>
                <span className="text-xs font-black text-text-main">85%</span>
              </div>
              {/* AI Insight Note */}
              <div className="p-4 bg-bg-mint/30 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Insight</span>
                </div>
                <p className="text-[11px] font-bold text-text-muted leading-relaxed mb-3">
                  You're doing great! Cutting dining out by $324/month could boost your savings by 15%.
                </p>
                <button className="text-[9px] font-black text-primary uppercase hover:underline flex items-center gap-1">
                  View Recommendation <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions & Upcoming Bills */}
        <div className="flex flex-col gap-8">
          {/* Recent Transactions */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Recent Transactions</h3>
              <button onClick={() => setPage("transactions")} className="text-[10px] font-bold text-primary uppercase hover:underline">View All</button>
            </div>
            <div className="flex flex-col">
              {recentTxs.map((tx: any) => (
                <TransactionItem 
                  key={tx.id}
                  title={tx.merchant}
                  date={new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  amount={tx.amount}
                  icon={CATEGORY_METADATA[tx.category as TransactionCategory]?.icon}
                  color={CATEGORY_METADATA[tx.category as TransactionCategory]?.color}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Upcoming Bills</h3>
              <button className="text-[10px] font-bold text-primary uppercase hover:underline">View All</button>
            </div>
            <div className="flex flex-col mb-6">
              {upcomingBills.map(bill => (
                <BillItem 
                  key={bill.id}
                  title={bill.title}
                  date={bill.date}
                  amount={bill.amount}
                  icon={bill.icon}
                />
              ))}
            </div>
            <button className="w-full py-4 border-2 border-dashed border-border-strong rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-text-muted hover:border-primary/50 hover:text-primary hover:bg-bg-mint transition-all group">
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              Add New Reminder
            </button>
          </div>
        </div>
      </div>
    </ViewContainer>
  );
};
