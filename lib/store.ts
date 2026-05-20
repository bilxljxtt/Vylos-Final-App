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
  | "Debt Payments"
  | "Savings"
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
  "Debt Payments": { icon: "💳", color: "#FF1744" },
  "Savings": { icon: "🐷", color: "#00BFA5" },
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
  id: string;
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
  subscription_tier: 'free' | 'individual' | 'entrepreneur' | 'business' | 'internal';
  subscription_status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled';
  role: 'user' | 'tester' | 'admin' | 'founder';
  is_internal_user: boolean;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  trial_ends_at?: string;
  payment_provider?: string;
  payment_customer_id?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  termsLastUpdated?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  userType?: string;
  reason_for_using_vylos?: string;
  moneyConfidence?: string;
  first_tracking_focus?: string;
  currentTrackingMethod?: string;
  biggest_money_challenge?: string;
  monthly_income_range?: string;
  main_money_goal?: string;
  review_frequency?: string;
  communication_preference?: string;
  budgetAlertSent?: boolean;
  budgetAlertEnabled?: boolean;
  created_at?: string;
  totalXp?: number;
  currentRank?: string;
  xpMultiplier?: number;
  currentStreak?: number;
  longestStreak?: number;
  dailyConsistencyScore?: number;
  lastConsistencyDate?: string;
  lastLoginXpDate?: string;
  dismissed_notifications?: string[];
}

export interface NotificationPrefs {
  budgetAlerts: boolean;
  billReminders: boolean;
  securityAlerts: boolean;
  goalUpdates: boolean;
  weeklySummary: boolean;
}

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  created_at: string;
  stable_id?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  category: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string; // HH:mm
  priority: "low" | "medium" | "high";
  recurring: "none" | "daily" | "weekly" | "monthly";
  status: "pending" | "completed" | "overdue";
  amount?: number; // Optional amount if linked to a bill
  completed_at?: string;
  billing_day?: number; // Day of month for recurring items
}

export interface ReminderCompletion {
  id: string;
  reminder_id: string;
  user_id: string;
  year: number;
  month: number;
  completed_at: string;
}

export interface BackendHealthScore {
  score: number;
  status: string;
  breakdown: {
    income_stability: number;
    expense_control: number;
    savings_progress: number;
    budget_usage: number;
    bills_risk: number;
    monthly_income: number;
    monthly_expenses: number;
    expense_to_income_ratio: number;
    top_overspending_category: string;
  };
  calculated_at: string;
}

import { MerchantRule } from "./services/CategorizationEngine";

export interface AppState {
  transactions: Transaction[];
  subscriptions: Subscription[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  reminders: Reminder[];
  reminderCompletions: ReminderCompletion[];
  merchantRules: MerchantRule[];
  budgets: Record<string, BudgetCategory>;
  userProfile: UserProfile;
  notifications: NotificationPrefs;
  notificationList: Notification[];
  unreadNotificationCount: number;
  selectedMonth: string; // ISO format "YYYY-MM-DD"
  aiUsage: { messages_used: number; billing_month: string };
  backendHealthScore: BackendHealthScore | null;
  isCalculatingHealthScore: boolean;
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
  "Debt Payments",
  "Savings",
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
  reminderCompletions: [],
  merchantRules: [],
  unreadNotificationCount: 0,
  notificationList: [],
  selectedMonth: getMonthStart(),
  aiUsage: { messages_used: 0, billing_month: new Date().toISOString().slice(0, 7) },
  budgets: {},
  userProfile: {
    id: "",
    name: "",
    email: "",
    phone: "",
    theme: "Light",
    language: "English (US)",
    avatarUrl: "",
    monthlyIncome: 0,
    country: "South Africa",
    age: 0,
    householdSize: 1,
    riskTolerance: 65,
    budgetAlertSent: false,
    budgetAlertEnabled: true,
    currency: "R",
    termsAccepted: false,
    termsAcceptedAt: "",
    termsVersion: "v1.0",
    termsLastUpdated: "2024-05-08",
    onboardingCompleted: false,
    onboardingCompletedAt: "",
    userType: "",
    reason_for_using_vylos: "",
    moneyConfidence: "",
    first_tracking_focus: "",
    currentTrackingMethod: "",
    biggest_money_challenge: "",
    monthly_income_range: "",
    main_money_goal: "",
    review_frequency: "",
    communication_preference: "",
    subscription_tier: 'free',
    subscription_status: 'active',
    role: 'user',
    is_internal_user: false,
    totalXp: 0,
    currentRank: "Scout Analyst",
    xpMultiplier: 1.0,
    currentStreak: 0,
    longestStreak: 0,
    dailyConsistencyScore: 0,
    lastConsistencyDate: "",
    lastLoginXpDate: ""
  },
  notifications: {
    budgetAlerts: true,
    billReminders: true,
    securityAlerts: false,
    goalUpdates: true,
    weeklySummary: true,
  },
  backendHealthScore: null,
  isCalculatingHealthScore: false,
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
  const c = countryStr.toLowerCase();
  if (c.includes("zar") || c.includes("south africa") || c.includes("rand")) return "R";
  if (c.includes("usd") || c.includes("usa") || c.includes("united states")) return "$";
  if (c.includes("gbp") || c.includes("united kingdom") || c.includes("britain")) return "£";
  if (c.includes("eur") || c.includes("germany") || c.includes("france") || c.includes("europe")) return "€";
  if (c.includes("kenya")) return "KSh ";
  if (c.includes("nigeria")) return "₦";
  if (c.includes("india")) return "₹";
  if (c.includes("japan") || c.includes("china")) return "¥";
  if (c.includes("brazil")) return "R$";
  if (c.includes("mexico") || c.includes("australia") || c.includes("canada") || c.includes("new zealand")) return "$";
  return "R";
}

export function formatMoney(val: number, currency: string = "R"): string {
  // Safe handling for invalid numbers
  if (val === null || val === undefined || isNaN(val)) return "R0";
  if (!isFinite(val)) return "R∞";

  // Standardize currency to R
  const symbol = "R";
  
  // Use Intl.NumberFormat for robust formatting across all scales (small to billion)
  const formatter = new Intl.NumberFormat("en-ZA", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: (Math.abs(val) < 100 && val % 1 !== 0) ? 2 : 0
  });

  const formatted = formatter.format(val);
  
  // Handle negative values correctly (e.g. -R1,234 instead of R-1,234)
  if (val < 0) {
    return `-${symbol}${formatted.replace("-", "")}`;
  }
  
  return `${symbol}${formatted}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
