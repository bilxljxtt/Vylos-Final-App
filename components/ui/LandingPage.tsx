"use client";

import { 
  BarChart3, ChevronRight, Layout, Sparkles, Shield, 
  Zap, TrendingUp, Target, Globe, Lock, ArrowUpRight, 
  Wallet, PieChart, Activity, Fingerprint 
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="vylos-bg-premium min-h-screen w-full flex flex-col relative overflow-x-hidden font-inter selection:bg-blue-500/30">
      
      {/* ─── Navigation ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-8 py-3 shadow-2xl' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
                <img src="/vylos-logo-final.png" alt="Vylos Logo" className="w-full h-full object-cover p-1.5 bg-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white leading-none">Vylos</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Security", "Pricing"].map((item) => (
                <button key={item} className="text-[11px] font-black text-white/60 hover:text-white uppercase tracking-[0.3em] transition-colors">
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-[11px] font-black text-white/60 hover:text-white uppercase tracking-[0.3em] transition-colors px-4">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-6 py-2.5 bg-white text-blue-600 font-black text-[11px] uppercase tracking-[0.2em] rounded-full hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={12} className="text-blue-300" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">The Intelligent Wealth Companion</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <span className="text-gradient">Govern your</span> <br />
              <span className="text-blue-200/90 italic font-serif">financial destiny.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed max-w-lg mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Vylos combines neural-driven insights with a premium liquid interface to help you track, understand, and explode your net worth.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[14px] uppercase tracking-[0.2em] rounded-[22px] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 group"
              >
                Open Your Account
                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </Link>
              <div className="flex items-center gap-4 text-white/40">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-slate-800 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Joined by 50k+ builders</span>
              </div>
            </div>
          </div>

          {/* Right Visuals (Dashboard Preview) */}
          <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-200">
             {/* Main Card Wrapper */}
             <div className="relative z-10 w-full aspect-[4/3] rounded-[40px] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden rotate-[-2deg] hover:rotate-0 transition-all duration-700 p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-400/5" />
                
                {/* Mock UI Elements */}
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20" />
                            <div className="w-24 h-2 bg-white/20 rounded-full" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/10" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="glass-card p-6 border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <Activity size={18} className="text-emerald-400" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Health</span>
                            </div>
                            <div className="text-3xl font-black text-white">84%</div>
                            <div className="mt-4 h-1.5 bg-white/5 rounded-full">
                                <div className="h-full w-[84%] bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
                            </div>
                        </div>
                        <div className="glass-card p-6 border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <TrendingUp size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Growth</span>
                            </div>
                            <div className="text-3xl font-black text-white">+12.4%</div>
                            <div className="mt-4 flex gap-1">
                                {[30, 50, 40, 70, 55, 90].map((h, i) => (
                                    <div key={i} className="flex-1 bg-blue-400/40 rounded-full" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2 glass-card p-6 border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Wallet size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Net Worth</span>
                                </div>
                                <span className="text-lg font-black text-white">R124,500.00</span>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[65%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                                    <span>Assets</span>
                                    <span>Liabilities</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Floating Elements */}
             <div className="absolute -top-10 -right-10 glass-card p-6 animate-float z-20 border-white/20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Shield size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Security</div>
                        <div className="text-sm font-black text-white">Encrypted</div>
                    </div>
                </div>
             </div>

             <div className="absolute -bottom-6 -left-12 glass-card p-6 animate-float z-20 border-white/20" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">AI Insights</div>
                        <div className="text-sm font-black text-white">Active</div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center lg:justify-between items-center gap-12 opacity-30">
            {[
                { icon: <Shield size={18} />, title: "256-bit encryption" },
                { icon: <Globe size={18} />, title: "Local Compliance" },
                { icon: <Fingerprint size={18} />, title: "Biometric Secure" },
                { icon: <Activity size={18} />, title: "Real-time Monitoring" },
            ].map((b, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="text-white">{b.icon}</div>
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{b.title}</span>
                </div>
            ))}
        </div>
      </div>

      {/* ─── Features Grid ─── */}
      <section className="py-24 lg:py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Powerful tools for <span className="text-blue-200 italic font-serif">modern builders.</span></h2>
                <p className="text-white/60 font-medium max-w-2xl mx-auto">Everything you need to master your money, automated and intelligent.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { 
                        icon: <PieChart className="text-blue-400" />, 
                        title: "Visual Budgeting", 
                        desc: "See exactly where your money flows with high-fidelity charts and automated categorization." 
                    },
                    { 
                        icon: <Target className="text-emerald-400" />, 
                        title: "Goal Engineering", 
                        desc: "Set, track, and crush your financial milestones with intelligent progress forecasting." 
                    },
                    { 
                        icon: <Zap className="text-amber-400" />, 
                        title: "Neural Insights", 
                        desc: "Our AI engine analyzes your habits to find hidden growth opportunities you might miss." 
                    },
                    { 
                        icon: <Lock className="text-indigo-400" />, 
                        title: "Bank-Grade Security", 
                        desc: "Your data is encrypted end-to-end. We never see your credentials, and neither does anyone else." 
                    },
                    { 
                        icon: <ArrowUpRight className="text-cyan-400" />, 
                        title: "Real-Time Sync", 
                        desc: "Connect your accounts and watch your net worth update in real-time as you grow." 
                    },
                    { 
                        icon: <Layout className="text-purple-400" />, 
                        title: "Premium Interface", 
                        desc: "A beautiful, liquid glass experience designed to make financial management a joy." 
                    },
                ].map((f, i) => (
                    <div key={i} className="glass-card p-8 group hover:border-white/20 transition-all border-white/5">
                        <div className="w-14 h-14 rounded-[22px] bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            {f.icon}
                        </div>
                        <h3 className="text-xl font-black text-white mb-4">{f.title}</h3>
                        <p className="text-white/50 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-5xl mx-auto vylos-glass rounded-[40px] p-12 lg:p-20 text-center relative overflow-hidden border-white/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
            
            <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-8">Ready to grow?</h2>
                <p className="text-xl text-white/60 font-medium mb-12 max-w-xl mx-auto">Join the future of personal finance today. No credit card required to start.</p>
                <Link 
                    href="/signup" 
                    className="inline-flex items-center justify-center px-12 py-5 bg-white text-blue-600 font-black text-[14px] uppercase tracking-[0.2em] rounded-[22px] hover:bg-blue-50 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                    Get Started Now
                    <ChevronRight size={20} className="ml-2" strokeWidth={3} />
                </Link>
            </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                    <img src="/vylos-logo-final.png" alt="Logo" className="w-full h-full object-cover p-1.5 bg-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">Vylos</span>
            </div>
            <div className="flex gap-8">
                <Link href="/terms" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em]">Terms</Link>
                <Link href="/privacy" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em]">Privacy</Link>
                <Link href="/login" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em]">Login</Link>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Track. Understand. Improve. Grow.</span>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">© 2024 Vylos Intelligence. All rights reserved.</p>
            </div>
        </div>
      </footer>

    </div>
  );
}
