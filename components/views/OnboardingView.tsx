"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, ArrowRight, ArrowLeft, ShieldCheck, 
  Target, Home, ChevronRight, Plus, Trash2, 
  TrendingUp, BarChart3, Wallet, Smartphone, Shield,
  CreditCard, Zap, User, Lock, Heart, HelpCircle
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { VylosLogo } from "../ui/VylosLogo";
import { VylosLoadingScreen } from "../ui/VylosLoadingScreen";

interface OnboardingViewProps {
  userName: string;
  onComplete: (data: any) => void;
}

// Pre-defined suggestions
const COMMON_HOBBIES = [
  "Gym", "Gaming", "Sports", "Eating out", "Fashion", "Travel", "Content creation", "Car hobby", "Entertainment"
];

const SUGGESTED_GOALS = [
  "Emergency fund", "Car", "House deposit", "Holiday/travel", "Education", "Business/startup", "Investment", "Debt payoff", "Wedding/event"
];

const DEBT_CATEGORIES = [
  "Credit card", "Personal loan", "Student loan", "Car finance", "Store account", "Family/friend loan", "Other"
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ userName, onComplete }) => {
  const { state } = useAppStore();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Determine if we need Step 0 (Quick Profile Setup) for Google OAuth users
  const needsPreStep = useMemo(() => {
    return !state.userProfile.userType || !state.userProfile.onboardingAnswers?.hasBudget;
  }, [state.userProfile.userType, state.userProfile.onboardingAnswers]);

  // Steps array: [0, 1, 2, 3, 4] or [1, 2, 3, 4]
  const steps = useMemo(() => {
    const list = [];
    if (needsPreStep) {
      list.push(0);
    }
    list.push(1, 2, 3, 4);
    return list;
  }, [needsPreStep]);

  const [currentStep, setCurrentStep] = useState(() => steps[0]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);

  const loadingMessages = [
    "Building your financial blueprint...",
    "Setting up your custom Vylos dashboard...",
    "Creating starter budget allocations...",
    "Scheduling your recurring reminders...",
    "Vylos is ready to go!"
  ];

  // Wizard state values
  const [answers, setAnswers] = useState({
    userType: state.userProfile.userType || "",
    hasBudget: state.userProfile.onboardingAnswers?.hasBudget || "",
    hobbies: [] as Array<{ name: string; amount: string }>,
    missions: [] as string[],
    goalsDetails: [] as any[],
    infrastructure: {
      rentBond: "",
      householdContribution: "",
      ratesLevies: "",
      fuel: "",
      publicTransport: "",
      carRepayment: "",
      carInsurance: "",
      carMaintenance: ""
    },
    groceries: "",
    utilities: "",
    data: "",
    toiletries: "",
    householdItems: "",
    otherEssentials: "",
    hasDebt: "",
    debts: [] as Array<{ id: string; name: string; category: string; repayment: string; balance: string }>,
    takeHomePay: "",
    age: state.userProfile.age || "25",
    budgetTarget: "individual"
  });

  const [hobbyInput, setHobbyInput] = useState("");
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Temporary debt state
  const [tempDebt, setTempDebt] = useState({
    name: "",
    category: "Credit card",
    repayment: "",
    balance: ""
  });

  // Cycle loading messages when finalizing
  useEffect(() => {
    if (!isFinalizing) return;
    const msgInterval = setInterval(() => {
      setLoadingMessageIdx(prev => (prev + 1) % loadingMessages.length);
    }, 1200);

    const doneTimeout = setTimeout(() => {
      clearInterval(msgInterval);
      onComplete(answers);
    }, 5500);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(doneTimeout);
    };
  }, [isFinalizing, answers, onComplete]);

  // Helper selectors
  const activeStepIndex = steps.indexOf(currentStep);
  const totalStepsCount = steps.length;

  const updateAnswer = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const updateInfrastructure = (field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      infrastructure: {
        ...prev.infrastructure,
        [field]: value
      }
    }));
    setError(null);
  };

  // Add hobby handler
  const handleAddHobby = (hobbyName: string) => {
    if (!hobbyName.trim()) return;
    const exists = answers.hobbies.some(h => h.name.toLowerCase() === hobbyName.toLowerCase().trim());
    if (exists) {
      setError("Hobby already added.");
      return;
    }
    updateAnswer("hobbies", [...answers.hobbies, { name: hobbyName.trim(), amount: "" }]);
    setHobbyInput("");
  };

  const handleRemoveHobby = (index: number) => {
    updateAnswer("hobbies", answers.hobbies.filter((_, i) => i !== index));
  };

  const handleHobbyAmountChange = (index: number, val: string) => {
    const updated = [...answers.hobbies];
    updated[index].amount = val;
    updateAnswer("hobbies", updated);
  };

  // Add goal handler
  const handleToggleGoal = (goalName: string) => {
    const isSelected = answers.missions.includes(goalName);
    if (isSelected) {
      updateAnswer("missions", answers.missions.filter(g => g !== goalName));
      updateAnswer("goalsDetails", answers.goalsDetails.filter(g => g.mission !== goalName));
    } else {
      updateAnswer("missions", [...answers.missions, goalName]);
      
      // Determine default icon / category based on name
      let category = "Savings";
      let icon = "🎯";
      let color = "#00D8A5";
      
      const lowerGoal = goalName.toLowerCase();
      if (lowerGoal.includes("car")) { icon = "🚗"; color = "#7C4DFF"; }
      else if (lowerGoal.includes("house") || lowerGoal.includes("deposit")) { icon = "🏠"; color = "#795548"; }
      else if (lowerGoal.includes("holiday") || lowerGoal.includes("travel")) { icon = "✈️"; color = "#00BCD4"; }
      else if (lowerGoal.includes("edu") || lowerGoal.includes("study")) { icon = "🎓"; color = "#3F51B5"; }
      else if (lowerGoal.includes("debt")) { icon = "💳"; color = "#FF1744"; category = "Debt Payments"; }
      else if (lowerGoal.includes("emergency")) { icon = "🛡️"; color = "#00C853"; }
      else if (lowerGoal.includes("invest")) { icon = "📈"; color = "#00BFA5"; }
      else if (lowerGoal.includes("business") || lowerGoal.includes("startup")) { icon = "🚀"; color = "#FFA000"; }
      else if (lowerGoal.includes("wedding") || lowerGoal.includes("event")) { icon = "💝"; color = "#EC407A"; }

      const defaultGoalDetail = {
        mission: goalName,
        title: goalName,
        target_amount: "",
        current_amount: "0",
        deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        category,
        icon,
        color
      };
      updateAnswer("goalsDetails", [...answers.goalsDetails, defaultGoalDetail]);
    }
  };

  const handleCustomGoalAdd = () => {
    if (!customGoalInput.trim()) return;
    const goalName = customGoalInput.trim();
    if (answers.missions.includes(goalName)) {
      setError("Goal already selected.");
      return;
    }
    handleToggleGoal(goalName);
    setCustomGoalInput("");
  };

  const handleGoalDetailChange = (index: number, field: string, val: any) => {
    const updated = [...answers.goalsDetails];
    updated[index] = { ...updated[index], [field]: val };
    updateAnswer("goalsDetails", updated);
  };

  // Add debt handler
  const handleAddDebt = () => {
    if (!tempDebt.name.trim()) {
      setError("Please enter a debt name/provider.");
      return;
    }
    const repayment = parseFloat(tempDebt.repayment);
    if (isNaN(repayment) || repayment <= 0) {
      setError("Please enter a valid monthly repayment amount.");
      return;
    }
    const balance = parseFloat(tempDebt.balance || "0");
    if (isNaN(balance) || balance < 0) {
      setError("Outstanding balance cannot be negative.");
      return;
    }

    const newDebt = {
      id: Math.random().toString(36).substring(2, 9),
      name: tempDebt.name.trim(),
      category: tempDebt.category,
      repayment: tempDebt.repayment,
      balance: tempDebt.balance || "0"
    };

    updateAnswer("debts", [...answers.debts, newDebt]);
    setTempDebt({ name: "", category: "Credit card", repayment: "", balance: "" });
  };

  const handleRemoveDebt = (id: string) => {
    updateAnswer("debts", answers.debts.filter(d => d.id !== id));
  };

  // Validations per step
  const validateStep = (): boolean => {
    setError(null);

    // Step 0: Profile Baseline
    if (currentStep === 0) {
      if (!answers.userType) {
        setError("Please choose what best describes you.");
        return false;
      }
      if (!answers.hasBudget) {
        setError("Please select whether you currently have a budget.");
        return false;
      }
    }

    // Step 1: Passions & Milestones
    if (currentStep === 1) {
      if (answers.hobbies.length === 0) {
        setError("Please select or add at least one hobby/lifestyle spend category.");
        return false;
      }
      // Check hobby amounts
      for (const h of answers.hobbies) {
        const amt = parseFloat(h.amount);
        if (isNaN(amt) || amt < 0) {
          setError(`Please specify a valid monthly amount for "${h.name}" (can be 0 if not spending right now).`);
          return false;
        }
      }
      // Check goals
      if (answers.goalsDetails.length === 0) {
        setError("Please select or add at least one goal.");
        return false;
      }
      // Validate Goal details
      for (const g of answers.goalsDetails) {
        const target = parseFloat(g.target_amount);
        if (isNaN(target) || target <= 0) {
          setError(`Please specify a valid target amount greater than R0 for "${g.title}".`);
          return false;
        }
        const current = parseFloat(g.current_amount || "0");
        if (isNaN(current) || current < 0) {
          setError(`Current saved amount cannot be negative for "${g.title}".`);
          return false;
        }
        if (current > target) {
          setError(`Current saved amount (R${current}) cannot be greater than the target amount (R${target}) for "${g.title}".`);
          return false;
        }
      }
    }

    // Step 2: Life Infrastructure
    if (currentStep === 2) {
      const infraFields = Object.keys(answers.infrastructure);
      for (const key of infraFields) {
        const val = answers.infrastructure[key as keyof typeof answers.infrastructure];
        if (val !== "") {
          const num = parseFloat(val);
          if (isNaN(num) || num < 0) {
            setError("Monthly infrastructure amounts cannot be negative.");
            return false;
          }
        }
      }
    }

    // Step 3: Survival Essentials & Debt
    if (currentStep === 3) {
      const essentialFields = ["groceries", "utilities", "data", "toiletries", "householdItems", "otherEssentials"];
      for (const key of essentialFields) {
        const val = answers[key as keyof typeof answers];
        if (val !== "" && typeof val === "string") {
          const num = parseFloat(val);
          if (isNaN(num) || num < 0) {
            setError("Essential monthly baseline amounts cannot be negative.");
            return false;
          }
        }
      }

      if (!answers.hasDebt) {
        setError("Please select if you currently have outstanding debt commitments.");
        return false;
      }
      if (answers.hasDebt === "Yes" && answers.debts.length === 0) {
        setError("Please add at least one debt details card, or select No.");
        return false;
      }
    }

    // Step 4: Economic Engine
    if (currentStep === 4) {
      const income = parseFloat(answers.takeHomePay);
      if (isNaN(income) || income <= 0) {
        setError("Please specify a valid monthly take-home pay amount greater than R0.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep === 4) {
      setIsFinalizing(true);
    } else {
      const nextIdx = activeStepIndex + 1;
      if (nextIdx < totalStepsCount) {
        setCurrentStep(steps[nextIdx]);
        containerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    }
  };

  const handleBack = () => {
    const prevIdx = activeStepIndex - 1;
    if (prevIdx >= 0) {
      setCurrentStep(steps[prevIdx]);
      containerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setError(null);
    }
  };

  if (isFinalizing) {
    return (
      <VylosLoadingScreen variant="fullscreen" text={loadingMessages[loadingMessageIdx]} />
    );
  }

  return (
    <div ref={containerRef} className="vylos-bg-premium fixed inset-0 z-[100] flex flex-col overflow-y-auto font-inter">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="flex-1 flex flex-col relative z-10 px-4 py-8 md:py-16">
        <div className="w-full max-w-[720px] mx-auto">
          
          <div className="vylos-glass rounded-[40px] p-6 md:p-12 shadow-2xl relative border border-white/20">
            
            {/* Step Counter */}
            <div className="absolute top-8 right-8 text-[11px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.25em]">
              Step {activeStepIndex + 1} of {totalStepsCount}
            </div>

            <div className="mb-8">
              {/* Vylos mini logo */}
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/10 flex items-center justify-center text-blue-600 font-black mb-6">
                {currentStep === 0 ? "★" : currentStep}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 0: Google Auth Signup Pre-Step (Profile & Budget baseline)
                  ───────────────────────────────────────────────────────────── */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Let's set up your profile</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Since you joined via Google, let's complete these two quick profile configurations.</p>
                  
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">What best describes you?</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: "student", label: "🎓 Student" },
                        { id: "employee", label: "💼 Employee (Salary/Wages)" },
                        { id: "freelancer", label: "💻 Freelancer / Contractor" },
                        { id: "business_owner", label: "🚀 Business Owner" },
                        { id: "other", label: "❓ Other" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateAnswer("userType", opt.id)}
                          className={`p-4 rounded-2xl border text-left font-black text-sm transition-all duration-200
                            ${answers.userType === opt.id 
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/20"
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">Do you already have a budget?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "Yes", label: "Yes 📊" },
                        { id: "No", label: "No ❌" },
                        { id: "somewhat", label: "Somewhat 🤔" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateAnswer("hasBudget", opt.id)}
                          className={`p-4 rounded-2xl border text-center font-black text-xs transition-all duration-200
                            ${answers.hasBudget === opt.id 
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/20"
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 1: Passions & Milestones
                  ───────────────────────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Passions & Milestones</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Let's map out your lifestyle passions and future target milestones first.</p>
                  
                  {/* HOBBIES SECTION */}
                  <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2"><Sparkles className="text-blue-500" size={18} /> Hobbies & Outings</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">What activities do you spend money on monthly? Add custom items below.</p>
                    
                    {/* Suggested list */}
                    <div className="flex flex-wrap gap-2 py-2">
                      {COMMON_HOBBIES.map(hobby => {
                        const isSelected = answers.hobbies.some(h => h.name.toLowerCase() === hobby.toLowerCase());
                        return (
                          <button
                            key={hobby}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                updateAnswer("hobbies", answers.hobbies.filter(h => h.name.toLowerCase() !== hobby.toLowerCase()));
                              } else {
                                handleAddHobby(hobby);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all
                              ${isSelected 
                                ? "bg-blue-600 border-blue-600 text-white" 
                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-blue-600/30"
                              }
                            `}
                          >
                            {hobby}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom hobby entry */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="e.g. Photography, Tennis..."
                        value={hobbyInput}
                        onChange={e => setHobbyInput(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddHobby(hobbyInput)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider"
                      >
                        Add Custom
                      </button>
                    </div>

                    {/* Active Hobbies Amounts Input */}
                    {answers.hobbies.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Monthly Estimates (R)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                          {answers.hobbies.map((h, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                              <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[150px]">{h.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="relative w-24">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={h.amount}
                                    onChange={e => handleHobbyAmountChange(idx, e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHobby(idx)}
                                  className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GOALS SECTION */}
                  <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2"><Target className="text-emerald-500" size={18} /> Financial Milestones</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">What targets are you working toward? Add custom targets below.</p>
                    
                    {/* Goal suggestions */}
                    <div className="flex flex-wrap gap-2 py-2">
                      {SUGGESTED_GOALS.map(goal => {
                        const isSelected = answers.missions.includes(goal);
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => handleToggleGoal(goal)}
                            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all
                              ${isSelected 
                                ? "bg-blue-600 border-blue-600 text-white" 
                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-blue-600/30"
                              }
                            `}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom goal entry */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="e.g. Save for MacBook, Wedding..."
                        value={customGoalInput}
                        onChange={e => setCustomGoalInput(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCustomGoalAdd}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider"
                      >
                        Add Custom
                      </button>
                    </div>

                    {/* Active Goals Tuning */}
                    {answers.goalsDetails.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Configure Target Details</label>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                          {answers.goalsDetails.map((g, idx) => (
                            <div key={idx} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                  <span className="text-lg">{g.icon}</span> {g.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleGoal(g.mission)}
                                  className="text-red-500 text-xs font-bold hover:underline"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {/* Target */}
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target amount (R)</label>
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                                    <input
                                      type="number"
                                      required
                                      placeholder="e.g. 50000"
                                      value={g.target_amount}
                                      onChange={e => handleGoalDetailChange(idx, "target_amount", e.target.value)}
                                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Current */}
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current saved (R)</label>
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      value={g.current_amount}
                                      onChange={e => handleGoalDetailChange(idx, "current_amount", e.target.value)}
                                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Date (Optional)</label>
                                  <input
                                    type="date"
                                    value={g.deadline}
                                    onChange={e => handleGoalDetailChange(idx, "deadline", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                                  />
                                </div>

                                {/* Category */}
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
                                  <select
                                    value={g.category}
                                    onChange={e => handleGoalDetailChange(idx, "category", e.target.value)}
                                    className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                                  >
                                    <option value="Savings">Savings</option>
                                    <option value="Debt Payments">Debt Payments</option>
                                    <option value="Bills">Bills</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 2: Life Infrastructure Costs
                  ───────────────────────────────────────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Life Infrastructure Costs</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enter monthly amounts for your fixed living assets. Leave blank if not applicable.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* HOUSING COLUMN */}
                    <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                      <h4 className="text-xs font-black text-blue-500 uppercase tracking-wider flex items-center gap-2"><Home size={15} /> Housing Expenses</h4>
                      
                      {[
                        { k: "rentBond", label: "Rent / Bond Repayment" },
                        { k: "householdContribution", label: "Household Contribution" },
                        { k: "ratesLevies", label: "Rates, Water & Levies" }
                      ].map(f => (
                        <div key={f.k} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={answers.infrastructure[f.k as keyof typeof answers.infrastructure]}
                              onChange={e => updateInfrastructure(f.k, e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* TRANSPORT COLUMN */}
                    <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                      <h4 className="text-xs font-black text-blue-500 uppercase tracking-wider flex items-center gap-2"><Wallet size={15} /> Transport & Mobility</h4>
                      
                      {[
                        { k: "fuel", label: "Fuel" },
                        { k: "publicTransport", label: "Public Transport / Taxi" },
                        { k: "carRepayment", label: "Vehicle Finance Repayment" },
                        { k: "carInsurance", label: "Car Insurance" },
                        { k: "carMaintenance", label: "Maintenance & Levies" }
                      ].map(f => (
                        <div key={f.k} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={answers.infrastructure[f.k as keyof typeof answers.infrastructure]}
                              onChange={e => updateInfrastructure(f.k, e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 3: Survival Baseline & Debt Liabilities
                  ───────────────────────────────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Survival Baseline & Debt Liabilities</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Specify your monthly survival essentials and active debt obligations.</p>
                  
                  {/* ESSENTIALS BLOCK */}
                  <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-wider flex items-center gap-2"><Smartphone size={15} /> Monthly Essentials Baseline</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { k: "groceries", label: "🛒 Groceries" },
                        { k: "utilities", label: "⚡ Electricity/Water" },
                        { k: "data", label: "📱 Airtime & Data" },
                        { k: "toiletries", label: "🧴 Toiletries" },
                        { k: "householdItems", label: "🧺 Household Cleaners" },
                        { k: "otherEssentials", label: "📦 Other essentials" }
                      ].map(f => (
                        <div key={f.k} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={answers[f.k as keyof typeof answers] as string}
                              onChange={e => updateAnswer(f.k, e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DEBTS BLOCK */}
                  <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-wider flex items-center gap-2"><CreditCard size={15} /> Debt Obligations</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Do you currently have credit cards, retail store accounts, or personal loans?</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {["Yes", "No"].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            updateAnswer("hasDebt", val);
                            if (val === "No") updateAnswer("debts", []);
                          }}
                          className={`p-4 rounded-2xl border font-black text-sm transition-all duration-200
                            ${answers.hasDebt === val 
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/20"
                            }
                          `}
                        >
                          {val}
                        </button>
                      ))}
                    </div>

                    {answers.hasDebt === "Yes" && (
                      <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-300">
                        {/* Add Debt Mini Card */}
                        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Debt Name / Provider</label>
                              <input
                                type="text"
                                placeholder="e.g. FNB CC, Store Card"
                                value={tempDebt.name}
                                onChange={e => setTempDebt({ ...tempDebt, name: e.target.value })}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                              <select
                                value={tempDebt.category}
                                onChange={e => setTempDebt({ ...tempDebt, category: e.target.value })}
                                className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                              >
                                {DEBT_CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Monthly Repayment (R)</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={tempDebt.repayment}
                                  onChange={e => setTempDebt({ ...tempDebt, repayment: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance (R)</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={tempDebt.balance}
                                  onChange={e => setTempDebt({ ...tempDebt, balance: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddDebt}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                          >
                            <Plus size={14} /> Add Debt Commitment
                          </button>
                        </div>

                        {/* List of active debts */}
                        {answers.debts.length > 0 && (
                          <div className="space-y-2">
                            {answers.debts.map((d, index) => (
                              <div key={d.id} className="flex justify-between items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3.5 rounded-xl">
                                <div>
                                  <div className="text-xs font-black text-slate-900 dark:text-white">{d.name} <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full ml-1.5">{d.category}</span></div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">Repayment: R{parseFloat(d.repayment).toLocaleString()} | Balance: R{parseFloat(d.balance).toLocaleString()}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDebt(d.id)}
                                  className="text-red-500 hover:bg-red-500/15 p-2 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 4: Economic Engine & Wrap-Up
                  ───────────────────────────────────────────────────────────── */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Economic Engine Baseline</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">What is your total monthly take-home pay? This determines your spending threshold allocation.</p>
                    
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-400">R</span>
                      <input
                        type="number"
                        placeholder="e.g. 25000"
                        value={answers.takeHomePay}
                        onChange={e => updateAnswer("takeHomePay", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 py-5 text-slate-900 dark:text-white font-bold tracking-tight text-2xl focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-blue-600/5 border border-blue-600/10 rounded-3xl space-y-3">
                    <div className="text-sm font-black text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <Sparkles size={16} /> Ready to compile!
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      Your Vylos financial blueprint will generate starter budgets, set up emergency fund targets, schedule billing reminders, and calculate your real-time health metrics immediately.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="mb-6 text-red-500 font-bold text-sm animate-bounce">
                ⚠️ {error}
              </p>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/5 mt-8">
              <button 
                onClick={handleBack}
                disabled={activeStepIndex === 0}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft size={16} strokeWidth={3} /> Back
              </button>

              <button 
                onClick={handleNext}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-[0.2em] text-xs"
              >
                {currentStep === 4 ? "Complete Blueprint" : "Next Step"}
                <ArrowRight size={18} strokeWidth={3} />
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-white/20 leading-relaxed max-w-lg mx-auto">
                By completing this blueprint config, Vylos establishes starter structures which you can adjust in the settings/goals tabs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
