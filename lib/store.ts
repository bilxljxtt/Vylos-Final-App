// ─── Vylos Mock Data Store ───────────────────────────────────────────────────
// All app data lives here. AppContext wraps this with React state + localStorage.

export type TransactionCategory =
  | "Salary"
  | "Business Income"
  | "Refund"
  | "Other Income"
  | "Groceries"
  | "Eating Out"
  | "Transport"
  | "Bills"
  | "Rent / Housing"
  | "Shopping"
  | "Health"
  | "Education"
  | "Entertainment"
  | "Subscriptions"
  | "Savings"
  | "Debt Payments"
  | "Other";

export const CATEGORY_METADATA: Record<TransactionCategory, { icon: string; color: string }> = {
  "Salary": { icon: "💰", color: "#00BFA5" },
  "Business Income": { icon: "📈", color: "#00BFA5" },
  "Refund": { icon: "🔄", color: "#00BFA5" },
  "Other Income": { icon: "💸", color: "#00BFA5" },
  "Groceries": { icon: "🛒", color: "#00C853" },
  "Eating Out": { icon: "🍔", color: "#FF7043" },
  "Transport": { icon: "🚗", color: "#7C4DFF" },
  "Bills": { icon: "⚡", color: "#FF6D00" },
  "Rent / Housing": { icon: "🏠", color: "#795548" },
  "Shopping": { icon: "🛍", color: "#0091EA" },
  "Health": { icon: "❤️", color: "#FF1744" },
  "Education": { icon: "📚", color: "#3F51B5" },
  "Entertainment": { icon: "🎬", color: "#F50057" },
  "Subscriptions": { icon: "📱", color: "#00BCD4" },
  "Savings": { icon: "🏦", color: "#4CAF50" },
  "Debt Payments": { icon: "💳", color: "#607D8B" },
  "Other": { icon: "📦", color: "#546E7A" },
};

export interface Transaction {
  id: string;
  date: string; // Legacy NOT NULL column (ISO date)
  transaction_date?: string; // New modernized date column
  merchant: string;
  category: TransactionCategory;
  amount: number; // negative = expense, positive = income
  notes?: string;
  recurring?: boolean;
  payment_status?: string;
  createdAt?: string; // System fallback
  updatedAt?: string;
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
  deadline: string; // ISO date
  category?: string;
  notes?: string;
  status: "On Track" | "Behind" | "Completed" | "At Risk";
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface BudgetCategory {
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
  onboardingCompleted?: boolean;
  budgetAlertSent?: boolean;
  budgetAlertEnabled?: boolean;
  isAdmin?: boolean;
}

export interface NotificationPrefs {
  budgetAlerts: boolean;
  billReminders: boolean;
  securityAlerts: boolean;
}

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO string
  category: string;
  repeat?: string;
  isPaid?: boolean;
}

import { MerchantRule } from "./services/CategorizationEngine";

export interface AppState {
  transactions: Transaction[];
  subscriptions: Subscription[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  reminders: Reminder[];
  merchantRules: MerchantRule[];
  budgets: Record<string, BudgetCategory>;
  userProfile: UserProfile;
  notifications: NotificationPrefs;
  notificationList: Notification[];
  unreadNotificationCount: number;
  selectedMonth: string; // ISO format "YYYY-MM-DD"
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  "Salary",
  "Business Income",
  "Refund",
  "Other Income",
  "Groceries",
  "Eating Out",
  "Transport",
  "Bills",
  "Rent / Housing",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "Subscriptions",
  "Savings",
  "Debt Payments",
  "Other",
];

export function getMonthStart(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const initialState: AppState = {
  transactions: [],
  subscriptions: [],
  goals: [],
  goalContributions: [],
  reminders: [],
  merchantRules: [],
  unreadNotificationCount: 0,
  notificationList: [],
  selectedMonth: getMonthStart(),
  budgets: {
    "Groceries": { limit: 3000, type: "limit" },
    "Bills": { limit: 3500, type: "limit" },
    "Rent / Housing": { limit: 8000, type: "limit" },
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
    budgetAlertSent: false,
    budgetAlertEnabled: true,
  },
  notifications: {
    budgetAlerts: true,
    billReminders: true,
    securityAlerts: false,
  },
};

// ─── Derived / Computed Helpers ───────────────────────────────────────────────

import { VylosEngine } from "./vylosEngine";

export function computeLiquidBalance(state: AppState): number {
  const accumulatedGoals = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const netCashFlow = state.transactions.reduce((acc, t) => acc + t.amount, 0);
  return accumulatedGoals + netCashFlow;
}

export type HealthScoreMetrics = {
  score: number;
  label: string;
  breakdown: {
    spending: number; // Mapping C
    savings: number; // Mapping Q
    budget: number; // Mapping D
    goals: number; // Mapping G
  };
  stats: {
    runwayMonths: number;
    budgetUtilization: number;
    savingsRate: number;
  }
};

export function computeHealthScoreMetrics(state: AppState): HealthScoreMetrics {
  const engine = VylosEngine.run(state);
  const { score, category, components } = VylosEngine.computeHealthScore(state);
  const budget = VylosEngine.computeBudget(state);
  const burnRate = VylosEngine.computeBurnRate(state);
  const income = state.userProfile.monthlyIncome || 1;
  const expenses = state.transactions
    .filter(t => t.date >= getMonthStart() && t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return { 
    score, 
    label: category,
    breakdown: {
      spending: Math.round(components.C * 25),
      savings: Math.round(components.Q * 25),
      budget: Math.round(components.D * 25),
      goals: Math.round(components.G * 25)
    },
    stats: {
      runwayMonths: burnRate.months,
      budgetUtilization: budget.monthlyBudget > 0 ? Math.round((expenses / budget.monthlyBudget) * 100) : 0,
      savingsRate: Math.round(((income - expenses) / income) * 100)
    }
  };
}

export function computeHealthScore(state: AppState): number {
  return VylosEngine.computeHealthScore(state).score;
}

export type GoalFeasibility = {
  status: string;
  monthsRemaining: number;
  requiredMonthlyDeposit: number;
  surplusCash: number;
  message: string;
};

export function computeGoalFeasibility(state: AppState, goal: Goal): GoalFeasibility {
  const engineRes = VylosEngine.computeGoalFeasibility({ ...state, goals: [goal] });
  const income = state.userProfile.monthlyIncome || 0;
  const survivalCost = (state.budgets["Bills"]?.limit || 0) + (state.budgets["Groceries"]?.limit || 0);
  
  return {
    status: engineRes.status,
    monthsRemaining: 12, // Default assumption
    requiredMonthlyDeposit: (goal.targetAmount - goal.currentAmount) / 12,
    surplusCash: income - survivalCost,
    message: engineRes.recommendation
  };
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
