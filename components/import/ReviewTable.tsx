"use client";

import React from "react";
import { Trash2, AlertTriangle, CheckCircle2, MoreHorizontal, Copy } from "lucide-react";
import { TransactionCategory } from "@/lib/store";

const CATEGORIES: TransactionCategory[] = [
  "Utilities", "Emergency Fund", "Side Hustle", "Dining Out", "Subscriptions",
  "Groceries", "Transport", "Shopping", "Entertainment", "Housing", "Bills", "Other"
];

interface ReviewTableProps {
  transactions: any[];
  onUpdate: (id: string, updates: any) => void;
  onRemove: (id: string) => void;
}

export function ReviewTable({ transactions, onUpdate, onRemove }: ReviewTableProps) {
  return (
    <div className="bg-card rounded-3xl border border-border-main overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted bg-bg/50 border-b border-border-main">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Merchant</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {transactions.map((tx) => {
              const isLowConfidence = tx.confidence < 0.5;
              return (
                <tr key={tx.id} className="group hover:bg-border-subtle transition-colors cursor-default">
                  <td className="px-6 py-3.5">
                    {tx.isDuplicate ? (
                      <div className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] uppercase">
                        <Copy className="w-3 h-3" /> Duplicate
                      </div>
                    ) : isLowConfidence ? (
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px] uppercase">
                        <AlertTriangle className="w-3 h-3" /> Review
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Match
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <input 
                      type="date" 
                      value={tx.date} 
                      onChange={(e) => onUpdate(tx.id, { date: e.target.value })}
                      className="bg-transparent border-none p-0 text-text-muted font-medium focus:ring-0 outline-none w-32"
                    />
                  </td>
                  <td className="px-6 py-3.5">
                    <input 
                      type="text" 
                      value={tx.merchant} 
                      onChange={(e) => onUpdate(tx.id, { merchant: e.target.value })}
                      className="bg-transparent border-none p-0 text-text-main font-bold focus:ring-0 outline-none w-full min-w-[150px]"
                    />
                  </td>
                  <td className="px-6 py-3.5">
                    <select
                      value={tx.category}
                      onChange={(e) => onUpdate(tx.id, { category: e.target.value, confidence: 1.0 })}
                      className="bg-primary/5 border border-primary/10 rounded-full px-3 py-1 text-xs font-bold text-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className={`px-6 py-3.5 text-right font-bold ${tx.amount > 0 ? "text-emerald-500" : "text-text-main"}`}>
                    <input 
                      type="number" 
                      value={tx.amount} 
                      onChange={(e) => onUpdate(tx.id, { amount: parseFloat(e.target.value) })}
                      className="bg-transparent border-none p-0 text-right font-bold focus:ring-0 outline-none w-24"
                    />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button 
                      onClick={() => onRemove(tx.id)}
                      className="text-text-muted hover:text-red-500 opacity-20 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
