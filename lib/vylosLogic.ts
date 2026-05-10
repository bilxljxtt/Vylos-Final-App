import { Transaction, Goal, BudgetCategory, AppState } from "./store";
import { getTransactionDateKey } from "./utils";

/**
 * Standardized South African Rand (ZAR) Formatter
 * Example: R24,542.19
 */
export function formatZAR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "R0.00";
  
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace("ZAR", "R").trim();
}

/**
 * Calculates a 0-100 Financial Health Score based on real user data
 */
export function calculateFinancialHealthScore(state: AppState): { score: number; status: string; label: string } {
  const { transactions, budgets, goals, userProfile } = state;
  
  if (transactions.length < 3 && Object.keys(budgets).length === 0) {
    return { score: 0, status: "neutral", label: "Not enough data yet" };
  }

  let totalScore = 0;
  let factors = 0;

  // 1. Budget Performance (30%)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthSpent = transactions
    .filter(t => getTransactionDateKey(t).startsWith(currentMonth) && t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const totalBudgetLimit = Object.values(budgets).reduce((acc, b) => acc + (b.limit || 0), 0);
  
  if (totalBudgetLimit > 0) {
    factors += 30;
    const budgetUtilization = monthSpent / totalBudgetLimit;
    if (budgetUtilization <= 0.85) totalScore += 30;
    else if (budgetUtilization <= 1.0) totalScore += 15;
    else totalScore += 0; // Over budget
  }

  // 2. Savings Rate (30%)
  const monthlyIncome = userProfile.monthlyIncome || 0;
  if (monthlyIncome > 0) {
    factors += 30;
    const savingsRate = (monthlyIncome - monthSpent) / monthlyIncome;
    if (savingsRate >= 0.2) totalScore += 30;
    else if (savingsRate >= 0.1) totalScore += 20;
    else if (savingsRate > 0) totalScore += 10;
  }

  // 3. Goal Progress (20%)
  if (goals.length > 0) {
    factors += 20;
    const avgProgress = goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / goals.length;
    totalScore += Math.min(20, Math.round(avgProgress * 20));
  }

  // 4. Spending Consistency (20%)
  // Simple check: do we have at least 5 transactions in the last 7 days?
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentTxCount = transactions.filter(t => new Date(getTransactionDateKey(t)) >= sevenDaysAgo).length;
  factors += 20;
  if (recentTxCount >= 5) totalScore += 20;
  else if (recentTxCount >= 2) totalScore += 10;

  const finalScore = factors > 0 ? Math.round((totalScore / factors) * 100) : 0;
  
  let label = "At Risk";
  let status = "critical";
  
  if (finalScore >= 80) { label = "Excellent"; status = "positive"; }
  else if (finalScore >= 60) { label = "Good"; status = "neutral"; }
  else if (finalScore >= 40) { label = "Fair"; status = "warning"; }

  return { score: finalScore, status, label };
}

/**
 * Centralized XP Rewards logic
 */
export const XP_REWARDS = {
  ADD_TRANSACTION: 10,
  ADD_BUDGET: 50,
  ADD_GOAL: 50,
  COMPLETE_TASK: 25,
  REACH_GOAL_MILESTONE: 100,
  WEEKLY_ADHERENCE: 200,
  ONBOARDING_COMPLETE: 500
};

/**
 * Formats a percentage safely (0-100)
 */
export function formatPercent(value: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}
