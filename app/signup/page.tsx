"use client";

import { Eye, ShieldCheck, Sparkles, Layout, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";

export default function Signup() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [riskValue, setRiskValue] = useState(65);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "",
    country: "South Africa (ZAR)", income: ""
  });

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
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
      const profile = {
        id: authData.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        monthly_income: parseFloat(form.income) || 0,
        risk_tolerance: riskValue,
        theme: 'Dark',
        subscription_plan: 'Pro Plan',
      };

      await supabase.from('user_profiles').insert([{
        ...profile,
        onboarding_completed: false
      }]);
      toast("Architectural account created!", "success");
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-bg flex text-text-main transition-colors duration-500 overflow-hidden">
      {/* LEFT: Branding Section */}
      <div className="hidden lg:flex w-[40%] bg-sidebar border-r border-border-main flex-col justify-center px-12 xl:px-24 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        
        <div className="relative z-10">
          <Link href="/login" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-16">
            <ChevronLeft size={16} strokeWidth={3} />
            Back to Entry
          </Link>

          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
              <Layout className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-5xl xl:text-7xl font-black leading-[0.95] tracking-tighter mb-8">
            The journey to <br />
            <span className="text-primary underline decoration-primary/20">wealth</span> starts.
          </h1>

          <p className="text-lg text-text-muted font-medium leading-relaxed max-w-sm mb-12">
            Join the elite circle of individuals using Vylos to automate their financial security and growth.
          </p>

          <div className="flex flex-col gap-8">
            <FeatureItem icon="🛡️" title="Neural Shield" desc="Advanced fraud protection active." />
            <FeatureItem icon="🌐" title="Global Scale" desc="Support for 42+ currencies." />
          </div>
        </div>
      </div>

      {/* RIGHT: Signup Form Section */}
      <div className="flex-1 flex overflow-y-auto px-6 py-12 relative bg-grid-pattern">
        <div className="m-auto w-full max-w-[500px]">
          <div className="bg-card border border-border-main p-12 xl:p-16 rounded-[3rem] shadow-2xl shadow-black/10">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black tracking-tighter mb-3">Initialize Account</h2>
              <p className="text-text-muted font-medium text-sm">Configure your core profile to access the neural engine.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Legal Name</label>
                  <input 
                    value={form.name} onChange={e=>setForm({...form,name:e.target.value})} 
                    placeholder="e.g. Alex Rivera" required
                    className="w-full bg-border-subtle/50 border border-border-main rounded-2xl px-5 py-4 text-text-main placeholder:text-text-muted/30 focus:border-primary transition-all outline-none font-bold tracking-tight"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Identity (Email)</label>
                  <input 
                    type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} 
                    placeholder="name@vylos.com" required
                    className="w-full bg-border-subtle/50 border border-border-main rounded-2xl px-5 py-4 text-text-main placeholder:text-text-muted/30 focus:border-primary transition-all outline-none font-bold tracking-tight"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Secure Auth Key (Password)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} 
                      placeholder="••••••••••••" required
                      className="w-full bg-border-subtle/50 border border-border-main rounded-2xl px-5 py-4 text-text-main placeholder:text-text-muted/30 focus:border-primary transition-all outline-none font-bold tracking-tight"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted">
                      {showPassword ? <Eye size={18} /> : <Eye size={18} className="opacity-40" />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-emerald-400 disabled:opacity-50 text-white font-black py-6 rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 group active:scale-95"
              >
                {loading ? "INITIALIZING..." : (
                  <>
                    Continue to Onboarding
                    <Sparkles size={20} className="group-hover:animate-pulse" />
                  </>
                )}
              </button>

              <div className="text-center">
                 <Link href="/login" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">
                    Already part of the circle? <span className="text-primary underline underline-offset-4 decoration-primary/20">Sign in</span>
                 </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-5 group">
      <div className="w-14 h-14 rounded-2xl bg-card border border-border-main flex items-center justify-center text-3xl shadow-sm transition-all group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/5">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-text-main tracking-tight">{title}</h4>
        <p className="text-sm text-text-muted font-medium opacity-80">{desc}</p>
      </div>
    </div>
  );
}
