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
  Notification,
  Debt
} from "./store";
import { CategorizationEngine, MerchantRule } from "./services/CategorizationEngine";
import { formatDate } from "./utils";

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
  | { type: "SET_BUDGETS"; payload: Record<string, BudgetCategory> }
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
  | { type: "UPDATE_REMINDER"; payload: { id: string; updates: Partial<Reminder> } }
  | { type: "UPDATE_REMINDER_COMPLETIONS"; payload: any[] }
  | { type: "ADD_REMINDER_COMPLETION"; payload: any }
  | { type: "DELETE_REMINDER_COMPLETION"; payload: { reminder_id: string; year: number; month: number } }
  | { type: "MARK_ALL_READ" }
  | { type: "UPDATE_REMINDERS"; payload: Reminder[] }
  | { type: "UPDATE_BACKEND_HEALTH_SCORE"; payload: any }
  | { type: "SET_HEALTH_SCORE_LOADING"; payload: boolean }
  | { type: "UPDATE_DEBTS"; payload: Debt[] }
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
    case "SET_BUDGETS":
      return {
        ...state,
        budgets: action.payload,
      };
    case "UPDATE_PROFILE":
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    case "UPDATE_NOTIFICATIONS":
      return { ...state, notifications: { ...state.notifications, ...action.payload } };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadNotificationCount: action.payload };
    case "ADD_REMINDER":
      return { ...state, reminders: [action.payload, ...state.reminders] };
    case "UPDATE_REMINDERS":
      return { ...state, reminders: action.payload };
    case "UPDATE_REMINDER":
      return {
        ...state,
        reminders: state.reminders.map(r => r.id === action.payload.id ? { ...r, ...action.payload.updates } : r)
      };
    case "DELETE_REMINDER":
      return { 
        ...state, 
        reminders: state.reminders.filter(r => r.id !== action.payload),
        reminderCompletions: state.reminderCompletions.filter(c => c.reminder_id !== action.payload)
      };
    case "UPDATE_REMINDER_COMPLETIONS":
      return { ...state, reminderCompletions: action.payload };
    case "ADD_REMINDER_COMPLETION":
      return { ...state, reminderCompletions: [action.payload, ...state.reminderCompletions] };
    case "DELETE_REMINDER_COMPLETION": {
      const { reminder_id, year, month } = action.payload;
      return {
        ...state,
        reminderCompletions: state.reminderCompletions.filter(c => 
          !(c.reminder_id === reminder_id && c.year === year && c.month === month)
        )
      };
    }
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
    case "UPDATE_BACKEND_HEALTH_SCORE":
      return { ...state, backendHealthScore: action.payload, isCalculatingHealthScore: false };
    case "SET_HEALTH_SCORE_LOADING":
      return { ...state, isCalculatingHealthScore: action.payload };
    case "UPDATE_DEBTS":
      return { ...state, debts: action.payload };
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
  awardXP: (eventType: string, baseXp: number, description: string) => Promise<number | undefined>;
  updateDailyConsistency: (actionType: "LOGIN" | "TRANSACTION" | "REVIEW" | "BUDGET_UPDATE" | "REPORT_CHECK") => Promise<void>;
  updateNotifications: (updates: Partial<NotificationPrefs>) => void;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  addNotification: (notif: Omit<Notification, "id" | "read" | "created_at">) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addReminder: (rem: Omit<Reminder, "id">) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  toggleReminderCompletion: (reminderId: string, year: number, month: number) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addMerchantRule: (rule: Omit<MerchantRule, "id">) => Promise<void>;
  categorizeTransaction: (desc: string, type: "income" | "expense") => TransactionCategory;
  formatCurrency: (val: number) => string;
  sessionUser: any;
  isAuthLoaded: boolean;
  profileLoadingError: string | null;
  clearProfileError: () => void;
  lastSynced: Date | null;
  setSelectedMonth: (date: string) => void;
  refreshData: () => Promise<void>;
  triggerHealthScoreRecalculation: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [profileLoadingError, setProfileLoadingError] = useState<string | null>(null);
  const [lastNotificationCheck, setLastNotificationCheck] = useState<number>(0);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const healthScoreTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const profileRef = React.useRef(state.userProfile);
  React.useEffect(() => {
    profileRef.current = state.userProfile;
  }, [state.userProfile]);

  const hydratingUserRef = React.useRef<string | null>(null);

  const clearProfileError = useCallback(() => {
    setProfileLoadingError(null);
  }, []);

  const triggerHealthScoreRecalculation = useCallback(() => {
    if (healthScoreTimeoutRef.current) clearTimeout(healthScoreTimeoutRef.current);
    
    healthScoreTimeoutRef.current = setTimeout(() => {
      // Ensure we are online and session exists
      if (!sessionUser || !navigator.onLine) return;
      
      // Fire and forget recalculation to keep UI snappy
      fetch("/api/user/health-score/recalculate", { method: "POST" })
        .catch(err => {
          console.warn("Background health score recalculation deferred:", err);
        });
    }, 5000); // 5s debounce to allow for multiple rapid mutations
  }, [sessionUser]);

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
      if (updates.onboardingCompletedAt !== undefined) pgUpdates.onboarding_completed_at = updates.onboardingCompletedAt;
      if (updates.userType !== undefined) pgUpdates.user_type = updates.userType;
      if (updates.reason_for_using_vylos !== undefined) pgUpdates.reason_for_using_vylos = updates.reason_for_using_vylos;
      if (updates.moneyConfidence !== undefined) pgUpdates.money_confidence = updates.moneyConfidence;
      if (updates.first_tracking_focus !== undefined) pgUpdates.first_tracking_focus = updates.first_tracking_focus;
      if (updates.currentTrackingMethod !== undefined) pgUpdates.current_tracking_method = updates.currentTrackingMethod;
      if (updates.biggest_money_challenge !== undefined) pgUpdates.biggest_money_challenge = updates.biggest_money_challenge;
      if (updates.monthly_income_range !== undefined) pgUpdates.monthly_income_range = updates.monthly_income_range;
      if (updates.main_money_goal !== undefined) pgUpdates.main_money_goal = updates.main_money_goal;
      if (updates.review_frequency !== undefined) pgUpdates.review_frequency = updates.review_frequency;
      if (updates.communication_preference !== undefined) pgUpdates.communication_preference = updates.communication_preference;
      
      if (updates.termsAccepted !== undefined) pgUpdates.terms_accepted = updates.termsAccepted;
      if (updates.termsAcceptedAt !== undefined) pgUpdates.terms_accepted_at = updates.termsAcceptedAt;
      if (updates.termsVersion !== undefined) pgUpdates.terms_version = updates.termsVersion;
      if (updates.termsLastUpdated !== undefined) pgUpdates.terms_last_updated = updates.termsLastUpdated;
      if (updates.totalXp !== undefined) pgUpdates.total_xp = updates.totalXp;
      if (updates.currentRank !== undefined) pgUpdates.current_rank = updates.currentRank;
      if (updates.xpMultiplier !== undefined) pgUpdates.xp_multiplier = updates.xpMultiplier;
      if (updates.currentStreak !== undefined) pgUpdates.current_streak = updates.currentStreak;
      if (updates.longestStreak !== undefined) pgUpdates.longest_streak = updates.longestStreak;
      if (updates.dailyConsistencyScore !== undefined) pgUpdates.daily_consistency_score = updates.dailyConsistencyScore;
      if (updates.lastConsistencyDate !== undefined) pgUpdates.last_consistency_date = updates.lastConsistencyDate;
      if (updates.lastLoginXpDate !== undefined) pgUpdates.last_login_xp_date = updates.lastLoginXpDate;
      if (updates.dismissed_notifications !== undefined) pgUpdates.dismissed_notifications = updates.dismissed_notifications;
      if (updates.onboardingAnswers !== undefined) pgUpdates.onboarding_answers = updates.onboardingAnswers;

      try {
        let { error } = await supabase.from('user_profiles').update(pgUpdates).eq('id', sessionUser.id);
        
        // If the update fails due to the onboarding_answers column missing, use local storage fallback and retry
        if (error && (error.code === 'PGRST204' || error.message.includes('onboarding_answers'))) {
          console.warn("Warning: 'onboarding_answers' column is missing in user_profiles table. Onboarding answers have been saved to local storage as a fallback. Please run the migration: ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_answers jsonb DEFAULT '{}'::jsonb;");
          
          if (typeof window !== 'undefined' && updates.onboardingAnswers) {
            localStorage.setItem('vylos_onboarding_answers_fallback', JSON.stringify(updates.onboardingAnswers));
          }
          
          const retriedUpdates = { ...pgUpdates };
          delete retriedUpdates.onboarding_answers;
          
          const { error: retryError } = await supabase.from('user_profiles').update(retriedUpdates).eq('id', sessionUser.id);
          error = retryError;
        }

        if (error) { 
          console.error("Supabase Profile Update Error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          dispatch({ type: "UPDATE_PROFILE", payload: previousProfile }); 
          throw new Error(error.message); 
        }
      } catch (err: any) {
        if (err.message === "Failed to fetch") {
          console.error("Network Error in updateProfile. Retrying in 1s...");
        }
        throw err;
      }
    },
    [sessionUser, state.userProfile, supabase]
  );

  const awardXP = useCallback(
    async (eventType: string, baseXP: number, description: string) => {
      if (!sessionUser) return;
      
      const profile = state.userProfile;
      const finalXP = Math.round(baseXP * (profile.xpMultiplier || 1.0));
      const newTotalXP = (profile.totalXp || 0) + finalXP;
      
      const { XPService } = await import("./services/XPService");
      const { current } = XPService.calculateRank(newTotalXP);
      
      // Save event to Supabase
      const { error: eventError } = await supabase.from('xp_events').insert([{
        user_id: sessionUser.id,
        event_type: eventType,
        base_xp: baseXP,
        multiplier: profile.xpMultiplier || 1.0,
        final_xp: finalXP,
        description: description
      }]);

      if (eventError) console.error("Failed to record XP event:", eventError);

      // Update profile with new XP and Rank
      await updateProfile({
        totalXp: newTotalXP,
        currentRank: current.name
      });

      return finalXP;
    },
    [sessionUser, state.userProfile, updateProfile, supabase]
  );

  const updateDailyConsistency = useCallback(
    async (actionType: "LOGIN" | "TRANSACTION" | "REVIEW" | "BUDGET_UPDATE" | "REPORT_CHECK") => {
      if (!sessionUser) return;
      
      const profile = state.userProfile;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isNewDay = profile.lastConsistencyDate !== today;
      const isYesterday = profile.lastConsistencyDate === yesterday;
      
      const { XPService, XP_CONFIG } = await import("./services/XPService");
      const increment = XPService.getDailyConsistencyIncrement(actionType);
      
      let newScore = isNewDay ? increment : (profile.dailyConsistencyScore || 0) + increment;
      if (newScore > 100) newScore = 100;

      const updates: any = {
        dailyConsistencyScore: newScore,
        lastConsistencyDate: today
      };

      // Streak Reset Logic: If not today and not yesterday, reset streak
      if (isNewDay && !isYesterday && profile.lastConsistencyDate !== "") {
        updates.currentStreak = 0;
      }

      // Check for consistency threshold (75%)
      const reachedThreshold = newScore >= 75;
      const previouslyReachedToday = (profile.dailyConsistencyScore || 0) >= 75 && !isNewDay;

      if (reachedThreshold && !previouslyReachedToday) {
        // Increment streak
        const newStreak = (profile.currentStreak || 0) + 1;
        updates.currentStreak = newStreak;
        if (newStreak > (profile.longestStreak || 0)) {
          updates.longestStreak = newStreak;
        }

        // Apply Streak Bonuses
        if (newStreak === 3) {
          const bonusXP = XP_CONFIG.STREAK_3_DAY.xp;
          await awardXP("STREAK_BONUS", bonusXP, "3-Day Consistency Streak Milestone");
          await supabase.from('streak_bonus_events').insert([{
            user_id: sessionUser.id,
            streak_milestone: 3,
            xp_awarded: bonusXP
          }]);
        } else if (newStreak === 30) {
          const bonusXP = XP_CONFIG.STREAK_30_DAY.xp;
          await awardXP("STREAK_BONUS", bonusXP, "30-Day Consistency Streak Milestone");
          await supabase.from('streak_bonus_events').insert([{
            user_id: sessionUser.id,
            streak_milestone: 30,
            xp_awarded: bonusXP
          }]);
        }

        // Multiplier Logic: Every 7 days
        if (newStreak % 7 === 0) {
          const newMultiplier = Math.min((profile.xpMultiplier || 1.0) + 0.1, 2.2);
          updates.xpMultiplier = newMultiplier;
          await supabase.from('streak_bonus_events').insert([{
            user_id: sessionUser.id,
            streak_milestone: newStreak,
            multiplier_increase: 0.1
          }]);
        }
      }

      await updateProfile(updates);
    },
    [sessionUser, state.userProfile, updateProfile, awardXP, supabase]
  );

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
        triggerHealthScoreRecalculation();
      }
    },
    [sessionUser, state.budgets, supabase, triggerHealthScoreRecalculation]
  );

  // Automated Reminder Notifications
  useEffect(() => {
    if (!sessionUser || state.reminders.length === 0) return;
    
    const now = Date.now();
    // Check every 5 minutes
    if (now - lastNotificationCheck < 300000) return;

    const checkReminders = async () => {
      const { getReminderDerivedStatus } = await import("./utils");
      const overdue = state.reminders.filter(r => getReminderDerivedStatus(r) === 'overdue');

      for (const r of overdue) {
        const stableId = `overdue_${r.id}_${r.due_date}`;
        
        // Check if user has already dismissed this specific notification
        const isDismissed = state.userProfile.dismissed_notifications?.includes(stableId);
        if (isDismissed) continue;

        // Check if we already have this in our current list (check both stable_id and message search)
        const alreadyExists = state.notificationList.some(n => 
          n.stable_id === stableId || 
          n.message?.includes(`[SID:${stableId}]`)
        );

        if (!alreadyExists) {
          await addNotification({
            title: `Overdue: ${r.title}`,
            message: `Your ${r.category} task was due on ${formatDate(r.due_date)}. Please clear it as soon as possible. [SID:${stableId}]`,
            type: 'warning',
            stable_id: stableId
          });
        }
      }
      setLastNotificationCheck(now);
    };

    checkReminders();
  }, [state.reminders, state.notificationList, sessionUser, lastNotificationCheck]);

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
      const { error } = await supabase.from('transactions').update(pgUpdates).eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_TRANSACTION", payload: { id, updates } });
      triggerHealthScoreRecalculation();
    },
    [sessionUser, supabase, triggerHealthScoreRecalculation]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
      triggerHealthScoreRecalculation();
    },
    [sessionUser, state.transactions, supabase, triggerHealthScoreRecalculation]
  );

  const addSubscription = useCallback(
    async (sub: Omit<Subscription, "id">) => {
      if (!sessionUser) return;
      const { data, error } = await supabase.from('subscriptions').insert([{ user_id: sessionUser.id, name: sub.name, amount: sub.amount, category: sub.category, frequency: sub.frequency, next_due: sub.nextDue }]).select().single();
      if (error) throw new Error(error.message);
      if (data) {
        dispatch({ type: "ADD_SUBSCRIPTION", payload: { ...sub, id: data.id } });
        triggerHealthScoreRecalculation();
      }
    },
    [sessionUser, supabase, triggerHealthScoreRecalculation]
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_SUBSCRIPTION", payload: id });
      triggerHealthScoreRecalculation();
    },
    [sessionUser, supabase, triggerHealthScoreRecalculation]
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
        
        const { XP_CONFIG } = await import("./services/XPService");
        await awardXP("UPDATE_GOAL_PROGRESS", XP_CONFIG.UPDATE_GOAL_PROGRESS.xp, `Added contribution to goal: ${contribution.goalId}`);
        await updateDailyConsistency("BUDGET_UPDATE");
        triggerHealthScoreRecalculation();
      }
    },
    [sessionUser, state.goals, supabase, awardXP, updateDailyConsistency, triggerHealthScoreRecalculation]
  );

  const updateBudgetLimit = useCallback(
    async (category: string, limit: number) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('budgets').upsert({ user_id: sessionUser.id, category, limit, type: state.budgets[category]?.type || "limit" }, { onConflict: "user_id,category" });
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_BUDGET_LIMIT", payload: { category, limit } });
      
      const { XP_CONFIG } = await import("./services/XPService");
      await awardXP("UPDATE_BUDGET", XP_CONFIG.UPDATE_BUDGET.xp, `Updated budget limit for ${category}`);
      await updateDailyConsistency("BUDGET_UPDATE");
      triggerHealthScoreRecalculation();
    },
    [sessionUser, state.budgets, supabase, awardXP, updateDailyConsistency, triggerHealthScoreRecalculation]
  );

  const updateBudgets = useCallback(
    async (updates: Record<string, number>) => {
      if (!sessionUser) return;
      const rows = Object.entries(updates).map(([cat, limit]) => ({ user_id: sessionUser.id, category: cat, limit, type: state.budgets[cat]?.type || "limit" }));
      const { error } = await supabase.from('budgets').upsert(rows, { onConflict: "user_id,category" });
      if (error) throw new Error(error.message);
      dispatch({ type: "UPDATE_BUDGETS", payload: updates });

      const { XP_CONFIG } = await import("./services/XPService");
      const count = Object.keys(updates).length;
      await awardXP(count > 1 ? "CREATE_BUDGET" : "UPDATE_BUDGET", count > 1 ? XP_CONFIG.CREATE_BUDGET.xp : XP_CONFIG.UPDATE_BUDGET.xp, `Updated ${count} budgets`);
      await updateDailyConsistency("BUDGET_UPDATE");
      triggerHealthScoreRecalculation();
    },
    [sessionUser, state.budgets, supabase, awardXP, updateDailyConsistency, triggerHealthScoreRecalculation]
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
      
      const notif = state.notificationList.find(n => n.id === id);
      
      // Optimistic update
      dispatch({ type: "DELETE_NOTIFICATION", payload: id });
      
      // If it has a stable_id (or hidden in message), track it as dismissed
      let stableId = notif?.stable_id;
      if (!stableId && notif?.message?.includes("[SID:")) {
        const match = notif.message?.match(/\[SID:([^\]]+)\]/);
        if (match) stableId = match[1];
      }

      if (stableId) {
        const currentDismissed = state.userProfile.dismissed_notifications || [];
        if (!currentDismissed.includes(stableId)) {
          await updateProfile({
            dismissed_notifications: [...currentDismissed, stableId]
          });
        }
      }
      
      const { error } = await supabase.from('notifications').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) {
        console.error("Delete notification error:", error);
        throw new Error(error.message);
      }
    },
    [sessionUser, state.notificationList, state.userProfile.dismissed_notifications, updateProfile, supabase]
  );

  const deleteAllNotifications = useCallback(
    async () => {
      if (!sessionUser) return;
      dispatch({ type: "SET_NOTIFICATIONS", payload: [] });
      dispatch({ type: "SET_UNREAD_COUNT", payload: 0 });
      const { error } = await supabase.from('notifications').delete().eq('user_id', sessionUser.id);
      if (error) {
        console.error("Delete all notifications error:", error);
        throw new Error(error.message);
      }
    },
    [sessionUser, supabase]
  );
  
  const addNotification = useCallback(
    async (notif: Omit<Notification, "id" | "read" | "created_at">) => {
      if (!sessionUser) return;
      
      const insertData: any = {
        user_id: sessionUser.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        read: false
      };
      
      // Try to include stable_id if provided
      if (notif.stable_id) insertData.stable_id = notif.stable_id;

      const { data, error } = await supabase.from('notifications').insert([insertData]).select().single();
      
      if (error) {
        // If it failed because of stable_id column missing, try again without it
        if (error.message.includes("stable_id") || error.code === "P0001") {
          const { data: retryData, error: retryError } = await supabase.from('notifications').insert([{
            user_id: sessionUser.id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            read: false
          }]).select().single();
          
          if (retryError) throw new Error(retryError.message);
          if (retryData) {
            dispatch({ type: "SET_NOTIFICATIONS", payload: [retryData, ...state.notificationList] });
            dispatch({ type: "SET_UNREAD_COUNT", payload: state.unreadNotificationCount + 1 });
          }
          return;
        }
        throw new Error(error.message);
      }
      
      if (data) {
        dispatch({ type: "SET_NOTIFICATIONS", payload: [data, ...state.notificationList] });
        dispatch({ type: "SET_UNREAD_COUNT", payload: state.unreadNotificationCount + 1 });
      }
    },
    [sessionUser, state.notificationList, state.unreadNotificationCount, supabase]
  );

  const markAllNotificationsAsRead = useCallback(
    async () => {
      if (!sessionUser) return;
      
      // Optimistic update
      dispatch({ type: "MARK_ALL_READ" });
      
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', sessionUser.id).eq('read', false);
      if (error) {
        console.error("Mark all read error:", error);
      }
    },
    [sessionUser, supabase]
  );

  const addReminder = useCallback(
    async (rem: Omit<Reminder, "id">) => {
      if (!sessionUser) return;
      const { data, error } = await supabase.from('reminders').insert([{ 
        user_id: sessionUser.id, 
        title: rem.title, 
        description: rem.description,
        amount: rem.amount, 
        due_date: rem.due_date, 
        due_time: rem.due_time,
        category: rem.category, 
        priority: rem.priority,
        recurring: rem.recurring,
        status: rem.status || 'pending',
        billing_day: rem.billing_day || (rem.due_date ? parseInt(rem.due_date.split('-')[2]) : null)
      }]).select().single();
      
      if (error) {
        console.error("Supabase Reminder Insert Error:", error);
        throw new Error(error.message);
      }
      
      if (data) {
        dispatch({ type: "ADD_REMINDER", payload: { ...rem, id: data.id } });
        // Health score recalculation is debounced and non-blocking
        triggerHealthScoreRecalculation();
      }
    },
    [sessionUser, supabase, triggerHealthScoreRecalculation]
  );

  const updateReminder = useCallback(
    async (id: string, updates: Partial<Reminder>) => {
      if (!sessionUser) return;
      const { error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', sessionUser.id);

      if (!error) {
        dispatch({ type: "UPDATE_REMINDER", payload: { id, updates } });
        triggerHealthScoreRecalculation();
      } else {
        console.error("Supabase Reminder Update Error:", error);
        throw new Error(error.message);
      }
    },
    [sessionUser, supabase, triggerHealthScoreRecalculation]
  );

  const toggleReminderCompletion = useCallback(
    async (reminderId: string, year: number, month: number) => {
      if (!sessionUser) return;
      
      const existing = state.reminderCompletions.find(c => 
        c.reminder_id === reminderId && c.year === year && c.month === month
      );

      if (existing) {
        // Optimistic delete
        dispatch({ type: "DELETE_REMINDER_COMPLETION", payload: { reminder_id: reminderId, year, month } });
        triggerHealthScoreRecalculation();

        try {
          const { error } = await supabase
            .from('reminder_completions')
            .delete()
            .eq('id', existing.id)
            .eq('user_id', sessionUser.id);
            
          if (error) {
            throw error;
          }
        } catch (err: any) {
          console.error("Supabase Reminder Completion Delete Error (rolling back):", err);
          // Roll back optimistic delete
          dispatch({ type: "ADD_REMINDER_COMPLETION", payload: existing });
          triggerHealthScoreRecalculation();
          throw err;
        }
      } else {
        // Optimistic add with temporary id
        const tempId = `temp-${Date.now()}`;
        const payload = {
          id: tempId,
          reminder_id: reminderId,
          user_id: sessionUser.id,
          year,
          month,
          completed_at: new Date().toISOString()
        };
        
        dispatch({ type: "ADD_REMINDER_COMPLETION", payload });
        triggerHealthScoreRecalculation();

        try {
          const { data, error } = await supabase
            .from('reminder_completions')
            .insert([{
              reminder_id: reminderId,
              user_id: sessionUser.id,
              year,
              month,
              completed_at: payload.completed_at
            }])
            .select()
            .single();
            
          if (error) {
            throw error;
          }

          if (data) {
            // Replace the temporary ID in state
            dispatch({ type: "DELETE_REMINDER_COMPLETION", payload: { reminder_id: reminderId, year, month } });
            dispatch({ type: "ADD_REMINDER_COMPLETION", payload: data });
            
            // XP Bonus for paying a bill
            const { XP_CONFIG } = await import("./services/XPService");
            await awardXP("COMPLETE_REMINDER", XP_CONFIG.UPDATE_GOAL_PROGRESS.xp, `Completed bill for ${month}/${year}`);
            triggerHealthScoreRecalculation();
          }
        } catch (err: any) {
          console.error("Supabase Reminder Completion Insert Error (rolling back):", err);
          // Roll back optimistic add
          dispatch({ type: "DELETE_REMINDER_COMPLETION", payload: { reminder_id: reminderId, year, month } });
          triggerHealthScoreRecalculation();
          throw err;
        }
      }
    },
    [sessionUser, state.reminderCompletions, supabase, awardXP, triggerHealthScoreRecalculation]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      if (!sessionUser) return;
      const { error } = await supabase.from('reminders').delete().eq('id', id).eq('user_id', sessionUser.id);
      if (error) throw new Error(error.message);
      dispatch({ type: "DELETE_REMINDER", payload: id });
      triggerHealthScoreRecalculation();
    },
    [sessionUser, supabase, triggerHealthScoreRecalculation]
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

  const hydrateCloudState = useCallback(async (user: any) => {
    if (!user) {
      setSessionUser(null);
      dispatch({ type: "RESET" });
      hydratingUserRef.current = null;
      setProfileLoadingError(null);
      setIsAuthLoaded(true);
      return;
    }

    if (hydratingUserRef.current === user.id) {
      console.log("Hydration already in progress or completed for user:", user.id);
      return;
    }
    hydratingUserRef.current = user.id;

    setSessionUser(user);
    setProfileLoadingError(null); // Clear error on new hydration attempt

    const currentMonth = new Date().toISOString().slice(0, 7);
    const results = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('subscriptions').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('goal_contributions').select('*').eq('user_id', user.id),
      supabase.from('budgets').select('*').eq('user_id', user.id),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('reminders').select('*').eq('user_id', user.id).order('due_date', { ascending: true }),
      supabase.from('reminder_completions').select('*').eq('user_id', user.id),
      supabase.from('merchant_rules').select('*').eq('user_id', user.id),
      supabase.from('ai_usage').select('*').eq('user_id', user.id).eq('billing_month', currentMonth).single(),
      supabase.from('user_health_scores').select('*').eq('user_id', user.id).order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('debts').select('*').eq('user_id', user.id)
    ]);

    const [profRes, txsRes, subsRes, gpsRes, contribsRes, budgetsRes, notifyRes, remRes, compRes, rulesRes, usageRes, scoreRes, debtsRes] = results;
    
    // Check if the query returned an error that is NOT 'PGRST116' (row not found)
    const isNoRowFound = profRes.error && profRes.error.code === 'PGRST116';
    if (profRes.error && !isNoRowFound) {
      console.error("Critical error fetching user profile:", profRes.error);
      // Release lock ref so user can click retry
      hydratingUserRef.current = null;
      // If we don't have profile data loaded yet, show the connection error screen
      if (!profileRef.current.id) {
        setProfileLoadingError(profRes.error.message || "Failed to load user profile");
      } else {
        console.warn("Background profile sync deferred due to query failure.");
      }
      setIsAuthLoaded(true);
      return;
    }

    let prof = profRes.data;
    if (!prof && user && isNoRowFound) {
      // Auto-create default user profile row in database since it is confirmed missing
      const defaultProf = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        email: user.email || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        theme: "System Default",
        language: "en",
        currency: "R",
        monthly_income: 0,
        country: "ZA",
        onboarding_completed: false,
        terms_accepted: false,
        total_xp: 0,
        current_rank: "Scout Analyst",
        xp_multiplier: 1.0,
        current_streak: 0,
        longest_streak: 0,
        daily_consistency_score: 0,
        subscription_tier: 'free',
        subscription_status: 'active',
        role: 'user',
        is_internal_user: false
      };
      
      const { data: newProf, error: insertErr } = await supabase
        .from('user_profiles')
        .insert([defaultProf])
        .select()
        .single();
        
      if (insertErr) {
        console.error("Failed to auto-create user profile during hydration:", insertErr);
      } else {
        prof = newProf;
      }
    }
    const txs = txsRes.data;
    const subs = subsRes.data;
    const gps = gpsRes.data;
    const contribs = contribsRes.data;
    const budgets = budgetsRes.data;
    const rems = remRes.data;
    const rules = rulesRes.data;
    const usage = usageRes?.data;

    let debtsData: any[] = [];
    if (debtsRes && debtsRes.error) {
      console.warn("Warning: Failed to fetch debts from Supabase. Falling back to profile onboardingAnswers. Error:", debtsRes.error.message);
      const profileData = profRes.data;
      if (profileData && profileData.onboarding_answers && profileData.onboarding_answers.debts) {
        debtsData = profileData.onboarding_answers.debts;
      }
    } else {
      debtsData = debtsRes?.data || [];
    }

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
        reminders: rems ? rems.map((r: any) => ({ 
          id: r.id, 
          title: r.title, 
          description: r.description,
          amount: r.amount ? parseFloat(r.amount) : undefined, 
          due_date: r.due_date, 
          due_time: r.due_time,
          category: r.category, 
          priority: r.priority,
          recurring: r.recurring, 
          status: r.status,
          completed_at: r.completed_at,
          billing_day: r.billing_day
        })) : [],
        reminderCompletions: compRes.data || [],
        merchantRules: rules ? rules.map((r: any) => ({ id: r.id, user_id: r.user_id, merchant_keyword: r.merchant_keyword, category: r.category })) : [],
        debts: debtsData.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category || d.type || "Other",
          monthlyRepayment: parseFloat(d.monthly_repayment || d.repayment || "0"),
          outstandingBalance: parseFloat(d.outstanding_balance || d.balance || "0"),
          createdAt: d.created_at
        })),
        budgets: Object.keys(budgetsObj).length > 0 ? budgetsObj : initialState.budgets,
        aiUsage: usage ? { messages_used: usage.messages_used, billing_month: usage.billing_month } : { messages_used: 0, billing_month: currentMonth },
        userProfile: prof ? {
          id: prof.id || user.id,
          name: prof.name || "",
          email: prof.email || "",
          phone: prof.phone || "",
          avatarUrl: prof.avatar_url || "",
          theme: prof.theme || "System Default",
          language: prof.language || "en",
          currency: prof.currency || "R",
          monthlyIncome: parseFloat(prof.monthly_income),
          country: prof.country || "ZA",
          age: prof.age,
          householdSize: prof.household_size,
          riskTolerance: prof.risk_tolerance,
          subscription_tier: prof.subscription_tier || 'free',
          subscription_status: prof.subscription_status || 'active',
          role: prof.role || 'user',
          is_internal_user: prof.is_internal_user || false,
          subscription_started_at: prof.subscription_started_at,
          subscription_expires_at: prof.subscription_expires_at,
          trial_ends_at: prof.trial_ends_at,
          payment_provider: prof.payment_provider,
          payment_customer_id: prof.payment_customer_id,
          onboardingCompleted: prof.onboarding_completed || false,
          onboardingCompletedAt: prof.onboarding_completed_at || "",
          userType: prof.user_type || "",
          reason_for_using_vylos: prof.reason_for_using_vylos || "",
          moneyConfidence: prof.money_confidence || "",
          first_tracking_focus: prof.first_tracking_focus || "",
          currentTrackingMethod: prof.current_tracking_method || "",
          biggest_money_challenge: prof.biggest_money_challenge || "",
          monthly_income_range: prof.monthly_income_range || "",
          main_money_goal: prof.main_money_goal || "",
          review_frequency: prof.review_frequency || "",
          communication_preference: prof.communication_preference || "",
          budgetAlertSent: prof.budget_alert_sent || false,
          budgetAlertEnabled: prof.budget_alert_enabled !== false,
          termsAccepted: prof.terms_accepted || false,
          termsAcceptedAt: prof.terms_accepted_at || "",
          termsVersion: prof.terms_version || "v1.0",
          termsLastUpdated: prof.terms_last_updated || "2026-05-26",
          totalXp: parseFloat(prof.total_xp || "0"),
          currentRank: prof.current_rank || "Scout Analyst",
          xpMultiplier: parseFloat(prof.xp_multiplier || "1.0"),
          currentStreak: parseInt(prof.current_streak || "0"),
          longestStreak: parseInt(prof.longest_streak || "0"),
          dailyConsistencyScore: parseFloat(prof.daily_consistency_score || "0"),
          lastConsistencyDate: prof.last_consistency_date || "",
          lastLoginXpDate: prof.last_login_xp_date || "",
          dismissed_notifications: prof.dismissed_notifications || [],
          onboardingAnswers: prof.onboarding_answers || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('vylos_onboarding_answers_fallback') || '{}') : {}),
        } : {
          ...initialState.userProfile,
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
        },
        notifications: prof?.notifications ? (prof.notifications as any) : initialState.notifications,
        notificationList: notifyRes?.data || [],
        unreadNotificationCount: (notifyRes?.data || []).filter((n: any) => !n.read).length,
        selectedMonth: getMonthStart(),
        backendHealthScore: scoreRes.data || null,
        isCalculatingHealthScore: false
      }
    });
    setLastSynced(new Date());
    setIsAuthLoaded(true);
  }, [supabase]);

  // Cleanup health score calculation debounced timeout on unmount
  useEffect(() => {
    return () => {
      if (healthScoreTimeoutRef.current) clearTimeout(healthScoreTimeoutRef.current);
    };
  }, []);

  const refreshData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      hydratingUserRef.current = null; // Clear lock to force re-hydration
      await hydrateCloudState(user);
    }
  }, [hydrateCloudState, supabase]);

  // Auth and Profile Hydration Hook
  useEffect(() => {
    let active = true;

    // Fetch current user session once on mount as a fallback/initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session?.user) {
        hydrateCloudState(session.user);
      } else if (active) {
        setIsAuthLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (!active) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        hydrateCloudState(session?.user);
      } else if (event === 'SIGNED_OUT') {
        hydrateCloudState(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, hydrateCloudState]);

  // Dedicated Realtime Database Subscription Hook
  useEffect(() => {
    if (!sessionUser) return;

    const user = sessionUser;

    const txChannel = supabase.channel('public:transactions')
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

    const goalsChannel = supabase.channel('public:goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, async () => {
        const { data: gps } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (gps) dispatch({ type: "UPDATE_GOALS", payload: gps.map((g: any) => ({ id: g.id, title: g.title, targetAmount: parseFloat(g.target_amount), currentAmount: parseFloat(g.current_amount), deadline: g.deadline, status: g.status, category: g.category, notes: g.notes, icon: g.icon, color: g.color, createdAt: g.created_at })) });
        setLastSynced(new Date());
      }).subscribe();

    const contribChannel = supabase.channel('public:goal_contributions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_contributions', filter: `user_id=eq.${user.id}` }, async () => {
        const { data: contribs } = await supabase.from('goal_contributions').select('*').eq('user_id', user.id);
        if (contribs) dispatch({ type: "UPDATE_CONTRIBUTIONS", payload: contribs.map((c: any) => ({ id: c.id, goalId: c.goal_id, amount: parseFloat(c.amount), date: c.date, notes: c.notes })) });
        setLastSynced(new Date());
      }).subscribe();

    const remChannel = supabase.channel('public:reminders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${user.id}` }, async () => {
        const { data: rems } = await supabase.from('reminders').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
        if (rems) dispatch({ type: "UPDATE_REMINDERS", payload: rems.map((r: any) => ({ 
          id: r.id, 
          title: r.title, 
          description: r.description,
          amount: r.amount ? parseFloat(r.amount) : undefined, 
          due_date: r.due_date, 
          due_time: r.due_time,
          category: r.category, 
          priority: r.priority,
          recurring: r.recurring, 
          status: r.status,
          completed_at: r.completed_at,
          billing_day: r.billing_day
        })) });
        setLastSynced(new Date());
      }).subscribe();

    const compChannel = supabase.channel('public:reminder_completions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminder_completions', filter: `user_id=eq.${user.id}` }, async () => {
        const { data: comps } = await supabase.from('reminder_completions').select('*').eq('user_id', user.id);
        if (comps) dispatch({ type: "UPDATE_REMINDER_COMPLETIONS", payload: comps });
        setLastSynced(new Date());
      }).subscribe();

    const scoreChannel = supabase.channel('public:user_health_scores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_health_scores', filter: `user_id=eq.${user.id}` }, async (payload: any) => {
        if (payload.new) {
          dispatch({ type: "UPDATE_BACKEND_HEALTH_SCORE", payload: payload.new });
        }
        setLastSynced(new Date());
      }).subscribe();

    const budgetsChannel = supabase.channel('public:budgets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` }, async () => {
        const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', user.id);
        const budgetsObj: Record<string, BudgetCategory> = {};
        if (budgets) {
          budgets.forEach((b: any) => {
            budgetsObj[b.category] = { limit: parseFloat(b.limit), type: b.type as any };
          });
        }
        dispatch({ type: "SET_BUDGETS", payload: budgetsObj });
        setLastSynced(new Date());
      }).subscribe();

    const debtsChannel = supabase.channel('public:debts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts', filter: `user_id=eq.${user.id}` }, async () => {
        const { data: dbDebts } = await supabase.from('debts').select('*').eq('user_id', user.id);
        if (dbDebts) {
          dispatch({
            type: "UPDATE_DEBTS",
            payload: dbDebts.map((d: any) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              monthlyRepayment: parseFloat(d.monthly_repayment),
              outstandingBalance: parseFloat(d.outstanding_balance),
              createdAt: d.created_at
            }))
          });
        }
        setLastSynced(new Date());
      }).subscribe();

    return () => {
      supabase.removeChannel(txChannel);
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(contribChannel);
      supabase.removeChannel(remChannel);
      supabase.removeChannel(compChannel);
      supabase.removeChannel(scoreChannel);
      supabase.removeChannel(budgetsChannel);
      supabase.removeChannel(debtsChannel);
    };
  }, [sessionUser, supabase]);

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
        awardXP,
        updateDailyConsistency,
        updateNotifications,
        deleteNotification,
        deleteAllNotifications,
        addNotification,
        markAllNotificationsAsRead,
        addReminder,
        updateReminder,
        toggleReminderCompletion,
        deleteReminder,
        addMerchantRule,
        categorizeTransaction,
        formatCurrency,
        sessionUser,
        isAuthLoaded,
        profileLoadingError,
        clearProfileError,
        lastSynced,
        setSelectedMonth,
        refreshData,
        triggerHealthScoreRecalculation,
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
