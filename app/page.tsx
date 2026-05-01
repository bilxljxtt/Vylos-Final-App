"use client";

import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from 'chart.js';
import { useAppStore } from "@/lib/AppContext";
import { TransactionCategory, getMonthStart } from "@/lib/store";
import { VylosEngine } from "@/lib/vylosEngine";
import { sanitizeString } from "@/lib/utils";
import { ExtractedTransaction } from "@/lib/services/import/ParserService";
import { ImportPreviewTransaction, ImportService } from "@/lib/services/import/ImportService";
import { normalizeTransactionCategory } from "@/lib/services/CategorizationEngine";
import { BudgetService, BudgetSummary } from "@/lib/services/BudgetService";

// Standardized Components
import { Sidebar } from "@/components/ui/Sidebar";
import { TopHeader } from "@/components/ui/TopHeader";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { TransactionsView } from "@/components/views/TransactionsView";
import { BudgetView } from "@/components/views/BudgetView";
import { GoalsView } from "@/components/views/GoalsView";
import { AIAdvisorView } from "@/components/views/AIAdvisorView";
import { ImportView } from "@/components/views/ImportView";
import { SettingsView } from "@/components/views/SettingsView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { CalendarView } from "@/components/views/CalendarView";
import { PricingView } from "@/components/views/PricingView";
import { OnboardingView } from "@/components/views/OnboardingView";
import { LandingPage } from "@/components/ui/LandingPage";
import { TransactionModal, GoalModal } from "@/components/ui/Modals";
import { HealthDetailModal } from "@/components/modals/HealthDetailModal";
import { AddReminderModal } from "@/components/modals/AddReminderModal";
import { EditBudgetModal } from "@/components/modals/EditBudgetModal";
import { FundCategoryModal } from "@/components/modals/FundCategoryModal";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { useToast } from "@/components/Toast";

// Register Chart.js
Chart.register(...registerables);

const ACCENT = "#00D8A5";


export default function App() {
  const { state, addTransaction, deleteTransaction, addGoal, deleteGoal, updateBudgetLimit, updateBudgets, updateProfile, sessionUser, isAuthLoaded, formatCurrency, categorizeTransaction } = useAppStore();
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

  // Persist page to localStorage
  useEffect(() => {
    localStorage.setItem('vylos-last-page', page);
  }, [page]);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [txForm, setTxForm] = useState({desc:"",amount:"",cat: "Groceries" as TransactionCategory,date:new Date().toISOString().slice(0,10),type:"expense"});
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
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [showFundCategory, setShowFundCategory] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Compute stats (Real-time Calculation Engine)
  const selectedMonth = /^\d{4}-\d{2}-\d{2}$/.test(state.selectedMonth)
    ? state.selectedMonth
    : getMonthStart();
  const [refYear, refMonth] = selectedMonth.split('-').map(Number);
  const currentMonthStart = new Date(refYear, refMonth - 1, 1).getTime();
  const currentMonthEnd = new Date(refYear, refMonth, 0, 23, 59, 59, 999).getTime();
  const prevMonthStart = new Date(refYear, refMonth - 2, 1).getTime();
  const prevMonthEnd = new Date(refYear, refMonth - 1, 0, 23, 59, 59, 999).getTime();

  const getMonthStr = (d: number) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
  };
  
  const currentMonthStr = getMonthStr(currentMonthStart);
  const previousMonthStr = getMonthStr(prevMonthStart);

  const budgetSummary = BudgetService.getBudgetSummary(state, currentMonthStr);
  const previousSummary = BudgetService.getBudgetSummary(state, previousMonthStr);

  const income = state.transactions
    .filter(t => {
      const d = new Date(t.date).getTime();
      return d >= currentMonthStart && d <= currentMonthEnd && t.amount > 0;
    })
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expense = budgetSummary.totalSpent;
  const spendByCat = Object.fromEntries(budgetSummary.categories.map(c => [c.category, c.spent]));

  const prevIncome = state.transactions
    .filter(t => {
      const d = new Date(t.date).getTime();
      return d >= prevMonthStart && d <= prevMonthEnd && t.amount > 0;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const prevExpense = previousSummary.totalSpent;

  const netWorth = state.transactions.reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : (expense === 0 ? 100 : 0);
  const prevNetWorth = netWorth - (income - expense);
  
  const incomeTrend = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
  const expenseTrend = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0;
  const netWorthTrend = prevNetWorth > 0 ? ((netWorth - prevNetWorth) / prevNetWorth) * 100 : 0;

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
      budgetUtilization: Math.round((expense / engineOutput.monthlyBudget) * 100),
      savingsRate: savingsRate
    },
    explanation: VylosEngine.explainHealthScoreChange(engineOutput.healthScore, engineOutput.healthScore, { Q: 0, D: 0, C: 0, G: 0 })
  };
  const [filterCat, setFilterCat] = useState("All");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
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

      const incomeMap: Record<string, number> = {
        "Less than $1,000": 500,
        "$1,000 – $2,500": 1750,
        "$2,500 – $5,000": 3750,
        "$5,000 – $10,000": 7500,
        "$10,000 – $20,000": 15000,
        "More than $20,000": 25000
      };

      const comfortMap: Record<string, number> = {
        "poor": 20, "low": 40, "neutral": 60, "good": 80, "high": 95
      };

      const updates = {
        monthlyIncome: incomeMap[answers.monthlyIncome] || 0,
        riskTolerance: comfortMap[answers.financialComfort] || 65,
        onboardingCompleted: true,
      };

      await updateProfile(updates);
      showToast("Welcome to Vylos! Your experience is now personalized.", "success");
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

  const isPro = state.userProfile?.subscriptionPlan === "pro" || state.userProfile?.isAdmin;

  // Handle Charts
  useEffect(()=>{
    const drawCharts = () => {
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
            const ts = new Date(t.date).getTime();
            return ts >= monthStart && ts <= monthEnd;
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
          .map(c => [c.category, c.available] as [string, number])
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
  }, [page, dark, state.transactions, spendByCat]);

  // Actions
  async function handleAddTransaction() {
    if(!txForm.desc||!txForm.amount) return;
    const amt = txForm.type==="expense" ? -Math.abs(parseFloat(txForm.amount)) : Math.abs(parseFloat(txForm.amount));
    await addTransaction({
      date: txForm.date,
      merchant: txForm.desc,
      category: txForm.cat,
      amount: amt
    });
    setShowAddTx(false);
    setTxForm({desc:"",amount:"",cat:"Groceries",date:new Date().toISOString().slice(0,10),type:"expense"});
    showToast("Transaction added!");
  }

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
    showToast("Goal created!", "success");
  }

  async function sendAI() {
    if(!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev=>[...prev,{role:"user",content:userMsg}]);
    setAiInput("");
    setAiLoading(true);

    const metrics = { score: engineOutput.healthScore, label: engineOutput.healthCategory, stats: { savingsRate: savingsRate, budgetUtilization: Math.round((expense / engineOutput.monthlyBudget) * 100), runwayMonths: engineOutput.burnRateMonths } };
    const context = `
      Income: ${formatCurrency(income)}
      Expenses: ${formatCurrency(expense)}
      Savings Rate: ${metrics.stats.savingsRate}%
      Budget Utilization: ${metrics.stats.budgetUtilization}%
      Financial Health Score: ${metrics.score}/100 (${metrics.label})
      Emergency Runway: ${metrics.stats.runwayMonths} months
      Top Expenses: ${Object.entries(spendByCat).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}: ${formatCurrency(v)}`).join(", ")}
      Active Goals: ${state.goals.map(g => `${g.title} (${Math.round((g.currentAmount/g.targetAmount)*100)}% complete)`).join(", ")}
    `;

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...aiMessages, {role: "user", content: userMsg}], context })
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
      await addTransaction({
        date: tx.date,
        merchant: tx.desc,
        category: tx.cat as TransactionCategory,
        amount: tx.amount
      });
    }
    
    setImportPreview(null);
    showToast(`Successfully imported ${count} transactions!`, "success");
  }

  if (!isAuthLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-bg">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!sessionUser) return <LandingPage />;

  if (!state.userProfile.onboardingCompleted) {
    return <OnboardingView userName={state.userProfile.name} onComplete={handleOnboardingComplete} />;
  }

  const filteredTransactions = state.transactions
    .filter(t => {
      const d = new Date(t.date || t.createdAt || new Date()).getTime();
      return d >= currentMonthStart && d <= currentMonthEnd;
    })
    .sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());

  return (
    <div className="flex min-h-screen bg-bg text-text-main transition-colors duration-500 overflow-hidden">
        <Sidebar 
          currentPage={page} 
          setPage={setPage} 
          dark={dark} 
          setDark={setDark} 
          userName={state.userProfile.name || "User"} 
          avatarUrl={state.userProfile.avatarUrl}
          isPro={isPro}
          onShowFeedback={() => setShowFeedback(true)}
        />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopHeader 
          title={
            page === "dashboard" ? "Dashboard" :
            page === "calendar" ? "Financial Calendar" :
            page === "budget" ? "Budget" :
            page === "goals" ? "Goals" :
            page === "transactions" ? "Transactions" :
            page === "ai" ? "Vylos Advisor" :
            page === "analytics" ? "Progress" :
            page === "pricing" ? "Upgrade" :
            page === "settings" ? "Settings" :
            page === "import" ? "Import" :
            page.charAt(0).toUpperCase() + page.slice(1)
          } 
          setPage={setPage} 
          userProfile={state.userProfile} 
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {page === "dashboard" && (
            <DashboardMain 
              income={income} 
              expense={expense} 
              netWorth={netWorth} 
              savingsRate={savingsRate} 
              transactions={filteredTransactions} 
              goals={state.goals}
              subscriptions={state.subscriptions}
              chartRef={chartRef} 
              donutRef={donutRef} 
              setPage={setPage} 
              trends={{ incomeTrend, expenseTrend, netWorthTrend }}
              chartStats={{ avgMonthlySpend, lowestMonthSpend, highestMonthSpend }}
              spendByCat={spendByCat}
              setShowHealthDetail={setShowHealthDetail}
              setShowAddReminder={setShowAddReminder}
              healthScore={engineOutput.healthScore}
              engineOutput={engineOutput}
              userName={state.userProfile.name}
              setShowNewBudget={setShowNewBudget}
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

          {page === "pricing" && (
            <PricingView />
          )}

          {page === "budget" && (
            <BudgetView 
              budgets={state.budgets} 
              spendByCat={spendByCat} 
              transactions={filteredTransactions}
              savingsRate={savingsRate}
              setShowNewBudget={setShowNewBudget} 
              setShowFundCategory={setShowFundCategory}
              handleDeleteCategory={handleDeleteCategory}
            />
          )}
          {page === "goals" && (
            <GoalsView goals={state.goals} setShowAddGoal={setShowAddGoal} deleteGoal={deleteGoal} showToast={showToast} />
          )}
          {page === "ai" && (
            <AIAdvisorView 
              aiMessages={aiMessages} aiInput={aiInput} setAiInput={setAiInput} 
              sendAI={sendAI} aiLoading={aiLoading} showToast={showToast}
              healthMetrics={healthMetrics}
              spendByCat={spendByCat}
              totalSpend={expense}
              goals={state.goals}
              setPage={setPage}
              setShowHealthDetail={setShowHealthDetail}
              setAiMessages={setAiMessages}
              isPro={isPro}
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
                  const results = await ImportService.processFile(file);
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
          {page === "settings" && <SettingsView state={state} updateProfile={updateProfile} showToast={showToast} dark={dark} setDark={setDark} />}
        </div>
      </main>

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
      <AddReminderModal 
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
      />
      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        showToast={showToast}
      />
    </div>
  );
}
