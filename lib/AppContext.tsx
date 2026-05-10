"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { createClient } from "@/utils/supabase/client";
import {
  AppState,
  initialState,
  Transaction,
  Subscription,
  Goal,
  GoalContribution,
  BudgetCategory,
  UserProfile,
  NotificationPrefs,
  formatMoney,
  Reminder,
  getMonthStart,
  TransactionCategory,
  Notification
} from "./store";
import { CategorizationEngine, MerchantRule } from "./services/CategorizationEngine";

// ─── Action Types ─────────────────────────────────────────────────────────────

type Action =
  | { type: "HYDRATE_STATE"; payload: AppState }
  | { type: "UPDATE_TRANSACTIONS"; payload: Transaction[] }
  | { type: "UPDATE_GOALS"; payload: Goal[] }
  | { type: "UPDATE_CONTRIBUTIONS"; payload: GoalContribution[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction & { hasAlert?: boolean } }
  | { type: "UPDATE_TRANSACTION"; payload: { id: string; updates: Partial<Transaction> } }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_SUBSCRIPTION"; payload: Subscription }
  | { type: "DELETE_SUBSCRIPTION"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: { id: string; updates: Partial<Goal> } }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_CONTRIBUTION"; payload: GoalContribution }
  | { type: "UPDATE_BUDGET_LIMIT"; payload: { category: string; limit: number } }
  | { type: "UPDATE_BUDGETS"; payload: Record<string, number> }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "UPDATE_NOTIFICATIONS"; payload: Partial<NotificationPrefs> }
  | { type: "SET_UNREAD_COUNT"; payload: number }
  | { type: "ADD_REMINDER"; payload: Reminder }
  | { type: "DELETE_REMINDER"; payload: string }
  | { type: "SET_SELECTED_MONTH"; payload: string }
  | { type: "UPDATE_MERCHANT_RULES"; payload: MerchantRule[] }
  | { type: "ADD_MERCHANT_RULE"; payload: MerchantRule }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "DELETE_NOTIFICATION"; payload: string }
  | { type: "MARK_ALL_READ" }
  | { type: "RESET" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE_STATE":
      return { ...initialState, ...action.payload };
    case "UPDATE_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "UPDATE_GOALS":
      return { ...state, goals: action.payload };
    case "UPDATE_CONTRIBUTIONS":
      return { ...state, goalContributions: action.payload };
    case "ADD_TRANSACTION": {
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        unreadNotificationCount: state.unreadNotificationCount + (action.payload.hasAlert ? 1 : 0)
      };
    }
    case "UPDATE_TRANSACTION": {
      const { id, updates } = action.payload;
      return {
        ...state,
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      };
    }
    case "DELETE_TRANSACTION": {
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload)
      };
    }
    case "ADD_SUBSCRIPTION": {
      return { ...state, subscriptions: [action.payload, ...state.subscriptions] };
    }
    case "DELETE_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: state.subscriptions.filter((s) => s.id !== action.payload),
      };
    case "ADD_GOAL": {
      return { ...state, goals: [...state.goals, action.payload] };
    }
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload.updates } : g
        ),
      };
    case "DELETE_GOAL":
      return { 
        ...state, 
        goals: state.goals.filter((g) => g.id !== action.payload),
        goalContributions: state.goalContributions.filter((c) => c.goalId !== action.payload)
      };
    case "ADD_CONTRIBUTION": {
      const contribution = action.payload;
      return {
        ...state,
        goalContributions: [...state.goalContributions, contribution],
        goals: state.goals.map(g => g.id === contribution.goalId 
          ? { ...g, currentAmount: g.currentAmount + contribution.amount }
          : g
        )
      };
    }
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
    case "UPDATE_BUDGETS":
      return {
        ...state,
        budgets: {
          ...state.budgets,
          ...Object.entries(action.payload as Record<string, number>).reduce((acc, [cat, limit]) => ({
            ...acc,
            [cat]: {
              ...(state.budgets[cat] || { limit: 0, type: "limit" }),
              limit
            }
          }), {})
        },
      };
    case "UPDATE_PROFILE":
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    case "UPDATE_NOTIFICATIONS":
      return { ...state, notifications: { ...state.notifications, ...action.payload } };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadNotificationCount: action.payload };
    case "ADD_REMINDER":
      return { ...state, reminders: [action.payload, ...state.reminders] };
    case "DELETE_REMINDER":
      return { ...state, reminders: state.reminders.filter(r => r.id !== action.payload) };
    case "SET_SELECTED_MONTH":
      return { ...state, selectedMonth: action.payload };
    case "UPDATE_MERCHANT_RULES":
      return { ...state, merchantRules: action.payload };
    case "ADD_MERCHANT_RULE":
      return { ...state, merchantRules: [...state.merchantRules, action.payload] };
    case "SET_NOTIFICATIONS":
      return { ...state, notificationList: action.payload };
    case "DELETE_NOTIFICATION":
      return { ...state, notificationList: state.notificationList.filter(n => n.id !== action.payload) };
    case "MARK_ALL_READ":
      return { 
        ...state, 
        notificationList: state.notificationList.map(n => ({ ...n, read: true })),
        unreadNotificationCount: 0
      };
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
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addSubscription: (sub: Omit<Subscription, "id">) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "status">) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalContribution: (contribution: Omit<GoalContribution, "id">) => Promise<void>;
  updateBudgetLimit: (category: string, limit: number) => Promise<void>;
  updateBudgets: (updates: Record<string, number>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationPrefs>) => void;
  deleteNotification: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addReminder: (rem: Omit<Reminder, "id">) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addMerchantRule: (rule: Omit<MerchantRule, "id">) => Promise<void>;
  categorizeTransaction: (desc: string, type: "income" | "expense") => TransactionCategory;
  formatCurrency: (val: number) => string;
  sessionUser: any;
  isAuthLoaded: boolean;
  lastSynced: Date | null;
  setSelectedMonth: (date: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function hydrateCloudState(user: any) {
      if (!user) {
        setSessionUser(null);
        dispatch({ type: "RESET" });
        setIsAuthLoaded(true);
        return;
      }
      setSessionUser(user);

      const results = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('goal_contributions').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('user_id', user.id).order('date', { ascending: true }),
        supabase.from('merchant_rules').select('*').eq('user_id', user.id)
      ]);

      const [profRes, txsRes, subsRes, gpsRes, contribsRes, budgetsRes, notifyRes, remRes, rulesRes] = results;
      const prof = profRes.data;
      const txs = txsRes.data;
      const subs = subsRes.data;
      const gps = gpsRes.data;
      const contribs = contribsRes.data;
      const budgets = budgetsRes.data;
      const rems = remRes.data;
      const rules = rulesRes.data;

      const budgetsObj: Record<string, BudgetCategory> = {};
      if (budgets) {
        budgets.forEach((b: any) => {
          budgetsObj[b.category] = { limit: parseFloat(b.limit), type: b.type as any };
        });
      }

      dispatch({
        type: "HYDRATE_STATE",
        payload: {
          transactions: txs ? txs.map((t: any) => ({ 
            id: t.id, 
            merchant: t.title, 
            amount: parseFloat(t.amount), 
            date: t.date, 
            transaction_date: t.transaction_date,
            category: t.category, 
            notes: t.notes,
            recurring: t.recurring,
            payment_status: t.payment_status,
            createdAt: t.created_at,
            updatedAt: t.updated_at
          })) : [],
          subscriptions: subs ? subs.map((s: any) => ({ id: s.id, name: s.name, amount: parseFloat(s.amount), category: s.category, frequency: s.frequency, nextDue: s.next_due })) : [],
          goals: gps ? gps.map((g: any) => ({ 
            id: g.id, 
            title: g.title, 
            targetAmount: parseFloat(g.target_amount), 
            currentAmount: parseFloat(g.current_amount), 
            deadline: g.deadline || new Date().toISOString(),
            status: g.status || "On Track",
            category: g.category,
            notes: g.notes,
            icon: g.icon,
            color: g.color,
            createdAt: g.created_at 
          })) : [],
          goalContributions: contribs ? contribs.map((c: any) => ({ id: c.id, goalId: c.goal_id, amount: parseFloat(c.amount), date: c.date, notes: c.notes })) : [],
          reminders: rems ? rems.map((r: any) => ({ id: r.id, title: r.title, amount: parseFloat(r.amount), date: r.date, category: r.category, repeat: r.repeat, isPaid: r.is_paid })) : [],
          merchantRules: rules ? rules.map((r: any) => ({ id: r.id, user_id: r.user_id, merchant_keyword: r.merchant_keyword, category: r.category })) : [],
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
          notificationList: notifyRes?.data || [],
          unreadNotificationCount: (notifyRes?.data || []).filter((n: any) => !n.read).length,
          selectedMonth: getMonthStart()
        }
      });
      setLastSynced(new Date());
      setIsAuthLoaded(true);
    }

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      hydrateCloudState(user);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        hydrateCloudState(session?.user);
      } else if (event === 'SIGNED_OUT') {
        hydrateCloudState(null);
      }
    });

    // Realtime Listeners
    let txChannel: any = null;
    let goalsChannel: any = null;
    let contribChannel: any = null;

    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      if (user) {
        txChannel = supabase.channel('public:transactions')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, async () => {
            const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false });
            if (txs) dispatch({ type: "UPDATE_TRANSACTIONS", payload: txs.map((t: any) => ({ 
              id: t.id, 
              merchant: t.title, 
              amount: parseFloat(t.amount), 
              date: t.date, 
              transaction_date: t.transaction_date,
              category: t.category,
              notes: t.notes,
              recurring: t.recurring,
              payment_status: t.payment_status,
              createdAt: t.created_at,
              updatedAt: t.updated_at
            })) });
            setLastSynced(new Date());
          }).subscribe();

        goalsChannel = supabase.channel('public:goals')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, async () => {
            const { data: gps } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (gps) dispatch({ type: "UPDATE_GOALS", payload: gps.map((g: any) => ({ id: g.id, title: g.title, targetAmount: parseFloat(g.target_amount), currentAmount: parseFloat(g.current_amount), deadline: g.deadline, status: g.status, category: g.category, notes: g.notes, icon: g.icon, color: g.color, createdAt: g.created_at })) });
            setLastSynced(new Date());
          }).subscribe();

        contribChannel = supabase.channel('public:goal_contributions')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_contributions', filter: `user_id=eq.${user.id}` }, async () => {
            const { data: contribs } = await supabase.from('goal_contributions').select('*').eq('user_id', user.id);
            if (contribs) dispatch({ type: "UPDATE_CONTRIBUTIONS", payload: contribs.map((c: any) => ({ id: c.id, goalId: c.goal_id, amount: parseFloat(c.amount), date: c.date, notes: c.notes })) });
            setLastSynced(new Date());
          }).subscribe();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (txChannel) supabase.removeChannel(txChannel);
      if (goalsChannel) supabase.removeChannel(goalsChannel);
      if (contribChannel) supabase.removeChannel(contribChannel);
    };
  }, []);

  const addTransaction = useCallback(
    async (tx: Omit<Transaction, "id">) => {
      if (!sessionUser) return;
      const effectiveDate = tx.transaction_date || tx.date || new Date().toISOString().split('T')[0];
      const pgTx = { 
        title: tx.merchant, 
        amount: tx.amount, 
        date: effectiveDate, // legacy NOT NULL
        transaction_date: effectiveDate, // new
        category: tx.category, 
        type: tx.amount < 0 ? "expense" : "income", 
        user_id: sessionUser.id,
        notes: tx.notes || "",
        recurring: tx.recurring || false,
        payment_status: tx.payment_status || "completed"
      };
      const { data, error } = await supabase.from('transactions').insert([pgTx]).select().single();
      if (error) throw new Error(error.message);
      if (data) {
        dispatch({ type: "ADD_TRANSACTION", payload: { ...tx, id: data.id } });
      }
    },
    [sessionUser, state.budgets, supabase]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      if (!sessionUser) return;
      const pgUpdates: any = {};
      if (updates.merchant) pgUpdates.title = updates.merchant;
      if (updates.amount !== undefined) pgUpdates.amount = updates.amount;
      if (updates.date) {
        pgUpdates.date = updates.date;
        pgUpdates.transaction_date = updates.date;
      }
      if (updates.transaction_date) pgUpdates.transaction_date = updates.transaction_date;
      if (updates.category) pgUpdates.category = updates.category;
      if (updates.notes !== undefined) pgUpdates.notes = updates.notes;
      if (updates.recurring !== undefined) pgUpdates.recurring = updates.recurring;
      if (updates.payment_status) pgUpdates.payment_status = updates.payment_status;
      const { error } = await supabase.from('transactions').update(pgUpdates).eq('id', id);
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_TRANSACTION", payload: { id, updates } });
    },
    [sessionUser, supabase]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    },
    [sessionUser, state.transactions, supabase]
  );

  const addSubscription = useCallback(
    async (sub: Omit<Subscription, "id">) => {
      if (!sessionUser) return;
      const { data, error } = await supabase.from('subscriptions').insert([{ user_id: sessionUser.id, name: sub.name, amount: sub.amount, category: sub.category, frequency: sub.frequency, next_due: sub.nextDue }]).select().single();
      if (error) throw new Error(error.message);
      if (data) dispatch({ type: "ADD_SUBSCRIPTION", payload: { ...sub, id: data.id } });
    },
    [sessionUser, supabase]
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_SUBSCRIPTION", payload: id });
    },
    [sessionUser, supabase]
  );

  const addGoal = useCallback(
    async (goal: Omit<Goal, "id" | "createdAt" | "status">) => {
      if (!sessionUser) return;
      const createdAt = new Date().toISOString();
      const status = "On Track";
      const { data, error } = await supabase.from('goals').insert([{
        user_id: sessionUser.id, 
        title: goal.title, 
        target_amount: goal.targetAmount, 
        current_amount: goal.currentAmount, 
        deadline: goal.deadline,
        category: goal.category,
        notes: goal.notes,
        status,
        icon: goal.icon,
        color: goal.color,
        created_at: createdAt
      }]).select().single();
      if (error) throw new Error(error.message);
      if (data) dispatch({ type: "ADD_GOAL", payload: { ...goal, id: data.id, createdAt, status } });
    },
    [sessionUser, supabase]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<Goal>) => {
      if (!sessionUser) return;
      const pgUpdates: any = {};
      if (updates.title) pgUpdates.title = updates.title;
      if (updates.targetAmount !== undefined) pgUpdates.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) pgUpdates.current_amount = updates.currentAmount;
      if (updates.deadline) pgUpdates.deadline = updates.deadline;
      if (updates.status) pgUpdates.status = updates.status;
      if (updates.category) pgUpdates.category = updates.category;
      if (updates.notes) pgUpdates.notes = updates.notes;
      if (updates.icon) pgUpdates.icon = updates.icon;
      if (updates.color) pgUpdates.color = updates.color;

      const { error } = await supabase.from('goals').update(pgUpdates).eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_GOAL", payload: { id, updates } });
    },
    [sessionUser, supabase]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_GOAL", payload: id });
    },
    [sessionUser, supabase]
  );

  const addGoalContribution = useCallback(
    async (contribution: Omit<GoalContribution, "id">) => {
      if (!sessionUser) return;
      const { data, error } = await supabase.from('goal_contributions').insert([{
        user_id: sessionUser.id,
        goal_id: contribution.goalId,
        amount: contribution.amount,
        date: contribution.date,
        notes: contribution.notes
      }]).select().single();

      if (error) {
        console.error("Supabase Contribution Insert Error:", error);
        throw new Error(error.message);
      }
      
      if (data) {
        // Update the goal's current amount in Supabase
        const currentGoal = state.goals.find(g => g.id === contribution.goalId);
        if (currentGoal) {
          const newAmount = currentGoal.currentAmount + contribution.amount;
          const { error: updateError } = await supabase
            .from('goals')
            .update({ current_amount: newAmount })
            .eq('id', contribution.goalId)
            .eq('user_id', sessionUser.id);
            
          if (updateError) {
            console.error("Supabase Goal Sync Error:", updateError);
            throw new Error(updateError.message);
          }
        }
        dispatch({ type: "ADD_CONTRIBUTION", payload: { ...contribution, id: data.id } });
      }
    },
    [sessionUser, state.goals, supabase]
  );

  const updateBudgetLimit = useCallback(
    async (category: string, limit: number) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('budgets').upsert({ user_id: sessionUser.id, category, limit, type: state.budgets[category]?.type || "limit" }, { onConflict: "user_id,category" });
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_BUDGET_LIMIT", payload: { category, limit } });
    },
    [sessionUser, state.budgets, supabase]
  );

  const updateBudgets = useCallback(
    async (updates: Record<string, number>) => {
      if (!sessionUser) return;
      const rows = Object.entries(updates).map(([cat, limit]) => ({ user_id: sessionUser.id, category: cat, limit, type: state.budgets[cat]?.type || "limit" }));
      const { error } = await supabase.from('budgets').upsert(rows, { onConflict: "user_id,category" });
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_BUDGETS", payload: updates });
    },
    [sessionUser, state.budgets, supabase]
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
      const { error } = await supabase.from('user_profiles').update(pgUpdates).eq('id', sessionUser.id);
      if (error) { dispatch({ type: "UPDATE_PROFILE", payload: previousProfile }); throw new Error(error.message); }
    },
    [sessionUser, state.userProfile, supabase]
  );

  const updateNotifications = useCallback(
    async (updates: Partial<NotificationPrefs>) => {
      if (!sessionUser) return;
      const newSettings = { ...state.notifications, ...updates };
      const { error } = await supabase.from('user_profiles').update({ notifications: newSettings }).eq('id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_NOTIFICATIONS", payload: updates });
    },
    [sessionUser, state.notifications, supabase]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('notifications').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) console.error("Delete notification error:", error);
      dispatch({ type: "DELETE_NOTIFICATION", payload: id });
    },
    [sessionUser, supabase]
  );

  const markAllNotificationsAsRead = useCallback(
    async () => {
      if (!sessionUser) return;
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', sessionUser.id).eq('read', false);
      if (error) console.error("Mark all read error:", error);
      dispatch({ type: "MARK_ALL_READ" });
    },
    [sessionUser, supabase]
  );

  const addReminder = useCallback(
    async (rem: Omit<Reminder, "id">) => {
      if (!sessionUser) return;
      const id = Math.random().toString(36).substr(2, 9);
      const { error } = await supabase.from('reminders').insert([{ id, user_id: sessionUser.id, title: rem.title, amount: rem.amount, date: rem.date, category: rem.category, repeat: rem.repeat, is_paid: false }]);
      if (error) throw new Error(error.message);
      dispatch({ type: "ADD_REMINDER", payload: { ...rem, id, isPaid: false } });
    },
    [sessionUser, supabase]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('reminders').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_REMINDER", payload: id });
    },
    [sessionUser, supabase]
  );

  const addMerchantRule = useCallback(
    async (rule: Omit<MerchantRule, "id">) => {
      if (!sessionUser) return;
      const { data, error } = await supabase.from('merchant_rules').insert([{ user_id: sessionUser.id, merchant_keyword: rule.merchant_keyword, category: rule.category }]).select().single();
      if (error) { dispatch({ type: "ADD_MERCHANT_RULE", payload: { ...rule, user_id: sessionUser.id } }); return; }
      if (data) dispatch({ type: "ADD_MERCHANT_RULE", payload: { id: data.id, user_id: data.user_id, merchant_keyword: data.merchant_keyword, category: data.category } });
    },
    [sessionUser, supabase]
  );

  const categorizeTransaction = useCallback((desc: string, type: "income" | "expense") => {
    return CategorizationEngine.categorize(desc, type, state.merchantRules);
  }, [state.merchantRules]);

  const formatCurrency = useCallback((val: number) => {
    return formatMoney(val, state.userProfile.currency);
  }, [state.userProfile.currency]);

  const setSelectedMonth = useCallback((date: string) => {
    dispatch({ type: "SET_SELECTED_MONTH", payload: date });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addSubscription,
        deleteSubscription,
        addGoal,
        updateGoal,
        deleteGoal,
        addGoalContribution,
        updateBudgetLimit,
        updateBudgets,
        updateProfile,
        updateNotifications,
        deleteNotification,
        markAllNotificationsAsRead,
        addReminder,
        deleteReminder,
        addMerchantRule,
        categorizeTransaction,
        formatCurrency,
        sessionUser,
        isAuthLoaded,
        lastSynced,
        setSelectedMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within an AppProvider");
  return context;
}
