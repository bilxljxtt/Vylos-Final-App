"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { TermsModal } from "../modals/TermsModal";

interface TermsAcceptanceFieldProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error?: string;
}

export function TermsAcceptanceField({ accepted, onChange, error }: TermsAcceptanceFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4 group cursor-pointer" onClick={() => onChange(!accepted)}>
        <div 
          className={`
            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-0.5
            ${accepted 
              ? "bg-primary border-primary shadow-lg shadow-primary/30" 
              : "bg-border-subtle/50 border-border-main hover:border-primary/50"
            }
            ${error ? "border-rose-500/50" : ""}
          `}
        >
          {accepted && <Check size={14} className="text-white" strokeWidth={4} />}
        </div>
        
        <p className="text-sm font-medium text-text-muted leading-relaxed select-none">
          I have read and agree to the{" "}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="text-primary font-black hover:underline underline-offset-4 decoration-primary/30 transition-all"
          >
            Vylos Terms and Conditions
          </button>.
        </p>
      </div>

      {error && (
        <p className="text-xs font-bold text-rose-500 ml-10 animate-in slide-in-from-left-2 duration-300">
          {error}
        </p>
      )}

      <TermsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
