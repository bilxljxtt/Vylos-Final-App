import { AppState, Transaction, BudgetCategory, TransactionCategory } from "../store";
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
}

export class BudgetService {
  /**
   * Centralized calculation engine for Vylos budgets.
   * Single source of truth for the Budget view.
   */
  static calculateBudgetSummary(state: AppState, selectedMonth: string): BudgetSummary {
    const monthPrefix = selectedMonth.slice(0, 7); // YYYY-MM

    // Filter transactions for the selected month
    const monthTxs = state.transactions.filter(t => {
      const dateKey = getTransactionDateKey(t);
      return dateKey.startsWith(monthPrefix);
    });

    // Filter subscriptions for the selected month
    const monthSubs = state.subscriptions.filter(s => {
      return s.nextDue.startsWith(monthPrefix);
    });

    const normalize = (s: string) => {
      if (!s) return "Other";
      const trimmed = s.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    };

    const incomeCategories = ["Salary", "Business Income", "Refund", "Other Income"];

    // Get all unique categories
    const allCategories = new Set([
      ...Object.keys(state.budgets).map(normalize),
      ...monthTxs.filter(t => t.amount < 0).map(t => normalize(t.category)), // Only negative amounts count towards spending categories
      ...monthSubs.map(s => normalize(s.category))
    ]);

    const categories: CategorySummary[] = Array.from(allCategories)
      .filter(cat => !incomeCategories.includes(cat))
      .map(cat => {
        const catTxs = monthTxs.filter(t => normalize(t.category) === cat);
        const catSubs = monthSubs.filter(s => normalize(s.category) === cat);
        
        // Spent = absolute value of negative amounts + subscriptions
        const txSpent = catTxs
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const subSpent = catSubs.reduce((sum, s) => sum + s.amount, 0);
        const spent = txSpent + subSpent;

        // Allocated = budget limit
        // We match budget keys case-insensitively
        const budgetKey = Object.keys(state.budgets).find(k => normalize(k) === cat);
        const allocated = budgetKey ? (state.budgets[budgetKey]?.limit || 0) : 0;
        
        const remaining = allocated - spent;
        let percentageUsed = 0;
        
        if (allocated > 0) {
          percentageUsed = (spent / allocated) * 100;
        } else if (spent > 0) {
          percentageUsed = 100; // Over budget by definition
        }

        let status: "safe" | "warning" | "over" = "safe";
        if (allocated === 0 && spent > 0) status = "over";
        else if (percentageUsed >= 100) status = "over";
        else if (percentageUsed >= 75) status = "warning";

        return {
          name: cat,
          allocated,
          spent,
          remaining,
          percentageUsed,
          status
        };
      })
      .sort((a, b) => b.spent - a.spent); // Sort by highest spend

    const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    
    let percentageUsed = 0;
    if (totalAllocated > 0) {
      percentageUsed = (totalSpent / totalAllocated) * 100;
    } else if (totalSpent > 0) {
      percentageUsed = 100;
    }

    const billsCat = categories.find(c => c.name === "Bills");
    const billsTotal = billsCat ? billsCat.spent : 0;

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      percentageUsed,
      categories,
      billsTotal
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
