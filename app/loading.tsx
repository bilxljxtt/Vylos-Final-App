"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="vylos-bg-premium fixed inset-0 flex flex-col items-center justify-center z-[9999]">
      <div className="relative">
        {/* Pulsing Glow */}
        <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse rounded-full" />
        
        {/* Vylos Logo / Icon (Placeholder text for now) */}
        <div className="relative text-white font-black text-4xl tracking-tighter mb-8 animate-float">
          VYLOS
        </div>
      </div>

      {/* Premium Loading Bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent w-full h-full animate-loading-bar" />
      </div>
      
      <p className="mt-6 text-[10px] font-black text-blue-200/60 uppercase tracking-[0.3em] animate-pulse">
        Initializing Intelligence
      </p>
    </div>
  );
}
