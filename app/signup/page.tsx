"use client";

import { useState } from "react";
import { 
  User, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, 
  ChevronRight, ArrowLeft, Phone, Zap, Shield, BarChart3, Target, Lightbulb, Globe, TrendingUp 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VylosLogo } from "@/components/ui/VylosLogo";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "",
    hasBudget: ""
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  function validateStep1() {
    if (!form.name.trim()) {
      toast("Full Name is required", "error");
      return false;
    }
    if (!form.email.trim()) {
      toast("Email address is required", "error");
      return false;
    }
    if (!form.password) {
      toast("Password is required", "error");
      return false;
    }
    if (form.password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast("Passwords do not match", "error");
      return false;
    }
    if (!agreeToTerms) {
      toast("Please agree to the Terms of Service and Privacy Policy", "error");
      return false;
    }
    return true;
  }

  function handleNext(e: React.MouseEvent) {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast(err.message || "Failed to connect with Google", "error");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.userType) {
      toast("Please select what describes you", "error");
      return;
    }
    if (!form.hasBudget) {
      toast("Please select if you already have a budget", "error");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, phone: form.phone } }
    });

    if (authError) { 
      toast(authError.message, "error"); 
      setLoading(false); 
      return; 
    }

    if (authData.user) {
      // Create user profile with Q1 (user_type) and Q2 (hasBudget inside onboarding_answers)
      const { error: profileError } = await supabase.from('user_profiles').upsert([{
        id: authData.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        user_type: form.userType,
        onboarding_completed: false,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        onboarding_answers: { hasBudget: form.hasBudget }
      }], { onConflict: "id" });

      if (profileError) {
        toast(profileError.message, "error");
        setLoading(false);
        return;
      }

      toast("Account created successfully!", "success");
      router.push("/"); 
    }
  }

  return (
    <div className="dark vylos-bg-premium min-h-screen w-full flex flex-col lg:flex-row relative overflow-x-hidden font-inter selection:bg-blue-500/30 bg-[#020617]">
      
      {/* ─── Background Blobs ─── */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* ─── Header Overlay ─── */}
      <div className="absolute top-8 left-8 lg:left-12 hidden sm:flex flex-col z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center relative group transition-all duration-700">
            <VylosLogo iconOnly size="medium" className="transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-out" />
          </div>
          <span className="text-3xl font-black tracking-tighter leading-tight overflow-visible pb-1 vylos-wordmark">Vylos</span>
        </div>
        <span className="text-[11px] font-black text-blue-200/50 tracking-widest uppercase mt-1.5 ml-[52px]">
          Track. Understand. Improve. Grow.
        </span>
      </div>

      {/* ─── LEFT: Visual Branding ─── */}
      <div className="hidden lg:flex flex-[1.2] flex-col justify-center p-16 xl:p-24 relative">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles size={12} className="text-blue-400 animate-pulse" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">The Future of Finance</span>
          </div>

          <h2 className="text-6xl xl:text-7xl font-black text-white leading-[0.95] tracking-tight mb-8">
            <span className="text-gradient">Smarter money</span> <br />
            <span className="text-blue-400 italic font-serif">starts here.</span>
          </h2>
          
          <p className="text-lg xl:text-xl text-slate-400 font-medium leading-relaxed max-w-lg mb-12">
            Join the next generation of financial builders. Secure, intelligent, and designed for growth.
          </p>

          {/* Mini Widgets Illustration */}
          <div className="grid grid-cols-2 gap-8 max-w-2xl">
             {/* Card 1: Spending */}
             <div className="glass-card p-6 border-white/5 animate-float">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spending</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                </div>
                <div className="text-3xl font-black text-white mb-2">R1,842<span className="text-slate-400 text-xl font-bold">.32</span></div>
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[10px] text-emerald-400 font-black">↓ 8.8% this month</span>
                </div>
             </div>

             {/* Card 2: Overview */}
             <div className="glass-card p-6 border-white/5 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                </div>
                <div className="flex items-end gap-2 h-16">
                    {[30, 45, 25, 60, 40, 80, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500/25 hover:bg-blue-500/50 rounded-full transition-all duration-300" style={{ height: `${h}%` }} />
                    ))}
                </div>
             </div>

             {/* Card 3: Goals */}
             <div className="col-span-2 glass-card p-6 border-white/5 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Target size={16} className="text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Goals</span>
                    </div>
                    <button className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-slate-300 uppercase tracking-widest transition-colors border border-white/5">
                        Manage Goals
                    </button>
                </div>
                <div className="space-y-4">
                    {[
                        { name: "Emergency Fund", progress: 75, color: "from-emerald-400 to-teal-500" },
                        { name: "Dream Vacation", progress: 65, color: "from-blue-400 to-indigo-500" },
                    ].map((g, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-xs font-bold text-white">{g.name}</span>
                                <span className="text-[10px] font-black text-slate-400">{g.progress}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full p-0.5 border border-white/5">
                                <div className={`h-full bg-gradient-to-r ${g.color} rounded-full`} style={{ width: `${g.progress}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="absolute bottom-12 left-24 right-24 flex justify-between items-center z-10 border-t border-white/5 pt-8 opacity-25">
             <div className="flex items-center gap-2">
                <Shield size={14} className="text-white" />
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Secure Data</span>
             </div>
             <div className="flex items-center gap-2">
                <Lock size={14} className="text-white" />
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Private</span>
             </div>
             <div className="flex items-center gap-2">
                <Globe size={14} className="text-white" />
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Global Reach</span>
             </div>
        </div>
      </div>

      {/* ─── RIGHT: Signup Card ─── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-20">
        <div className="w-full max-w-[460px] vylos-glass rounded-[32px] p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-white/5 bg-[#0a0f1d]/90">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center relative group transition-all duration-700 mb-4">
              <VylosLogo size="large" className="transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-out" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              {step === 1 ? "Create account" : "Profile Setup"}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-2 max-w-[260px] leading-relaxed">
              {step === 1 ? "Start your smarter financial journey today." : "Help Vylos customize your experience."}
            </p>
          </div>

          {step === 1 ? (
            /* STEP 1: Account credentials */
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" placeholder="John Doe" required
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-[#121A2E]/60 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-tight text-base"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" placeholder="john@example.com" required
                      value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-[#121A2E]/60 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-tight text-base"
                    />
                  </div>
                </div>

                {/* Passwords Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={16} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} placeholder="••••••••" required
                        value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                        className="w-full bg-[#121A2E]/60 border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-tight text-sm"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <ShieldCheck size={16} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} placeholder="••••••••" required
                        value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                        className="w-full bg-[#121A2E]/60 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-tight text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number (Optional)</label>
                  <div className="relative group">
                    <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel" placeholder="+27 82 000 0000"
                      value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full bg-[#121A2E]/60 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-tight text-base"
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 py-2 px-1">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input 
                      type="checkbox" required
                      checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)}
                      className="peer h-5.5 w-5.5 appearance-none rounded-lg border border-white/10 bg-white/5 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                    />
                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none scale-0 peer-checked:scale-100 transition-transform">
                      <Zap size={10} fill="currentColor" />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 leading-normal">
                    I agree to Vylos's <Link href="/terms" className="text-blue-400 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 font-bold hover:underline">Privacy Policy</Link>
                  </span>
                </div>
              </div>

              {/* Next Step Button */}
              <button 
                type="button" 
                onClick={handleNext}
                className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/10 transition-all active:scale-95 uppercase tracking-[0.25em]"
              >
                Continue Setup
                <ChevronRight size={18} strokeWidth={3} />
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-4 bg-[#0a0f1d] text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Or signup with</span>
              </div>

              {/* Google Button */}
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-[#121A2E]/40 border border-white/10 hover:bg-[#121A2E]/70 text-white rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
              >
                <div className="w-5.5 h-5.5 bg-white rounded-full flex items-center justify-center p-1 shadow-sm shrink-0">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-full h-full" />
                </div>
                <span className="text-sm font-bold text-slate-200">Google Account</span>
              </button>
            </div>
          ) : (
            /* STEP 2: Questionnaire */
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Question 1: What describes you? */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">What best describes you?</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "student", label: "🎓 Student" },
                    { id: "employee", label: "💼 Employee (Salary/Wages)" },
                    { id: "freelancer", label: "💻 Freelancer / Contractor" },
                    { id: "business_owner", label: "🚀 Business owner / Entrepreneur" },
                    { id: "other", label: "❓ Other" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({...form, userType: opt.id})}
                      className={`p-4 rounded-xl border text-left font-bold text-xs transition-all duration-300
                        ${form.userType === opt.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "bg-[#121A2E]/60 border-white/10 text-slate-300 hover:border-blue-500/40 hover:bg-[#121A2E]/80"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Do you already have a budget? */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Do you already have a budget?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Yes", label: "Yes 📊" },
                    { id: "No", label: "No ❌" },
                    { id: "somewhat", label: "Somewhat 🤔" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({...form, hasBudget: opt.id})}
                      className={`py-4 px-1 rounded-xl border text-center font-bold text-xs transition-all duration-300
                        ${form.hasBudget === opt.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "bg-[#121A2E]/60 border-white/10 text-slate-300 hover:border-blue-500/40 hover:bg-[#121A2E]/80"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-[0.2em]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-600/10 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
                >
                  {loading ? "Joining..." : "Join Vylos"}
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs font-semibold text-slate-400">
              Already part of Vylos? <Link href="/login" className="text-blue-400 font-bold hover:underline ml-1">Log In</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 text-slate-600">
           <span className="text-[9px] font-black uppercase tracking-[0.4em]">Track. Understand. Improve. Grow.</span>
        </div>
      </div>

    </div>
  );
}
