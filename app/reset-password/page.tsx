"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";
import { Lock, ArrowRight, Shield, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { VylosLogo } from "@/components/ui/VylosLogo";

export default function ResetPassword() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast("Please use the reset link from your email.", "error");
        router.push("/login");
      }
    };
    checkSession();
  }, [router, supabase.auth, toast]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      toast(error.message, "error");
    } else {
      toast("Password updated successfully!", "success");
      router.push("/");
    }
  }

  return (
    <div className="vylos-bg-premium min-h-screen w-full flex items-center justify-center p-6 relative overflow-y-auto overflow-x-hidden font-inter selection:bg-blue-500/30">
      
      {/* ─── Background Blobs ─── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[480px] vylos-glass rounded-[40px] p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center relative group transition-all duration-700 mb-6">
            <VylosLogo size="large" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Secure Account</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-[280px]">
            Set a new strong password to protect your financial data.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-2">
            <Shield size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">New Password</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                placeholder="••••••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                placeholder="••••••••••••" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold tracking-tight text-lg"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-[22px] font-black text-base flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
          >
            {loading ? "Updating..." : "Secure My Account"}
            {!loading && <ChevronRight size={20} strokeWidth={3} />}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link href="/login" className="text-sm font-black text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

