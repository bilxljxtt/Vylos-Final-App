"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";
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
  formatMoney,
} from "./store";

// ─── Action Types ─────────────────────────────────────────────────────────────

type Action =
  | { type: "HYDRATE_STATE"; payload: AppState }
  | { type: "ADD_TRANSACTION"; payload: Transaction & { hasAlert?: boolean } }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_SUBSCRIPTION"; payload: Subscription }
  | { type: "DELETE_SUBSCRIPTION"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: { id: string; updates: Partial<Goal> } }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "DEPOSIT_TO_GOAL"; payload: { id: string; amount: number } }
  | { type: "WITHDRAW_FROM_GOAL"; payload: { id: string; amount: number } }
  | { type: "UPDATE_BUDGET_LIMIT"; payload: { category: string; limit: number } }
  | { type: "UPDATE_BUDGET_SPENT"; payload: { category: string; spent: number } }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "UPDATE_NOTIFICATIONS"; payload: Partial<NotificationPrefs> }
  | { type: "SET_UNREAD_COUNT"; payload: number }
  | { type: "RESET" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE_STATE":
      return action.payload;
    case "ADD_TRANSACTION": {
      const newTx: Transaction = action.payload;
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
        transactions: [action.payload, ...state.transactions],
        budgets: updatedBudgets,
        unreadNotificationCount: state.unreadNotificationCount + (action.payload.hasAlert ? 1 : 0)
      };
    }
    case "DELETE_TRANSACTION": {
      const txToDelete = state.transactions.find((t) => t.id === action.payload);
      if (!txToDelete) return state;

      const cat = txToDelete.category;
      const existing = state.budgets[cat];
      const updatedBudgets = existing
        ? {
            ...state.budgets,
            [cat]: {
              ...existing,
              spent: Math.max(0, existing.spent - Math.abs(txToDelete.amount)),
            },
          }
        : state.budgets;

      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
        budgets: updatedBudgets,
      };
    }
    case "ADD_SUBSCRIPTION": {
      const newSub: Subscription = action.payload;
      return { ...state, subscriptions: [newSub, ...state.subscriptions] };
    }
    case "DELETE_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: state.subscriptions.filter((s) => s.id !== action.payload),
      };
    case "ADD_GOAL": {
      const newGoal: Goal = action.payload;
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
    case "WITHDRAW_FROM_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id
            ? { ...g, currentAmount: Math.max(g.currentAmount - action.payload.amount, 0) }
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
    case "SET_UNREAD_COUNT":
      return { ...state, unreadNotificationCount: action.payload };
    case "RESET":
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vylos-last-page');
      }
      return initialState;
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addSubscription: (sub: Omit<Subscription, "id">) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  depositToGoal: (id: string, amount: number) => Promise<void>;
  withdrawFromGoal: (id: string, amount: number) => Promise<void>;
  updateBudgetLimit: (category: string, limit: number) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationPrefs>) => void;
  formatCurrency: (val: number) => string;
  sessionUser: any;
  isAuthLoaded: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function hydrateCloudState(user: any) {
      if (!user) {
        setSessionUser(null);
        dispatch({ type: "RESET" });
        setIsAuthLoaded(true);
        return;
      }
      setSessionUser(user);

      const [{ data: prof }, { data: txs }, { data: subs }, { data: gps }, { data: budgets }, { data: unreadNoteCount }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
      ]);

      const budgetsObj: Record<string, BudgetCategory> = {};
      if (budgets) {
        budgets.forEach(b => {
          budgetsObj[b.category] = { spent: parseFloat(b.spent), limit: parseFloat(b.limit), type: b.type as any };
        });
      }

      dispatch({
        type: "HYDRATE_STATE",
        payload: {
          transactions: txs ? txs.map(t => ({ id: t.id, merchant: t.title, amount: parseFloat(t.amount), date: t.date, category: t.category })) : [],
          subscriptions: subs ? subs.map(s => ({ id: s.id, name: s.name, amount: parseFloat(s.amount), category: s.category, frequency: s.frequency, nextDue: s.next_due })) : [],
          goals: gps ? gps.map(g => ({ id: g.id, title: g.title, targetAmount: parseFloat(g.target_amount), currentAmount: parseFloat(g.current_amount), createdAt: g.created_at })) : [],
          budgets: Object.keys(budgetsObj).length > 0 ? budgetsObj : initialState.budgets,
          userProfile: prof ? {
            name: prof.name || "",
            email: prof.email || "",
            phone: prof.phone || "",
            avatarUrl: prof.avatar_url || "",
            theme: prof.theme,
            language: prof.language || "en",
            currency: prof.currency || "R",
            monthlyIncome: parseFloat(prof.monthly_income),
            country: prof.country || "ZA",
            age: prof.age,
            householdSize: prof.household_size,
            riskTolerance: prof.risk_tolerance,
            trialStartedAt: prof.trial_started_at,
            subscriptionPlan: prof.subscription_plan,
            subscriptionStatus: prof.subscription_status,
            onboardingCompleted: prof.onboarding_completed || false,
            budgetAlertSent: prof.budget_alert_sent || false,
            budgetAlertEnabled: prof.budget_alert_enabled !== false, // default true
          } : initialState.userProfile,
          notifications: prof?.notifications ? (prof.notifications as any) : initialState.notifications,
          unreadNotificationCount: unreadNoteCount?.length || 0
        }
      });
      setIsAuthLoaded(true);
    }

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      hydrateCloudState(user);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        hydrateCloudState(session?.user);
      } else if (event === 'SIGNED_OUT') {
        hydrateCloudState(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addTransaction = useCallback(
    async (tx: Omit<Transaction, "id">) => {
      if (!sessionUser) return;
      const pgTx = {
        title: tx.merchant,
        amount: tx.amount,
        date: tx.date,
        category: tx.category,
        type: tx.amount < 0 ? "expense" : "income",
        user_id: sessionUser.id
      };
      const { data, error } = await supabase.from('transactions').insert([pgTx]).select().single();
      if (error) throw new Error(error.message);
      if (data) {
        // Calculate threshold BEFORE dispatch to ensure hasAlert is accurate
        let hasAlert = false;
        if (tx.amount < 0) {
          const cat = tx.category;
          const budget = state.budgets[cat];
          if (budget && budget.limit > 0) {
            const oldSpent = budget.spent;
            const newSpent = budget.spent + Math.abs(tx.amount);
            const oldPct = (oldSpent / budget.limit) * 100;
            const newPct = (newSpent / budget.limit) * 100;
            
            let threshold = 0;
            if (oldPct < 90 && newPct >= 90) threshold = 90;
            else if (oldPct < 95 && newPct >= 95) threshold = 95;
            else if (oldPct < 100 && newPct >= 100) threshold = 100;

            if (threshold > 0) {
              hasAlert = true;
              const msg = threshold === 100 
                ? `Budget Exceeded! You have used 100% of your ${cat} budget.`
                : `Budget Warning: You have reached ${threshold}% of your ${cat} budget.`;
              
              await supabase.from('notifications').insert([{
                user_id: sessionUser.id,
                title: threshold === 100 ? 'Budget Exceeded' : 'Budget Warning',
                message: msg,
                type: 'threshold',
                read: false
              }]);
              
              // Trigger Resend email if >= 95 and alerts are enabled and not already sent
              if (threshold >= 95 && state.userProfile.budgetAlertEnabled && !state.userProfile.budgetAlertSent) {
                try {
                  const res = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to: state.userProfile.email,
                      subject: `Vylos Budget Alert: ${cat}`,
                      html: `<h2>Budget Alert</h2><p>${msg}</p><p>You have spent R${newSpent.toFixed(2)} out of your R${budget.limit.toFixed(2)} limit.</p>`
                    })
                  });
                  if (res.ok) {
                    // Update user profile immediately to prevent duplicates
                    const { error } = await supabase.from('user_profiles').update({ budget_alert_sent: true }).eq('id', sessionUser.id);
                    if (!error) {
                      dispatch({ type: "UPDATE_PROFILE", payload: { budgetAlertSent: true } });
                    }
                  }
                } catch (e) {
                  console.error("Failed to send budget alert email", e);
                }
              }
            }
          }
        }

        dispatch({ type: "ADD_TRANSACTION", payload: { ...tx, id: data.id, hasAlert } });
      }
    },
    [sessionUser, state.budgets, state.userProfile, supabase]
  );
  const deleteTransaction = useCallback(
    async (id: string) => {
      const txToDelete = state.transactions.find(t => t.id === id);
      if (txToDelete && txToDelete.amount < 0) {
        // Find existing budget
        const { data: currentBudget } = await supabase
          .from("budgets")
          .select("spent")
          .eq("user_id", sessionUser.id)
          .eq("category", txToDelete.category)
          .single();
        
        if (currentBudget) {
          await supabase.from("budgets").update({ 
            spent: Math.max(0, (currentBudget.spent || 0) - Math.abs(txToDelete.amount)) 
          }).eq("user_id", sessionUser.id).eq("category", txToDelete.category);
        }
      }

      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    },
    []
  );
  const addSubscription = useCallback(
    async (sub: Omit<Subscription, "id">) => {
      if (!sessionUser) return;
      const { data, error } = await supabase.from('subscriptions').insert([{
        user_id: sessionUser.id, name: sub.name, amount: sub.amount, category: sub.category, frequency: sub.frequency, next_due: sub.nextDue
      }]).select().single();
      if (error) throw new Error(error.message);
      if (data) dispatch({ type: "ADD_SUBSCRIPTION", payload: { ...sub, id: data.id } });
    },
    [sessionUser]
  );
  const deleteSubscription = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_SUBSCRIPTION", payload: id });
    },
    []
  );
  const addGoal = useCallback(
    async (goal: Omit<Goal, "id" | "createdAt">) => {
      if (!sessionUser) return;
      const createdAt = new Date().toISOString();
      const { data, error } = await supabase.from('goals').insert([{
        user_id: sessionUser.id, title: goal.title, target_amount: goal.targetAmount, current_amount: goal.currentAmount, created_at: createdAt
      }]).select().single();
      if (error) throw new Error(error.message);
      if (data) dispatch({ type: "ADD_GOAL", payload: { ...goal, id: data.id, createdAt } });
    },
    [sessionUser]
  );
  const updateGoal = useCallback(
    async (id: string, updates: Partial<Goal>) => {
      const pgUpdates: any = {};
      if (updates.title) pgUpdates.title = updates.title;
      if (updates.targetAmount !== undefined) pgUpdates.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) pgUpdates.current_amount = updates.currentAmount;
      const { error } = await supabase.from('goals').update(pgUpdates).eq('id', id);
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_GOAL", payload: { id, updates } });
    },
    []
  );
  const deleteGoal = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_GOAL", payload: id });
    },
    []
  );
  const depositToGoal = useCallback(
    async (id: string, amount: number) => {
      const current = state.goals.find(g => g.id === id);
      if (current) {
         const { error } = await supabase.from('goals').update({ current_amount: Math.min(current.currentAmount + amount, current.targetAmount) }).eq('id', id);
         if (error) throw new Error(error.message);
      }
      dispatch({ type: "DEPOSIT_TO_GOAL", payload: { id, amount } });
    },
    [state.goals]
  );
  const withdrawFromGoal = useCallback(
    async (id: string, amount: number) => {
      const current = state.goals.find(g => g.id === id);
      if (current) {
         const { error } = await supabase.from('goals').update({ current_amount: Math.max(current.currentAmount - amount, 0) }).eq('id', id);
         if (error) throw new Error(error.message);
      }
      dispatch({ type: "WITHDRAW_FROM_GOAL", payload: { id, amount } });
    },
    [state.goals]
  );
  const updateBudgetLimit = useCallback(
    async (category: string, limit: number) => {
      if (!sessionUser) return;
      
      const { error } = await supabase.from('budgets').upsert({ user_id: sessionUser.id, category, "limit": limit, spent: state.budgets[category]?.spent || 0, type: state.budgets[category]?.type || "limit" });
      if (error) throw new Error(error.message);

      dispatch({ type: "UPDATE_BUDGET_LIMIT", payload: { category, limit } });
    },
    [sessionUser, state.budgets]
  );
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!sessionUser) return;

      const previousProfile = { ...state.userProfile };
      dispatch({ type: "UPDATE_PROFILE", payload: updates });

      const pgUpdates: any = {};
      if (updates.name) pgUpdates.name = updates.name;
      if (updates.email) pgUpdates.email = updates.email;
      if (updates.monthlyIncome !== undefined) pgUpdates.monthly_income = updates.monthlyIncome;
      if (updates.riskTolerance !== undefined) pgUpdates.risk_tolerance = updates.riskTolerance;
      if (updates.age !== undefined) pgUpdates.age = updates.age;
      if (updates.avatarUrl !== undefined) pgUpdates.avatar_url = updates.avatarUrl;
      if (updates.country !== undefined) pgUpdates.country = updates.country;
      if (updates.householdSize !== undefined) pgUpdates.household_size = updates.householdSize;
      if (updates.theme !== undefined) pgUpdates.theme = updates.theme;
      if (updates.language !== undefined) pgUpdates.language = updates.language;
      if (updates.currency !== undefined) pgUpdates.currency = updates.currency;
      if (updates.onboardingCompleted !== undefined) pgUpdates.onboarding_completed = updates.onboardingCompleted;
      if (updates.budgetAlertSent !== undefined) pgUpdates.budget_alert_sent = updates.budgetAlertSent;
      if (updates.budgetAlertEnabled !== undefined) pgUpdates.budget_alert_enabled = updates.budgetAlertEnabled;
      
      const { error } = await supabase.from('user_profiles').update(pgUpdates).eq('id', sessionUser.id);
      if (error) {
        dispatch({ type: "UPDATE_PROFILE", payload: previousProfile });
        throw new Error(error.message);
      }

    },
    [sessionUser]
  );
  const updateNotifications = useCallback(
    async (updates: Partial<NotificationPrefs>) => {
      if (!sessionUser) return;
      
      const newSettings = { ...state.notifications, ...updates };
      const { error } = await supabase.from('user_profiles').update({ notifications: newSettings }).eq('id', sessionUser.id);
      
      if (error) throw new Error(error.message);
      
      dispatch({ type: "UPDATE_NOTIFICATIONS", payload: updates });
    },
    [sessionUser, state.notifications]
  );

  const formatCurrency = useCallback((val: number) => {
    return formatMoney(val, state.userProfile.currency);
  }, [state.userProfile.currency]);

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
        withdrawFromGoal,
        updateBudgetLimit,
        updateProfile,
        updateNotifications,
        formatCurrency,
        sessionUser,
        isAuthLoaded,
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
