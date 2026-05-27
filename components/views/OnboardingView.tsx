"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, 
  Target, TrendingUp, BarChart3, Wallet, Smartphone, 
  Mail, MessageSquare, Home, Calendar, Layout, 
  ChevronRight, Lightbulb, Bell, PieChart, Users, 
  Briefcase, GraduationCap, Rocket, Store, Search, 
  Smile, Meh, Frown, TrendingDown, CreditCard, Zap,
  Globe, User, Lock, Heart, HelpCircle, Plus, Trash2, HelpCircle as TooltipIcon
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { VylosAvatar } from "../ui/VylosAvatar";
import { VylosLogo } from "../ui/VylosLogo";
import { VylosLoadingScreen } from "../ui/VylosLoadingScreen";
import { GoalIcon } from "../ui/GoalIcon";

interface OnboardingViewProps {
  userName: string;
  onComplete: (data: any) => void;
}

// 100 Hobby / Outings options
const HOBBY_OPTIONS = [
  "Gaming", "Movies", "Cinema", "Eating out", "Coffee shops", "Gym",
  "Football", "Basketball", "Cricket", "Cars", "Motorbikes", "Music",
  "Concerts", "DJ events", "Shopping", "Travel", "Beach trips", "Hiking",
  "Cycling", "Running", "Art", "Photography", "Reading", "Fashion",
  "Beauty", "Skincare", "Cooking", "Baking", "Pets", "Fishing",
  "Arcades", "Board games", "Puzzles", "Camping", "Wellness", "Boxing",
  "Swimming", "Bowling", "Pool", "Golf", "Skateboarding", "Theatre",
  "Tech", "Gadgets", "Coding", "Gardening", "Fine dining", "Bubble tea",
  "Takeaways", "Grocery exploring", "Sports events", "Weekend getaways",
  "Road trips", "Paintball", "Airsoft", "Rock climbing", "Kayaking",
  "Learning", "Writing", "Content creation", "Streaming", "Horse riding",
  "Crafts", "Sewing", "Collecting", "Gifts", "Home decor", "DIY",
  "Socialising", "Nightlife", "Parties", "Dancing", "Clubs", "Festivals",
  "Picnics", "Parks", "Aquarium visits", "Zoo visits", "Boat rides",
  "Adventure sports", "Outdoor adventures", "Courses", "Networking events",
  "Church/community", "Volunteering", "Competitions", "Sneakers", "Jewellery",
  "Collectibles", "Food markets", "Cafes", "Health foods", "Car meets",
  "Motorsport", "Science/experiments", "Astronomy", "Exploring new places",
  "Staycations", "Restaurants", "Podcasts", "News/current affairs",
  "Side hustles", "Trading/investing interest", "Family time", "Date nights"
];

// 50 Goal options
const GOAL_OPTIONS = [
  "Buy a car", "Buy a house", "Rent my own place", "Pay for studies",
  "Pay off debt", "Build emergency fund", "Start investing", "Start a business",
  "Save for tax", "Travel overseas", "Go on holiday", "Save for wedding",
  "Prepare for a child", "Support family", "Save for retirement", "Buy a laptop",
  "Buy a phone", "Buy furniture", "Improve health", "Learn a new skill",
  "Buy books/courses", "Build credit score", "Track spending better", "Stop overspending",
  "Improve grocery planning", "Reduce transport costs", "Home renovation", "Car maintenance",
  "Career growth", "Increase income", "Create a monthly budget", "Reduce financial stress",
  "Understand net worth", "Cut subscriptions", "Save on groceries", "Save R1,000",
  "Save R5,000", "Save R10,000", "Save R50,000", "Save R100,000", "Open savings account",
  "Invest monthly", "Get insurance", "Prepare legal/financial documents", "Grow business revenue",
  "Manage household spending", "Separate personal/business money", "Save for gifts",
  "Save for fuel", "Plan future expenses", "Become financially secure"
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(0); // 0 is welcome screen
  const totalQuestions = 12;
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [isParsingSheet, setIsParsingSheet] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const loadingMessages = [
    "Building your financial picture...",
    "Setting up your Vylos dashboard...",
    "Preparing your budget insights...",
    "Almost ready..."
  ];

  // 12-step Answers state (includes spreadsheet import)
  const [answers, setAnswers] = useState<any>({
    userType: "",
    age: "",
    hasBudget: "",
    budgetChoice: "",
    wantsBudgetImport: false,
    importedBudgetUploaded: false,
    importedBudgetFileName: "",
    importedBudgetData: [] as Array<{ category: string; limit: number }>,
    hobbies: [] as string[],
    hobbiesSpend: "",
    missions: [] as string[],
    goalsDetails: [] as any[],
    customGoal: "",
    takeHomePay: "",
    investingTypes: [] as string[],
    infrastructure: {
      fuel: "0",
      publicTransport: "0",
      uberBolt: "0",
      carRepayment: "0",
      carInsurance: "0",
      carMaintenance: "0",
      rentBond: "0",
      residence: "0",
      householdContribution: "0",
      ratesLevies: "0"
    },
    survivalBaseline: "",
    groceries: "0",
    utilities: "0",
    data: "0",
    toiletries: "0",
    householdItems: "0",
    otherEssentials: "0",
    hasDebt: "",
    debts: [] as Array<{ id: string; name: string; repayment: string; balance: string; type: string }>,
    budgetTarget: "",
    householdBreakdown: {
      kids: "0",
      teens: "0",
      youngAdults: "0",
      adults: "1",
      elders: "0"
    },
    trackingMethod: ""
  });

  const [error, setError] = useState<string | null>(null);

  // Search filter states for searchable multi-selects
  const [hobbyQuery, setHobbyQuery] = useState("");
  const [goalQuery, setGoalQuery] = useState("");
  const [showHobbyDropdown, setShowHobbyDropdown] = useState(false);
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);

  // Debt temporary addition form state
  const [tempDebt, setTempDebt] = useState({
    name: "",
    repayment: "",
    balance: "",
    type: "Credit card"
  });

  // Cycle loading messages when finalizing
  useEffect(() => {
    if (!isFinalizing) return;
    const msgInterval = setInterval(() => {
      setLoadingMessageIdx(prev => (prev + 1) % loadingMessages.length);
    }, 1500);

    const doneTimeout = setTimeout(() => {
      clearInterval(msgInterval);
      onComplete(answers);
    }, 6000);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(doneTimeout);
    };
  }, [isFinalizing, answers]);

  const updateNestedAnswer = (section: string, field: string, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setError(null);
  };

  const updateAnswer = (field: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Helper calculation for household size
  const calculatedHouseholdSize = useMemo(() => {
    if (answers.budgetTarget === "individual") return 1;
    const breakdown = answers.householdBreakdown;
    return (
      parseInt(breakdown.kids || "0") +
      parseInt(breakdown.teens || "0") +
      parseInt(breakdown.youngAdults || "0") +
      parseInt(breakdown.adults || "0") +
      parseInt(breakdown.elders || "0")
    );
  }, [answers.budgetTarget, answers.householdBreakdown]);

  // Dynamic progress sequence tracker based on budgetChoice and selected missions
  const visibleSteps = useMemo(() => {
    const list = [1, 2];
    if (answers.hasBudget === "Yes" && answers.budgetChoice === "import") {
      list.push(3); // Step 2A: Import Upload
    }
    list.push(4, 5);
    if (answers.missions && answers.missions.length > 0) {
      list.push(55); // Step 5A: Configure Goal Details
    }
    list.push(6, 7, 8, 9, 10, 11, 12);
    return list;
  }, [answers.hasBudget, answers.budgetChoice, answers.missions]);

  const currentProgressIndex = visibleSteps.indexOf(step) + 1;
  const totalProgressCount = visibleSteps.length;

  const handleBudgetFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingSheet(true);
    setParseError(null);

    try {
      const { ParserService } = await import("@/lib/services/import/ParserService");
      const rawData = await ParserService.getRawData(file);
      
      if (!rawData || !rawData.rows || rawData.rows.length === 0) {
        throw new Error("No data rows found in the selected spreadsheet.");
      }

      const parsedItems: Array<{ category: string; limit: number }> = [];

      rawData.rows.forEach((row: any) => {
        const keys = Object.keys(row);
        let categoryName = "";
        let limitAmount = 0;

        keys.forEach(k => {
          const val = row[k];
          if (val === null || val === undefined || val === "") return;

          if (typeof val === "string") {
            const cleanVal = val.trim();
            if (cleanVal.length > 2 && cleanVal.length < 35 && isNaN(Number(cleanVal))) {
              categoryName = cleanVal;
            }
          }

          if (typeof val === "number" || (typeof val === "string" && !isNaN(Number(val.replace(/[^\d.-]/g, ""))))) {
            const num = typeof val === "number" ? val : parseFloat(val.replace(/[^\d.-]/g, ""));
            if (!isNaN(num) && num > 0 && num < 1000000) {
              limitAmount = num;
            }
          }
        });

        if (categoryName && limitAmount > 0) {
          let matchedCategory = categoryName;
          const lowerCat = categoryName.toLowerCase();

          if (lowerCat.includes("grocery") || lowerCat.includes("groceries") || lowerCat.includes("supermarket")) {
            matchedCategory = "Groceries";
          } else if (lowerCat.includes("rent") || lowerCat.includes("housing") || lowerCat.includes("bond") || lowerCat.includes("accommodation")) {
            matchedCategory = "Rent / Housing";
          } else if (lowerCat.includes("transport") || lowerCat.includes("fuel") || lowerCat.includes("car") || lowerCat.includes("mobility")) {
            matchedCategory = "Transport";
          } else if (lowerCat.includes("bill") || lowerCat.includes("utility") || lowerCat.includes("electricity") || lowerCat.includes("water")) {
            matchedCategory = "Bills";
          } else if (lowerCat.includes("eat") || lowerCat.includes("restaurant") || lowerCat.includes("dine") || lowerCat.includes("dining")) {
            matchedCategory = "Eating Out";
          } else if (lowerCat.includes("shop") || lowerCat.includes("clothing") || lowerCat.includes("fashion")) {
            matchedCategory = "Shopping";
          } else if (lowerCat.includes("health") || lowerCat.includes("medical") || lowerCat.includes("doctor")) {
            matchedCategory = "Health";
          } else if (lowerCat.includes("edu") || lowerCat.includes("school") || lowerCat.includes("study") || lowerCat.includes("university")) {
            matchedCategory = "Education";
          } else if (lowerCat.includes("entertainment") || lowerCat.includes("movie") || lowerCat.includes("cinema") || lowerCat.includes("fun")) {
            matchedCategory = "Entertainment";
          } else if (lowerCat.includes("sub") || lowerCat.includes("netflix") || lowerCat.includes("spotify")) {
            matchedCategory = "Subscriptions";
          } else if (lowerCat.includes("debt") || lowerCat.includes("loan") || lowerCat.includes("credit card") || lowerCat.includes("repay")) {
            matchedCategory = "Debt Payments";
          } else if (lowerCat.includes("save") || lowerCat.includes("saving") || lowerCat.includes("investment")) {
            matchedCategory = "Savings";
          }

          const existing = parsedItems.find(p => p.category.toLowerCase() === matchedCategory.toLowerCase());
          if (!existing) {
            parsedItems.push({ category: matchedCategory, limit: limitAmount });
          }
        }
      });

      if (parsedItems.length === 0) {
        throw new Error("Could not parse any valid budget items from your sheet. Please ensure it has a category label and a limit/amount column.");
      }

      setAnswers((prev: any) => ({
        ...prev,
        wantsBudgetImport: true,
        importedBudgetUploaded: true,
        importedBudgetFileName: file.name,
        importedBudgetData: parsedItems
      }));

    } catch (err: any) {
      console.error("Budget parsing error:", err);
      setParseError(err.message || "Failed to parse the file.");
      setAnswers((prev: any) => ({
        ...prev,
        importedBudgetUploaded: false,
        importedBudgetFileName: "",
        importedBudgetData: []
      }));
    } finally {
      setIsParsingSheet(false);
    }
  };

  // Validation & step controls
  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    setError(null);

    // Dynamic step validations
    if (step === 1) {
      if (!answers.userType) {
        setError("Please select your current role/profile description.");
        return;
      }
      const ageNum = parseInt(answers.age);
      if (isNaN(ageNum) || ageNum < 12 || ageNum > 120) {
        setError("Please enter a valid age (between 12 and 120).");
        return;
      }
    }

    if (step === 2) {
      if (!answers.hasBudget) {
        setError("Please select whether you currently have a set budget.");
        return;
      }
      if (answers.hasBudget === "Yes" && !answers.budgetChoice) {
        setError("Please choose whether you want to import or create a new budget.");
        return;
      }
    }

    if (step === 3) {
      // Step 2A: Import upload step validation
      // No mandatory file upload validation (user can skip/continue)
    }

    if (step === 4) {
      if (answers.hobbies.length === 0) {
        setError("Please select at least one hobby or outing choice.");
        return;
      }
      const spendVal = parseFloat(answers.hobbiesSpend);
      if (isNaN(spendVal) || spendVal < 0) {
        setError("Please enter or select your monthly hobbies/outings spend.");
        return;
      }
    }

    if (step === 5) {
      if (answers.missions.length === 0) {
        setError("Please select or add at least one mission or goal.");
        return;
      }

      // Initialize or sync goalsDetails based on selected missions
      const existingDetails = answers.goalsDetails || [];
      const newDetails = answers.missions.map((mission: string) => {
        const title = mission.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
        const existing = existingDetails.find((d: any) => d.mission === mission || d.title.toLowerCase() === title.toLowerCase());
        
        if (existing) return existing;
        
        let category = "Savings";
        let icon = "Target";
        let color = "#00D8A5";
        
        if (mission.includes("car")) { icon = "Car"; color = "#7C4DFF"; }
        else if (mission.includes("house")) { icon = "Home"; color = "#795548"; }
        else if (mission.includes("place")) { icon = "Building"; color = "#0091EA"; }
        else if (mission.includes("studies")) { icon = "GraduationCap"; color = "#3F51B5"; }
        else if (mission.includes("debt")) { icon = "CreditCard"; color = "#FF1744"; category = "Debt Payments"; }
        else if (mission.includes("emergency")) { icon = "Shield"; color = "#00C853"; }
        else if (mission.includes("investing")) { icon = "Target"; color = "#00BFA5"; }
        else if (mission.includes("business")) { icon = "Building"; color = "#FFA000"; }
        else if (mission.includes("overseas")) { icon = "Plane"; color = "#00BCD4"; }
        else if (mission.includes("holiday")) { icon = "Plane"; color = "#FFB300"; }
        else if (mission.includes("wedding")) { icon = "Heart"; color = "#EC407A"; }
        else if (mission.includes("child")) { icon = "Baby"; color = "#AB47BC"; }
        else if (mission.includes("family")) { icon = "Users"; color = "#26A69A"; }
        else if (mission.includes("retirement")) { icon = "Users"; color = "#78909C"; }
        else if (mission.includes("laptop")) { icon = "Laptop"; color = "#26C6DA"; }
        else if (mission.includes("phone")) { icon = "Smartphone"; color = "#82B1FF"; }
        else if (mission.includes("furniture")) { icon = "Home"; color = "#8D6E63"; }
        
        const deadline = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
        
        return {
          mission,
          title,
          target_amount: "", // Do not auto-guess, leave empty
          current_amount: 0,
          deadline,
          category,
          icon,
          color
        };
      });
      updateAnswer("goalsDetails", newDetails);
    }

    if (step === 55) {
      if (!answers.goalsDetails || answers.goalsDetails.length === 0) {
        setError("Please configure at least one goal details card.");
        return;
      }
      for (let i = 0; i < answers.goalsDetails.length; i++) {
        const g = answers.goalsDetails[i];
        if (!g.title.trim()) {
          setError(`Goal #${i + 1} must have a name.`);
          return;
        }
        const amt = parseFloat(g.target_amount);
        if (isNaN(amt) || amt <= 0) {
          setError(`Please enter a valid target amount greater than 0 for goal "${g.title}".`);
          return;
        }
        if (g.current_amount !== "") {
          const cur = parseFloat(g.current_amount);
          if (isNaN(cur) || cur < 0) {
            setError(`Current saved amount must be a positive number for "${g.title}".`);
            return;
          }
        }
      }
    }

    if (step === 6) {
      const payVal = parseFloat(answers.takeHomePay);
      if (isNaN(payVal) || payVal <= 0) {
        setError("Please enter a valid take-home pay amount greater than 0.");
        return;
      }
    }

    if (step === 7) {
      if (answers.investingTypes.length === 0) {
        setError("Please select at least one investment status / type.");
        return;
      }
    }

    if (step === 9) {
      const baseVal = parseFloat(answers.survivalBaseline);
      if (isNaN(baseVal) || baseVal <= 0) {
        setError("Please specify your monthly survival baseline.");
        return;
      }
    }

    if (step === 10) {
      if (!answers.hasDebt) {
        setError("Please select whether you currently have outstanding debts.");
        return;
      }
      if (answers.hasDebt === "Yes" && answers.debts.length === 0) {
        setError("Please add at least one debt details card or select No.");
        return;
      }
    }

    if (step === 11) {
      if (!answers.budgetTarget) {
        setError("Please select who you are making this budget for.");
        return;
      }
      if (answers.budgetTarget !== "individual" && calculatedHouseholdSize <= 0) {
        setError("Household size must be at least 1 person.");
        return;
      }
    }

    if (step === 12) {
      if (!answers.trackingMethod) {
        setError("Please select your prior tracking method.");
        return;
      }
      setIsFinalizing(true);
      return;
    }

    // Step Routing transitions using visibleSteps
    const currentIdx = visibleSteps.indexOf(step);
    if (currentIdx !== -1 && currentIdx < visibleSteps.length - 1) {
      setStep(visibleSteps[currentIdx + 1]);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    const currentIdx = visibleSteps.indexOf(step);
    if (currentIdx > 0) {
      setStep(visibleSteps[currentIdx - 1]);
      window.scrollTo(0, 0);
    } else if (step === 1) {
      setStep(0);
      window.scrollTo(0, 0);
    }
  };

  // Autocomplete suggestions
  const filteredHobbies = useMemo(() => {
    if (!hobbyQuery) return HOBBY_OPTIONS.filter(h => !answers.hobbies.includes(h));
    const cleanQuery = hobbyQuery.toLowerCase().trim();
    return HOBBY_OPTIONS.filter(
      opt => opt.toLowerCase().includes(cleanQuery) && !answers.hobbies.includes(opt)
    );
  }, [hobbyQuery, answers.hobbies]);

  const filteredGoals = useMemo(() => {
    if (!goalQuery) return GOAL_OPTIONS.filter(g => !answers.missions.includes(g));
    const cleanQuery = goalQuery.toLowerCase().trim();
    return GOAL_OPTIONS.filter(
      opt => opt.toLowerCase().includes(cleanQuery) && !answers.missions.includes(opt)
    );
  }, [goalQuery, answers.missions]);

  // Debt handling
  const handleAddDebt = () => {
    if (!tempDebt.name.trim()) return;
    const repaymentVal = parseFloat(tempDebt.repayment);
    if (isNaN(repaymentVal) || repaymentVal <= 0) return;

    const newDebt = {
      id: Math.random().toString(36).substring(2, 9),
      name: tempDebt.name.trim(),
      repayment: tempDebt.repayment,
      balance: tempDebt.balance || "0",
      type: tempDebt.type
    };

    updateAnswer("debts", [...answers.debts, newDebt]);
    setTempDebt({ name: "", repayment: "", balance: "", type: "Credit card" });
  };

  const handleRemoveDebt = (id: string) => {
    updateAnswer("debts", answers.debts.filter((d: any) => d.id !== id));
  };

  // Money Falling loading page
  if (isFinalizing) {
    return (
      <VylosLoadingScreen variant="fullscreen" text={loadingMessages[loadingMessageIdx]} />
    );
  }

  return (
    <div className="vylos-bg-premium fixed inset-0 z-[100] flex overflow-hidden font-inter select-none">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Wizard Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto z-10 px-4 py-8 md:py-16">
        <div className="w-full max-w-[720px] mx-auto">
          
          {step === 0 ? (
            // Welcome Page
            <div className="vylos-glass-readable !p-10 md:!p-16 !rounded-[40px] shadow-2xl animate-in fade-in zoom-in-95 duration-700">
               <div className="mb-10 drop-shadow-2xl">
                 <VylosLogo size="large" />
               </div>
               
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-8">
                 Let's build your <span className="text-blue-600">Financial Blueprint.</span>
               </h1>
               
               <div className="space-y-6 text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                 <p>Welcome! We'll ask a few personalized questions to build a real-time budget baseline and dynamic target plan.</p>
                 <p>These responses actively set up starter categories, goals, and customize your personalized insights.</p>
               </div>

               <div className="mt-12 p-6 rounded-3xl bg-blue-600/5 border border-blue-600/10 flex items-start gap-4">
                 <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={20} />
                 <p className="text-xs font-bold text-blue-800 dark:text-blue-300/60 leading-relaxed uppercase tracking-widest">
                   Protected by bank-grade encryption. Your details are used strictly for in-app customization.
                 </p>
               </div>

               <button 
                 onClick={handleNext}
                 className="mt-12 w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm"
               >
                 Build My Blueprint
                 <ChevronRight size={22} strokeWidth={3} />
               </button>
            </div>
          ) : (
            // Steps Page
            <div className="vylos-glass-readable !p-8 md:!p-12 !rounded-[40px] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
              
              {/* Progress Indicator */}
              <div className="absolute top-10 right-10 text-[10px] font-black text-slate-600 dark:text-white/40 uppercase tracking-[0.3em]">
                Step {currentProgressIndex} of {totalProgressCount}
              </div>

              <div className="mb-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/10 flex items-center justify-center text-blue-600 font-black mb-6 shadow-sm">
                  {currentProgressIndex}
                </div>
                
                {/* 1. Tell us about yourself */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tell us about yourself</h2>
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">What best describes you?</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: "student", label: "🎓 Student" },
                          { id: "working", label: "💼 Working professional" },
                          { id: "entrepreneur", label: "🚀 Entrepreneur / business owner" },
                          { id: "freelancer", label: "💻 Freelancer" },
                          { id: "parent", label: "👪 Parent / guardian" },
                          { id: "household_manager", label: "🏡 Household manager" },
                          { id: "investor", label: "📈 Investor" },
                          { id: "other", label: "❓ Other" }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateAnswer("userType", opt.id)}
                            className={`p-5 rounded-2xl border text-left font-black text-sm tracking-tight transition-all duration-300
                              ${answers.userType === opt.id 
                                ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" 
                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/30"
                              }
                            `}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 mt-6">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">What is your age?</label>
                      <input
                        type="number"
                        min="12"
                        max="120"
                        placeholder="e.g. 25"
                        value={answers.age}
                        onChange={e => updateAnswer("age", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold tracking-tight text-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Do you already have a set budget? */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Do you already have a set budget?</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Do you already have a budget established, for example in a spreadsheet?</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {["Yes", "No"].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateAnswer("hasBudget", val)}
                          className={`p-6 rounded-2xl border font-black text-lg transition-all duration-300
                            ${answers.hasBudget === val 
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" 
                              : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/30"
                            }
                          `}
                        >
                          {val}
                        </button>
                      ))}
                    </div>

                    {answers.hasBudget === "Yes" && (
                      <div className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in duration-300">
                        <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">What would you like to do?</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: "import", label: "📊 Import existing budget", desc: "Upload a spreadsheet (CSV/XLSX)" },
                            { id: "create", label: "✨ Create a new Vylos budget", desc: "Build a personalized budget step-by-step" }
                          ].map(choice => (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => updateAnswer("budgetChoice", choice.id)}
                              className={`p-5 rounded-2xl border text-left transition-all duration-300
                                ${answers.budgetChoice === choice.id
                                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20"
                                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/30"
                                }
                              `}
                            >
                              <div className="font-black text-sm">{choice.label}</div>
                              <div className={`text-[10px] font-bold mt-1 ${answers.budgetChoice === choice.id ? "text-white/70" : "text-slate-400"}`}>{choice.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2A. Import budget upload step */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Upload your budget sheet</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Upload your CSV or Excel budget sheet. We will automatically parse your categories and limit allocations.
                    </p>

                    <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center bg-white/5 relative hover:border-blue-600/30 transition-all">
                      <input 
                        type="file" 
                        accept=".csv,.xlsx,.xls" 
                        onChange={handleBudgetFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isParsingSheet}
                      />
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600">
                          <BarChart3 size={32} />
                        </div>
                        {answers.importedBudgetUploaded ? (
                          <div>
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest block mb-1">✓ Budget Sheet Uploaded</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{answers.importedBudgetFileName}</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-sm font-black text-slate-900 dark:text-white block">Click to browse or drag and drop</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Supports CSV, XLSX, XLS</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isParsingSheet && (
                      <div className="flex items-center justify-center gap-3 p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl animate-pulse">
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                        <span className="text-xs font-bold text-blue-600">Analyzing budget spreadsheet...</span>
                      </div>
                    )}

                    {parseError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/10 text-xs font-bold text-red-500 rounded-2xl">
                        ⚠️ {parseError}
                      </div>
                    )}

                    {answers.importedBudgetUploaded && answers.importedBudgetData && answers.importedBudgetData.length > 0 && (
                      <div className="space-y-3 p-6 border border-white/5 bg-white/5 rounded-3xl animate-in fade-in duration-300">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Parsed Budget allocations ({answers.importedBudgetData.length})</label>
                        <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2">
                          {answers.importedBudgetData.map((b: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[120px]">{b.category}</span>
                              <span className="text-xs font-black text-emerald-500">R{b.limit.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!answers.importedBudgetUploaded && !isParsingSheet && (
                      <button
                        type="button"
                        onClick={() => {
                          updateAnswer("wantsBudgetImport", false);
                          handleNext();
                        }}
                        className="w-full py-4 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
                      >
                        Skip Upload & Use Starter Budget
                      </button>
                    )}
                  </div>
                )}

                {/* 3. What fuels your excitement? */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">What fuels your excitement?</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select your hobbies, interests, entertainment, and outing categories.</p>
                    
                    {/* Selected tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {answers.hobbies.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-blue-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => updateAnswer("hobbies", answers.hobbies.filter((h: string) => h !== tag))}
                            className="hover:text-red-300 ml-1 font-bold text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Search textbox */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Search hobbies & outings (e.g. Gaming, Concerts...)"
                        value={hobbyQuery}
                        onChange={e => { setHobbyQuery(e.target.value); setShowHobbyDropdown(true); }}
                        onFocus={() => setShowHobbyDropdown(true)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold tracking-tight text-base focus:outline-none focus:border-blue-600"
                      />
                      
                      {showHobbyDropdown && filteredHobbies.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                          {filteredHobbies.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                updateAnswer("hobbies", [...answers.hobbies, opt]);
                                setHobbyQuery("");
                                setShowHobbyDropdown(false);
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-black text-slate-700 dark:text-white transition-colors"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Monthly Hobbies spend */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">Around how much do you spend monthly on hobbies and outings?</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-slate-400">R</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={answers.hobbiesSpend}
                          onChange={e => updateAnswer("hobbiesSpend", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 text-slate-900 dark:text-white font-bold tracking-tight text-xl focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      {/* Estimate chips */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {["0", "350", "750", "1800", "3500", "6000"].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateAnswer("hobbiesSpend", v)}
                            className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-300"
                          >
                            {v === "0" ? "R0 - R250" : v === "350" ? "R250 - R500" : v === "750" ? "R500 - R1,000" : v === "1800" ? "R1,000 - R2,500" : v === "3500" ? "R2,500 - R5,000" : "R5,000+"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. What are your missions/goals? */}
                {step === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">What are your missions/goals?</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Choose your short and long-term goals. We'll populate suggested targets in your Goals page.</p>

                    {/* Selected tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {answers.missions.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-blue-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => updateAnswer("missions", answers.missions.filter((m: string) => m !== tag))}
                            className="hover:text-red-300 ml-1 font-bold text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Search textbox */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Search goals (e.g. house, car, investments...)"
                        value={goalQuery}
                        onChange={e => { setGoalQuery(e.target.value); setShowGoalDropdown(true); }}
                        onFocus={() => setShowGoalDropdown(true)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold tracking-tight text-base focus:outline-none focus:border-blue-600"
                      />
                      
                      {showGoalDropdown && filteredGoals.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                          {filteredGoals.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                updateAnswer("missions", [...answers.missions, opt]);
                                setGoalQuery("");
                                setShowGoalDropdown(false);
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-black text-slate-700 dark:text-white transition-colors"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Custom goal field */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">Add a Custom Goal</label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          placeholder="e.g. Buy mechanical keyboard"
                          value={answers.customGoal}
                          onChange={e => updateAnswer("customGoal", e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold tracking-tight focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!answers.customGoal.trim()) return;
                            updateAnswer("missions", [...answers.missions, answers.customGoal.trim()]);
                            updateAnswer("customGoal", "");
                          }}
                          className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all font-black text-sm uppercase tracking-wider"
                        >
                          <Plus size={18} className="mr-1" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5A. Configure Goal Details */}
                {step === 55 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configure Goal Details</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Specify details for each of your selected savings goals. No guesses - enter your exact targets.</p>
                    
                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                      {answers.goalsDetails?.map((goal: any, index: number) => (
                        <div key={index} className="border border-slate-200 dark:border-white/10 bg-white/5 rounded-3xl p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/10 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                              <GoalIcon iconName={goal.icon || "Target"} size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <input 
                                type="text"
                                value={goal.title}
                                onChange={e => {
                                  const updated = [...answers.goalsDetails];
                                  updated[index].title = e.target.value;
                                  updateAnswer("goalsDetails", updated);
                                }}
                                className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 font-black text-slate-900 dark:text-white text-lg focus:outline-none w-full"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Amount (R)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  placeholder="e.g. 50000"
                                  value={goal.target_amount}
                                  onChange={e => {
                                    const updated = [...answers.goalsDetails];
                                    updated[index].target_amount = e.target.value;
                                    updateAnswer("goalsDetails", updated);
                                  }}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Saved (R, optional)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={goal.current_amount || ""}
                                  onChange={e => {
                                    const updated = [...answers.goalsDetails];
                                    updated[index].current_amount = e.target.value;
                                    updateAnswer("goalsDetails", updated);
                                  }}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Date</label>
                              <input
                                type="date"
                                value={goal.deadline}
                                onChange={e => {
                                  const updated = [...answers.goalsDetails];
                                  updated[index].deadline = e.target.value;
                                  updateAnswer("goalsDetails", updated);
                                }}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                              <select
                                value={goal.category}
                                onChange={e => {
                                  const updated = [...answers.goalsDetails];
                                  updated[index].category = e.target.value;
                                  updateAnswer("goalsDetails", updated);
                                }}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
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

                {/* 5. What is your total take-home pay? */}
                {step === 6 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">What is your monthly take-home pay?</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Specify your total monthly income after tax/benefit deductions. This is the actual amount hitting your account.</p>

                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-400">R</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={answers.takeHomePay}
                        onChange={e => updateAnswer("takeHomePay", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 py-5 text-slate-900 dark:text-white font-bold tracking-tight text-2xl focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Are you currently investing for your future? */}
                {step === 7 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Are you currently investing?</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select all investment vehicles/products you are active in. (Choose 'Not investing yet' if applicable).</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 border border-white/5 rounded-2xl bg-white/5">
                      {[
                        "Not investing yet", "Savings account", "Tax-free savings account", "Retirement annuity",
                        "Pension/provident fund", "Unit trusts", "ETFs", "Stocks/shares",
                        "Crypto", "Property", "Business investment", "Forex/trading", "Stokvel", "Other"
                      ].map(item => {
                        const isSel = answers.investingTypes.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              if (item === "Not investing yet") {
                                updateAnswer("investingTypes", ["Not investing yet"]);
                              } else {
                                const cleanList = answers.investingTypes.filter((x: string) => x !== "Not investing yet");
                                if (isSel) {
                                  updateAnswer("investingTypes", cleanList.filter((x: string) => x !== item));
                                } else {
                                  updateAnswer("investingTypes", [...cleanList, item]);
                                }
                              }
                            }}
                            className={`p-4 rounded-xl border text-left text-sm font-black transition-all duration-200
                              ${isSel 
                                ? "bg-blue-600 border-blue-600 text-white" 
                                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/30"
                              }
                            `}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. What does your current life infrastructure look like? */}
                {step === 8 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Life infrastructure costs</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Please provide your fixed monthly housing and vehicle/transport costs.</p>

                    <div className="space-y-6">
                      <div className="border border-white/5 bg-white/5 rounded-3xl p-6 space-y-4">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-2"><Home size={16} /> Roof over your head</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { k: "rentBond", label: "Rent / Bond" },
                            { k: "residence", label: "Student Residence" },
                            { k: "householdContribution", label: "Household Contribution" },
                            { k: "ratesLevies", label: "Rates, Water & Levies" }
                          ].map(field => (
                            <div key={field.k} className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  value={answers.infrastructure[field.k]}
                                  onChange={e => updateNestedAnswer("infrastructure", field.k, e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border border-white/5 bg-white/5 rounded-3xl p-6 space-y-4">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-2"><CarRepaymentIcon /> Transport & Mobility</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { k: "fuel", label: "Fuel" },
                            { k: "publicTransport", label: "Public Transport" },
                            { k: "uberBolt", label: "Uber / Bolt" },
                            { k: "carRepayment", label: "Car Repayment" },
                            { k: "carInsurance", label: "Car Insurance" },
                            { k: "carMaintenance", label: "Maintenance" }
                          ].map(field => (
                            <div key={field.k} className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  value={answers.infrastructure[field.k]}
                                  onChange={e => updateNestedAnswer("infrastructure", field.k, e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. What is your monthly survival baseline? */}
                {step === 9 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your Survival Baseline</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">What is the absolute minimum amount you need monthly for essentials?</p>

                    <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex gap-3 text-xs font-medium leading-relaxed text-blue-900 dark:text-blue-300">
                      <TooltipIcon size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Survival Baseline:</strong> The core minimum needed for survival (groceries, utilities, basic data, toiletries, essential accommodation). Do not include shopping, eating out, entertainment, or subscription services.
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">Total Monthly Essentials Cost</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-400">R</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={answers.survivalBaseline}
                          onChange={e => updateAnswer("survivalBaseline", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 py-5 text-slate-900 dark:text-white font-bold tracking-tight text-2xl focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* Optional breakdown */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                      <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Breakdown estimates (optional)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { k: "groceries", label: "🛒 Groceries" },
                          { k: "utilities", label: "⚡ Utilities" },
                          { k: "data", label: "📱 Airtime/Data" },
                          { k: "toiletries", label: "🧴 Toiletries" },
                          { k: "householdItems", label: "🧺 Household" },
                          { k: "otherEssentials", label: "📦 Other core" }
                        ].map(item => (
                          <div key={item.k} className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R</span>
                              <input
                                type="number"
                                value={answers[item.k]}
                                onChange={e => {
                                  updateAnswer(item.k, e.target.value);
                                  // Update total baseline reactively as sum of components
                                  const sum = 
                                    parseFloat(item.k === "groceries" ? e.target.value : answers.groceries || "0") +
                                    parseFloat(item.k === "utilities" ? e.target.value : answers.utilities || "0") +
                                    parseFloat(item.k === "data" ? e.target.value : answers.data || "0") +
                                    parseFloat(item.k === "toiletries" ? e.target.value : answers.toiletries || "0") +
                                    parseFloat(item.k === "householdItems" ? e.target.value : answers.householdItems || "0") +
                                    parseFloat(item.k === "otherEssentials" ? e.target.value : answers.otherEssentials || "0");
                                  if (!isNaN(sum)) updateAnswer("survivalBaseline", String(sum));
                                }}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. What is holding back your freedom? (Debts) */}
                {step === 10 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">What is holding back your freedom?</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Do you currently have debt repayments or financial commitments holding you back?</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {["Yes", "No"].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            updateAnswer("hasDebt", val);
                            if (val === "No") updateAnswer("debts", []);
                          }}
                          className={`p-6 rounded-2xl border font-black text-lg transition-all duration-300
                            ${answers.hasDebt === val 
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" 
                              : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/30"
                            }
                          `}
                        >
                          {val}
                        </button>
                      ))}
                    </div>

                    {answers.hasDebt === "Yes" && (
                      <div className="space-y-6 pt-6 border-t border-white/5 animate-in fade-in duration-300">
                        {/* Debt addition form */}
                        <div className="border border-white/10 bg-white/5 rounded-3xl p-6 space-y-4">
                          <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><CreditCard size={16} /> Add a Debt Commitments Card</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Debt Provider / Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Standard Bank CC"
                                value={tempDebt.name}
                                onChange={e => setTempDebt({...tempDebt, name: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Debt Category Type</label>
                              <select
                                value={tempDebt.type}
                                onChange={e => setTempDebt({...tempDebt, type: e.target.value})}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                              >
                                {["Credit card", "Personal loan", "Student loan", "Car finance", "Clothing account", "Store account", "Family/friend debt", "Business debt", "Other"].map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Repayment</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={tempDebt.repayment}
                                  onChange={e => setTempDebt({...tempDebt, repayment: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding Balance (optional)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={tempDebt.balance}
                                  onChange={e => setTempDebt({...tempDebt, balance: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddDebt}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
                          >
                            <Plus size={16} /> Add Debt Record
                          </button>
                        </div>

                        {/* List of debts added */}
                        {answers.debts.length > 0 && (
                          <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Active Debts Added</label>
                            <div className="space-y-2">
                              {answers.debts.map((d: any) => (
                                <div key={d.id} className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                                  <div>
                                    <div className="font-black text-sm text-slate-900 dark:text-white">{d.name} <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold ml-2">{d.type}</span></div>
                                    <div className="text-xs text-slate-400 font-bold mt-1">Repayment: R{d.repayment}/mo | Outstanding: R{d.balance || "0"}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDebt(d.id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 10. Who is this budget for? */}
                {step === 11 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Who is this budget for?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: "individual", label: "👤 Just me / individual" },
                        { id: "household", label: "👪 My household / family" },
                        { id: "business", label: "💼 My business" },
                        { id: "both", label: "🏢 Personal + business" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateAnswer("budgetTarget", opt.id)}
                          className={`p-6 rounded-2xl border text-left font-black text-sm transition-all duration-300
                            ${answers.budgetTarget === opt.id 
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" 
                              : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/30"
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Household count breakdown */}
                    {answers.budgetTarget && answers.budgetTarget !== "individual" && (
                      <div className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in duration-300">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Who is in your household / company?</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { k: "kids", label: "👶 Kids (<13)" },
                            { k: "teens", label: "🎒 Teens (13-18)" },
                            { k: "youngAdults", label: "🎓 Youth (18-30)" },
                            { k: "adults", label: "💼 Adults (30-60)" },
                            { k: "elders", label: "👵 Elders (60+)" }
                          ].map(field => (
                            <div key={field.k} className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                              <input
                                type="number"
                                min="0"
                                value={answers.householdBreakdown[field.k]}
                                onChange={e => updateNestedAnswer("householdBreakdown", field.k, e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-center text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center text-xs font-bold text-slate-700 dark:text-blue-300">
                          <span>Computed Household Size:</span>
                          <span className="text-base text-blue-600 font-black">{calculatedHouseholdSize} people</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 11. What has been your tracking method? */}
                {step === 12 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Prior tracking method</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">How have you been tracking your finances prior to Vylos?</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: "none", label: "🤷 I do not track yet" },
                        { id: "bank_app", label: "📱 I use my banking app" },
                        { id: "spreadsheet", label: "📊 I use a spreadsheet" },
                        { id: "notes", label: "📝 I use notes on my phone" },
                        { id: "budget_app", label: "🛠️ I use another budgeting app" },
                        { id: "envelopes", label: "✉️ I use cash/envelopes" },
                        { id: "mental", label: "🧠 I track mentally" },
                        { id: "other_person", label: "👥 Someone else manages it" },
                        { id: "other", label: "❓ Other" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateAnswer("trackingMethod", opt.id)}
                          className={`p-5 rounded-2xl border text-left font-black text-sm transition-all duration-300
                            ${answers.trackingMethod === opt.id 
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" 
                              : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 hover:border-blue-600/30"
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="mb-6 text-red-500 font-bold text-sm animate-bounce">
                  ⚠️ {error}
                </p>
              )}

              {/* Wizard Nav footer */}
              <div className="flex items-center justify-between pt-10 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs text-slate-600 dark:text-white/40 hover:text-slate-900 dark:hover:text-white uppercase tracking-[0.2em] transition-all"
                >
                  <ArrowLeft size={16} strokeWidth={3} /> Back
                </button>

                <button 
                  onClick={handleNext}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-[0.2em] text-xs"
                >
                  {step === 12 ? "Complete Blueprint" : "Next Step"}
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-medium text-slate-400 dark:text-white/20 leading-relaxed max-w-lg mx-auto">
                  By completing this questionnaire, Vylos establishes starter budget categories and sets up goal targets which you can edit at any time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function CarRepaymentIcon() {
  return <Wallet size={16} />;
}
