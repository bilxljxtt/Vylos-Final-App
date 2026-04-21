"use client";

import { Eye, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";

import { BrandLogo } from "@/components/BrandLogo";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast(error.message, "error");
      setLoading(false);
      return;
    }
    
    toast("Welcome back to Vylos", "success");
    router.push("/");
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-bg overflow-hidden transition-colors duration-300">
      {/* Left: Branding & Messaging */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:pl-32 xl:pr-24 flex-1 bg-sidebar/30 border-r border-border-main relative">
        <div className="absolute top-12 left-12 xl:left-32">
          <BrandLogo size="md" />
        </div>

        <div className="max-w-md">
          <h2 className="text-5xl font-black text-text-main mb-6 leading-tight tracking-tight">
            Ready to reclaim <span className="text-primary">financial clarity?</span>
          </h2>
          <p className="text-lg text-text-muted mb-8 leading-relaxed">
            Sign in to access your dashboard, monitor your goals, and get fresh AI-powered insights.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">✓</div>
              <span className="text-sm font-semibold text-text-main">Bank-level security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">✓</div>
              <span className="text-sm font-semibold text-text-main">Real-time data sync</span>
            </div>
          </div>
        </div>

        {/* Decorative shadow */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Right: Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 lg:hidden">
          <BrandLogo size="sm" />
        </div>

        <div className="w-full max-w-md bg-card rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-primary/5 border border-border-main flex flex-col z-10">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">Welcome Back</h1>
            <p className="text-text-muted font-medium text-sm">Access your financial command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all placeholder:text-text-muted/50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center ml-6">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[11px] font-bold text-primary hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all pr-14 placeholder:text-text-muted/50"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-opacity-90 transition-all text-white font-bold shadow-lg shadow-primary/20 flex justify-center items-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-text-muted font-medium">
            New to Vylos? <Link href="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </div>
        </div>

        {/* Decorative background for mobile */}
        <div className="lg:hidden absolute inset-0 bg-sidebar/10 pointer-events-none" />
      </div>
    </div>
  );
}
