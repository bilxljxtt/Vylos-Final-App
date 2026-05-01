"use client";

import React, { useState } from "react";
import { Sparkles, 
  ArrowRight, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Briefcase,
  CreditCard,
  Smile,
  Meh,
  Frown,
  PartyPopper,
  Save,
  ShieldCheck,
  Layout,
  PieChart,
  Home,
  PiggyBank,
  MoreHorizontal
} from "lucide-react";
import { } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";

interface OnboardingViewProps {
  userName: string;
  onComplete: (data: any) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ userName, onComplete }) => {
  const { formatCurrency } = useAppStore();
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  
  const [answers, setAnswers] = useState({
    primaryGoal: "",
    monthlyIncome: "",
    expenseDescription: "",
    debtStatus: "",
    savingsAmount: "",
    financialComfort: "",
  });

  const updateAnswer = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(answers);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg flex overflow-hidden">
      {/* Left Panel: Branding & Welcome */}
      <div className="hidden lg:flex w-[35%] bg-sidebar border-r border-border-main flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-20">
             <div className="w-12 h-12 rounded-full border border-[#00A86B]/10 overflow-hidden flex items-center justify-center">
               <img src="/logo.png" alt="Vylos Logo" className="w-full h-full object-cover scale-[1.1]" />
             </div>
             <span className="text-3xl font-bold tracking-tight text-[#00A86B]">Vylos</span>
          </div>

          <h2 className="text-5xl font-black text-text-main tracking-tighter leading-[0.95] mb-6">
            Welcome to <br />
            <span className="text-primary">Vylos!</span> 🥳
          </h2>
          <p className="text-lg text-text-muted font-medium leading-relaxed max-w-xs">
            To personalize your experience, let's get to know your financial situation better.
          </p>
        </div>

        {/* Floating Previews */}
        <div className="relative z-10 space-y-6">
            <div className="bg-card border border-border-main p-6 rounded-3xl shadow-xl shadow-black/5 rotate-[-2deg] translate-x-4 max-w-[280px]">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Financial Health</span>
                    <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">Good</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-text-main">78</span>
                    <span className="text-sm font-bold text-text-muted mb-1">/100</span>
                </div>
                <div className="h-12 w-full mt-4 flex items-end gap-1">
                    {[30, 45, 35, 55, 60, 50, 78].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border-main p-6 rounded-3xl shadow-xl shadow-black/5 rotate-[3deg] -translate-x-4 max-w-[280px]">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Monthly Cash Flow</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-emerald-500">+$1,250</span>
                    <span className="text-[10px] font-bold text-text-muted">This Month</span>
                </div>
                <div className="mt-4 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-[6px] border-emerald-500 border-t-transparent animate-spin-slow" />
                </div>
            </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-text-muted/50">
            <ShieldCheck size={20} />
            <p className="text-[10px] font-medium leading-tight">
                Your data is secure and private. We use bank-level encryption to protect your information.
            </p>
        </div>
      </div>

      {/* Right Panel: Questionnaire */}
      <div className="flex-1 flex flex-col relative overflow-y-auto bg-grid-pattern">
        
        {/* Top Progress Bar */}
        <div className="sticky top-0 z-20 bg-bg/80 backdrop-blur-md border-b border-border-main px-12 py-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-primary uppercase tracking-widest">Step {step} of {totalSteps}</span>
                <div className="flex gap-2 w-48 lg:w-64">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-primary" : "bg-border-main"}`} />
                    ))}
                </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors">
                <Save size={14} /> Save & Exit
            </button>
        </div>

        <div className="flex-1 flex px-6 py-20">
          <div className="m-auto w-full max-w-[680px]">
            <div className="flex flex-col mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles size={24} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-text-main tracking-tight">Let's understand your financial picture</h2>
                </div>
                <p className="text-text-muted font-medium pl-1">Your answers help Vylos provide personalized insights and recommendations.</p>
            </div>

            <div className="space-y-8">
                {/* Step 1: Goals */}
                {step === 1 && (
                    <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-black text-text-main tracking-tight mb-2">1. What is your primary financial goal right now?</h3>
                        <p className="text-xs font-medium text-text-muted mb-8">Choose the one that matters most to you.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { id: "save", label: "Save more money", icon: <PiggyBank size={24} /> },
                                { id: "debt", label: "Pay off debt", icon: <CreditCard size={24} /> },
                                { id: "home", label: "Buy a home", icon: <Home size={24} /> },
                                { id: "invest", label: "Invest for the future", icon: <TrendingUp size={24} /> },
                                { id: "other", label: "Other", icon: <MoreHorizontal size={24} /> },
                            ].map((opt) => (
                                <button 
                                    key={opt.id}
                                    onClick={() => updateAnswer("primaryGoal", opt.id)}
                                    className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border transition-all
                                        ${answers.primaryGoal === opt.id 
                                            ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500" 
                                            : "bg-transparent border-border-main hover:border-border-strong hover:bg-border-main/20"
                                        }
                                    `}
                                >
                                    {answers.primaryGoal === opt.id && (
                                        <div className="absolute top-2 right-2 flex items-center justify-center">
                                            <div className="bg-emerald-500 rounded-full p-0.5">
                                                <CheckCircle2 size={12} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={`transition-colors ${answers.primaryGoal === opt.id ? "text-emerald-500" : "text-text-muted"}`}>
                                        {opt.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-text-main leading-tight text-center uppercase tracking-tight">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Income */}
                {step === 2 && (
                    <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-black text-text-main tracking-tight mb-2">2. What is your current monthly income (after tax)?</h3>
                        <p className="text-xs font-medium text-text-muted mb-8">Include salary, freelance, business, or any other income.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                `Less than ${formatCurrency(1000)}`, `${formatCurrency(1000)} – ${formatCurrency(2500)}`, `${formatCurrency(2500)} – ${formatCurrency(5000)}`,
                                `${formatCurrency(5000)} – ${formatCurrency(10000)}`, `${formatCurrency(10000)} – ${formatCurrency(20000)}`, `More than ${formatCurrency(20000)}`
                            ].map((opt) => (
                                <button 
                                    key={opt}
                                    onClick={() => updateAnswer("monthlyIncome", opt)}
                                    className={`relative px-6 py-5 rounded-2xl border text-sm font-black transition-all flex items-center justify-between
                                        ${answers.monthlyIncome === opt 
                                            ? "bg-emerald-500/10 border-emerald-500 text-text-main shadow-md ring-1 ring-emerald-500" 
                                            : "bg-transparent border-border-main text-text-muted hover:text-text-main hover:bg-border-main/20"
                                        }
                                    `}
                                >
                                    {opt}
                                    {answers.monthlyIncome === opt && (
                                        <div className="bg-emerald-500 rounded-full p-0.5">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Expenses */}
                {step === 3 && (
                    <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-black text-text-main tracking-tight mb-2">3. How would you describe your monthly expenses?</h3>
                        <p className="text-xs font-medium text-text-muted mb-8">Choose the option that best fits your situation.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                "I spend less than I earn", "I spend about the same as I earn", "I spend more than I earn"
                            ].map((opt) => (
                                <button 
                                    key={opt}
                                    onClick={() => updateAnswer("expenseDescription", opt)}
                                    className={`relative px-6 py-8 rounded-2xl border text-sm font-black transition-all flex flex-col items-center text-center gap-4
                                        ${answers.expenseDescription === opt 
                                            ? "bg-emerald-500/10 border-emerald-500 text-text-main shadow-md ring-1 ring-emerald-500" 
                                            : "bg-transparent border-border-main text-text-muted hover:text-text-main hover:bg-border-main/20"
                                        }
                                    `}
                                >
                                    {opt}
                                    {answers.expenseDescription === opt && (
                                        <div className="absolute top-4 right-4 bg-emerald-500 rounded-full p-0.5">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Debt */}
                {step === 4 && (
                    <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-black text-text-main tracking-tight mb-2">4. Do you have any debt?</h3>
                        <p className="text-xs font-medium text-text-muted mb-8">This includes credit cards, personal loans, student loans, etc.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                "No debt", "Some debt, but manageable", "A significant amount of debt"
                            ].map((opt) => (
                                <button 
                                    key={opt}
                                    onClick={() => updateAnswer("debtStatus", opt)}
                                    className={`relative px-6 py-8 rounded-2xl border text-sm font-black transition-all flex flex-col items-center text-center gap-4
                                        ${answers.debtStatus === opt 
                                            ? "bg-emerald-500/10 border-emerald-500 text-text-main shadow-md ring-1 ring-emerald-500" 
                                            : "bg-transparent border-border-main text-text-muted hover:text-text-main hover:bg-border-main/20"
                                        }
                                    `}
                                >
                                    {opt}
                                    {answers.debtStatus === opt && (
                                        <div className="absolute top-4 right-4 bg-emerald-500 rounded-full p-0.5">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Savings */}
                {step === 5 && (
                    <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-black text-text-main tracking-tight mb-2">5. How much do you have in savings right now?</h3>
                        <p className="text-xs font-medium text-text-muted mb-8">Include emergency fund, savings accounts, etc.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                "Nothing saved", `Less than ${formatCurrency(1000)}`, `${formatCurrency(1000)} – ${formatCurrency(5000)}`,
                                `${formatCurrency(5000)} – ${formatCurrency(20000)}`, `${formatCurrency(20000)} – ${formatCurrency(50000)}`, `More than ${formatCurrency(50000)}`
                            ].map((opt) => (
                                <button 
                                    key={opt}
                                    onClick={() => updateAnswer("savingsAmount", opt)}
                                    className={`relative px-6 py-5 rounded-2xl border text-sm font-black transition-all flex items-center justify-between
                                        ${answers.savingsAmount === opt 
                                            ? "bg-emerald-500/10 border-emerald-500 text-text-main shadow-md ring-1 ring-emerald-500" 
                                            : "bg-transparent border-border-main text-text-muted hover:text-text-main hover:bg-border-main/20"
                                        }
                                    `}
                                >
                                    {opt}
                                    {answers.savingsAmount === opt && (
                                        <div className="bg-emerald-500 rounded-full p-0.5">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 6: Comfort */}
                {step === 6 && (
                    <div className="bg-card border border-border-main p-8 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-black text-text-main tracking-tight mb-2">6. How comfortable are you with managing your finances?</h3>
                        <p className="text-xs font-medium text-text-muted mb-8">This helps us tailor insights to your needs.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { id: "poor", label: "Not comfortable at all", icon: <Frown size={24} />, color: "rose" },
                                { id: "low", label: "A little uncomfortable", icon: <Meh size={24} />, color: "orange" },
                                { id: "neutral", label: "Neutral", icon: <Meh size={24} />, color: "amber" },
                                { id: "good", label: "Comfortable", icon: <Smile size={24} />, color: "emerald" },
                                { id: "high", label: "Very comfortable", icon: <Smile size={24} />, color: "primary" },
                            ].map((opt) => (
                                <button 
                                    key={opt.id}
                                    onClick={() => updateAnswer("financialComfort", opt.id)}
                                    className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border transition-all
                                        ${answers.financialComfort === opt.id 
                                            ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500" 
                                            : "bg-transparent border-border-main hover:border-border-strong hover:bg-border-main/20"
                                        }
                                    `}
                                >
                                    {answers.financialComfort === opt.id && (
                                        <div className="absolute top-2 right-2 flex items-center justify-center">
                                            <div className="bg-emerald-500 rounded-full p-0.5">
                                                <CheckCircle2 size={12} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={`transition-colors 
                                        ${answers.financialComfort === opt.id ? "text-emerald-500" : "text-text-muted"}
                                    `}>
                                        {opt.icon}
                                    </div>
                                    <span className="text-[9px] font-black text-text-main leading-tight text-center uppercase tracking-tight">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Insight Bar */}
            <div className="mt-12 bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Sparkles size={20} strokeWidth={2.5} />
                    </div>
                    <p className="text-xs font-bold text-text-main opacity-80">Almost there! One last step to unlock your personalized dashboard.</p>
                </div>
                
                <button 
                    onClick={handleNext}
                    className="relative z-10 px-8 py-4 bg-primary hover:bg-emerald-400 text-white font-black rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                >
                    {step === totalSteps ? "Unlock Dashboard" : "Continue"}
                    <ArrowRight size={18} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
