"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/Toast";
import { BrandLogo } from "@/components/BrandLogo";

export default function ResetPassword() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return toast("Passwords do not match", "error");
    if (password.length < 6) return toast("Password must be at least 6 characters", "error");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast(error.message, "error");
      setLoading(false);
      return;
    }

    setDone(true);
    toast("Password updated successfully", "success");
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md bg-card rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-primary/5 border border-border-main flex flex-col relative overflow-hidden">
        
        <div className="mb-10 flex flex-col items-center text-center">
          <BrandLogo size="md" className="mb-8" />
          <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">
            {done ? "All Set!" : "Reset Password"}
          </h1>
          <p className="text-text-muted font-medium text-sm">
            {done ? "Your password has been updated. Redirecting..." : "Choose a new secure password for your Vylos account."}
          </p>
        </div>

        {!done ? (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all pr-14"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-6">Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-14 rounded-2xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-opacity-90 transition-all text-white font-bold shadow-lg shadow-primary/20 flex justify-center items-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? (
                <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Updating...
                </>
              ) : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 scale-in-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
