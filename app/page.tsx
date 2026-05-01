"use client";

import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from 'chart.js';
import { useAppStore } from "@/lib/AppContext";
import { TransactionCategory } from "@/lib/store";
import { sanitizeString } from "@/lib/utils";
import { ParserService, ExtractedTransaction } from "@/lib/services/import/ParserService";

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
import { OnboardingView } from "@/components/views/OnboardingView";
import { LandingPage } from "@/components/ui/LandingPage";
import { TransactionModal, GoalModal } from "@/components/ui/Modals";
import { useToast } from "@/components/Toast";

// Register Chart.js
Chart.register(...registerables);

const ACCENT = "#00D8A5";

const KEYWORD_MAP = [
  {kw:["uber","bolt","taxi","lyft","petrol","fuel","garage"],cat:"Transport"},
  {kw:["checkers","pick n pay","woolworths","spar","shoprite","grocery","food","restaurant","mcdonald","kfc","steers","nando"],cat:"Food & Dining"},
  {kw:["salary","income","payment received","deposit","payroll"],cat:"Income"},
  {kw:["netflix","showmax","spotify","dstv","youtube","apple","hbo","disney"],cat:"Entertainment"},
  {kw:["electricity","water","rates","insurance","internet","vodacom","mtn","telkom","wifi","medical aid"],cat:"Bills"},
  {kw:["clicks","dischem","pharmacy","doctor","hospital","dentist"],cat:"Health"},
  {kw:["mall","clothing","takealot","amazon","zara","h&m","mr price","fashion"],cat:"Shopping"},
];

function autocat(desc: string): TransactionCategory {
  const d = desc.toLowerCase();
  for (const {kw,cat} of KEYWORD_MAP) if (kw.some(k=>d.includes(k))) return cat as TransactionCategory;
  return "Other";
}

export default function App() {
  const { state, addTransaction, deleteTransaction, addGoal, deleteGoal, updateBudgetLimit, updateProfile, sessionUser, isAuthLoaded } = useAppStore();
  const { toast: showToast } = useToast();
  
  const [dark, setDark] = useState(true);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Sync theme to document element
  useEffect(() => {
    const savedTheme = localStorage.getItem('vylos-theme');
    if (savedTheme === 'light') {
      setDark(false);
    } else if (savedTheme === 'dark') {
      setDark(true);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDark(true);
    }
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!isThemeLoaded) return;
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vylos-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vylos-theme', 'light');
    }
  }, [dark, isThemeLoaded]);
  const [page, setPage] = useState<string>("dashboard");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Sync page from localStorage
  useEffect(() => {
    const savedPage = localStorage.getItem('vylos-last-page');
    if (savedPage) {
      setPage(savedPage);
    }
    setIsPageLoaded(true);
  }, []);

  // Persist page to localStorage
  useEffect(() => {
    if (isPageLoaded) {
      localStorage.setItem('vylos-last-page', page);
    }
  }, [page, isPageLoaded]);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [txForm, setTxForm] = useState({desc:"",amount:"",cat: "Food & Dining" as TransactionCategory,date:new Date().toISOString().slice(0,10),type:"expense"});
  const [goalForm, setGoalForm] = useState({name:"",target:"",saved:"",icon:"🎯",color:"#00D8A5"});
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
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

  // Compute stats
  const income = state.transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const expense = Math.abs(state.transactions.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0));
  const netWorth = income - expense;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const totalSaved = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);

  const spendByCat: Record<string, number> = {};
  state.transactions.filter(t=>t.amount<0).forEach(t=>{ 
    spendByCat[t.category]=(spendByCat[t.category]||0)+Math.abs(t.amount); 
  });

  // Handle Charts
  useEffect(()=>{
    const drawCharts = () => {
      const monthlySpend = new Array(6).fill(0);
      const labels = new Array(6).fill("");
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels[5 - i] = d.toLocaleString('default', { month: 'short' });
      }

      state.transactions.filter(t => t.amount < 0).forEach(t => {
        const d = new Date(t.date);
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        if (diffMonths >= 0 && diffMonths <= 5) {
          monthlySpend[5 - diffMonths] += Math.abs(t.amount);
        }
      });

      if(chartRef.current) {
        if(chartInst.current) chartInst.current.destroy();
        chartInst.current = new Chart(chartRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [{ 
              label: "Spending",
              data: monthlySpend,
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
              fill:true, tension:0.4, borderWidth:3, pointRadius:0, pointHoverRadius: 6, pointHoverBackgroundColor: "#10B981", pointHoverBorderColor: "#fff", pointHoverBorderWidth: 2
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
                  label: (context: any) => ` $${context.parsed.y.toLocaleString()}`
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
        const catData = Object.entries(spendByCat).filter(([,v])=>v>0);
        donutInst.current = new Chart(donutRef.current, {
          type: 'doughnut',
          data: {
            labels: catData.map(([k])=>k),
            datasets: [{
              data: catData.map(([,v])=>v),
              backgroundColor: ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280"],
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

    const timer = setTimeout(drawCharts, 500);
    return () => { 
      clearTimeout(timer);
      chartInst.current?.destroy(); 
      donutInst.current?.destroy(); 
    };
  }, [page, dark, expense]);

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
    setTxForm({desc:"",amount:"",cat:"Food & Dining",date:new Date().toISOString().slice(0,10),type:"expense"});
    showToast("Transaction added!");
  }

  async function handleDeleteTx(id: string) {
    await deleteTransaction(id);
    showToast("Transaction deleted","info");
  }

  async function handleAddGoal() {
    if(!goalForm.name||!goalForm.target) return;
    await addGoal({
      title: goalForm.name,
      targetAmount: parseFloat(goalForm.target),
      currentAmount: parseFloat(goalForm.saved||"0"),
    });
    setShowAddGoal(false);
    setGoalForm({name:"",target:"",saved:"",icon:"🎯",color:ACCENT});
    showToast("Goal created!");
  }

  async function sendAI() {
    if(!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev=>[...prev,{role:"user",content:userMsg}]);
    setAiInput("");
    setAiLoading(true);

    const context = `
      Income: R${income.toLocaleString()}
      Expenses: R${expense.toLocaleString()}
      Savings Rate: ${savingsRate}%
      Top Expenses: ${Object.entries(spendByCat).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}: R${v}`).join(", ")}
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
    const rows = txs.map(tx => ({
      id: Math.random().toString(36).substr(2, 9),
      date: tx.date || new Date().toISOString().slice(0, 10),
      desc: sanitizeString(tx.merchant || "Imported"),
      amount: tx.amount,
      cat: autocat(tx.merchant || ""),
      _preview: true
    }));
    setImportPreview(rows);
  }

  async function confirmImport() {
    if (!importPreview) return;
    const count = importPreview.length;
    for (const tx of importPreview) {
      await addTransaction({
        date: tx.date,
        merchant: tx.desc,
        category: tx.cat as TransactionCategory,
        amount: tx.amount
      });
    }
    setImportPreview(null);
    showToast(`${count} transactions imported!`);
  }

  if (!isAuthLoaded || !isPageLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-bg">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!sessionUser) return <LandingPage />;

  if (!state.userProfile.onboardingCompleted) {
    return <OnboardingView userName={state.userProfile.name} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex min-h-screen bg-bg text-text-main transition-colors duration-500 overflow-hidden">
      <Sidebar 
        currentPage={page} 
        setPage={setPage} 
        dark={dark} 
        setDark={setDark} 
        userName="Alex Morgan" 
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopHeader title={page === "analytics" ? "Progress Analysis" : page} />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {page === "dashboard" && (
            <DashboardMain 
              income={income} expense={expense} netWorth={netWorth} savingsRate={savingsRate} 
              transactions={state.transactions} goals={state.goals} chartRef={chartRef} 
              donutRef={donutRef} setPage={setPage}
            />
          )}
          {page === "transactions" && (
            <TransactionsView 
              transactions={state.transactions} filterCat={filterCat} setFilterCat={setFilterCat} 
              setShowAddTx={setShowAddTx} deleteTx={handleDeleteTx} 
            />
          )}
          {page === "budget" && (
            <BudgetView 
              budgets={state.budgets} spendByCat={spendByCat} donutRef={donutRef} 
              updateBudgetLimit={updateBudgetLimit} showToast={showToast} savingsRate={savingsRate}
            />
          )}
          {page === "goals" && (
            <GoalsView goals={state.goals} setShowAddGoal={setShowAddGoal} deleteGoal={deleteGoal} ACCENT={ACCENT} />
          )}
          {page === "ai" && (
            <AIAdvisorView 
              aiMessages={aiMessages} aiInput={aiInput} setAiInput={setAiInput} 
              sendAI={sendAI} aiLoading={aiLoading} showToast={showToast}
              healthMetrics={require("@/lib/store").computeHealthScoreMetrics(state)}
              spendByCat={spendByCat}
              totalSpend={expense}
            />
          )}
          {page === "analytics" && <AnalyticsView chartRef={chartRef} netWorth={netWorth} totalSaved={totalSaved} />}
          {page === "import" && (
            <ImportView 
              handleCSV={()=>{}} 
              handleImportResults={handleImportResults} 
              showToast={showToast} 
              importPreview={importPreview} 
              setImportPreview={setImportPreview} 
              confirmImport={confirmImport} 
              processFile={async (file) => {
                const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
                try {
                  let results: ExtractedTransaction[] = [];
                  if (isExcel) {
                    const buffer = await file.arrayBuffer();
                    results = await ParserService.parseExcel(buffer);
                  } else {
                    results = await ParserService.parseCSV(file);
                  }
                  if (results.length === 0) showToast("No transactions found.", "info");
                  else handleImportResults(results);
                } catch (err) {
                  showToast("Failed to parse file.", "error");
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
          handleAddTransaction={handleAddTransaction} autocat={autocat} 
        />
      )}
      {showAddGoal && (
        <GoalModal 
          goalForm={goalForm} setGoalForm={setGoalForm} setShowAddGoal={setShowAddGoal} 
          handleAddGoal={handleAddGoal} 
        />
      )}
    </div>
  );
}
