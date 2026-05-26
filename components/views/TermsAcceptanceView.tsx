"use client";

import React from "react";
import { ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { TermsAndConditions } from "../legal/TermsAndConditions";
import { VylosLogo } from "../ui/VylosLogo";

interface TermsAcceptanceViewProps {
  onAccept: () => void;
}

export function TermsAcceptanceView({ onAccept }: TermsAcceptanceViewProps) {
  return (
    <div className="vylos-bg-premium fixed inset-0 z-[100] flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 overflow-hidden font-inter">
      
      {/* ─── Background Blobs ─── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl h-full max-h-[900px] vylos-modal-glass rounded-[1.5rem] sm:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-700 relative border border-white/20">
        
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-5 sm:p-8 md:p-10 border-b border-slate-200/20 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 backdrop-blur-xl shrink-0 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shrink-0">
              <ShieldCheck size={24} className="sm:hidden" strokeWidth={2.5} />
              <ShieldCheck size={32} className="hidden sm:block" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Legal Requirement</h2>
              <p className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-white/50 mt-0.5">Please review and accept our terms to continue</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em]">Mandatory Step</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-10 md:p-16 custom-scrollbar relative z-10">
          <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
            
            {/* Context Message */}
            <div className="p-5 sm:p-8 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] sm:rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <p className="text-sm sm:text-base md:text-lg font-medium text-slate-800 dark:text-white/80 leading-relaxed relative z-10">
                Before you can access the <span className="text-blue-400 font-black">Vylos intelligence ecosystem</span>, you must read and agree to our Terms and Conditions. This ensures you understand how our platform works and how we safeguard your financial destiny.
              </p>
            </div>

            {/* Branding Break */}
            <div className="flex flex-col items-center justify-center py-4 sm:py-8 text-center">
                <div className="mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                    <VylosLogo iconOnly size="hero" className="hidden sm:flex" />
                    <VylosLogo iconOnly size="large" className="flex sm:hidden" />
                </div>
                <h3 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2 leading-tight overflow-visible pb-1 vylos-wordmark">Vylos</h3>
                <p className="text-[9px] sm:text-[11px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.4em]">Track. Understand. Improve. Grow.</p>
            </div>

            {/* Main Terms Content */}
            <div className="vylos-glass rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-10 border border-slate-200/20 dark:border-white/10 shadow-2xl relative">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-1.5 h-6 sm:h-8 bg-blue-500 rounded-full" />
                    <h4 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Vylos Terms and Conditions</h4>
                </div>
                <div className="prose dark:prose-invert text-slate-800 dark:text-slate-200 max-w-none text-sm sm:text-base">
                    <TermsAndConditions />
                </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-8 md:p-12 border-t border-slate-200/20 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 backdrop-blur-2xl shrink-0 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
             <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-slate-200/20 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-white/40 bg-slate-900/5 dark:bg-white/5 shadow-inner shrink-0">
                <FileText size={20} className="sm:hidden" />
                <FileText size={24} className="hidden sm:block" />
             </div>
             <div className="flex flex-col">
                <p className="text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-white/60 uppercase tracking-widest leading-tight mb-1">Confirmation</p>
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-white/30 max-w-xs leading-relaxed">
                    By clicking "I Accept", you agree to be bound by the Vylos Terms of Service and Privacy Policy.
                </p>
             </div>
          </div>
          
          <button 
            onClick={onAccept}
            className="w-full sm:w-auto px-8 sm:px-16 py-4 sm:py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 sm:gap-4 uppercase tracking-[0.2em] text-xs sm:text-sm group"
          >
            I Accept and Agree
            <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
