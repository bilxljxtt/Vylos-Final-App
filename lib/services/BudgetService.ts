import { AppState, Transaction, BudgetCategory, TransactionCategory, TRANSACTION_CATEGORIES } from "../store";
import { getTransactionDateKey, toDateKey } from "../utils";

export interface CategorySummary {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: "safe" | "warning" | "over";
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  percentageUsed: number;
  categories: CategorySummary[];
  billsTotal: number;
  isUnrealistic: boolean;
  monthlyIncome: number;
}

export class BudgetService {
  /**
   * Centralized calculation engine for Vylos budgets.
   * Single source of truth for the Budget view.
   */
  static calculateBudgetSummary(state: AppState, selectedMonth: string): BudgetSummary {
    const monthPrefix = selectedMonth.slice(0, 7);
    const incomeCategories = ["Salary", "Business Income", "Refund", "Other Income"];

    const normalize = (s: string) => {
      if (!s) return "Other";
      const trimmed = s.trim();
      const match = TRANSACTION_CATEGORIES.find(c => c.toLowerCase() === trimmed.toLowerCase());
      if (match) return match;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    };

    // Single pass to aggregate transaction spending by normalized category
    const spentMap: Record<string, number> = {};
    const txs = state.transactions;
    for (let i = 0; i < txs.length; i++) {
      const t = txs[i];
      const dateKey = getTransactionDateKey(t);
      if (dateKey.startsWith(monthPrefix) && t.amount < 0) {
        const cat = normalize(t.category);
        if (!incomeCategories.includes(cat)) {
          spentMap[cat] = (spentMap[cat] || 0) + Math.abs(t.amount);
        }
      }
    }

    // Single pass for subscriptions
    const subs = state.subscriptions;
    for (let i = 0; i < subs.length; i++) {
      const s = subs[i];
      if (s.nextDue.startsWith(monthPrefix)) {
        const cat = normalize(s.category);
        if (!incomeCategories.includes(cat)) {
          spentMap[cat] = (spentMap[cat] || 0) + s.amount;
        }
      }
    }

    // Get all unique categories from budgets and spending
    const budgetEntries = Object.entries(state.budgets);
    const budgetCategories = new Set(budgetEntries.map(([k]) => normalize(k)));
    const allCategories = new Set([...budgetCategories, ...Object.keys(spentMap)]);

    const categories: CategorySummary[] = Array.from(allCategories).map(cat => {
      const spent = spentMap[cat] || 0;
      const budgetKey = Object.keys(state.budgets).find(k => normalize(k) === cat);
      const allocated = budgetKey ? (state.budgets[budgetKey]?.limit || 0) : 0;
      
      const remaining = allocated - spent;
      const percentageUsed = allocated > 0 ? (spent / allocated) * 100 : (spent > 0 ? 100 : 0);

      let status: "safe" | "warning" | "over" = "safe";
      if (percentageUsed >= 100 || (allocated === 0 && spent > 0)) status = "over";
      else if (percentageUsed >= 75) status = "warning";

      return { name: cat, allocated, spent, remaining, percentageUsed, status };
    }).sort((a, b) => b.spent - a.spent);

    const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    const monthlyIncome = state.userProfile.monthlyIncome || 0;

    return {
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      percentageUsed: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : (totalSpent > 0 ? 100 : 0),
      categories,
      billsTotal: categories.find(c => c.name === "Bills")?.spent || 0,
      isUnrealistic: totalAllocated > monthlyIncome && monthlyIncome > 0,
      monthlyIncome
    };
  }

  /**
   * Returns daily movement (income vs expense) for a month
   */
  static getDailyMovement(state: AppState, monthStr: string): Record<string, { income: number; expense: number; net: number }> {
    const monthPrefix = monthStr.slice(0, 7);
    const isBudgetRecord = (title: string) => {
      const t = title.toLowerCase();
      return t.includes("budget top-up") || t.includes("budget allocation") || t.includes("top-up:") || t.includes("allocation:");
    };

    return state.transactions.reduce((acc, t) => {
      const dateKey = getTransactionDateKey(t);
      if (dateKey.startsWith(monthPrefix)) {
        if (!acc[dateKey]) {
          acc[dateKey] = { income: 0, expense: 0, net: 0 };
        }
        
        // Exclude budget internal movements from income/net calculations
        if (isBudgetRecord(t.merchant)) {
          return acc;
        }

        if (t.amount > 0) {
          acc[dateKey].income += t.amount;
        } else {
          acc[dateKey].expense += Math.abs(t.amount);
        }
        acc[dateKey].net += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number; net: number }>);
  }

  /**
   * Returns a comprehensive monthly summary for the Calendar view
   */
  static getMonthFinancialSummary(state: AppState, monthStr: string) {
    const monthPrefix = monthStr.slice(0, 7);

    const isBudgetRecord = (title: string) => {
      const t = title.toLowerCase();
      return t.includes("budget top-up") || t.includes("budget allocation") || t.includes("top-up:") || t.includes("allocation:");
    };

    const monthTxs = state.transactions.filter(t => {
      const dateKey = getTransactionDateKey(t);
      return dateKey.startsWith(monthPrefix) && !isBudgetRecord(t.merchant);
    });

    const income = monthTxs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxs.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const monthSubs = state.subscriptions.filter(s => {
      return s.nextDue.startsWith(monthPrefix);
    });
    const subscriptionsTotal = monthSubs.reduce((sum, s) => sum + s.amount, 0);
    
    const budgetSummary = this.calculateBudgetSummary(state, monthStr);

    return {
      totalIncome: income,
      totalExpenses: expenses + subscriptionsTotal,
      totalSubscriptions: subscriptionsTotal,
      netBalance: income - (expenses + subscriptionsTotal),
      remainingBudget: budgetSummary.totalRemaining,
      upcomingPaymentsCount: monthSubs.filter(s => {
        const todayStr = toDateKey(new Date());
        return s.nextDue >= todayStr;
      }).length
    };
  }
}
