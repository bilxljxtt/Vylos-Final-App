"use client";

import React, { useState } from "react";
import { 
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, 
  Target, TrendingUp, BarChart3, Wallet, Smartphone, 
  Mail, MessageSquare, Home, Calendar, Layout, 
  ChevronRight, Lightbulb, Bell, PieChart, Users, 
  Briefcase, GraduationCap, Rocket, Store, Search, 
  Smile, Meh, Frown, TrendingDown, CreditCard, Zap,
  Globe, User, Lock, Heart, HelpCircle
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { VylosAvatar } from "../ui/VylosAvatar";

interface OnboardingViewProps {
  userName: string;
  onComplete: (data: any) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(0); // 0 is welcome screen
  const totalQuestions = 10;
  
  const [answers, setAnswers] = useState<Record<string, string>>({
    userType: "",
    reason_for_using_vylos: "",
    moneyConfidence: "",
    first_tracking_focus: "",
    currentTrackingMethod: "",
    biggest_money_challenge: "",
    monthly_income_range: "",
    main_money_goal: "",
    review_frequency: "",
    communication_preference: "",
  });

  const [error, setError] = useState<string | null>(null);

  const updateAnswer = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    // Validation
    const requiredQuestions = [1, 2, 3, 4, 5, 6, 8, 9, 10];
    const fieldMap: Record<number, string> = {
        1: "userType",
        2: "reason_for_using_vylos",
        3: "moneyConfidence",
        4: "first_tracking_focus",
        5: "currentTrackingMethod",
        6: "biggest_money_challenge",
        7: "monthly_income_range",
        8: "main_money_goal",
        9: "review_frequency",
        10: "communication_preference"
    };

    if (requiredQuestions.includes(step) && !answers[fieldMap[step]]) {
      setError("Please choose one option to continue.");
      return;
    }

    if (step < totalQuestions) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const progress = (step / totalQuestions) * 100;

  return (
    <div className="vylos-bg-premium fixed inset-0 z-[100] flex overflow-hidden font-inter select-none">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Wizard Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto z-10 px-6 py-12 md:py-24">
        <div className="w-full max-w-[700px] mx-auto">
          
          {step === 0 ? (
            <div className="vylos-glass-readable !p-10 md:!p-16 !rounded-[40px] shadow-2xl animate-in fade-in zoom-in-95 duration-700">
               <div className="w-20 h-20 rounded-[2rem] bg-white border border-blue-600/20 flex items-center justify-center mb-10 shadow-2xl overflow-hidden p-3">
                 <img src="/vylos-logo-final.png" alt="Vylos" className="w-full h-full object-contain" />
               </div>
               
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-8">
                 Welcome to <span className="text-blue-600">Vylos.</span>
               </h1>
               
               <div className="space-y-6 text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                 <p>We’ll ask a few quick questions to help set up your dashboard properly.</p>
                 <p>Your answers help Vylos show you the right tools, reminders, and money tips.</p>
               </div>

               <div className="mt-12 p-6 rounded-3xl bg-blue-600/5 border border-blue-600/10 flex items-start gap-4">
                 <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={20} />
                 <p className="text-xs font-bold text-blue-800 dark:text-blue-300/60 leading-relaxed uppercase tracking-widest">
                   Your information is kept private and handled safely according to our Privacy Policy.
                 </p>
               </div>

               <button 
                 onClick={handleNext}
                 className="mt-12 w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm"
               >
                 Start Personalizing
                 <ChevronRight size={22} strokeWidth={3} />
               </button>
            </div>
          ) : (
            <div className="vylos-glass-readable !p-8 md:!p-14 !rounded-[40px] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
              
              {/* Progress Indicator */}
              <div className="absolute top-10 right-10 text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-[0.3em]">
                Question {step} of 10
              </div>

              <div className="mb-12">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/10 flex items-center justify-center text-blue-600 font-black mb-6 shadow-sm">
                  {step}
                </div>
                
                {step === 1 && (
                  <OnboardingStep 
                    title="Which one sounds most like you?"
                    value={answers.userType}
                    options={[
                      { id: "student", label: "I am a student", icon: <GraduationCap size={20} /> },
                      { id: "working", label: "I am working", icon: <Briefcase size={20} /> },
                      { id: "small_business", label: "I run a small business", icon: <Store size={20} /> },
                      { id: "side_hustle", label: "I have a side hustle", icon: <Rocket size={20} /> },
                      { id: "family", label: "I manage money for my home or family", icon: <Users size={20} /> },
                      { id: "other", label: "Other", icon: <HelpCircle size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("userType", v)}
                  />
                )}

                {step === 2 && (
                  <OnboardingStep 
                    title="Why are you using Vylos?"
                    value={answers.reason_for_using_vylos}
                    options={[
                      { id: "tracking", label: "To see where my money goes", icon: <Search size={20} /> },
                      { id: "control", label: "To control my spending", icon: <Zap size={20} /> },
                      { id: "budget", label: "To make a budget", icon: <PieChart size={20} /> },
                      { id: "saving", label: "To save more money", icon: <Target size={20} /> },
                      { id: "business", label: "To track business money", icon: <Briefcase size={20} /> },
                      { id: "reports", label: "To get simple money reports", icon: <BarChart3 size={20} /> },
                      { id: "trying", label: "I am just trying it out", icon: <Sparkles size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("reason_for_using_vylos", v)}
                  />
                )}

                {step === 3 && (
                  <OnboardingStep 
                    title="How do you feel about managing your money right now?"
                    value={answers.moneyConfidence}
                    options={[
                      { id: "confident", label: "I feel confident", icon: <Smile size={20} className="text-emerald-500" /> },
                      { id: "okay", label: "I am okay, but I need help", icon: <Smile size={20} className="text-blue-500" /> },
                      { id: "not_sure", label: "I am not sure", icon: <Meh size={20} className="text-slate-400" /> },
                      { id: "difficult", label: "I find it difficult", icon: <Frown size={20} className="text-orange-500" /> },
                      { id: "stressed", label: "I feel stressed about it", icon: <Frown size={20} className="text-red-500" /> },
                    ]}
                    onSelect={(v) => updateAnswer("moneyConfidence", v)}
                  />
                )}

                {step === 4 && (
                  <OnboardingStep 
                    title="What do you want to track first?"
                    value={answers.first_tracking_focus}
                    options={[
                      { id: "personal", label: "My personal money", icon: <User size={20} /> },
                      { id: "business", label: "My business money", icon: <Briefcase size={20} /> },
                      { id: "both", label: "Both personal and business money", icon: <Globe size={20} /> },
                      { id: "savings", label: "My savings goals", icon: <Target size={20} /> },
                      { id: "budget", label: "My monthly budget", icon: <PieChart size={20} /> },
                      { id: "not_sure", label: "I am not sure yet", icon: <HelpCircle size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("first_tracking_focus", v)}
                  />
                )}

                {step === 5 && (
                  <OnboardingStep 
                    title="How do you track your money now?"
                    value={answers.currentTrackingMethod}
                    options={[
                      { id: "not_tracking", label: "I do not track it", icon: <Search size={20} /> },
                      { id: "bank_app", label: "I use my bank app", icon: <Smartphone size={20} /> },
                      { id: "notes", label: "I use notes on my phone", icon: <Smartphone size={20} /> },
                      { id: "excel", label: "I use Excel or Google Sheets", icon: <BarChart3 size={20} /> },
                      { id: "accounting", label: "I use accounting software", icon: <Briefcase size={20} /> },
                      { id: "paper", label: "I write it down on paper", icon: <Heart size={20} /> },
                      { id: "helped", label: "Someone helps me", icon: <Users size={20} /> },
                      { id: "other", label: "Other", icon: <Globe size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("currentTrackingMethod", v)}
                  />
                )}

                {step === 6 && (
                  <OnboardingStep 
                    title="What do you need the most help with?"
                    value={answers.biggest_money_challenge}
                    options={[
                      { id: "overspending", label: "Spending too much", icon: <TrendingDown size={20} /> },
                      { id: "budgeting", label: "Making a budget", icon: <PieChart size={20} /> },
                      { id: "saving", label: "Saving money regularly", icon: <TrendingUp size={20} /> },
                      { id: "business_expenses", label: "Tracking business expenses", icon: <Briefcase size={20} /> },
                      { id: "separation", label: "Keeping personal and business money separate", icon: <Layout size={20} /> },
                      { id: "reports", label: "Understanding reports", icon: <BarChart3 size={20} /> },
                      { id: "payments", label: "Remembering payments", icon: <Bell size={20} /> },
                      { id: "debt", label: "Managing debt", icon: <CreditCard size={20} /> },
                      { id: "not_sure", label: "I am not sure", icon: <HelpCircle size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("biggest_money_challenge", v)}
                  />
                )}

                {step === 7 && (
                  <OnboardingStep 
                    title="What is your monthly income?"
                    value={answers.monthly_income_range}
                    options={[
                      { id: "none", label: "I do not have regular income yet" },
                      { id: "less_2500", label: "Less than R2,500" },
                      { id: "2500_5000", label: "R2,500 to R5,000" },
                      { id: "5001_10000", label: "R5,001 to R10,000" },
                      { id: "10001_20000", label: "R10,001 to R20,000" },
                      { id: "20001_50000", label: "R20,001 to R50,000" },
                      { id: "more_50000", label: "More than R50,000" },
                      { id: "private", label: "I prefer not to say" },
                    ]}
                    onSelect={(v) => updateAnswer("monthly_income_range", v)}
                  />
                )}

                {step === 8 && (
                  <OnboardingStep 
                    title="What is your main money goal right now?"
                    value={answers.main_money_goal}
                    options={[
                      { id: "save", label: "Save more money", icon: <TrendingUp size={20} /> },
                      { id: "spend_less", label: "Spend less money", icon: <TrendingDown size={20} /> },
                      { id: "emergency", label: "Build emergency savings", icon: <ShieldCheck size={20} /> },
                      { id: "debt", label: "Pay off debt", icon: <CreditCard size={20} /> },
                      { id: "grow_business", label: "Grow my business", icon: <Rocket size={20} /> },
                      { id: "profit", label: "Track profit better", icon: <BarChart3 size={20} /> },
                      { id: "invest", label: "Start investing", icon: <TrendingUp size={20} /> },
                      { id: "understand", label: "Understand my money better", icon: <Search size={20} /> },
                      { id: "other", label: "Other", icon: <HelpCircle size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("main_money_goal", v)}
                  />
                )}

                {step === 9 && (
                  <OnboardingStep 
                    title="How often should Vylos help you check your money?"
                    value={answers.review_frequency}
                    options={[
                      { id: "daily", label: "Every day", icon: <Smartphone size={20} /> },
                      { id: "weekly", label: "Every week", icon: <Calendar size={20} /> },
                      { id: "monthly", label: "Every month", icon: <BarChart3 size={20} /> },
                      { id: "on_login", label: "Only when I open the app", icon: <Layout size={20} /> },
                      { id: "not_sure", label: "I am not sure yet", icon: <HelpCircle size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("review_frequency", v)}
                  />
                )}

                {step === 10 && (
                  <OnboardingStep 
                    title="Can Vylos send you helpful reminders and updates?"
                    value={answers.communication_preference}
                    options={[
                      { id: "email", label: "Yes, by email", icon: <Mail size={20} /> },
                      { id: "whatsapp", label: "Yes, by WhatsApp", icon: <MessageSquare size={20} /> },
                      { id: "both", label: "Yes, by email and WhatsApp", icon: <Smartphone size={20} /> },
                      { id: "none", label: "No, only important account messages", icon: <ShieldCheck size={20} /> },
                    ]}
                    onSelect={(v) => updateAnswer("communication_preference", v)}
                  />
                )}
              </div>

              {error && (
                <p className="mb-6 text-red-500 font-bold text-sm animate-bounce">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-10 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-[0.2em] transition-all"
                >
                  <ArrowLeft size={16} strokeWidth={3} /> Back
                </button>

                <button 
                  onClick={handleNext}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-[0.2em] text-xs"
                >
                  {step === 10 ? "Continue to My Dashboard" : "Next Step"}
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-medium text-slate-400 dark:text-white/20 leading-relaxed max-w-lg mx-auto">
                  Your answers help Vylos personalise your dashboard and improve your experience. 
                  We do not sell your personal information. 
                  You can update your preferences later in Settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function OnboardingStep({ title, options, value, onSelect }: { title: string, options: any[], value: string, onSelect: (v: string) => void }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt) => (
                    <button 
                        key={opt.id}
                        onClick={() => onSelect(opt.id)}
                        className={`flex items-center gap-4 p-6 rounded-3xl border text-left transition-all duration-300
                            ${value === opt.id 
                                ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]" 
                                : "bg-white/5 border-white/10 text-slate-600 dark:text-slate-400 hover:border-blue-600/30"
                            }
                        `}
                    >
                        {opt.icon && (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${value === opt.id ? "bg-white/20 text-white" : "bg-white/5 text-blue-600 border border-white/10"}`}>
                              {opt.icon}
                          </div>
                        )}
                        <span className="text-sm font-black leading-tight tracking-tight">{opt.label}</span>
                        {value === opt.id && <CheckCircle2 className="ml-auto text-white" size={20} />}
                    </button>
                ))}
            </div>
        </div>
    );
}
