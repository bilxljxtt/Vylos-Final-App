"use client";

import { useState, useEffect, useRef } from "react";
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
import { HealthDetailModal } from "@/components/modals/HealthDetailModal";
import { RemindersModal } from "@/components/modals/RemindersModal";
import { EditBudgetModal } from "@/components/modals/EditBudgetModal";
import { FundCategoryModal } from "@/components/modals/FundCategoryModal";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { XPSystemModal } from "@/components/modals/XPSystemModal";
import { ComingSoonModal } from "@/components/modals/ComingSoonModal";
import { useToast } from "@/components/Toast";

// Register Chart.js
Chart.register(...registerables);

const ACCENT = "#00D8A5";


export default function App() {
  const { state, addTransaction, deleteTransaction, addGoal, deleteGoal, updateBudgetLimit, updateBudgets, updateProfile, awardXP, updateDailyConsistency, sessionUser, isAuthLoaded, formatCurrency, categorizeTransaction, setSelectedMonth } = useAppStore();
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

  const [page, setPage] = useState<string>(() => {
    if (typeof window === "undefined") return "dashboard";
    const savedPage = localStorage.getItem('vylos-last-page');
    return savedPage || "dashboard";
  });

  // Daily XP and Consistency Check
  useEffect(() => {
    if (sessionUser && state.userProfile.termsAccepted && state.userProfile.onboardingCompleted) {
      async function handleDailyXP() {
        const today = new Date().toISOString().split('T')[0];
        if (state.userProfile.lastLoginXpDate !== today) {
          const { XP_CONFIG } = await import("@/lib/services/XPService");
          await awardXP("DAILY_LOGIN", XP_CONFIG.DAILY_LOGIN.xp, "First login of the day");
          await updateDailyConsistency("LOGIN");
          await updateProfile({ lastLoginXpDate: today });
          showToast(`+${XP_CONFIG.DAILY_LOGIN.xp} XP for your daily visit!`, "success");
        }
        
        // Mark Dashboard Review
        if (page === "dashboard") {
           await updateDailyConsistency("REVIEW");
        }
      }
      handleDailyXP();
    }
  }, [sessionUser, state.userProfile.termsAccepted, state.userProfile.onboardingCompleted, page]);

  // Persist page to localStorage and Handle Route Protection
  useEffect(() => {
    localStorage.setItem('vylos-last-page', page);
    
    // Protection: Redirect if free user tries to access premium AI
    if (page === "ai" && !Permissions.canUseAIAdvisor(state.userProfile)) {
      setPage("dashboard");
    }
  }, [page, state.userProfile]);
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
    icon: "🎯",
    color: ACCENT
  });
  const [importPreview, setImportPreview] = useState<ImportPreviewTransaction[] | null>(null);

  const [showHealthDetail, setShowHealthDetail] = useState(false);
  const [showXPSystem, setShowXPSystem] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [showFundCategory, setShowFundCategory] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState({ isOpen: false, source: "billing_upgrade", title: "Coming Soon" });

  // Compute stats (Real-time Calculation Engine)
  const selectedMonth = /^\d{4}-\d{2}-\d{2}$/.test(state.selectedMonth)
    ? state.selectedMonth
    : getMonthStart();
  
  const currentMonthStr = selectedMonth;
  const previousMonthDate = new Date(selectedMonth);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthStr = previousMonthDate.toISOString().slice(0, 10);

  const stats = VylosCalculations.getMonthStats(state, currentMonthStr);
  const prevStats = VylosCalculations.getMonthStats(state, previousMonthStr);

  const income = stats.income;
  const expense = stats.expense;
  const netWorth = stats.netWorth;
  const savingsRate = stats.savingsRate;
  
  const incomeTrend = prevStats.income > 0 ? ((income - prevStats.income) / prevStats.income) * 100 : 0;
  const expenseTrend = prevStats.expense > 0 ? ((expense - prevStats.expense) / prevStats.expense) * 100 : 0;
  const netWorthTrend = prevStats.netWorth > 0 ? ((netWorth - prevStats.netWorth) / prevStats.netWorth) * 100 : 0;

  const engineOutput = VylosEngine.run(state);
  const healthMetrics = {
    score: engineOutput.healthScore,
    label: engineOutput.healthCategory,
    breakdown: {
      spending: Math.round(VylosEngine.computeHealthScore(state).components.C * 25),
      savings: Math.round(VylosEngine.computeHealthScore(state).components.Q * 25),
      budget: Math.round(VylosEngine.computeHealthScore(state).components.D * 25),
      goals: Math.round(VylosEngine.computeHealthScore(state).components.G * 25),
    },
    stats: {
      runwayMonths: engineOutput.burnRateMonths,
      budgetUtilization: stats.budgetUtilization,
      savingsRate: savingsRate
    },
    explanation: VylosEngine.explainHealthScoreChange(engineOutput.healthScore, engineOutput.healthScore, { Q: 0, D: 0, C: 0, G: 0 })
  };
  const [filterCat, setFilterCat] = useState("All");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {role:"assistant",content:"👋 Hi! I've analyzed your financial situation. Ask me anything — budget tips, savings advice, or what your numbers mean."}
  ]);
  const [aiInput, setAiInput] = useState("");
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart | null>(null);
  const donutInst = useRef<Chart | null>(null);

  async function handleOnboardingComplete(answers: any) {
    try {
      if (!sessionUser) return;

      const updates = {
        userType: answers.userType,
        reason_for_using_vylos: answers.reason_for_using_vylos,
        moneyConfidence: answers.moneyConfidence,
        first_tracking_focus: answers.first_tracking_focus,
        currentTrackingMethod: answers.currentTrackingMethod,
        biggest_money_challenge: answers.biggest_money_challenge,
        monthly_income_range: answers.monthly_income_range,
        main_money_goal: answers.main_money_goal,
        review_frequency: answers.review_frequency,
        communication_preference: answers.communication_preference,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString()
      };

      await updateProfile(updates);
      
      const { XP_CONFIG } = await import("@/lib/services/XPService");
      await awardXP("ONBOARDING_COMPLETE", XP_CONFIG.ONBOARDING_COMPLETE.xp, "Completed Onboarding Questionnaire");
      
      showToast(`Welcome to Vylos! +${XP_CONFIG.ONBOARDING_COMPLETE.xp} XP earned for personalizing your profile.`, "success");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  }


  const totalSaved = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);

  // Calculate dynamic dashboard stats
  const monthlySpendMap: Record<string, number> = {};
  state.transactions.filter(t => t.amount < 0).forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlySpendMap[key] = (monthlySpendMap[key] || 0) + Math.abs(t.amount);
  });
  const spendValues = Object.values(monthlySpendMap);
  const avgMonthlySpend = spendValues.length > 0 ? spendValues.reduce((a, b) => a + b, 0) / spendValues.length : 0;
  const lowestMonthSpend = spendValues.length > 0 ? Math.min(...spendValues) : 0;
  const highestMonthSpend = spendValues.length > 0 ? Math.max(...spendValues) : 0;

  const isPro = Permissions.isInternalUser(state.userProfile) || state.userProfile.subscription_tier !== 'free';

  // Handle Charts
  useEffect(()=>{
    const drawCharts = () => {
      const [refYear, refMonth] = selectedMonth.split('-').map(Number);
      const budgetSummary = BudgetService.calculateBudgetSummary(state, currentMonthStr);
      const monthlySpend = new Array(6).fill(0);
      const labels = new Array(6).fill("");
      const now = new Date();
      const monthlyHealth: number[] = new Array(6).fill(0);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(refYear, refMonth - 1 - i, 1);
        labels[5 - i] = d.toLocaleString('default', { month: 'short' });
        
        // Compute health for this specific month
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
        const monthTxs = state.transactions.filter(t => {
            const dateKey = getTransactionDateKey(t);
            return dateKey.startsWith(d.toISOString().slice(0, 7));
        });

        // Create a mock state for this month
        const monthState = {
            ...state,
            transactions: monthTxs,
            // Re-calculate spent for budgets based on these txs
            budgets: Object.fromEntries(Object.entries(state.budgets).map(([k, b]: [string, any]) => {
                const catSpend = monthTxs.filter(t => t.category === k && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
                return [k, { ...b, spent: catSpend }];
            }))
        };
        monthlyHealth[5 - i] = VylosEngine.computeHealthScore(monthState).score;
      }

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
  }, [page, dark, state.transactions, currentMonthStr]);

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
      icon: "🎯",
      color: ACCENT
    });
    const { XP_CONFIG } = await import("@/lib/services/XPService");
    const earned = await awardXP("CREATE_GOAL", XP_CONFIG.CREATE_GOAL.xp, `Created goal: ${goalForm.name}`);
    await updateDailyConsistency("BUDGET_UPDATE");
    
    showToast(`Goal created! +${earned} XP earned.`, "success");
  }

  async function sendAI() {
    if(!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev=>[...prev,{role:"user",content:userMsg}]);
    setAiInput("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...aiMessages, {role: "user", content: userMsg}] })
      });
      const data = await res.json();
      setAiMessages(prev=>[...prev,{role:"assistant",content:data.reply}]);
    } catch(e) {
      setAiMessages(prev=>[...prev,{role:"assistant",content:"Connection issue. Please try again."}]);
    }
    setAiLoading(false);
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

  if (!isAuthLoaded) return (
    <div className="vylos-bg-premium h-screen w-full flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center animate-pulse shadow-2xl">
          <img src="/vylos-logo-final.png" alt="Vylos" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
        </div>
        <div className="absolute -inset-4 bg-blue-400/20 rounded-[40px] blur-2xl animate-pulse -z-10" />
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="text-white font-black text-xl tracking-tighter animate-pulse">Vylos</span>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );

  if (!sessionUser) return <LandingPage />;

  if (!state.userProfile.termsAccepted) {
    return (
      <TermsAcceptanceView 
        onAccept={async () => {
          await updateProfile({ 
            termsAccepted: true, 
            termsAcceptedAt: new Date().toISOString(),
            termsVersion: "v1.0",
            termsLastUpdated: "2024-05-08"
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

  const filteredTransactions = state.transactions
    .filter(t => {
      const dateKey = getTransactionDateKey(t);
      return dateKey.startsWith(currentMonthStr.slice(0, 7));
    })
    .sort((a, b) => getTransactionDateKey(b).localeCompare(getTransactionDateKey(a)));

  const firstName = state.userProfile.name?.split(" ")[0] || "User";

  return (
    <div className="vylos-bg-premium min-h-screen w-full flex flex-col pt-2 pb-8 px-4 md:pt-4 md:px-6 lg:pt-4 lg:px-8 font-inter overflow-x-hidden relative">
      
      {/* ─── Global App Header ─── */}
      <V2Header 
        firstName={firstName} 
        avatarUrl={state.userProfile?.avatarUrl} 
        onPageChange={setPage} 
      />

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col gap-2 md:gap-4 pb-32 relative z-10">
        {page === "dashboard" && (
          <DashboardV3
            income={income}
            expense={expense}
            netWorth={netWorth}
            savingsRate={savingsRate}
            transactions={filteredTransactions}
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
          />
        )}

        {page === "transactions" && (
          <TransactionsView 
            transactions={filteredTransactions} filterCat={filterCat} setFilterCat={setFilterCat} 
            setShowAddTx={setShowAddTx} deleteTx={handleDeleteTx} setPage={setPage}
            trends={{ incomeTrend, expenseTrend, netWorthTrend }}
          />
        )}
        {page === "calendar" && (
          <CalendarView />
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
            handleCSV={()=>{}} 
            handleImportResults={handleImportResults} 
            showToast={showToast} 
            importPreview={importPreview} 
            setImportPreview={setImportPreview} 
            confirmImport={confirmImport} 
            processFile={async (file) => {
              try {
                const results = await ImportService.processFile(file, state.transactions);
                if (results.length === 0) {
                  showToast("No valid transactions found in file.", "info");
                } else {
                  setImportPreview(results);
                  const summary = ImportService.getSummary(results);
                  showToast(`Found ${summary.total} transactions (${summary.categorized} auto-categorized).`, "success");
                }
              } catch (err) {
                showToast("Error parsing file. Ensure it's a valid CSV or Excel document.", "error");
              }
            }}
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
          />
        )}
        {page === "privacy" && <LegalView type="privacy" onBack={() => setPage("dashboard")} />}
        {page === "terms" && <LegalView type="terms" onBack={() => setPage("dashboard")} />}
      </main>

      {/* ─── Global Floating Navigation Dock ─── */}
      <V2ShortcutDock onPageChange={setPage} currentPage={page} userProfile={state.userProfile} />

      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

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
        showToast={showToast}
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
