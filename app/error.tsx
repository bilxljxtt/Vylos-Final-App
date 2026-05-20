"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Vylos Global Error:", error);
  }, [error]);

  return (
    <div className="vylos-bg-premium fixed inset-0 flex items-center justify-center p-6 z-[9999]">
      <div className="vylos-glass-modal max-w-md w-full p-10 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
          <AlertTriangle size={40} strokeWidth={2.5} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-text-main tracking-tight">System Interruption</h2>
          <p className="text-sm text-text-muted leading-relaxed font-medium">
            The Vylos engine encountered an unexpected anomaly. We've logged the event and our engineers are investigating.
          </p>
        </div>

        {error.digest && (
          <code className="text-[10px] bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg text-text-muted font-mono opacity-60">
            Error ID: {error.digest}
          </code>
        )}

        <div className="flex flex-col w-full gap-3 mt-4">
          <button
            onClick={() => reset()}
            className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 group"
          >
            <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            Try to Restart Engine
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="btn-secondary w-full py-4 rounded-2xl flex items-center justify-center gap-3"
          >
            <Home size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
