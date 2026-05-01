"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-10 right-10 z-[9999] flex flex-col gap-4 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-4 px-6 py-5 rounded-[1.8rem] shadow-2xl border border-white/10 backdrop-blur-3xl animate-in slide-in-from-right-10 fade-in duration-500
              ${t.type === "success" ? "bg-primary text-white shadow-primary/20" : ""}
              ${t.type === "error" ? "bg-rose-500 text-white shadow-rose-500/20" : ""}
              ${t.type === "info" ? "bg-acc-blue text-white shadow-acc-blue/20" : ""}
              ${t.type === "warning" ? "bg-amber-500 text-white shadow-amber-500/20" : ""}
            `}
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {t.type === "success" && <CheckCircle2 size={24} strokeWidth={3} />}
              {t.type === "error" && <AlertCircle size={24} strokeWidth={3} />}
              {t.type === "info" && <Info size={24} strokeWidth={3} />}
              {t.type === "warning" && <AlertCircle size={24} strokeWidth={3} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">
                {t.type === "success" ? "Operation Successful" : "System Notification"}
              </div>
              <div className="text-sm font-black tracking-tight leading-tight">{t.message}</div>
            </div>

            <button 
              onClick={() => removeToast(t.id)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
