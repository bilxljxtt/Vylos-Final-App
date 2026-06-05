"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { Chart, registerables } from 'chart.js';
import { useAppStore } from "@/lib/AppContext";
import { TransactionCategory, getMonthStart } from "@/lib/store";
import { VylosEngine } from "@/lib/vylosEngine";
import { sanitizeString, getTransactionDateKey } from "@/lib/utils";
import { ExtractedTransaction } from "@/lib/services/import/ParserService";
import { ImportPreviewTransaction, ImportService } from "@/lib/services/import/ImportService";
import { normalizeTransactionCategory } from "@/lib/services/CategorizationEngine";
import { BudgetService, BudgetSummary } from "@/lib/services/BudgetService";
import { Permissions } from "@/lib/permissions";
import { VylosCalculations } from "@/lib/vylosCalculations";

// Standardized Components
import { DashboardV3 } from "@/components/dashboard/DashboardV3";
import { V2Header } from "@/components/dashboard/v2/V2Header";
import { V2ShortcutDock } from "@/components/dashboard/v2/V2ShortcutDock";
import { TransactionsView } from "@/components/views/TransactionsView";
import { BudgetView } from "@/components/views/BudgetView";
import { GoalsView } from "@/components/views/GoalsView";
import { AIAdvisorView, Message } from "@/components/views/AIAdvisorView";
import { VylosAIService } from "@/lib/services/VylosAIService";
import { ImportView } from "@/components/views/ImportView";
import { SettingsView } from "@/components/views/SettingsView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { CalendarView } from "@/components/views/CalendarView";
import { RemindersView } from "@/components/views/RemindersView";
import { PricingView } from "@/components/views/PricingView";
import { OnboardingView } from "@/components/views/OnboardingView";
import { LandingPage } from "@/components/ui/LandingPage";
import { LegalView } from "@/components/views/LegalView";
import { ActivityView } from "@/components/views/ActivityView";
import { TermsAcceptanceView } from "@/components/views/TermsAcceptanceView";
import { TransactionModal, GoalModal } from "@/components/ui/Modals";
import { ExportTransactionsModal } from "@/components/modals/ExportTransactionsModal";
import { HealthDetailModal } from "@/components/modals/HealthDetailModal";
import { RemindersModal } from "@/components/modals/RemindersModal";
import { EditBudgetModal } from "@/components/modals/EditBudgetModal";
import { FundCategoryModal } from "@/components/modals/FundCategoryModal";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { XPSystemModal } from "@/components/modals/XPSystemModal";
import { ComingSoonModal } from "@/components/modals/ComingSoonModal";
import { useToast } from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { VylosLogo } from "@/components/ui/VylosLogo";
import { VylosLoadingScreen } from "@/components/ui/VylosLoadingScreen";

// Register Chart.js
Chart.register(...registerables);

const ACCENT = "#00D8A5";


export default function App() {
  const { state, addTransaction, deleteTransaction, addGoal, deleteGoal, updateBudgetLimit, updateBudgets, updateProfile, awardXP, updateDailyConsistency, sessionUser, isAuthLoaded, profileLoadingError, clearProfileError, formatCurrency, categorizeTransaction, setSelectedMonth, refreshData } = useAppStore();
  const { toast: showToast } = useToast();
  
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const savedTheme = localStorage.getItem('vylos-theme');
    if (savedTheme === 'light') return false;
    if (savedTheme === 'dark') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync theme to document element
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vylos-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vylos-theme', 'light');
    }
  }, [dark]);

  // Sync database profile theme with local dark state reactively
  useEffect(() => {
    const userTheme = state.userProfile?.theme as string | undefined;
    if (userTheme === "Dark") {
      setDark(true);
    } else if (userTheme === "Light") {
      setDark(false);
    } else if (userTheme === "System Default" || userTheme === "System" || !userTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
    }
  }, [state.userProfile?.theme]);

  // Listen for OS color scheme changes if theme is System Default
  useEffect(() => {
    const userTheme = state.userProfile?.theme as string | undefined;
    if (userTheme === "System Default" || userTheme === "System" || !userTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setDark(e.matches);
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [state.userProfile?.theme]);

  const [page, setPage] = useState<string>(() => {
    if (typeof window === "undefined") return "dashboard";
    const savedPage = localStorage.getItem('vylos-last-page');
    return savedPage || "dashboard";
  });

  // Daily XP and Consistency Check
  const dailyXPProcessed = useRef(false);
  const dashboardReviewProcessed = useRef(false);
  useEffect(() => {
    if (!sessionUser || !state.userProfile.termsAccepted || !state.userProfile.onboardingCompleted) return;

    async function handleDailyXP() {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. First login of the day
        if (state.userProfile.lastLoginXpDate !== today && !dailyXPProcessed.current) {
          dailyXPProcessed.current = true;
          const { XP_CONFIG } = await import("@/lib/services/XPService");
          await awardXP("DAILY_LOGIN", XP_CONFIG.DAILY_LOGIN.xp, "First login of the day");
          await updateDailyConsistency("LOGIN");
          await updateProfile({ lastLoginXpDate: today });
          showToast(`+${XP_CONFIG.DAILY_LOGIN.xp} XP for your daily visit!`, "success");
        }
        
        // 2. Mark Dashboard Review (once per day/session)
        if (page === "dashboard" && !dashboardReviewProcessed.current) {
           dashboardReviewProcessed.current = true;
           await updateDailyConsistency("REVIEW");
        }
      } catch (err: any) {
        console.error("Daily XP Error:", err);
        // On error, reset processed flags to allow retry
        if (err.message === "Failed to fetch") {
           // We might not want to reset immediately if it's a persistent network issue
        }
      }
    }
    handleDailyXP();
  }, [sessionUser, state.userProfile.termsAccepted, state.userProfile.onboardingCompleted, state.userProfile.lastLoginXpDate, page]);

  // Persist page to localStorage and Handle Route Protection
  useEffect(() => {
    localStorage.setItem('vylos-last-page', page);
    
    // Protection: Redirect if free user tries to access premium AI
    if (page === "ai" && !Permissions.canUseAIAdvisor(state.userProfile)) {
      setPage("dashboard");
    }
  }, [page, state.userProfile]);

  // Reset scroll to top (vertical and horizontal) on active view state changes
  const previousPageRef = useRef(page);
  useEffect(() => {
    if (previousPageRef.current !== page) {
      previousPageRef.current = page;
      // Temporarily disable smooth scroll to force instant scroll to top on tab change
      const originalScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });
      // Restore scroll-behavior in the next animation frame
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
      });
    }
  }, [page]);

  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [txForm, setTxForm] = useState({desc:"",amount:"",cat: "Groceries" as TransactionCategory,date:new Date().toISOString().slice(0,10),type:"expense",notes:""});
  const [goalForm, setGoalForm] = useState({
    name: "",
    target: "",
    saved: "0",
    deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    category: "Savings",
    notes: "",
    icon: "Target",
    color: ACCENT
  });
  const [importPreview, setImportPreview] = useState<ImportPreviewTransaction[] | null>(null);

  const [showHealthDetail, setShowHealthDetail] = useState(false);
  const [showXPSystem, setShowXPSystem] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [showFundCategory, setShowFundCategory] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState({ isOpen: false, source: "billing_upgrade", title: "Coming Soon" });

  // Compute stats (Real-time Calculation Engine)
  const selectedMonth = useMemo(() => {
    return /^\d{4}-\d{2}-\d{2}$/.test(state.selectedMonth)
      ? state.selectedMonth
      : getMonthStart();
  }, [state.selectedMonth]);
  
  const currentMonthStr = selectedMonth;
  const previousMonthStr = useMemo(() => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  }, [selectedMonth]);

  const transactionIndex = useMemo(() => {
    return VylosCalculations.createTransactionIndex(state.transactions);
  }, [state.transactions]);

  const stats = useMemo(() => {
    const start = performance.now();
    const res = VylosCalculations.getMonthStats(state, currentMonthStr, transactionIndex);
    const end = performance.now();
    if (end - start > 10) console.log(`[Perf] getMonthStats took ${(end - start).toFixed(2)}ms`);
    return res;
  }, [state, currentMonthStr, transactionIndex]);

  const prevStats = useMemo(() => {
    return VylosCalculations.getMonthStats(state, previousMonthStr, transactionIndex);
  }, [state, previousMonthStr, transactionIndex]);

  const income = stats.income;
  const expense = stats.expense;
  const netWorth = stats.netWorth;
  const savingsRate = stats.savingsRate;
  
  const trends = useMemo(() => ({
    incomeTrend: prevStats.income > 0 ? ((income - prevStats.income) / prevStats.income) * 100 : 0,
    expenseTrend: prevStats.expense > 0 ? ((expense - prevStats.expense) / prevStats.expense) * 100 : 0,
    netWorthTrend: prevStats.netWorth > 0 ? ((netWorth - prevStats.netWorth) / prevStats.netWorth) * 100 : 0
  }), [income, expense, netWorth, prevStats]);

  const engineOutput = useMemo(() => {
    const start = performance.now();
    const res = VylosEngine.run(state, transactionIndex);
    const end = performance.now();
    if (end - start > 10) console.log(`[Perf] VylosEngine.run took ${(end - start).toFixed(2)}ms`);
    return res;
  }, [state, transactionIndex]);

  const healthMetrics = useMemo(() => {
    const scoreState = VylosEngine.computeHealthScore(state, transactionIndex);
    return {
      score: engineOutput.healthScore,
      label: engineOutput.healthCategory,
      breakdown: {
        spending: Math.round(scoreState.components.C * 25),
        savings: Math.round(scoreState.components.Q * 25),
        budget: Math.round(scoreState.components.D * 25),
        goals: Math.round(scoreState.components.G * 25),
      },
      stats: {
        runwayMonths: engineOutput.burnRateMonths,
        budgetUtilization: stats.budgetUtilization,
        savingsRate: savingsRate
      },
      explanation: VylosEngine.explainHealthScoreChange(engineOutput.healthScore, engineOutput.healthScore, { Q: 0, D: 0, C: 0, G: 0 })
    };
  }, [engineOutput, stats.budgetUtilization, savingsRate, state, transactionIndex]);
  const [filterCat, setFilterCat] = useState("All");
  const [aiLoading, setAiLoading] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [monthlyUsed, setMonthlyUsed] = useState(0);
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: "initial-assistant-msg",
      role: "assistant",
      content: "Hello. I have analysed your financial metrics. Feel free to ask any questions regarding your budget limits, savings targets, or spending habits.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [aiInput, setAiInput] = useState("");

  const fetchAiUsage = useCallback(async () => {
    if (!sessionUser) return;
    try {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);
      const currentMonth = new Date().toISOString().slice(0, 7);

      const { data: dailyData } = await supabase
        .from('ai_daily_usage')
        .select('message_count')
        .eq('user_id', sessionUser.id)
        .eq('usage_date', today)
        .maybeSingle();

      const { data: monthlyData } = await supabase
        .from('ai_usage')
        .select('messages_used')
        .eq('user_id', sessionUser.id)
        .eq('billing_month', currentMonth)
        .maybeSingle();

      setDailyUsed(dailyData?.message_count || 0);
      setMonthlyUsed(monthlyData?.messages_used || 0);
    } catch (err) {
      console.error("Error fetching AI limits:", err);
    }
  }, [sessionUser]);

  useEffect(() => {
    if (page === "ai") {
      fetchAiUsage();
    }
  }, [page, fetchAiUsage]);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart | null>(null);
  const donutInst = useRef<Chart | null>(null);

  async function handleOnboardingComplete(answers: any) {
    try {
      if (!sessionUser) return;
      
      const takeHomePay = parseFloat(answers.takeHomePay || "0");
      const age = parseInt(answers.age || "0");
      const householdSize = answers.budgetTarget === "individual" ? 1 : (
        parseInt(answers.householdBreakdown?.kids || "0") +
        parseInt(answers.householdBreakdown?.teens || "0") +
        parseInt(answers.householdBreakdown?.youngAdults || "0") +
        parseInt(answers.householdBreakdown?.adults || "0") +
        parseInt(answers.householdBreakdown?.elders || "0")
      );

      const updates = {
        userType: answers.userType,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        monthlyIncome: takeHomePay,
        age: age,
        householdSize: householdSize,
        onboardingAnswers: answers
      };

      await updateProfile(updates);

      const supabase = createClient();

      // 1. Generate starter budgets
      const budgetLimits: Record<string, number> = {};

      const addLimit = (cat: string, amt: number) => {
        if (isNaN(amt) || amt <= 0) return;
        budgetLimits[cat] = (budgetLimits[cat] || 0) + amt;
      };

      // Hobbies mapping
      if (answers.hobbies && Array.isArray(answers.hobbies)) {
        answers.hobbies.forEach((h: any) => {
          const name = (h.name || "").toLowerCase().trim();
          const amt = parseFloat(h.amount || "0");
          if (isNaN(amt) || amt <= 0) return;

          let cat = "";
          if (name.includes("gym") || name === "fitness" || name === "health") {
            cat = "Health/Fitness";
          } else if (name.includes("gaming") || name === "entertainment") {
            cat = "Entertainment";
          } else if (name.includes("eating out") || name.includes("restaurant") || name.includes("cafe") || name.includes("food")) {
            cat = "Eating Out";
          } else if (name.includes("fashion") || name.includes("clothing") || name.includes("shop") || name.includes("beauty")) {
            cat = "Shopping";
          } else if (name.includes("travel") || name.includes("holiday")) {
            cat = "Travel";
          } else if (name.includes("car")) {
            cat = "Transport/Car Lifestyle";
          } else if (name.includes("content creation") || name.includes("creative") || name.includes("business")) {
            cat = "Business/Creative";
          } else if (name.includes("sports") || name.includes("sport") || name.includes("exercise")) {
            cat = "Fitness/Sports";
          } else {
            cat = h.name.trim().charAt(0).toUpperCase() + h.name.trim().slice(1);
          }
          addLimit(cat, amt);
        });
      }

      // Infrastructure costs
      const rentBond = parseFloat(answers.infrastructure?.rentBond || "0");
      const householdContribution = parseFloat(answers.infrastructure?.householdContribution || "0");
      const ratesLevies = parseFloat(answers.infrastructure?.ratesLevies || "0");
      const fuel = parseFloat(answers.infrastructure?.fuel || "0");
      const publicTransport = parseFloat(answers.infrastructure?.publicTransport || "0");
      const carRepayment = parseFloat(answers.infrastructure?.carRepayment || "0");
      const carInsurance = parseFloat(answers.infrastructure?.carInsurance || "0");
      const carMaintenance = parseFloat(answers.infrastructure?.carMaintenance || "0");

      addLimit("Housing", rentBond);
      addLimit("Housing/Household", householdContribution);
      addLimit("Utilities/Bills", ratesLevies);
      addLimit("Transport", fuel);
      addLimit("Transport", publicTransport);
      addLimit("Car Finance/Transport", carRepayment);
      addLimit("Insurance", carInsurance);
      addLimit("Maintenance/Transport", carMaintenance);

      // Essentials
      const groceries = parseFloat(answers.groceries || "0");
      const utilities = parseFloat(answers.utilities || "0");
      const data = parseFloat(answers.data || "0");
      const toiletries = parseFloat(answers.toiletries || "0");
      const householdItems = parseFloat(answers.householdItems || "0");
      const otherEssentials = parseFloat(answers.otherEssentials || "0");

      addLimit("Groceries", groceries);
      addLimit("Utilities/Bills", utilities);
      addLimit("Mobile/Data", data);
      addLimit("Personal Care", toiletries);
      addLimit("Household", householdItems);
      addLimit("Other Essentials", otherEssentials);

      // Debts budget category mapping
      const debtLimit = answers.debts ? answers.debts.reduce((sum: number, d: any) => sum + parseFloat(d.repayment || "0"), 0) : 0;
      addLimit("Debt Payments", debtLimit);

      // Default allocations (Savings 20%, Entertainment 15% if not already allocated)
      if (takeHomePay > 0 && !budgetLimits["Savings"]) {
        addLimit("Savings", Math.round(takeHomePay * 0.20));
      }
      if (takeHomePay > 0 && !budgetLimits["Entertainment"]) {
        addLimit("Entertainment", Math.round(takeHomePay * 0.15));
      }

      const budgetsToInsert = Object.entries(budgetLimits).map(([cat, limit]) => ({
        category: cat,
        user_id: sessionUser.id,
        limit,
        spent: 0,
        type: "limit"
      }));

      if (budgetsToInsert.length > 0) {
        const { error: budgetError } = await supabase
          .from('budgets')
          .upsert(budgetsToInsert, { onConflict: "category,user_id" });
        if (budgetError) console.error("Error creating starter budgets:", budgetError);
      }

      // 2. Generate starter goals
      if (answers.goalsDetails && answers.goalsDetails.length > 0) {
        const { data: existingGoals } = await supabase
          .from('goals')
          .select('id, title')
          .eq('user_id', sessionUser.id);

        const goalsToUpdate: any[] = [];
        const goalsToInsert: any[] = [];

        for (const g of answers.goalsDetails) {
          const targetAmt = parseFloat(g.target_amount) || 0;
          const currentAmt = parseFloat(g.current_amount || "0") || 0;
          const deadline = g.deadline || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
          const matchedGoal = existingGoals?.find((eg: any) => eg.title.toLowerCase().trim() === g.title.toLowerCase().trim());

          if (matchedGoal) {
            goalsToUpdate.push({
              id: matchedGoal.id,
              user_id: sessionUser.id,
              title: g.title,
              target_amount: targetAmt,
              current_amount: currentAmt,
              deadline,
              category: g.category || "Savings",
              icon: g.icon || "🎯",
              color: g.color || "#00D8A5",
              notes: `Updated during onboarding config`
            });
          } else {
            goalsToInsert.push({
              user_id: sessionUser.id,
              title: g.title,
              target_amount: targetAmt,
              current_amount: currentAmt,
              deadline,
              category: g.category || "Savings",
              status: "On Track",
              notes: `Created during onboarding config`,
              icon: g.icon || "🎯",
              color: g.color || "#00D8A5",
              created_at: new Date().toISOString()
            });
          }
        }

        if (goalsToInsert.length > 0) {
          const { error: insertGoalErr } = await supabase
            .from('goals')
            .insert(goalsToInsert);
          if (insertGoalErr) console.error("Error inserting onboarding goals:", insertGoalErr);
        }

        if (goalsToUpdate.length > 0) {
          const { error: updateGoalErr } = await supabase
            .from('goals')
            .upsert(goalsToUpdate);
          if (updateGoalErr) console.error("Error updating onboarding goals:", updateGoalErr);
        }
      }

      // 3. Save to native debts table (if table exists)
      if (answers.hasDebt === "Yes" && answers.debts && answers.debts.length > 0) {
        try {
          const { data: existingDebts } = await supabase
            .from('debts')
            .select('id, name')
            .eq('user_id', sessionUser.id);

          const debtsToUpdate: any[] = [];
          const debtsToInsert: any[] = [];

          for (const d of answers.debts) {
            const repaymentAmt = parseFloat(d.repayment || "0") || 0;
            const balanceAmt = parseFloat(d.balance || "0") || 0;
            const matchedDebt = existingDebts?.find((ed: any) => ed.name.toLowerCase().trim() === d.name.toLowerCase().trim());

            if (matchedDebt) {
              debtsToUpdate.push({
                id: matchedDebt.id,
                user_id: sessionUser.id,
                name: d.name,
                category: d.category || "Other",
                monthly_repayment: repaymentAmt,
                outstanding_balance: balanceAmt
              });
            } else {
              debtsToInsert.push({
                user_id: sessionUser.id,
                name: d.name,
                category: d.category || "Other",
                monthly_repayment: repaymentAmt,
                outstanding_balance: balanceAmt
              });
            }
          }

          if (debtsToInsert.length > 0) {
            await supabase.from('debts').insert(debtsToInsert);
          }

          if (debtsToUpdate.length > 0) {
            await supabase.from('debts').upsert(debtsToUpdate);
          }
        } catch (debtsError: any) {
          console.warn("Could not manage native debts table (it may not exist yet or have RLS limits):", debtsError.message);
        }
      }

      // 4. Create bill reminders for fixed costs and debts
      const nextMonthFirst = new Date();
      nextMonthFirst.setMonth(nextMonthFirst.getMonth() + 1);
      nextMonthFirst.setDate(1);
      const dueDateStr = nextMonthFirst.toISOString().split('T')[0];

      const candidateReminders: any[] = [];

      if (rentBond > 0) {
        candidateReminders.push({
          title: "Rent / Bond Payment",
          description: "Fixed monthly housing infrastructure payment",
          amount: rentBond,
          due_date: dueDateStr,
          category: "Housing",
          priority: "high",
          recurring: "monthly"
        });
      }

      if (carRepayment > 0) {
        candidateReminders.push({
          title: "Car Repayment",
          description: "Monthly vehicle finance repayment",
          amount: carRepayment,
          due_date: dueDateStr,
          category: "Car Finance/Transport",
          priority: "high",
          recurring: "monthly"
        });
      }

      if (carInsurance > 0) {
        candidateReminders.push({
          title: "Car Insurance",
          description: "Monthly car insurance premium",
          amount: carInsurance,
          due_date: dueDateStr,
          category: "Insurance",
          priority: "medium",
          recurring: "monthly"
        });
      }

      if (answers.hasDebt === "Yes" && answers.debts && answers.debts.length > 0) {
        answers.debts.forEach((d: any) => {
          const repaymentAmt = parseFloat(d.repayment || "0");
          if (repaymentAmt > 0) {
            candidateReminders.push({
              title: `${d.name} Repayment`,
              description: `Monthly payment obligation for ${d.category || "Debt"}`,
              amount: repaymentAmt,
              due_date: dueDateStr,
              category: "Debt Payments",
              priority: "high",
              recurring: "monthly"
            });
          }
        });
      }

      if (candidateReminders.length > 0) {
        const { data: existingReminders } = await supabase
          .from('reminders')
          .select('id, title')
          .eq('user_id', sessionUser.id)
          .eq('status', 'pending');

        const remindersToUpdate: any[] = [];
        const remindersToInsert: any[] = [];

        for (const rem of candidateReminders) {
          const matchedRem = existingReminders?.find((er: any) => er.title.toLowerCase().trim() === rem.title.toLowerCase().trim());
          if (matchedRem) {
            remindersToUpdate.push({
              id: matchedRem.id,
              user_id: sessionUser.id,
              title: rem.title,
              amount: rem.amount,
              due_date: rem.due_date,
              description: rem.description,
              category: rem.category,
              priority: rem.priority,
              recurring: rem.recurring,
              status: "pending"
            });
          } else {
            remindersToInsert.push({
              user_id: sessionUser.id,
              title: rem.title,
              description: rem.description,
              amount: rem.amount,
              due_date: rem.due_date,
              category: rem.category,
              priority: rem.priority,
              recurring: rem.recurring,
              status: "pending"
            });
          }
        }

        if (remindersToInsert.length > 0) {
          const { error: insertRemErr } = await supabase
            .from('reminders')
            .insert(remindersToInsert);
          if (insertRemErr) console.error("Error inserting reminders:", insertRemErr);
        }

        if (remindersToUpdate.length > 0) {
          const { error: updateRemErr } = await supabase
            .from('reminders')
            .upsert(remindersToUpdate);
          if (updateRemErr) console.error("Error updating reminders:", updateRemErr);
        }
      }

      const { XP_CONFIG } = await import("@/lib/services/XPService");
      await awardXP("ONBOARDING_COMPLETE", XP_CONFIG.ONBOARDING_COMPLETE.xp, "Completed Onboarding Questionnaire");
      await refreshData();
      
      showToast(`Welcome to Vylos! +${XP_CONFIG.ONBOARDING_COMPLETE.xp} XP earned for personalising your profile.`, "success");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  }


  // Memoize dynamic dashboard stats and calculations
  const { totalSaved, avgMonthlySpend, lowestMonthSpend, highestMonthSpend } = useMemo(() => {
    const totalSavedVal = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const spendMap: Record<string, number> = {};
    state.transactions.filter(t => t.amount < 0).forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      spendMap[key] = (spendMap[key] || 0) + Math.abs(t.amount);
    });
    const spendVals = Object.values(spendMap);
    const avg = spendVals.length > 0 ? spendVals.reduce((a, b) => a + b, 0) / spendVals.length : 0;
    const lowest = spendVals.length > 0 ? Math.min(...spendVals) : 0;
    const highest = spendVals.length > 0 ? Math.max(...spendVals) : 0;
    return {
      totalSaved: totalSavedVal,
      avgMonthlySpend: avg,
      lowestMonthSpend: lowest,
      highestMonthSpend: highest
    };
  }, [state.transactions, state.goals]);

  // Pre-sort transactions and memoize to avoid sorting inside render loops
  const sortedTransactions = useMemo(() => {
    return [...state.transactions].sort((a, b) => getTransactionDateKey(b).localeCompare(getTransactionDateKey(a)));
  }, [state.transactions]);

  const isPro = useMemo(() => Permissions.isInternalUser(state.userProfile) || state.userProfile.subscription_tier !== 'free', [state.userProfile]);

  // Chart Data Preparation (Memoized to prevent freezing during render)
  const chartData = useMemo(() => {
    const start = performance.now();
    const [refYear, refMonth] = selectedMonth.split('-').map(Number);
    const monthlyHealth: number[] = new Array(6).fill(0);
    const labels = new Array(6).fill("");

    for (let i = 5; i >= 0; i--) {
      const d = new Date(refYear, refMonth - 1 - i, 1);
      labels[5 - i] = d.toLocaleString('default', { month: 'short' });
      
      const monthPrefix = d.toISOString().slice(0, 7);
      const monthTxs = transactionIndex.monthMap[monthPrefix] || [];

      // Optimized mini-state for health calculation
      const monthState = {
          ...state,
          transactions: monthTxs,
          budgets: Object.fromEntries(Object.entries(state.budgets).map(([k, b]: [string, any]) => {
              const catSpend = monthTxs.filter(t => t.category === k && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
              return [k, { ...b, spent: catSpend }];
          }))
      };
      monthlyHealth[5 - i] = VylosEngine.computeHealthScore(monthState).score;
    }
    const end = performance.now();
    console.log(`[Perf] Chart data calculation took ${(end - start).toFixed(2)}ms`);
    return { labels, monthlyHealth };
  }, [state, selectedMonth, transactionIndex]);

  // Handle Charts
  useEffect(()=>{
    const drawCharts = () => {
      const budgetSummary = BudgetService.calculateBudgetSummary(state, currentMonthStr);
      const { labels, monthlyHealth } = chartData;

      if(chartRef.current) {
        if(chartInst.current) chartInst.current.destroy();
        chartInst.current = new Chart(chartRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [{ 
              label: "Health Score",
              data: monthlyHealth,
              borderColor: "#10B981", 
              backgroundColor: (context: any) => {
                const chart = context.chart;
                const {ctx, chartArea} = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, "rgba(16, 185, 129, 0)");
                gradient.addColorStop(1, "rgba(16, 185, 129, 0.15)");
                return gradient;
              },
              fill:true, tension:0.4, borderWidth:4, pointRadius:4, pointBackgroundColor: "#10B981", pointBorderColor: "#fff", pointBorderWidth: 2, pointHoverRadius: 8
            }]
          },
          options: {
            responsive:true, maintainAspectRatio:false,
            interaction: { intersect: false, mode: 'index' },
            plugins:{
              legend:{display:false},
              tooltip: {
                backgroundColor: '#fff',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                  label: (context: any) => ` Health Score: ${context.parsed.y}`
                }
              }
            },
            scales: {
              x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#94a3b8' } },
              y: { grid: { color: "rgba(148,163,184,0.05)", drawTicks: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#94a3b8', padding: 10 } }
            }
          }
        });
      }
      if(donutRef.current) {
        if(donutInst.current) donutInst.current.destroy();
        const catData = budgetSummary.categories
          .map(c => [c.name, c.spent] as [string, number])
          .filter(([, v]) => v > 0);
        donutInst.current = new Chart(donutRef.current, {
          type: 'doughnut',
          data: {
            labels: catData.map(([k])=>k),
            datasets: [{
              data: catData.map(([,v])=>v),
              backgroundColor: ["#00C853", "#FF7043", "#7C4DFF", "#FF6D00", "#795548", "#0091EA", "#FF1744", "#3F51B5", "#F50057", "#00BCD4", "#4CAF50", "#607D8B", "#546E7A"],
              borderWidth: 0,
              hoverOffset: 10,
              spacing: 4,
              borderRadius: 4
            }]
          },
          options: {
            responsive:true, maintainAspectRatio:false, cutout: "70%",
            plugins:{legend:{display:false}}
          }
        });
      }
    };

    const timer = setTimeout(drawCharts, 300);
    return () => { 
      clearTimeout(timer);
    };
  }, [page, dark, chartData, state.budgets, currentMonthStr]);

  // Actions
  async function handleAddTransaction() {
    if(!txForm.desc||!txForm.amount) return;
    const finalAmount = txForm.type==="expense" ? -Math.abs(parseFloat(txForm.amount)) : Math.abs(parseFloat(txForm.amount));
      await addTransaction({
        merchant: txForm.desc,
        amount: finalAmount,
        category: txForm.cat,
        date: txForm.date,
        transaction_date: txForm.date,
        notes: txForm.notes
      });
    setShowAddTx(false);
    // RESET with default cat
    setTxForm({desc:"",amount:"",cat:"Groceries",date:new Date().toISOString().slice(0,10),type:"expense",notes:""});
    
    const { XP_CONFIG } = await import("@/lib/services/XPService");
    const earned = await awardXP("ADD_TRANSACTION", XP_CONFIG.ADD_TRANSACTION.xp, `Added transaction: ${txForm.desc}`);
    await updateDailyConsistency("TRANSACTION");
    
    showToast(`Transaction added! +${earned} XP earned.`);
  }

  function handleQuickAddTransaction(cat: TransactionCategory) {
    setTxForm(prev => ({ ...prev, cat }));
    setShowAddTx(true);
  }

  function handleQuickFundCategory(cat: TransactionCategory) {
    // We can handle this by passing a prop or updating a state that FundCategoryModal consumes
    // For now let's just use a ref-like state if needed, or update the modal prop
    setQuickFundCat(cat);
    setShowFundCategory(true);
  }

  const [quickFundCat, setQuickFundCat] = useState<TransactionCategory>("Shopping");

  async function handleDeleteTx(id: string) {
    await deleteTransaction(id);
    showToast("Transaction deleted","info");
  }

  async function handleDeleteCategory(cat: string) {
    const newBudgets = { ...state.budgets };
    delete newBudgets[cat];
    const limitUpdates: Record<string, number> = {};
    Object.keys(newBudgets).forEach(k => { limitUpdates[k] = newBudgets[k].limit; });
    await updateBudgets(limitUpdates);
    showToast(`${cat} budget removed`, "info");
  }

  async function handleAddGoal() {
    if(!goalForm.name||!goalForm.target) return;
    await addGoal({
      title: goalForm.name,
      targetAmount: parseFloat(goalForm.target),
      currentAmount: parseFloat(goalForm.saved||"0"),
      deadline: new Date(goalForm.deadline).toISOString(),
      category: goalForm.category,
      notes: goalForm.notes,
      icon: goalForm.icon,
      color: goalForm.color
    });
    setShowAddGoal(false);
    setGoalForm({
      name: "",
      target: "",
      saved: "0",
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      category: "Savings",
      notes: "",
      icon: "Target",
      color: ACCENT
    });
    const { XP_CONFIG } = await import("@/lib/services/XPService");
    const earned = await awardXP("CREATE_GOAL", XP_CONFIG.CREATE_GOAL.xp, `Created goal: ${goalForm.name}`);
    await updateDailyConsistency("BUDGET_UPDATE");
    
    showToast(`Goal created! +${earned} XP earned.`, "success");
  }

  async function sendAI() {
    if(!aiInput.trim() || aiLoading) return;

    if (!Permissions.canUseAI(state.userProfile)) {
      showToast("You do not have permission to access this AI feature.", "error");
      return;
    }

    const isDeveloper = state.userProfile.email === 'bilxljxtt10@gmail.com';
    if (!isDeveloper) {
      if (state.userProfile.subscription_tier === 'free') {
        if (dailyUsed >= 5) {
          showToast("Daily AI limit reached. Please try again tomorrow.", "error");
          return;
        }
      } else {
        const monthlyLimit = Permissions.getAIMonthlyLimit(state.userProfile);
        if (monthlyUsed >= monthlyLimit) {
          showToast(`You have reached your Vylos Advisor limit of ${monthlyLimit} messages for this month.`, "error");
          return;
        }
      }
    }

    const userMsg = aiInput.trim();
    const userMsgId = `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const assistantMsgId = `msg-assistant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: userMsg,
      timestamp: new Date().toISOString()
    };

    setAiMessages(prev => [...prev, newUserMessage]);
    setAiInput("");
    setAiLoading(true);

    try {
      const response = await VylosAIService.askVylosAI(userMsg);
      
      const newAssistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        source: response.source,
        layer: response.layer,
        data: response.data ?? undefined,
      };
      if (process.env.NODE_ENV === "development") {
        console.log("[sendAI] response.data:", response.data, "| msg.data:", newAssistantMessage.data);
      }
      setAiMessages(prev => [...prev, newAssistantMessage]);
      await fetchAiUsage();
    } catch (e: any) {
      let errorMessage = "AI service connection failed. Please check the backend connection.";
      
      if (process.env.NODE_ENV === "development") {
        console.error("[Vylos AI Error]", e);
      }

      if (e.message === "UNAUTHORIZED") {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (e.message === "FORBIDDEN") {
        errorMessage = "You do not have permission to access this AI feature.";
      } else if (e.message === "RATE_LIMITED") {
        errorMessage = "You’ve reached the AI message limit for now. Please try again later.";
        await fetchAiUsage();
      } else if (e.message === "BACKEND_ERROR") {
        errorMessage = "Vylos AI is temporarily unavailable. Please try again shortly.";
      }

      const errorAssistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: `❌ **Error:** ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      
      setAiMessages(prev => [...prev, errorAssistantMessage]);
      showToast(errorMessage, "error");
    } finally {
      setAiLoading(false);
    }
  }

  function handleImportResults(txs: ExtractedTransaction[]) {
    const rows: ImportPreviewTransaction[] = txs.map(tx => {
      const cat = tx.category ? normalizeTransactionCategory(tx.category) : categorizeTransaction(tx.merchant || "", tx.amount >= 0 ? "income" : "expense");
      // If it's not income, ensure it's negative
      let amt = tx.amount;
      const isIncome = ["Salary", "Business Income", "Refund", "Other Income"].includes(cat);
      if (!isIncome && amt > 0) amt = -amt;
      if (isIncome && amt < 0) amt = Math.abs(amt);

      return {
        id: Math.random().toString(36).substr(2, 9),
        date: tx.date || new Date().toISOString().slice(0, 10),
        desc: sanitizeString(tx.merchant || "Imported"),
        merchant: sanitizeString(tx.merchant || "Imported"),
        amount: amt,
        cat: cat,
        category: cat,
        confidence: cat === "Other" ? 0.1 : 0.85,
        isDuplicate: false,
        _preview: true as const
      };
    });
    setImportPreview(rows);
  }

  async function confirmImport() {
    if (!importPreview) return;
    const count = importPreview.length;
    showToast(`Processing ${count} transactions...`, "info");
    
    // Batch add transactions
    for (const tx of importPreview) {
      if (tx.isDuplicate) continue;
      await addTransaction({
        date: tx.date,
        merchant: tx.desc,
        category: tx.cat as TransactionCategory,
        amount: tx.amount
      });
    }
    
    setImportPreview(null);
    const { XP_CONFIG } = await import("@/lib/services/XPService");
    const earned = await awardXP("IMPORT_TRANSACTIONS", XP_CONFIG.IMPORT_TRANSACTIONS.xp, `Imported ${count} transactions`);
    await updateDailyConsistency("TRANSACTION");
    
    showToast(`Successfully imported ${count} transactions! +${earned} XP earned.`, "success");
  }

  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter(t => {
        const dateKey = getTransactionDateKey(t);
        return dateKey.startsWith(currentMonthStr.slice(0, 7));
      })
      .sort((a, b) => getTransactionDateKey(b).localeCompare(getTransactionDateKey(a)));
  }, [state.transactions, currentMonthStr]);

  const firstName = state.userProfile.name?.split(" ")[0] || "User";

  if (!isAuthLoaded) return (
    <VylosLoadingScreen variant="fullscreen" text="Syncing your finances..." />
  );

  if (profileLoadingError) {
    return (
      <div className="vylos-bg-loading fixed inset-0 flex flex-col items-center justify-center z-[9999] p-6 text-center select-none animate-in fade-in duration-300">
        <div className="absolute top-[48%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-80 h-80 bg-red-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-20 flex flex-col items-center max-w-sm">
          <div className="w-16 h-16 rounded-[22px] bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5 mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="4" />
              <line x1="8" y1="2" x2="8" y2="4" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sync Connection Error</h3>
          <p className="text-white/60 text-xs font-medium leading-relaxed mb-8">
            Vylos was unable to sync your financial profile from the database securely. Please check your internet connection and try again.
          </p>
          <button
            onClick={async () => {
              clearProfileError();
              await refreshData();
            }}
            className="w-full py-4 bg-white/10 hover:bg-white/25 border border-white/10 hover:border-white/20 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!sessionUser) return <LandingPage />;

  if (!state.userProfile.termsAccepted) {
    return (
      <TermsAcceptanceView 
        onAccept={async () => {
          await updateProfile({ 
            termsAccepted: true, 
            termsAcceptedAt: new Date().toISOString(),
            termsVersion: "v1.0",
            termsLastUpdated: "2026-05-26"
          });
          const { XP_CONFIG } = await import("@/lib/services/XPService");
          await awardXP("TERMS_ACCEPTANCE", XP_CONFIG.TERMS_ACCEPTANCE.xp, "Accepted Terms and Conditions");
          showToast(`+${XP_CONFIG.TERMS_ACCEPTANCE.xp} XP earned!`, "success");
        }} 
      />
    );
  }

  if (!state.userProfile.onboardingCompleted) {
    return <OnboardingView userName={state.userProfile.name} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="vylos-bg-premium min-h-screen w-full flex flex-col pt-2 pb-0 md:pb-8 px-4 md:pt-4 md:px-6 lg:pt-4 lg:px-8 font-inter relative overflow-clip">
      
      {/* ─── Global App Header ─── */}
      <V2Header 
        firstName={firstName} 
        avatarUrl={state.userProfile?.avatarUrl} 
        onPageChange={setPage} 
        onShowFeedback={() => setShowFeedback(true)}
      />

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col gap-2 md:gap-4 pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-32 relative z-10">
        {page === "dashboard" && (
          <DashboardV3
            income={income}
            expense={expense}
            netWorth={netWorth}
            savingsRate={savingsRate}
            transactions={sortedTransactions}
            goals={state.goals}
            healthScore={engineOutput.healthScore}
            userName={state.userProfile.name}
            userProfile={state.userProfile}
            selectedMonth={currentMonthStr}
            onMonthChange={(m) => setSelectedMonth(m)}
            budgetSummary={BudgetService.calculateBudgetSummary(state, currentMonthStr)}
            formatCurrency={formatCurrency}
            setPage={setPage}
            onXPClick={() => setShowXPSystem(true)}
            onHealthClick={() => setShowHealthDetail(true)}
            onShowFeedback={() => setShowFeedback(true)}
          />
        )}

        {page === "transactions" && (
          <TransactionsView 
            transactions={state.transactions} filterCat={filterCat} setFilterCat={setFilterCat} 
            setShowAddTx={setShowAddTx} deleteTx={handleDeleteTx} setPage={setPage}
            setShowExportModal={setShowExportModal}
            trends={trends}
          />
        )}
        {page === "calendar" && (
          <CalendarView setPage={setPage} />
        )}
        {page === "reminders" && (
          <RemindersView setShowAddReminder={setShowAddReminder} />
        )}

        {page === "pricing" && (
          <PricingView 
            onUpgrade={(title) => setShowComingSoon({ isOpen: true, source: "pricing_page", title })} 
            user={state.userProfile}
          />
        )}

        {page === "budget" && (
          <BudgetView 
            setShowNewBudget={setShowNewBudget} 
            handleDeleteCategory={handleDeleteCategory}
            onQuickAddTx={handleQuickAddTransaction}
            setShowFundCategory={setShowFundCategory}
            setShowHealthDetail={setShowHealthDetail}
          />
        )}
        {page === "goals" && (
          <GoalsView goals={state.goals} setShowAddGoal={setShowAddGoal} deleteGoal={deleteGoal} showToast={showToast} />
        )}

        {page === "activity" && (
          <ActivityView />
        )}

        {page === "ai" && (
          <AIAdvisorView 
            aiMessages={aiMessages} 
            aiInput={aiInput} 
            setAiInput={setAiInput} 
            sendAI={sendAI} 
            aiLoading={aiLoading} 
            showToast={showToast}
            userProfile={state.userProfile}
            setPage={setPage}
            setAiMessages={setAiMessages}
            dailyUsed={dailyUsed}
            monthlyUsed={monthlyUsed}
          />
        )}

        {page === "analytics" && (
          <AnalyticsView 
            chartRef={chartRef} 
            netWorth={netWorth} 
            totalSaved={totalSaved} 
            transactions={state.transactions}
            budgets={state.budgets}
            goals={state.goals}
            userProfile={state.userProfile}
          />
        )}
        {page === "import" && (
          <ImportView 
            showToast={showToast} 
            importPreview={importPreview} 
            setImportPreview={setImportPreview} 
            confirmImport={confirmImport} 
          />
        )}
        {page === "settings" && (
          <SettingsView 
            state={state} 
            updateProfile={updateProfile} 
            showToast={showToast} 
            dark={dark} 
            setDark={setDark} 
            setPage={setPage} 
            onUpgrade={(title: string) => setShowComingSoon({ isOpen: true, source: "settings_page", title })}
            onShowFeedback={() => setShowFeedback(true)}
          />
        )}
        {page === "privacy" && <LegalView type="privacy" onBack={() => setPage("dashboard")} />}
        {page === "terms" && <LegalView type="terms" onBack={() => setPage("dashboard")} />}
      </main>

      {/* ─── Global Floating Navigation Dock ─── */}
      <V2ShortcutDock 
        onPageChange={setPage} 
        currentPage={page} 
        userProfile={state.userProfile} 
        onShowFeedback={() => setShowFeedback(true)}
        onShowExport={() => setShowExportModal(true)}
      />

      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {showAddTx && (
        <TransactionModal 
          txForm={txForm} setTxForm={setTxForm} setShowAddTx={setShowAddTx} 
          handleAddTransaction={handleAddTransaction} autocat={categorizeTransaction} 
        />
      )}
      {showAddGoal && (
        <GoalModal 
          goalForm={goalForm} setGoalForm={setGoalForm} setShowAddGoal={setShowAddGoal} 
          handleAddGoal={handleAddGoal} 
        />
      )}
      <HealthDetailModal 
        isOpen={showHealthDetail} 
        onClose={() => setShowHealthDetail(false)} 
        metrics={healthMetrics}
      />
      <XPSystemModal 
        isOpen={showXPSystem} 
        onClose={() => setShowXPSystem(false)}
      />
      <RemindersModal 
        isOpen={showAddReminder} 
        onClose={() => setShowAddReminder(false)}
      />
      <EditBudgetModal 
        isOpen={showNewBudget} 
        onClose={() => setShowNewBudget(false)}
      />
      <FundCategoryModal 
        isOpen={showFundCategory}
        onClose={() => setShowFundCategory(false)}
        showToast={showToast}
        initialCategory={quickFundCat}
      />
      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
      <ExportTransactionsModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
      <ComingSoonModal 
        isOpen={showComingSoon.isOpen}
        onClose={() => setShowComingSoon({ ...showComingSoon, isOpen: false })}
        source={showComingSoon.source}
        title={showComingSoon.title}
      />
    </div>
  );
}
