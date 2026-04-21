"use client";

import { Eye, Phone, Globe, ShieldCheck, Lock, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";
import { BrandLogo } from "@/components/BrandLogo";
import { useAppStore } from "@/lib/AppContext";

export default function Signup() {
  const router = useRouter();
  const { toast } = useToast();
  const { sessionUser } = useAppStore();
  const supabase = createClient();
  const [riskValue, setRiskValue] = useState(65);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "",
    country: "South Africa (ZAR)", age: "32", income: "", size: "1"
  });
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, phone: form.phone }
      }
    });

    if (authError) {
      toast(authError.message, "error");
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Create user profile in Database
      const profile = {
        id: authData.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        age: parseInt(form.age) || null,
        monthly_income: parseFloat(form.income) || 0,
        household_size: parseInt(form.size) || 1,
        risk_tolerance: riskValue,
        theme: 'Light',
        language: 'English (US)',
        currency: 'South African Rand (R)',
        notifications: { budgetAlerts: true, billReminders: true, securityAlerts: false },
        trial_started_at: new Date().toISOString(),
        subscription_plan: 'starter',
        subscription_status: 'trialing'
      };

      const { error: profileError } = await supabase.from('user_profiles').insert([profile]);
      if (profileError) {
        toast("Profile matching error: " + profileError.message, "error");
        setLoading(false);
        return;
      }

      // Initialize Default Budgets for the new user
      const defaultCategories = [
        { cat: "Groceries", type: "limit" },
        { cat: "Rent/Housing", type: "limit" },
        { cat: "Transport", type: "limit" },
        { cat: "Utilities", type: "limit" },
        { cat: "Entertainment", type: "limit" },
        { cat: "Emergency Fund", type: "target" }
      ];

      const budgetInitializers = defaultCategories.map(c => ({
        user_id: authData.user?.id,
        category: c.cat,
        spent: 0,
        limit: 0,
        type: c.type
      }));

      await supabase.from('budgets').insert(budgetInitializers);

      toast("Account securely initialized! Welcome to Vylos.", "success");
      router.push("/");
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-bg overflow-x-hidden transition-colors duration-300">
      {/* Left: Branding & Value Prop */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:pl-32 xl:pr-24 flex-1 bg-sidebar/30 border-r border-border-main relative overflow-hidden">
        <div className="absolute top-12 left-12 xl:left-32">
          <BrandLogo size="md" />
        </div>

        <div className="max-w-md relative z-10">
          <h2 className="text-5xl font-black text-text-main mb-6 leading-tight tracking-tight">
            Start your journey <br /> to <span className="text-primary">financial freedom.</span>
          </h2>
          <p className="text-lg text-text-muted mb-8 leading-relaxed">
            Join thousands of users who trust Vylos to manage their wealth, automate their savings, and secure their future.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-text-main text-sm">Security First</h4>
                <p className="text-xs text-text-muted mt-0.5">Your data is encrypted with bank-level protocols.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0 font-bold text-xs">
                7D
              </div>
              <div>
                <h4 className="font-bold text-text-main text-sm">7-Day Free Trial</h4>
                <p className="text-xs text-text-muted mt-0.5">Explore all premium features risk-free for 7 days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative shadow */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Right: Signup Form Container */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Header */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-12 lg:hidden">
          <BrandLogo size="sm" />
          <Link href="/login" className="text-sm font-bold text-primary">Sign In</Link>
        </div>

        <div className="w-full max-w-2xl bg-card rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-primary/5 border border-border-main flex flex-col relative z-10 mb-20">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">7-Day Trial Included</span>
            </div>
            <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">Create Account</h1>
            <p className="text-text-muted font-medium text-sm">Setup your profile in less than 2 minutes.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-12">
            {/* Step 1: Identity */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</span>
                Identity & Access
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted/40"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">Phone Number</label>
                  <input 
                    type="text" 
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="(082) 123-4567"
                    className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all placeholder:text-text-muted/40"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all placeholder:text-text-muted/40"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="Create a secure password"
                    className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all placeholder:text-text-muted/40"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border-subtle" />

            {/* Step 2: Financial Background */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">2</span>
                Financial Calibration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4 sm:col-span-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">Country</label>
                  <select 
                    value={form.country} 
                    onChange={e => setForm({...form, country: e.target.value})}
                    className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none appearance-none cursor-pointer"
                  >
                    <option>South Africa (ZAR)</option>
                    <option>United States (USD)</option>
                    <option>United Kingdom (GBP)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">Monthly Income (R)</label>
                  <input 
                    type="number" 
                    value={form.income}
                    onChange={e => setForm({...form, income: e.target.value})}
                    placeholder="50000"
                    className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all placeholder:text-text-muted/40"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">Risk Tolerance (0-100)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={riskValue} 
                      onChange={(e) => setRiskValue(Number(e.target.value))}
                      className="flex-1 h-2 bg-border-main rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-bold text-primary w-8">{riskValue}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-opacity-90 transition-all text-white font-bold text-lg shadow-xl shadow-primary/20 flex flex-col justify-center items-center gap-0 disabled:opacity-70"
            >
              <div className="flex items-center gap-2">
                {loading ? "INITIALIZING..." : "START MY FREE TRIAL"}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </div>
              {!loading && <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">No credit card required</span>}
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-text-muted font-medium">
            By signing up, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
          </div>
        </div>

        {/* Floating background elements for mobile */}
        <div className="lg:hidden absolute inset-0 bg-sidebar/10 pointer-events-none" />
      </div>

      {!sessionUser && (
        <div className="fixed top-8 right-8 hidden lg:block z-50">
          <Link href="/login" className="px-6 py-2.5 bg-card border border-border-main rounded-full text-sm font-bold text-text-main shadow-sm hover:bg-border-subtle transition-all">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

