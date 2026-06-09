"use client";

import { useState } from "react";
import { 
  Mail, Lock, Eye, EyeOff, ChevronRight, ShieldCheck, 
  Globe, Zap, TrendingUp, Target, CreditCard, Shield, Sparkles 
} from "lucide-react";
import Link from "next/link";
import { VylosLogo } from "@/components/ui/VylosLogo";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const authClient = createClient();
    const { error, data } = await authClient.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) { 
      toast(error.message, "error"); 
      setLoading(false); 
      return; 
    }

    if (data.user) {
        toast("Welcome back to Vylos", "success");
        router.push("/"); 
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

  async function handleForgotPassword() {
    if (!email) {
      toast("Please enter your email address first", "info");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      
      if (error) throw error;
      toast("Password reset email sent. Please check your inbox.", "success");
    } catch (err: any) {
      toast(err.message || "Failed to send reset email", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vylos-bg-premium min-h-screen w-full flex flex-col lg:flex-row relative overflow-y-auto overflow-x-hidden font-inter selection:bg-blue-500/30">
      
      {/* ─── Background Blobs ─── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── Header Overlay ─── */}
      <div className="absolute top-8 left-8 lg:left-12 hidden sm:flex flex-col z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center relative group transition-all duration-700">
            <VylosLogo iconOnly size="medium" className="transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-out" />
          </div>
          <span className="text-3xl font-black tracking-tighter leading-tight overflow-visible pb-1 vylos-wordmark">Vylos</span>
        </div>
        <span className="text-[11px] font-black text-blue-200/60 tracking-widest uppercase mt-1 ml-[52px]">
          Track. Understand. Improve. Grow.
        </span>
      </div>

      {/* ─── LEFT: Visual Branding ─── */}
      <div className="hidden lg:flex flex-[1.2] flex-col justify-center p-16 xl:p-24 relative">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles size={12} className="text-blue-300" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">The Future of Finance</span>
          </div>

          <h1 className="text-6xl xl:text-7xl font-black text-white leading-[0.95] tracking-tight mb-8">
            <span className="text-gradient">Your financial future,</span> <br />
            <span className="text-blue-200/90 italic font-serif">in your hands.</span>
          </h1>
          
          <p className="text-lg xl:text-xl text-white/70 font-medium leading-relaxed max-w-lg mb-12">
            Vylos helps you track, understand, and improve your finances, so you can grow with confidence.
          </p>

          {/* Mini Widgets Illustration */}
          <div className="grid grid-cols-2 gap-8 max-w-2xl">
             {/* Card 1: Spending */}
             <div className="glass-card p-8 animate-float">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Spending</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                </div>
                <div className="text-4xl font-black text-white mb-2">R1,842<span className="text-white/40 text-2xl">.32</span></div>
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-black">↓ 8.8%</span>
                </div>
             </div>

             {/* Card 2: Overview */}
             <div className="glass-card p-8 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-between mb-8">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Efficiency</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                </div>
                <div className="flex items-end gap-2 h-20">
                    {[30, 45, 25, 60, 40, 80, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/40 to-cyan-400/60 rounded-full" style={{ height: `${h}%` }} />
                    ))}
                </div>
             </div>

             {/* Card 3: Goals */}
             <div className="col-span-2 glass-card p-8 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Target size={20} className="text-blue-300" />
                        </div>
                        <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Active Goals</span>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-colors border border-white/5">
                        Manage Goals
                    </button>
                </div>
                <div className="space-y-6">
                    {[
                        { name: "Emergency Fund", progress: 75, color: "from-emerald-400 to-teal-500", glow: "shadow-[0_0_15px_rgba(52,211,153,0.3)]" },
                        { name: "Dream Vacation", progress: 65, color: "from-blue-400 to-indigo-500", glow: "shadow-[0_0_15px_rgba(96,165,250,0.3)]" },
                    ].map((g, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-sm font-black text-white">{g.name}</span>
                                <span className="text-xs font-black text-white/40">{g.progress}%</span>
                            </div>
                            <div className="h-2.5 bg-white/5 rounded-full p-0.5 border border-white/5">
                                <div className={`h-full bg-gradient-to-r ${g.color} rounded-full ${g.glow}`} style={{ width: `${g.progress}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="absolute bottom-12 left-24 right-24 flex justify-between items-center z-10 border-t border-white/10 pt-8 opacity-40">
             <div className="flex items-center gap-3">
                <Shield size={16} className="text-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Secure Data</span>
             </div>
             <div className="flex items-center gap-3">
                <Lock size={16} className="text-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Private</span>
             </div>
             <div className="flex items-center gap-3">
                <Globe size={16} className="text-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Global Reach</span>
             </div>
        </div>
      </div>

      {/* ─── RIGHT: Login Card ─── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-8 relative z-20">
        <div className="w-full max-w-[480px] vylos-glass rounded-[40px] p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-white/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center relative group transition-all duration-700 mb-6">
              <VylosLogo size="large" className="transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 ease-out" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Welcome back</h2>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-400 mt-2 max-w-[280px]">
              Access your personalised financial dashboard and keep growing.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.2em] ml-2">Email address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  id="login-email"
                  name="email"
                  type="email" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.2em]">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-14 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-lg"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                    <input 
                        id="login-remember-me"
                        name="rememberMe"
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={() => setRememberMe(!rememberMe)}
                        className="peer h-6 w-6 appearance-none rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                    />
                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none scale-0 peer-checked:scale-100 transition-transform">
                        <Zap size={12} fill="currentColor" />
                    </div>
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button 
                type="button"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-[22px] font-black text-base flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
            >
              {loading ? "Verifying..." : "Log In to Vylos"}
              <ChevronRight size={20} strokeWidth={3} />
            </button>

            <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <span className="relative px-6 bg-white dark:bg-slate-900 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Secure Social Login</span>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-5 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[22px] flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm"
            >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-full h-full" />
                </div>
                <span className="text-base font-black text-slate-700 dark:text-white tracking-tight">Continue with Google Account</span>
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-400">
              Don't have an account? <Link href="/signup" className="text-blue-600 font-black hover:underline ml-1">Create Account</Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4 text-white/20">
           <span className="text-[11px] font-black uppercase tracking-[0.4em]">Track. Understand. Improve. Grow.</span>
        </div>
      </div>

    </div>
  );
}
