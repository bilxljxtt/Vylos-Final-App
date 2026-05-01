import { AppState, Transaction, BudgetCategory, TransactionCategory } from "../store";

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
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1).getTime();
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    // Filter transactions for the selected month
    const monthTxs = state.transactions.filter(t => {
      const d = new Date(t.date || t.createdAt || new Date()).getTime();
      return d >= monthStart && d <= monthEnd;
    });

    const incomeCategories = ["Salary", "Business Income", "Refund", "Other Income"];
    
    const categories: CategorySummary[] = Object.entries(state.budgets).map(([cat, b]) => {
      const catTxs = monthTxs.filter(t => t.category === cat);
      
      // Funding = positive amounts in budget categories (top-ups, etc.)
      const funding = catTxs
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      // Spent = absolute value of negative amounts
      const spent = catTxs
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const limit = b.limit || 0;
      const cap = limit + funding;
      const available = cap - spent;
      const percent = cap > 0 ? Math.round((spent / cap) * 100) : 0;

      return {
        category: cat,
        limit,
        funding,
        spent,
        available,
        percent
      };
    }).filter(c => !incomeCategories.includes(c.category));

    const totalLimit = categories.reduce((sum, c) => sum + c.limit, 0);
    const totalFunding = categories.reduce((sum, c) => sum + c.funding, 0);
    const totalSpent = monthTxs
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalCap = totalLimit + totalFunding;
    const totalAvailable = totalCap - totalSpent;
    const totalSpentPercent = totalCap > 0 ? Math.round((totalSpent / totalCap) * 100) : 0;

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
    const [year, month] = monthStr.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1).getTime();
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const dailyMovement: Record<string, { income: number; expense: number; net: number }> = {};

    state.transactions.forEach(t => {
      const actualDate = t.date || t.createdAt;
      if (!actualDate) return;
      const d = new Date(actualDate);
      const ts = d.getTime();
      if (ts >= monthStart && ts <= monthEnd) {
        const dateKey = actualDate.split('T')[0];
        if (!dailyMovement[dateKey]) {
          dailyMovement[dateKey] = { income: 0, expense: 0, net: 0 };
        }
        if (t.amount > 0) {
          dailyMovement[dateKey].income += t.amount;
        } else {
          dailyMovement[dateKey].expense += Math.abs(t.amount);
        }
        dailyMovement[dateKey].net += t.amount;
      }
    });

    return dailyMovement;
  }

  /**
   * Returns a comprehensive monthly summary for the Calendar view
   */
  static getMonthFinancialSummary(state: AppState, monthStr: string) {
    const [year, month] = monthStr.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1).getTime();
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const monthTxs = state.transactions.filter(t => {
      const d = new Date(t.date || t.createdAt || new Date()).getTime();
      return d >= monthStart && d <= monthEnd;
    });

    const income = monthTxs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxs.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const monthSubs = state.subscriptions.filter(s => {
      const d = new Date(s.nextDue);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });
    const subscriptionsTotal = monthSubs.reduce((sum, s) => sum + s.amount, 0);
    
    const budgetSummary = this.getBudgetSummary(state, monthStr);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalSubscriptions: subscriptionsTotal,
      netBalance: income - expenses,
      remainingBudget: budgetSummary.totalAvailable,
      upcomingPaymentsCount: monthSubs.filter(s => new Date(s.nextDue).getTime() > Date.now()).length
    };
  }
}
