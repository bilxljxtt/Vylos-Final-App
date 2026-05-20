import { AppState, Transaction, BudgetCategory, formatMoney, computeHealthScoreMetrics } from "./store";
import { getTransactionDateKey } from "./utils";
import { VylosEngine } from "./vylosEngine";

export interface TransactionIndex {
  monthMap: Record<string, Transaction[]>;
  dateMap: Record<string, Transaction[]>;
}

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

  static createTransactionIndex(transactions: Transaction[]): TransactionIndex {
    const monthMap: Record<string, Transaction[]> = {};
    const dateMap: Record<string, Transaction[]> = {};

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      const dateKey = getTransactionDateKey(t);
      const monthKey = dateKey.slice(0, 7);

      if (!monthMap[monthKey]) monthMap[monthKey] = [];
      monthMap[monthKey].push(t);

      if (!dateMap[dateKey]) dateMap[dateKey] = [];
      dateMap[dateKey].push(t);
    }

    return { monthMap, dateMap };
  }

  static getMonthStats(state: AppState, monthStr: string, index?: TransactionIndex): DashboardStats {
    const currentMonthPrefix = monthStr.slice(0, 7);
    
    let income = 0;
    let expense = 0;
    let netWorth = 0;
    let investmentSpend = 0;
    
    const investmentCategories = ["Savings", "Debt Payments"];
    const txs = index ? index.monthMap[currentMonthPrefix] || [] : state.transactions;
    const allTxs = state.transactions;

    // Net worth needs full history, but stats need current month
    // We'll use allTxs for netWorth and txs for monthly metrics
    
    // Net Worth Calculation (Optimized - needs to run once)
    for (let i = 0; i < allTxs.length; i++) {
      const t = allTxs[i];
      if (!this.isBudgetRecord(t.merchant)) {
        netWorth += t.amount;
      }
    }

    for (let i = 0; i < txs.length; i++) {
      const t = txs[i];
      if (!this.isBudgetRecord(t.merchant)) {
        if (investmentCategories.includes(t.category)) {
          investmentSpend += Math.abs(t.amount);
        }

        if (t.amount > 0) {
          income += t.amount;
        } else {
          expense += Math.abs(t.amount);
        }
      }
    }

    const totalSaved = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalBudget = Object.values(state.budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);
    
    return {
      income,
      expense,
      netWorth: Number.isFinite(netWorth) ? netWorth : 0,
      savingsRate: income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0,
      totalSaved: Math.max(0, totalSaved),
      budgetUtilization: totalBudget > 0 ? Math.round((expense / totalBudget) * 100) : 0,
      activeGoalsCount: state.goals.filter(g => g.status === 'On Track' || g.status === 'At Risk').length,
      portfolioTotal: Number.isFinite(investmentSpend + totalSaved) ? (investmentSpend + totalSaved) : 0,
      cashFlowIndex: income - expense
    };
  }

  static getSpendingByCategory(state: AppState, monthStr: string, index?: TransactionIndex): Record<string, number> {
    const currentMonthPrefix = monthStr.slice(0, 7);
    const spendMap: Record<string, number> = {};
    const txs = index ? index.monthMap[currentMonthPrefix] || [] : state.transactions;

    for (let i = 0; i < txs.length; i++) {
      const t = txs[i];
      if (t.amount < 0 && !this.isBudgetRecord(t.merchant)) {
        spendMap[t.category] = (spendMap[t.category] || 0) + Math.abs(t.amount);
      }
    }

    return spendMap;
  }

  static getAllocationPercentages(state: AppState, monthStr: string) {
    const spendByCat = this.getSpendingByCategory(state, monthStr);
    const total = Object.values(spendByCat).reduce((a, b) => a + b, 0);

    if (total === 0) return { needs: 0, wants: 0 };

    const needsCategories = ["Rent / Housing", "Bills", "Transport", "Health", "Education", "Groceries", "Insurance", "Utilities", "Debt Payments"];
    let needs = 0;
    
    for (const [cat, amt] of Object.entries(spendByCat)) {
      if (needsCategories.includes(cat)) {
        needs += amt;
      }
    }
    
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
  
  static getPlannedVsActual(state: AppState, monthStr: string, index?: any) {
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
      
      const dayTransactions = index 
        ? (index.dateMap[dateStr] || []).filter((t: any) => t.amount < 0 && !this.isBudgetRecord(t.merchant))
        : state.transactions.filter((t: any) => {
            const d = getTransactionDateKey(t);
            return d === dateStr && t.amount < 0 && !this.isBudgetRecord(t.merchant);
          });
      
      const daySpend = dayTransactions.reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);
      runningActual += daySpend;
      
      // If the day is in the future, don't push actual data
      const isPastOrToday = new Date(dateStr) <= new Date();
      actualData.push(isPastOrToday ? Math.round(runningActual) : null);
    }
    
    return { labels, planned: plannedData, actual: actualData };
  }

  static getRemindersSummary(state: AppState) {
    const { getReminderDerivedStatus, generateReminderOccurrences } = require("./utils");
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const reminders = generateReminderOccurrences(state.reminders || [], state.reminderCompletions || [], year, month);
    
    let dueTodayCount = 0;
    let dueTodayAmount = 0;
    let upcomingCount = 0;
    let upcomingAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let completedCount = 0;
    
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    reminders.forEach((r: any) => {
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
      totalScheduledAmount: reminders.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
    };
  }

  static getRecentInsights(state: AppState) {
    const stats = this.getMonthStats(state, state.selectedMonth);
    const engineOutput = VylosEngine.run(state);
    const now = new Date();
    
    const insights = [];
    
    // 1. Negative Cash Flow Insight
    if (stats.cashFlowIndex < 0 && stats.income > 0) {
      insights.push({
        title: "Negative Cash Flow",
        message: `Your expenses have exceeded your income by ${formatMoney(Math.abs(stats.cashFlowIndex))}. Review your budget to prevent going into debt.`,
        type: "warning",
        page: "budget"
      });
    }

    // 2. Spending Trend Insight
    const trend = this.getMonthlyTrend(state, 2);
    if (trend.length === 2) {
      const currentExp = trend[trend.length - 1].expense;
      const prevExp = trend[trend.length - 2].expense;
      if (prevExp > 0 && currentExp > prevExp * 1.1) {
        insights.push({
          title: "Spending Spike Detected",
          message: `Your spending is up ${Math.round(((currentExp - prevExp) / prevExp) * 100)}% compared to last month. Consider reviewing your recent transactions.`,
          type: "warning",
          page: "transactions"
        });
      }
    }

    // 3. Category Over-consumption Insight
    const spendByCategory = this.getSpendingByCategory(state, state.selectedMonth);
    const nonEssentialCategories = ["Dining Out", "Entertainment", "Shopping", "Personal Care"];
    for (const [cat, amount] of Object.entries(spendByCategory)) {
      if (stats.income > 0 && nonEssentialCategories.includes(cat)) {
        const percent = (amount / stats.income) * 100;
        if (percent > 20) {
          insights.push({
            title: "Category Consumption Alert",
            message: `The '${cat}' category is consuming ${Math.round(percent)}% of your monthly income.`,
            type: "warning",
            page: "analytics"
          });
          break; // Only show one category warning
        }
      }
    }

    // 4. Unused Budget Remaining Insight
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - now.getDate();
    if (daysRemaining <= 7 && daysRemaining > 0) {
      const totalBudget = Object.values(state.budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);
      if (totalBudget > 0) {
        const remainingBudget = totalBudget - stats.expense;
        if (remainingBudget > (totalBudget * 0.2)) {
          insights.push({
            title: "Unused Budget Remaining",
            message: `You have ${formatMoney(remainingBudget)} left in your budget with only ${daysRemaining} days remaining in the month. Great discipline!`,
            type: "success",
            page: "budget"
          });
        }
      }
    }

    // 5. Goal Behind Schedule Insight
    const activeGoals = state.goals.filter(g => g.currentAmount < g.targetAmount);
    for (const goal of activeGoals) {
      if (!goal.deadline) continue;
      const deadlineDate = new Date(goal.deadline);
      const monthsRemaining = (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth());
      if (monthsRemaining > 0) {
        const remainingAmount = goal.targetAmount - goal.currentAmount;
        const requiredMonthly = remainingAmount / monthsRemaining;
        const freeCashFlow = stats.income - stats.expense;
        // If the required monthly is significantly more than they usually save or what they have free, it's at risk
        if (requiredMonthly > freeCashFlow && freeCashFlow > 0) {
           insights.push({
             title: "Goal Behind Schedule",
             message: `Your goal '${goal.title}' is at risk. You need ${formatMoney(requiredMonthly)}/month, but your current free cash flow is only ${formatMoney(freeCashFlow)}.`,
             type: "warning",
             page: "goals"
           });
           break; // Just one goal warning
        }
      }
    }

    // 6. Upcoming Bill Risk Insight
    const remindersSummary = this.getRemindersSummary(state);
    if (remindersSummary.upcomingCount > 0) {
      const upcomingBills = remindersSummary.upcomingAmount;
      const currentBalance = stats.income - stats.expense;
      if (upcomingBills > currentBalance) {
         insights.push({
            title: "Upcoming Bill Risk",
            message: `You have ${formatMoney(upcomingBills)} in upcoming bills, which exceeds your current available cash flow of ${formatMoney(currentBalance)}.`,
            type: "critical",
            page: "reminders"
         });
      }
    }

    if (insights.length === 0) {
      insights.push({
        title: "All Systems Nominal",
        message: "Your financial vitals are stable. Keep tracking your daily expenses to maintain your consistency.",
        type: "info",
        page: "dashboard"
      });
    }
    
    // Sort critical and warnings first
    const severityMap: Record<string, number> = { critical: 0, warning: 1, info: 2, success: 3 };
    insights.sort((a, b) => severityMap[a.type] - severityMap[b.type]);

    return insights.slice(0, 3);
  }

}

