import { AppState, Transaction, BudgetCategory, TransactionCategory } from "../store";
import { getTransactionDateKey, toDateKey } from "../utils";

export interface CategorySummary {
  category: string;
  limit: number;
  spent: number;
  funding: number;
  available: number;
  percent: number;
}

export interface BudgetSummary {
  totalLimit: number;
  totalSpent: number;
  totalFunding: number;
  totalAvailable: number;
  totalSpentPercent: number;
  categories: CategorySummary[];
}

export class BudgetService {
  /**
   * Centralized calculation engine for Vylos budgets.
   * Derives all spending and funding from transactions for a specific month.
   */
  static getBudgetSummary(state: AppState, selectedMonth: string): BudgetSummary {
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

    // Get all unique categories from budgets, transactions, and subscriptions
    const allCategories = new Set([
      ...Object.keys(state.budgets).map(normalize),
      ...monthTxs.map(t => normalize(t.category)),
      ...monthSubs.map(s => normalize(s.category))
    ]);

    const incomeCategories = ["Salary", "Business Income", "Refund", "Other Income"];

    const categories: CategorySummary[] = Array.from(allCategories)
      .filter(cat => !incomeCategories.includes(cat))
      .map(cat => {
        const catTxs = monthTxs.filter(t => t.category === cat);
        const catSubs = monthSubs.filter(s => s.category === cat);
        
        // Funding = positive amounts in non-income categories
        const funding = catTxs
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);

        // Spent = absolute value of negative amounts + subscriptions
        const txSpent = catTxs
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const subSpent = catSubs.reduce((sum, s) => sum + s.amount, 0);
        const spent = txSpent + subSpent;

        const b = state.budgets[cat] || { limit: 0, type: "limit" };
        const limit = b.limit || 0;
        const cap = limit + funding;
        const available = cap - spent;
        const percent = cap > 0 ? Math.round((spent / cap) * 100) : (spent > 0 ? 100 : 0);

        return {
          category: cat,
          limit,
          funding,
          spent,
          available,
          percent
        };
      })
      .sort((a, b) => b.spent - a.spent); // Sort by highest spend

    const totalLimit = categories.reduce((sum, c) => sum + c.limit, 0);
    const totalFunding = categories.reduce((sum, c) => sum + c.funding, 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    
    const totalCap = totalLimit + totalFunding;
    const totalAvailable = totalCap - totalSpent;
    const totalSpentPercent = totalCap > 0 ? Math.round((totalSpent / totalCap) * 100) : (totalSpent > 0 ? 100 : 0);

    return {
      totalLimit,
      totalSpent,
      totalFunding,
      totalAvailable,
      totalSpentPercent,
      categories
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
    
    const budgetSummary = this.getBudgetSummary(state, monthStr);

    return {
      totalIncome: income,
      totalExpenses: expenses + subscriptionsTotal,
      totalSubscriptions: subscriptionsTotal,
      netBalance: income - (expenses + subscriptionsTotal),
      remainingBudget: budgetSummary.totalAvailable,
      upcomingPaymentsCount: monthSubs.filter(s => {
        const todayStr = toDateKey(new Date());
        return s.nextDue >= todayStr;
      }).length
    };
  }
}
