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
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const initialState: AppState = {
  transactions: [
    { id: "t1", date: "2026-03-26", merchant: "City Power", category: "Utilities", amount: -8585 },
    { id: "t2", date: "2026-03-11", merchant: "Emergency Fund Deposit", category: "Emergency Fund", amount: 5331 },
    { id: "t3", date: "2026-03-10", merchant: "Freelance Client", category: "Side Hustle", amount: 10000 },
    { id: "t4", date: "2026-03-05", merchant: "Ocean Basket", category: "Dining Out", amount: -5000 },
    { id: "t5", date: "2026-03-01", merchant: "Amazon Prime (Recurring)", category: "Subscriptions", amount: -500 },
  ],
  subscriptions: [
    { id: "s1", name: "Amazon Prime", category: "Subscriptions", frequency: "Monthly", nextDue: "2026-04-01", amount: 500 },
  ],
  goals: [
    { id: "g1", title: "Emergency Fund", currentAmount: 5331, targetAmount: 90000, createdAt: "2026-01-01" },
    { id: "g2", title: "M5", currentAmount: 0, targetAmount: 2000000, createdAt: "2026-01-01" },
  ],
  budgets: {
    Groceries:     { spent: 0,    limit: 3150,    type: "limit" },
    Subscriptions: { spent: 500,  limit: 900,     type: "limit" },
    Savings:       { spent: 5331, limit: 1500,    type: "target" },
    Entertainment: { spent: 0,    limit: 900,     type: "limit" },
    Housing:       { spent: 0,    limit: 9000,    type: "limit" },
    Transport:     { spent: 0,    limit: 1575,    type: "limit" },
    Shopping:      { spent: 0,    limit: 900,     type: "limit" },
    Utilities:     { spent: 8585, limit: 5000,    type: "limit" },
    Bills:         { spent: 0,    limit: 1500,    type: "limit" },
    "Dining Out":  { spent: 5000, limit: 1200,    type: "limit" },
    "Emergency Fund": { spent: 5331, limit: 90000, type: "target" },
    M5:            { spent: 0,    limit: 2000000, type: "target" },
  },
  userProfile: {
    name: "Bilal",
    email: "bilal.t@gmail.com",
    phone: "0731099565",
    theme: "Light",
    language: "English (US)",
    currency: "South African Rand (R)",
  },
  notifications: {
    budgetAlerts: true,
    billReminders: true,
    securityAlerts: false,
  },
};

// ─── Derived / Computed Helpers ───────────────────────────────────────────────

export function computeNetWorth(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function computeHealthScore(state: AppState): number {
  const { budgets, goals } = state;
  // Budget adherence: avg % within limits
  const limitCats = Object.values(budgets).filter((b) => b.type === "limit");
  const avgAdherence = limitCats.length
    ? limitCats.reduce((sum, b) => {
        const pct = b.limit > 0 ? Math.min(b.spent / b.limit, 1) : 0;
        return sum + (1 - pct);
      }, 0) / limitCats.length
    : 0.5;

  // Goals progress
  const totalGoalProgress =
    goals.length > 0
      ? goals.reduce((sum, g) => sum + Math.min(g.currentAmount / g.targetAmount, 1), 0) / goals.length
      : 0;

  // Score out of 850
  const baseScore = 300;
  const maxBonus = 550;
  return Math.round(baseScore + maxBonus * (avgAdherence * 0.7 + totalGoalProgress * 0.3));
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

export function formatZAR(val: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" })
    .format(val)
    .replace("ZAR", "R");
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
