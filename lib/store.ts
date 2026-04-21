// ─── Vylos Mock Data Store ───────────────────────────────────────────────────
// All app data lives here. AppContext wraps this with React state + localStorage.

export type TransactionCategory =
  | "Utilities"
  | "Emergency Fund"
  | "Side Hustle"
  | "Dining Out"
  | "Subscriptions"
  | "Groceries"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Housing"
  | "Bills"
  | "Other";

export interface Transaction {
  id: string;
  date: string; // ISO string
  merchant: string;
  category: TransactionCategory;
  amount: number; // negative = expense, positive = income
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  frequency: "Monthly" | "Annual" | "Weekly";
  nextDue: string; // ISO string
  amount: number;
}

export interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  createdAt: string;
  targetDate?: string; // Optional target date
}

export interface BudgetCategory {
  spent: number;
  limit: number;
  type: "limit" | "target";
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  theme: "Light" | "Dark" | "System Default";
  language: string;
  currency: string;
  avatarUrl?: string;
  monthlyIncome?: number;
  country?: string;
  age?: number;
  householdSize?: number;
  riskTolerance?: number;
  trialStartedAt?: string;
  subscriptionPlan?: 'starter' | 'go' | 'pro';
  subscriptionStatus?: 'active' | 'canceled' | 'trialing';
}

export interface NotificationPrefs {
  budgetAlerts: boolean;
  billReminders: boolean;
  securityAlerts: boolean;
}

export interface AppState {
  transactions: Transaction[];
  subscriptions: Subscription[];
  goals: Goal[];
  budgets: Record<string, BudgetCategory>;
  userProfile: UserProfile;
  notifications: NotificationPrefs;
  unreadNotificationCount: number;
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const initialState: AppState = {
  transactions: [],
  subscriptions: [],
  goals: [],
  budgets: {
    Utilities:     { spent: 0, limit: 0, type: "limit" },
    "Emergency Fund": { spent: 0, limit: 0, type: "target" },
  },
  userProfile: {
    name: "",
    email: "",
    phone: "",
    theme: "Light",
    language: "English (US)",
    currency: "South African Rand (R)",
    avatarUrl: "",
    monthlyIncome: 0,
    country: "South Africa (ZAR)",
    age: 0,
    householdSize: 1,
    riskTolerance: 65,
  },
  notifications: {
    budgetAlerts: true,
    billReminders: true,
    securityAlerts: false,
  },
  unreadNotificationCount: 0,
};

// ─── Derived / Computed Helpers ───────────────────────────────────────────────

export function computeLiquidBalance(state: AppState): number {
  const accumulatedGoals = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const netCashFlow = state.transactions.reduce((acc, t) => acc + t.amount, 0);
  return accumulatedGoals + netCashFlow;
}

export type HealthScoreMetrics = {
  score: number;
  label: "Poor" | "Fair" | "Good" | "Strong" | "Excellent";
  cashFlowState: "Negative" | "Tight" | "Positive";
  savingsRate: "Low" | "Moderate" | "High";
  debtLevel: "Low" | "Moderate" | "High";
  netWorthState: "Negative" | "Low" | "Healthy" | "High";
};

export function computeHealthScoreMetrics(state: AppState): HealthScoreMetrics {
  const { budgets, userProfile } = state;
  const income = userProfile.monthlyIncome || 0;
  
  // Expenses and Cash Flow (Max 50 points)
  const totalLimit = computeTotalBudgetLimit(budgets);
  const totalSpent = computeTotalBudgetSpent(budgets);

  let cashFlowScore = 0;
  let cashFlowState: HealthScoreMetrics["cashFlowState"] = "Tight";
  if (totalSpent > income) {
    cashFlowState = "Negative";
    cashFlowScore = 0;
  } else if (totalSpent <= income * 0.7) {
    cashFlowState = "Positive";
    cashFlowScore = 50;
  } else if (totalSpent <= income * 0.9) {
    cashFlowScore = 35;
    cashFlowState = "Tight";
  } else {
    cashFlowScore = 15;
    cashFlowState = "Tight";
  }

  // Savings / Targets Execution (Max 50 points)
  const savingsTargets = Object.values(budgets).filter(b => b.type === "target");
  const totalSavingsLimit = savingsTargets.reduce((s, b) => s + b.limit, 0);
  const savingsRatePct = income > 0 ? totalSavingsLimit / income : 0;

  let savingsScore = 0;
  let savingsRate: HealthScoreMetrics["savingsRate"] = "Moderate";
  if (savingsRatePct >= 0.2) {
    savingsRate = "High";
    savingsScore = 50;
  } else if (savingsRatePct >= 0.1) {
    savingsRate = "Moderate";
    savingsScore = 30;
  } else {
    savingsRate = "Low";
    savingsScore = 10;
  }

  // Compute final 0-100 score
  let score = cashFlowScore + savingsScore;
  score = Math.min(Math.max(score, 0), 100);

  let label: HealthScoreMetrics["label"] = "Good";
  if (score <= 25) label = "Poor";
  else if (score <= 50) label = "Fair";
  else if (score <= 75) label = "Good";
  else if (score <= 90) label = "Strong";
  else label = "Excellent";

  return { 
    score, 
    label, 
    cashFlowState, 
    savingsRate,
    debtLevel: "Low", // To be refined with real debt/liability tracking
    netWorthState: score > 70 ? "Healthy" : "Low" 
  };
}

export function computeHealthScore(state: AppState): number {
  return computeHealthScoreMetrics(state).score;
}

export type GoalFeasibility = {
  status: "Realistic" | "Moderate" | "Difficult" | "Unrealistic";
  monthsRemaining: number;
  requiredMonthlyDeposit: number;
  surplusCash: number;
  message: string;
};

export function computeGoalFeasibility(state: AppState, goal: Goal): GoalFeasibility {
  const surplus = (state.userProfile.monthlyIncome || 0) - computeTotalBudgetSpent(state.budgets);
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  
  // If no surplus, any goal with a balance remaining is unrealistic
  if (surplus <= 0) {
    return {
      status: "Unrealistic",
      monthsRemaining: Infinity,
      requiredMonthlyDeposit: 0,
      surplusCash: surplus,
      message: "At your current savings rate, this goal is not currently realistic unless your income increases or your expenses decrease."
    };
  }

  const monthsNeeded = remainingAmount / surplus;
  let status: GoalFeasibility["status"] = "Realistic";
  let message = "This goal aligns perfectly with your current financial capacity.";

  if (monthsNeeded > 60) { // > 5 years
    status = "Difficult";
    message = "This goal will take over 5 years. Consider increasing your monthly contributions.";
  } else if (monthsNeeded > 24) { // > 2 years
    status = "Moderate";
    message = "Achievable with consistent discipline over the next 2+ years.";
  }

  // If there's a target date, check if we can actually hit it
  let requiredDeposit = surplus;
  if (goal.targetDate) {
    const target = new Date(goal.targetDate);
    const now = new Date();
    const monthsUntil = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    
    if (monthsUntil > 0) {
      requiredDeposit = remainingAmount / monthsUntil;
      if (requiredDeposit > surplus) {
        status = "Unrealistic";
        message = `To hit this target date, you need to save ${formatMoney(requiredDeposit, state.userProfile.country)}/mo, which exceeds your current surplus of ${formatMoney(surplus, state.userProfile.country)}.`;
      }
    }
  }

  return {
    status,
    monthsRemaining: Math.ceil(monthsNeeded),
    requiredMonthlyDeposit: requiredDeposit,
    surplusCash: surplus,
    message
  };
}

export function computeTotalBudgetSpent(budgets: Record<string, BudgetCategory>): number {
  return Object.values(budgets)
    .filter((b) => b.type === "limit")
    .reduce((sum, b) => sum + b.spent, 0);
}

export function computeTotalBudgetLimit(budgets: Record<string, BudgetCategory>): number {
  return Object.values(budgets)
    .filter((b) => b.type === "limit")
    .reduce((sum, b) => sum + b.limit, 0);
}

export function getCurrencySymbol(countryStr?: string): string {
  if (!countryStr) return "R";
  if (countryStr.includes("ZAR") || countryStr.includes("South Africa")) return "R";
  if (countryStr.includes("USD") || countryStr.includes("USA") || countryStr.includes("United States")) return "$";
  if (countryStr.includes("GBP") || countryStr.includes("United Kingdom") || countryStr.includes("Britain")) return "£";
  if (countryStr.includes("EUR") || countryStr.includes("Germany") || countryStr.includes("France") || countryStr.includes("Europe")) return "€";
  if (countryStr.includes("Kenya")) return "KSh ";
  if (countryStr.includes("Nigeria")) return "₦";
  if (countryStr.includes("India")) return "₹";
  if (countryStr.includes("Japan")) return "¥";
  if (countryStr.includes("China")) return "¥";
  if (countryStr.includes("Brazil")) return "R$";
  if (countryStr.includes("Mexico") || countryStr.includes("Australia") || countryStr.includes("Canada") || countryStr.includes("New Zealand")) return "$";
  return "R";
}

export function formatMoney(val: number, country?: string): string {
  const symbol = getCurrencySymbol(country);
  // Ensure we get raw numbers like "50,000" rather than browser locale quirks
  const formatted = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(val));
  const prefix = val < 0 ? "-" : "";
  return `${prefix}${symbol}${formatted}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
