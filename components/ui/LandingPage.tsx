"use client";

import { 
  BarChart3, ChevronRight, Layout, Sparkles, Shield, 
  Zap, TrendingUp, Target, Globe, Lock, ArrowUpRight, 
  Wallet, PieChart, Activity, Fingerprint, Check, Menu, X as CloseIcon 
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { VylosLogo } from "./VylosLogo";
import { TermsModal } from "../modals/TermsModal";
import { PrivacyModal } from "../modals/PrivacyModal";
import { FeedbackModal } from "../modals/FeedbackModal";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="dark vylos-bg-premium min-h-screen w-full flex flex-col relative overflow-x-hidden font-inter selection:bg-blue-500/30">
      
      {/* ─── Navigation ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-8 py-3 shadow-2xl' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center shadow-2xl drop-shadow-xl">
                <VylosLogo iconOnly size="medium" />
              </div>
              <span className="text-2xl font-black tracking-tighter leading-tight overflow-visible pb-1 vylos-wordmark">Vylos</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Security", "Pricing"].map((item) => (
                <button 
                  key={item} 
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-[11px] font-black text-white/60 hover:text-white uppercase tracking-[0.3em] transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/login" className="hidden sm:block text-[11px] font-black text-white/60 hover:text-white uppercase tracking-[0.3em] transition-colors px-4 cursor-pointer">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-white text-blue-600 font-black text-[9px] sm:text-[11px] uppercase tracking-[0.2em] rounded-full hover:bg-blue-50 transition-all active:scale-95 shadow-xl cursor-pointer"
              >
                Get Started
              </Link>
              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-blue-300 transition-colors cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <CloseIcon size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu Drawer ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] sm:top-[88px] z-50 bg-black/95 backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-5 duration-300 flex flex-col p-8 gap-6 border-b border-white/10 shadow-2xl">
          {["Features", "Security", "Pricing"].map((item) => (
            <button 
              key={item} 
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-left text-base font-black text-white/80 hover:text-white uppercase tracking-[0.2em] py-3 border-b border-white/5 cursor-pointer"
            >
              {item}
            </button>
          ))}
          <Link 
            href="/login" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-left text-base font-black text-white/80 hover:text-white uppercase tracking-[0.2em] py-3 border-b border-white/5 cursor-pointer"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-left text-base font-black text-white/80 hover:text-white uppercase tracking-[0.2em] py-3 border-b border-white/5 cursor-pointer"
          >
            Signup
          </Link>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              setFeedbackOpen(true);
            }}
            className="text-left text-base font-black text-white/80 hover:text-white uppercase tracking-[0.2em] py-3 border-b border-white/5 cursor-pointer"
          >
            Feedback
          </button>
        </div>
      )}

      {/* ─── Hero Section ─── */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={12} className="text-blue-300" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">The Intelligent Wealth Companion</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <span className="text-gradient">Govern your</span> <br />
              <span className="text-blue-200/90 italic font-serif">financial destiny.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed max-w-lg mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Vylos combines neural-driven insights with a premium liquid interface to help you track, understand, and explode your net worth. Built for beginners, students, individuals, and growing businesses who want simple financial clarity without complicated tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[14px] uppercase tracking-[0.2em] rounded-[22px] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 group cursor-pointer"
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
      <div className="my-16 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-16 px-6">
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
      <section id="features" className="py-32 lg:py-40 px-6 relative scroll-mt-32">
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
                        desc: "See exactly where your money flows with high-fidelity charts and automated categorisation." 
                    },
                    { 
                        icon: <Target className="text-emerald-400" />, 
                        title: "Goal Engineering", 
                        desc: "Set, track, and crush your financial milestones with intelligent progress forecasting." 
                    },
                    { 
                        icon: <Zap className="text-amber-400" />, 
                        title: "Neural Insights", 
                        desc: "Our AI engine analyses your habits to find hidden growth opportunities you might miss." 
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

      {/* ─── Security Section ─── */}
      <section id="security" className="py-32 lg:py-40 px-6 bg-white/[0.02] border-y border-white/5 relative scroll-mt-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <Shield size={12} className="text-emerald-400" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">Bank-Grade Security</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
              Your security is <br />
              <span className="text-emerald-400 italic font-serif">our absolute priority.</span>
            </h2>
            <p className="text-base text-white/70 font-medium leading-relaxed mb-8">
              Vylos uses secure, privacy-preserving technology to help you track your net worth safely.
            </p>
            <div className="space-y-6">
              {[
                { title: "End-to-End Encryption", desc: "Your data is encrypted in transit and at rest using standard industry-grade protocols." },
                { title: "Isolated Data Storage", desc: "Data access is governed by strict row-level security (RLS) rules, ensuring absolute isolation." },
                { title: "Privacy First Approach", desc: "We support South African POPIA practices to respect and protect your personal details." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{item.title}</h4>
                    <p className="text-xs text-white/50 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="w-72 h-72 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
              <Shield size={80} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
              <span className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2">Security Status</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">Encrypted & Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="py-32 lg:py-40 px-6 relative scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Beta Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Plans built for <span className="text-blue-400 italic font-serif">your growth.</span>
            </h2>
            <p className="text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
              Choose the tier that fits your journey. Get started today in our public beta. Beta users currently receive expanded AI access. Paid plans will include higher AI usage limits, while basic/free usage may remain limited.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Free",
                price: "R0",
                desc: "Fundamental tracking for builders.",
                features: ["Manual transactions", "Personal dashboard", "Standard budgets", "Goal tracking", "Weekly reports"]
              },
              {
                name: "Individual",
                price: "R49",
                desc: "Advanced insights for mastery.",
                features: ["All Free features", "Full analytics suite", "Transaction imports", "Advanced reports", "Vylos Advisor (Limited)"]
              },
              {
                name: "Entrepreneur",
                price: "R99",
                desc: "Blend of personal & business intelligence.",
                features: ["All Individual features", "Business expense suite", "Priority bank imports", "Expanded AI Advisor", "Custom reminders"],
                popular: true
              },
              {
                name: "Business",
                price: "R249",
                desc: "Clarity for your entire team.",
                features: ["All Entrepreneur features", "Multi-user dashboard", "Team access control", "Unlimited AI Advisor", "Priority 24/7 support"]
              }
            ].map((plan, idx) => (
              <div key={idx} className={`glass-card p-8 flex flex-col h-full border-white/5 relative ${plan.popular ? 'ring-2 ring-blue-500/50 shadow-blue-500/20' : ''}`}>
                {plan.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Popular</span>
                )}
                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">/mo</span>
                </div>
                <p className="text-xs text-white/50 font-medium mb-8 leading-relaxed min-h-[36px]">{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-white/70 font-medium">
                      <Check size={12} className="text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup" 
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-center transition-all cursor-pointer ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-500' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-32 lg:py-40 px-6">
        <div className="max-w-5xl mx-auto vylos-glass rounded-[40px] p-12 lg:p-20 text-center relative overflow-hidden border-white/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
            
            <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-8">Ready to grow?</h2>
                <p className="text-xl text-white/60 font-medium mb-12 max-w-xl mx-auto">Join the future of personal finance today. No credit card required to start.</p>
                <Link 
                    href="/signup" 
                    className="inline-flex items-center justify-center px-12 py-5 bg-white text-blue-600 font-black text-[14px] uppercase tracking-[0.2em] rounded-[22px] hover:bg-blue-50 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] cursor-pointer"
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
                <div className="flex items-center justify-center drop-shadow-xl">
                    <VylosLogo iconOnly size="small" />
                </div>
                <span className="text-xl font-black tracking-tighter leading-tight overflow-visible pb-1 vylos-wordmark">Vylos</span>
            </div>
            <div className="flex gap-8 items-center">
                <button 
                  onClick={() => setTermsOpen(true)} 
                  className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] cursor-pointer"
                >
                  Terms
                </button>
                <button 
                  onClick={() => setPrivacyOpen(true)} 
                  className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] cursor-pointer"
                >
                  Privacy
                </button>
                <Link href="/login" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] cursor-pointer">Login</Link>
                <button 
                  onClick={() => setFeedbackOpen(true)} 
                  className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] cursor-pointer"
                >
                  Feedback
                </button>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Track. Understand. Improve. Grow.</span>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">© 2026 Vylos Intelligence. All rights reserved.</p>
            </div>
        </div>
      </footer>

      {/* ─── Legal & Feedback Modals ─── */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

    </div>
  );
}
