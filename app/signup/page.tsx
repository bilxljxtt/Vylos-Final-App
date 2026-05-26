"use client";

import { useState } from "react";
import { 
  User, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, 
  ChevronRight, Phone, Target, Zap, Shield, BarChart3, Clock, Lightbulb, Globe 
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }

    if (!agreeToTerms) {
      toast("Please agree to the Terms and Privacy Policy", "error");
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
      // Create profile
      const { error: profileError } = await supabase.from('user_profiles').upsert([{
        id: authData.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        onboarding_completed: false,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
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
    <div className="vylos-bg-premium min-h-screen w-full flex flex-col relative overflow-hidden font-inter selection:bg-blue-500/30">
      
      {/* ─── Background Blobs ─── */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* ─── Header Overlay ─── */}
      <div className="p-8 lg:px-16 hidden sm:flex items-center justify-between z-50">
            <div className="flex flex-col items-start">
                <div className="flex items-center justify-center relative group transition-all duration-700">
                  <VylosLogo size="large" className="transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-out" />
                </div>
            </div>
        <div className="hidden md:flex items-center gap-8">
            <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Built for the modern builder</span>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center px-6 lg:px-16 py-12 relative z-10 gap-16 xl:gap-24">
        
        {/* ─── LEFT PANEL: Features ─── */}
        <div className="hidden xl:flex flex-1 flex-col gap-6 max-w-[320px]">
            <h2 className="text-4xl font-black text-white leading-[0.95] tracking-tight mb-4">
                <span className="text-gradient">Smarter money</span> <br />
                <span className="text-blue-200/80 italic font-serif">starts here.</span>
            </h2>
            <p className="text-base text-white/60 font-medium leading-relaxed mb-2">
                Join the next generation of financial builders. Secure, intelligent, and designed for growth.
            </p>

            <div className="space-y-6">
                {[
                    { icon: <Shield size={18} className="text-emerald-400" />, title: "Secure", desc: "Military-grade encryption." },
                    { icon: <Zap size={18} className="text-amber-400" />, title: "Real-time", desc: "Instant growth insights." },
                    { icon: <Sparkles size={18} className="text-blue-400" />, title: "Pro Tools", desc: "Advanced goal tracking." },
                ].map((f, i) => (
                    <div key={i} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-blue-600/20 transition-all duration-300">
                            {f.icon}
                        </div>
                        <div className="space-y-0.5 mt-0.5">
                            <h4 className="text-sm font-black text-white">{f.title}</h4>
                            <p className="text-[10px] text-white/40 leading-tight font-medium">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trusted Users */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex -space-x-2 mb-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600/50 bg-slate-800 overflow-hidden shadow-xl">
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=vylosuser${i}&backgroundColor=b6e3f4`} alt="User" />
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center text-[8px] font-black text-white shadow-xl">
                        +50k
                    </div>
                </div>
            </div>
        </div>

        {/* ─── CENTER PANEL: Signup Card ─── */}
        <div className="w-full max-w-[480px] vylos-glass rounded-[40px] p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-white/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="flex flex-col items-center text-center mb-12">
                <div className="flex items-center justify-center relative group transition-all duration-700 mb-10">
                  <VylosLogo size="large" className="transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-out" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Create account</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                    Start your smarter financial journey today.
                </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <User size={20} />
                            </div>
                            <input 
                                type="text" placeholder="John Doe" required
                                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-lg"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input 
                                type="email" placeholder="john@example.com" required
                                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-lg"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Password</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} placeholder="••••••••" required
                                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-12 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-base"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Confirm</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <ShieldCheck size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} placeholder="••••••••" required
                                value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-base"
                            />
                        </div>
                    </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Phone Number (Optional)</label>
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            <Phone size={20} />
                        </div>
                        <input 
                            type="tel" placeholder="+27 82 000 0000"
                            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-lg"
                        />
                    </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-4 py-4 px-2">
                    <div className="relative flex items-center justify-center mt-1">
                        <input 
                            type="checkbox" required
                            checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)}
                            className="peer h-6 w-6 appearance-none rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        />
                        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none scale-0 peer-checked:scale-100 transition-transform">
                            <Zap size={12} fill="currentColor" />
                        </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                        I agree to Vylos's <Link href="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>
                    </span>
                </div>

                <button 
                    type="submit" disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-black text-[14px] flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
                >
                    {loading ? "Creating..." : "Join Vylos"}
                    <ChevronRight size={18} strokeWidth={3} />
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Already part of Vylos? <Link href="/login" className="text-blue-600 font-black hover:underline ml-1">Log In</Link>
                </p>
            </div>
        </div>

        {/* ─── RIGHT PANEL: Dashboard Preview ─── */}
        <div className="hidden 2xl:flex flex-1 flex-col gap-8 max-w-[400px]">
            {/* Widget 1: Budget */}
            <div className="glass-card p-8 animate-float">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Budget Flow</span>
                    <BarChart3 size={18} className="text-white/40" />
                </div>
                <div className="flex items-center gap-8">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={226 * 0.32} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        </svg>
                        <span className="absolute text-sm font-black text-white tracking-tighter">68%</span>
                    </div>
                    <div className="space-y-2">
                        <div className="text-base font-black text-white">R3,366<span className="text-white/40 text-xs">.21</span></div>
                        <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg uppercase tracking-widest">On Track</div>
                    </div>
                </div>
            </div>

            {/* Widget 2: Savings */}
            <div className="glass-card p-8 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Target size={20} className="text-blue-300" />
                        </div>
                        <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Goal Growth</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-black text-white">House Fund</span>
                        <span className="text-xs font-black text-white/40">R12,400 <span className="text-white/20">/ R50k</span></span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full p-0.5 border border-white/5">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.3)]" style={{ width: '35%' }} />
                    </div>
                </div>
            </div>

            {/* Widget 3: Advisor */}
            <div className="glass-card p-8 animate-float" style={{ animationDelay: '3s' }}>
                <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Lightbulb size={22} />
                    </div>
                    <div>
                        <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Smart Suggestion</div>
                        <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                            "You're saving 15% more than last month. Ready to invest the surplus?"
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ─── Footer Trust Badges ─── */}
      <div className="bg-white/5 backdrop-blur-3xl border-t border-white/5 p-8 lg:p-12 mt-12 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center lg:justify-between items-center gap-12 opacity-30">
            {[
                { icon: <Shield size={18} />, title: "256-bit encryption", subtitle: "Industrial strength security" },
                { icon: <Globe size={18} />, title: "Local Compliance", subtitle: "Built for South Africa" },
                { icon: <Zap size={18} />, title: "Real-time sync", subtitle: "Instant financial updates" },
                { icon: <Target size={18} />, title: "99.9% Uptime", subtitle: "Always available for you" },
            ].map((b, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="text-white">{b.icon}</div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{b.title}</span>
                        <span className="text-[9px] font-bold text-white/50">{b.subtitle}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}
