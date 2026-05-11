import { AppState, Transaction, BudgetCategory, formatMoney, computeHealthScoreMetrics } from "./store";
import { getTransactionDateKey } from "./utils";
import { VylosEngine } from "./vylosEngine";

export interface DashboardStats {
  income: number;
  expense: number;
  netWorth: number;
  savingsRate: number;
  totalSaved: number;
  budgetUtilization: number;
  activeGoalsCount: number;
  portfolioTotal: number;
  cashFlowIndex: number;
}

export class VylosCalculations {
  static isBudgetRecord(title: string) {
    const t = title.toLowerCase();
    return t.includes("budget top-up") || t.includes("budget allocation") || t.includes("top-up:") || t.includes("allocation:");
  }

  static getMonthStats(state: AppState, monthStr: string): DashboardStats {
    const currentMonthPrefix = monthStr.slice(0, 7);
    
    // Income (Positive transactions excluding internal budget transfers)
    const income = state.transactions
      .filter(t => {
        const dateKey = getTransactionDateKey(t);
        return dateKey.startsWith(currentMonthPrefix) && t.amount > 0 && !this.isBudgetRecord(t.merchant);
      })
      .reduce((acc, t) => acc + t.amount, 0);

    // Expense (Negative transactions excluding internal budget transfers)
    const expense = state.transactions
      .filter(t => {
        const dateKey = getTransactionDateKey(t);
        return dateKey.startsWith(currentMonthPrefix) && t.amount < 0 && !this.isBudgetRecord(t.merchant);
      })
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    // Net Worth (Total historical balance across all accounts/transactions)
    const netWorth = state.transactions
      .filter(t => !this.isBudgetRecord(t.merchant))
      .reduce((acc, t) => acc + t.amount, 0);

    // Savings Rate: % of income that isn't spent
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : (expense === 0 && income === 0 ? 0 : 0);

    // Total Saved (Sum of current amounts in all active goals)
    const totalSaved = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);

    // Budget Utilization (Total expense vs total budget limits)
    const totalBudget = Object.values(state.budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((expense / totalBudget) * 100) : 0;

    // Active Goals Count
    const activeGoalsCount = state.goals.filter(g => g.status === 'On Track' || g.status === 'At Risk').length;

    // Portfolio Total (Total of investment-related categories + savings goals)
    const investmentCategories = ["Savings", "Debt Payments"];
    const portfolioTotal = state.transactions
      .filter(t => !this.isBudgetRecord(t.merchant) && investmentCategories.includes(t.category))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0) + totalSaved;

    // Cash Flow Index (Income - Expense for the month)
    const cashFlowIndex = income - expense;

    return {
      income,
      expense,
      netWorth,
      savingsRate: Math.max(0, savingsRate),
      totalSaved,
      budgetUtilization,
      activeGoalsCount,
      portfolioTotal,
      cashFlowIndex
    };
  }

  static getSpendingByCategory(state: AppState, monthStr: string): Record<string, number> {
    const currentMonthPrefix = monthStr.slice(0, 7);
    const spendMap: Record<string, number> = {};

    state.transactions
      .filter(t => {
        const dateKey = getTransactionDateKey(t);
        return dateKey.startsWith(currentMonthPrefix) && t.amount < 0 && !this.isBudgetRecord(t.merchant);
      })
      .forEach(t => {
        spendMap[t.category] = (spendMap[t.category] || 0) + Math.abs(t.amount);
      });

    return spendMap;
  }

  static getAllocationPercentages(state: AppState, monthStr: string) {
    const stats = this.getMonthStats(state, monthStr);
    const spendByCat = this.getSpendingByCategory(state, monthStr);
    const total = stats.expense;

    if (total === 0) return { needs: 0, wants: 0 };

    // Standard categorisation for Needs in Vylos Ecosystem
    const needsCategories = ["Rent / Housing", "Bills", "Transport", "Health", "Education", "Groceries", "Insurance", "Utilities", "Debt Payments"];
    const needs = Object.entries(spendByCat)
        .filter(([cat]) => needsCategories.includes(cat))
        .reduce((sum, [, amt]) => sum + amt, 0);
    
    const wants = Math.max(0, total - needs);

    return {
        needs: Math.round((needs / total) * 100),
        wants: Math.round((wants / total) * 100)
    };
  }

  static getMonthlyTrend(state: AppState, months: number = 6) {
    const now = new Date();
    const trend = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toISOString().slice(0, 7);
      const stats = this.getMonthStats(state, monthStr + "-01");
      trend.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income: stats.income,
        expense: stats.expense,
        netWorth: stats.netWorth,
        cashFlow: stats.income - stats.expense
      });
    }
    return trend;
  }

  static getCashFlowTrend(state: AppState, monthsCount: number = 6) {
    const now = new Date();
    const results = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toISOString().slice(0, 7);
      const stats = this.getMonthStats(state, monthStr + "-01");
      results.push(stats.income - stats.expense);
    }
    return results;
  }
  
  static getPlannedVsActual(state: AppState, monthStr: string) {
    const currentMonthPrefix = monthStr.slice(0, 7);
    const daysInMonth = new Date(parseInt(monthStr.slice(0, 4)), parseInt(monthStr.slice(5, 7)), 0).getDate();
    
    // Total planned (budget)
    const totalBudget = Object.values(state.budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);
    const dailyPlanned = totalBudget / daysInMonth;
    
    const labels = [];
    const plannedData = [];
    const actualData = [];
    
    let runningActual = 0;
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = i.toString().padStart(2, '0');
      const dateStr = `${currentMonthPrefix}-${dayStr}`;
      
      labels.push(dateStr);
      plannedData.push(Math.round(dailyPlanned * i));
      
      const dayTransactions = state.transactions.filter(t => {
        const d = getTransactionDateKey(t);
        return d === dateStr && t.amount < 0 && !this.isBudgetRecord(t.merchant);
      });
      
      const daySpend = dayTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
      runningActual += daySpend;
      
      // If the day is in the future, don't push actual data
      const isPastOrToday = new Date(dateStr) <= new Date();
      actualData.push(isPastOrToday ? Math.round(runningActual) : null);
    }
    
    return { labels, planned: plannedData, actual: actualData };
  }

  static getRemindersSummary(state: AppState) {
    const reminders = state.reminders || [];
    const { getReminderDerivedStatus } = require("./utils");
    
    let dueTodayCount = 0;
    let dueTodayAmount = 0;
    let upcomingCount = 0;
    let upcomingAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let completedCount = 0;
    
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    reminders.forEach(r => {
      const status = getReminderDerivedStatus(r);
      const amount = r.amount || 0;

      if (status === 'completed') {
        if (r.completed_at?.startsWith(currentMonthPrefix)) {
          completedCount++;
        }
      } else if (status === 'overdue') {
        overdueCount++;
        overdueAmount += amount;
      } else if (status === 'upcoming') {
        upcomingCount++;
        upcomingAmount += amount;
        
        // If it's specifically today
        const todayStr = new Date().toISOString().slice(0, 10);
        if (r.due_date === todayStr) {
          dueTodayCount++;
          dueTodayAmount += amount;
        }
      }
    });
    
    return {
      dueTodayCount,
      dueTodayAmount,
      upcomingCount,
      upcomingAmount,
      overdueCount,
      overdueAmount,
      completedCount,
      totalScheduledCount: reminders.length,
      totalScheduledAmount: reminders.reduce((sum, r) => sum + (r.amount || 0), 0)
    };
  }

  static getRecentInsights(state: AppState) {
    const health = computeHealthScoreMetrics(state);
    const stats = this.getMonthStats(state, state.selectedMonth);
    const engineOutput = VylosEngine.run(state);
    
    const insights = [];
    
    // 1. Budget Insight
    if (health.stats.budgetUtilization > 100) {
      insights.push({
        title: "Budget Exhausted",
        message: `You've exceeded your total budget by ${formatMoney(stats.expense - health.stats.budgetUtilization * 0.01 * stats.expense)}. Consider reallocating from other categories.`,
        type: "warning",
        page: "budget"
      });
    } else if (health.stats.budgetUtilization > 85) {
      insights.push({
        title: "Budget Alert",
        message: `You've used ${health.stats.budgetUtilization}% of your monthly budget. Only ${formatMoney(health.stats.runwayMonths * stats.expense)} remains.`,
        type: "warning",
        page: "budget"
      });
    }

    // 2. Savings/Goal Insight
    if (stats.savingsRate > 25) {
      insights.push({
        title: "High Performance",
        message: `Your savings rate of ${stats.savingsRate}% is elite. You're accumulating wealth faster than 90% of users.`,
        type: "success",
        page: "goals"
      });
    } else if (stats.savingsRate < 10 && stats.income > 0) {
      insights.push({
        title: "Savings Opportunity",
        message: "Your current savings rate is below the recommended 20%. Try to automate a small transfer to your goals.",
        type: "info",
        page: "goals"
      });
    }

    // 3. Runway Insight
    if (engineOutput.burnRateMonths < 3 && stats.income > 0) {
      insights.push({
        title: "Liquidity Warning",
        message: `Your current cash runway is ${engineOutput.burnRateMonths} months. We recommend building a 6-month emergency buffer.`,
        type: "warning",
        page: "goals"
      });
    }

    // 4. Spending Trend Insight
    const trend = this.getMonthlyTrend(state, 2);
    if (trend.length === 2) {
      const currentExp = trend[trend.length - 1].expense;
      const prevExp = trend[trend.length - 2].expense;
      if (currentExp > prevExp * 1.2) {
        insights.push({
          title: "Spending Spike",
          message: `Your spending is up ${Math.round(((currentExp - prevExp) / prevExp) * 100)}% compared to last month. Analyze your largest transactions.`,
          type: "warning",
          page: "transactions"
        });
      }
    }
    
    if (insights.length === 0) {
      insights.push({
        title: "Steady Progress",
        message: "Your financial vitals are stable. Keep tracking your daily expenses to maintain your consistency streak.",
        type: "info",
        page: "dashboard"
      });
    }
    
    return insights.slice(0, 3);
  }
}

