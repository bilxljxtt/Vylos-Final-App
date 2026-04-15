"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  AppState,
  initialState,
  Transaction,
  Subscription,
  Goal,
  BudgetCategory,
  UserProfile,
  NotificationPrefs,
  generateId,
} from "./store";

// ─── Action Types ─────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_TRANSACTION"; payload: Omit<Transaction, "id"> }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_SUBSCRIPTION"; payload: Omit<Subscription, "id"> }
  | { type: "DELETE_SUBSCRIPTION"; payload: string }
  | { type: "ADD_GOAL"; payload: Omit<Goal, "id" | "createdAt"> }
  | { type: "UPDATE_GOAL"; payload: { id: string; updates: Partial<Goal> } }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "DEPOSIT_TO_GOAL"; payload: { id: string; amount: number } }
  | { type: "UPDATE_BUDGET_LIMIT"; payload: { category: string; limit: number } }
  | { type: "UPDATE_BUDGET_SPENT"; payload: { category: string; spent: number } }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "UPDATE_NOTIFICATIONS"; payload: Partial<NotificationPrefs> }
  | { type: "RESET" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_TRANSACTION": {
      const newTx: Transaction = { ...action.payload, id: generateId() };
      // Also update budget spent for the category
      const cat = action.payload.category;
      const existing = state.budgets[cat];
      const updatedBudgets = existing
        ? {
            ...state.budgets,
            [cat]: {
              ...existing,
              spent: existing.spent + Math.abs(action.payload.amount),
            },
          }
        : state.budgets;
      return {
        ...state,
        transactions: [newTx, ...state.transactions],
        budgets: updatedBudgets,
      };
    }
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "ADD_SUBSCRIPTION": {
      const newSub: Subscription = { ...action.payload, id: generateId() };
      return { ...state, subscriptions: [newSub, ...state.subscriptions] };
    }
    case "DELETE_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: state.subscriptions.filter((s) => s.id !== action.payload),
      };
    case "ADD_GOAL": {
      const newGoal: Goal = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, goals: [...state.goals, newGoal] };
    }
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload.updates } : g
        ),
      };
    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case "DEPOSIT_TO_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id
            ? { ...g, currentAmount: Math.min(g.currentAmount + action.payload.amount, g.targetAmount) }
            : g
        ),
      };
    case "UPDATE_BUDGET_LIMIT":
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.category]: {
            ...state.budgets[action.payload.category],
            limit: action.payload.limit,
          },
        },
      };
    case "UPDATE_BUDGET_SPENT":
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.category]: {
            ...state.budgets[action.payload.category],
            spent: action.payload.spent,
          },
        },
      };
    case "UPDATE_PROFILE":
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    case "UPDATE_NOTIFICATIONS":
      return { ...state, notifications: { ...state.notifications, ...action.payload } };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, "id">) => void;
  deleteSubscription: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (id: string, amount: number) => void;
  updateBudgetLimit: (category: string, limit: number) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateNotifications: (updates: Partial<NotificationPrefs>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "vylos_app_state";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window === "undefined") return init;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AppState) : init;
    } catch {
      return init;
    }
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage quota exceeded — ignore
    }
  }, [state]);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id">) => dispatch({ type: "ADD_TRANSACTION", payload: tx }),
    []
  );
  const deleteTransaction = useCallback(
    (id: string) => dispatch({ type: "DELETE_TRANSACTION", payload: id }),
    []
  );
  const addSubscription = useCallback(
    (sub: Omit<Subscription, "id">) => dispatch({ type: "ADD_SUBSCRIPTION", payload: sub }),
    []
  );
  const deleteSubscription = useCallback(
    (id: string) => dispatch({ type: "DELETE_SUBSCRIPTION", payload: id }),
    []
  );
  const addGoal = useCallback(
    (goal: Omit<Goal, "id" | "createdAt">) => dispatch({ type: "ADD_GOAL", payload: goal }),
    []
  );
  const updateGoal = useCallback(
    (id: string, updates: Partial<Goal>) => dispatch({ type: "UPDATE_GOAL", payload: { id, updates } }),
    []
  );
  const deleteGoal = useCallback(
    (id: string) => dispatch({ type: "DELETE_GOAL", payload: id }),
    []
  );
  const depositToGoal = useCallback(
    (id: string, amount: number) => dispatch({ type: "DEPOSIT_TO_GOAL", payload: { id, amount } }),
    []
  );
  const updateBudgetLimit = useCallback(
    (category: string, limit: number) =>
      dispatch({ type: "UPDATE_BUDGET_LIMIT", payload: { category, limit } }),
    []
  );
  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => dispatch({ type: "UPDATE_PROFILE", payload: updates }),
    []
  );
  const updateNotifications = useCallback(
    (updates: Partial<NotificationPrefs>) =>
      dispatch({ type: "UPDATE_NOTIFICATIONS", payload: updates }),
    []
  );

  return (
    <AppContext.Provider
      value={{
        state,
        addTransaction,
        deleteTransaction,
        addSubscription,
        deleteSubscription,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        updateBudgetLimit,
        updateProfile,
        updateNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
}
