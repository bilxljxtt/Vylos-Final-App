"use client";

import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Layout, 
  ArrowRight,
  Globe,
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";

export default function Login() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { 
      toast(error.message, "error"); 
      setLoading(false); 
      return; 
    }
    toast("Welcome back", "success");
    router.push("/");
  }

  async function handleForgotPassword() {
    if (!email) return toast("Please enter your email first", "error");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Neural reset link sent to your email.", "success");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* ─── LEFT: Branding & Illustration ────────────────────────────────────── */}
      <div className="lg:w-[42%] bg-bg-mint flex-col p-8 lg:p-16 relative overflow-hidden hidden lg:flex">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-16 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Layout className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Vylos</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Take control of <br />
            your <span className="text-primary">financial future</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium mb-12 max-w-md leading-relaxed">
            Vylos helps you track, budget, and grow your money with AI-powered insights.
          </p>

          <div className="space-y-8">
            <FeatureItem 
              icon={<TrendingUp className="w-5 h-5 text-primary" />} 
              title="Smart Insights" 
              desc="AI-powered insights to help you make better financial decisions."
            />
            <FeatureItem 
              icon={<ShieldCheck className="w-5 h-5 text-primary" />} 
              title="Secure & Private" 
              desc="Bank-level security to keep your data safe and encrypted."
            />
            <FeatureItem 
              icon={<Target className="w-5 h-5 text-primary" />} 
              title="Achieve Goals" 
              desc="Set goals, track progress, and build the life you want."
            />
          </div>
        </div>

        {/* Dashboard Preview Illustration */}
        <div className="mt-auto relative z-10 pt-16">
          <div className="relative transform hover:scale-[1.02] transition-transform duration-500">
             {/* Main Card */}
            <div className="glass-card rounded-3xl p-6 w-full max-w-[340px] relative z-20 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Balance</span>
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center">
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-4">$24,250.75</div>
              <div className="h-24 w-full flex items-end gap-1">
                {[40, 70, 45, 90, 65, 80, 50, 85, 100].map((h, i) => (
                  <div 
                    key={i} 
                    style={{ height: `${h}%` }} 
                    className={`flex-1 rounded-t-sm transition-all duration-1000 delay-${i * 100} bg-primary/20 hover:bg-primary`}
                  />
                ))}
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -bottom-10 -left-10 glass-card rounded-2xl p-4 w-48 shadow-2xl z-30 transform -rotate-6">
              <div className="w-10 h-6 bg-emerald-500 rounded-md mb-3" />
              <div className="h-2 w-3/4 bg-slate-100 rounded-full mb-2" />
              <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
            </div>

            <div className="absolute top-1/2 -right-4 glass-card rounded-full p-4 shadow-xl z-30 transform translate-x-1/2">
              <div className="w-12 h-12 rounded-full border-[6px] border-primary border-t-transparent animate-spin-slow" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Login Form Section ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Link */}
        <div className="p-8 flex justify-end items-center">
          <p className="text-sm font-medium text-slate-500">
            New to Vylos? <Link href="/signup" className="text-primary font-bold hover:underline ml-1">Create account</Link>
          </p>
        </div>

        {/* Center Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[480px]">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back 👋</h2>
              <p className="text-slate-500 font-medium">Login to your Vylos account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-sm font-bold text-primary hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-12 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3 px-1">
                <button 
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-primary border-primary' : 'border-slate-200 hover:border-primary/50'}`}
                >
                  {rememberMe && <div className="w-3 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                </button>
                <span className="text-sm font-bold text-slate-600 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>Remember me</span>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full login-btn py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
              >
                {loading ? "Logging in..." : "Login to Vylos"}
              </button>
            </form>


            {/* Security Note */}
            <div className="mt-12 p-6 bg-slate-50 rounded-3xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Your data is safe with us</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We use bank-level encryption to protect your personal and financial information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-8 text-center">
          <p className="text-xs font-medium text-slate-400">
            By continuing, you agree to Vylos's <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-5 group">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-snug">{desc}</p>
      </div>
    </div>
  );
}
