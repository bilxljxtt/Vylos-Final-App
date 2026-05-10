"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { CATEGORY_METADATA, TransactionCategory } from "@/lib/store";
import { cleanMerchantName, formatDate } from "@/lib/utils";
import { TransactionIcon } from "@/components/ui/TransactionIcon";

interface RecentTransactionsWidgetProps {
  transactions: any[];
  formatCurrency: (val: number) => string;
  onViewAll: () => void;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({ 
  transactions, formatCurrency, onViewAll 
}) => {
  const recentTxs = transactions.slice(0, 5);

  return (
    <GlassCard p="p-8" className="flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter">Activity History</h4>
        <button 
          onClick={onViewAll}
          className="px-4 py-1.5 rounded-full bg-blue-600/5 hover:bg-blue-600 text-[10px] font-black text-blue-600 hover:text-white uppercase tracking-widest transition-all active:scale-95 border border-blue-600/10"
        >
          View All
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-6">
        {recentTxs.length > 0 ? recentTxs.map((tx, i) => {
          const meta = CATEGORY_METADATA[tx.category as TransactionCategory] || { icon: "💰", color: "#64748b" };
          return (
            <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-white/20 dark:hover:bg-white/5 p-2 -mx-2 rounded-2xl transition-all">
              <div className="flex items-center gap-4">
                <TransactionIcon 
                  merchant={tx.merchant} 
                  category={tx.category} 
                  type={tx.amount > 0 ? "income" : "expense"}
                  size="md"
                  className="group-hover:scale-110 transition-transform"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight truncate">{cleanMerchantName(tx.merchant)}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">{tx.category}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-xs font-black tracking-tight ${tx.amount > 0 ? "text-emerald-500" : "text-slate-900 dark:text-white"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">{formatDate(tx.date)}</p>
              </div>
            </div>
          );
        }) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <CreditCard size={32} />
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
              No recent records found.<br/>Import your first statement.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
