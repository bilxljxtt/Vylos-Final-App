"use client";

import React from "react";
import { X, Scale } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { TermsAndConditions } from "../legal/TermsAndConditions";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer" 
          onClick={onClose} 
        />
        
        <div className="relative vylos-modal-glass border border-border-main w-full max-w-3xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col">
          
          {/* Header */}
          <div className="p-8 border-b border-border-main shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Scale size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-text-main tracking-tight">Terms of Service</h2>
                <p className="text-xs font-medium text-text-muted">Please review our rules and disclaimers</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-text-muted hover:text-text-main hover:bg-border-main/50 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content - Scrollable area */}
          <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar">
            <TermsAndConditions />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border-main bg-bg-mint/30 shrink-0 flex justify-center">
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-emerald-400 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
