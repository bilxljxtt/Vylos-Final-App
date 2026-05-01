"use client";

import { BarChart3, ChevronRight, Layout } from "lucide-react";
import Link from "next/link";

export function LandingPage() {
  return (
    <div className="w-full h-screen bg-bg flex relative overflow-hidden">
      {/* Decorative Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-acc-blue/10 rounded-full blur-[120px]" />
      
      {/* Content Side */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24 xl:px-32 z-10">
        <div className="absolute top-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
            <Layout className="w-7 h-7 text-white" strokeWidth={3} />
          </div>
          <span className="text-3xl font-black tracking-tighter text-text-main">Vylos</span>
        </div>

        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.25rem] mb-10 border border-primary/20">
            Next-Gen Asset Command
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-text-main mb-10 leading-[0.9] tracking-tighter">
            Govern Your<br />
            <span className="text-primary underline decoration-primary/20">Wealth.</span>
          </h1>
          <p className="text-xl text-text-muted mb-16 max-w-sm font-medium leading-relaxed opacity-80">
            The neural-driven finance companion designed for peak performance financial health and asset growth.
          </p>
          <div className="flex items-center gap-8">
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-10 py-5 bg-primary hover:bg-emerald-400 transition-all text-white font-black rounded-[1.8rem] shadow-2xl shadow-primary/30 text-lg group active:scale-95"
            >
              Get Started
              <ChevronRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-all border-b-2 border-transparent hover:border-primary"
            >
              Entry Point →
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative p-20">
        <div className="relative w-full aspect-square rounded-[5rem] border border-border-main bg-card/60 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden rotate-[-4deg] border-t-border-strong/10 ring-1 ring-border-strong/10 group hover:rotate-0 transition-all duration-1000 ease-out">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50" />
           <div className="relative z-10 flex flex-col items-center gap-8">
             <div className="w-32 h-32 rounded-[2.5rem] bg-bg flex items-center justify-center shadow-2xl ring-1 ring-border-strong/5">
                <BarChart3 size={48} className="text-primary" strokeWidth={2.5} />
             </div>
             <div className="text-center">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Neural Engine</div>
                <div className="text-2xl font-black text-text-main tracking-tight">Active Surveillance</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
