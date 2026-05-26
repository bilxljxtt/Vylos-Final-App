"use client";

import React, { useState } from "react";
import { Permissions } from "@/lib/permissions";
import { UserProfile } from "@/lib/store";
import { Home, Calendar, Wallet, Target, CreditCard, Sparkles, TrendingUp, Bell, Settings, MoreHorizontal } from "lucide-react";

interface V2ShortcutDockProps {
  onPageChange: (page: string) => void;
  currentPage: string;
  userProfile: UserProfile;
}

export const V2ShortcutDock: React.FC<V2ShortcutDockProps> = ({ onPageChange, currentPage, userProfile }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const canUseAI = Permissions.canUseAIAdvisor(userProfile);

  const shortcuts = [
    { label: "Home", icon: Home, page: "dashboard" },
    { label: "Calendar", icon: Calendar, page: "calendar" },
    { label: "Budget", icon: Wallet, page: "budget" },
    { label: "Goals", icon: Target, page: "goals" },
    { label: "Transactions", icon: CreditCard, page: "transactions" },
    { label: "Advisor", icon: Sparkles, page: "ai", premium: true },
    { label: "Progress", icon: TrendingUp, page: "analytics" },
    { label: "Reminders", icon: Bell, page: "reminders" },
    { label: "Settings", icon: Settings, page: "settings" }
  ].filter(s => !s.premium || canUseAI);

  // Split into primary (first 4 items on mobile) and secondary (rest)
  const primaryShortcuts = [
    { label: "Home", icon: Home, page: "dashboard" },
    { label: "Budget", icon: Wallet, page: "budget" },
    { label: "Goals", icon: Target, page: "goals" },
    { label: "Transactions", icon: CreditCard, page: "transactions" }
  ];

  const secondaryShortcuts = shortcuts.filter(
    s => !primaryShortcuts.some(p => p.page === s.page)
  );

  const isSecondaryActive = secondaryShortcuts.some(s => s.page === currentPage);

  return (
    <>
      {/* Backdrop overlay for Mobile "More" menu */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-black/25 dark:bg-black/50 backdrop-blur-[2px] md:hidden animate-in fade-in duration-200" 
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none w-full px-4">
        <div className="relative flex flex-col items-center w-full max-w-[420px] md:max-w-none">
          
          {/* Mobile Floating Glass Menu (Shown above dock when toggle is open) */}
          {isMoreOpen && (
            <div className="md:hidden pointer-events-auto flex flex-wrap justify-around items-center gap-2 p-3.5 mb-3 w-[calc(100vw-2rem)] max-w-[380px] bg-white/40 dark:bg-black/60 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.3)] rounded-3xl animate-in fade-in slide-in-from-bottom-5 duration-200 z-[101]">
              {secondaryShortcuts.map((shortcut, i) => {
                const isActive = currentPage === shortcut.page;
                const IconComponent = shortcut.icon;
                
                return (
                  <button
                    key={i}
                    className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-95 outline-none text-slate-800 dark:text-slate-200"
                    onClick={() => {
                      onPageChange(shortcut.page);
                      setIsMoreOpen(false);
                    }}
                    aria-label={`Navigate to ${shortcut.label}`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110' 
                          : 'bg-white/20 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/10 hover:scale-105'
                        }
                      `}
                    >
                      <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[9px] font-bold mt-1 tracking-tight truncate max-w-full ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {shortcut.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Desktop Layout (Hidden on Mobile) */}
          <div 
            className="hidden md:flex pointer-events-auto items-center justify-center gap-1 md:gap-2 px-3 py-2 rounded-full border border-white/40 dark:border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-x-auto no-scrollbar max-w-full bg-white/20 dark:bg-black/30 backdrop-blur-2xl animate-in fade-in duration-300"
          >
            {shortcuts.map((shortcut, i) => {
              const isActive = currentPage === shortcut.page;
              const IconComponent = shortcut.icon;
              
              return (
                <button 
                  key={i} 
                  className="relative group flex flex-col items-center justify-center shrink-0 vylos-focus-clean rounded-2xl p-1.5 transition-all active:scale-95 outline-none"
                  onClick={() => onPageChange(shortcut.page)}
                  aria-label={`Navigate to ${shortcut.label}`}
                >
                  <div 
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-out
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110' 
                        : 'text-slate-800 dark:text-slate-200 opacity-90 hover:opacity-100 hover:bg-white/30 dark:hover:bg-white/10 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      }
                    `}
                  >
                    <IconComponent 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={`transition-all duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} 
                    />
                  </div>

                  <span className={`text-[10px] font-bold mt-1 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    {shortcut.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Layout (Hidden on Desktop) */}
          <div 
            className="flex md:hidden pointer-events-auto items-center justify-around gap-1 px-3 py-1.5 rounded-full border border-white/40 dark:border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.15)] w-full max-w-[420px] bg-white/20 dark:bg-black/30 backdrop-blur-2xl relative z-[100]"
          >
            {primaryShortcuts.map((shortcut, i) => {
              const isActive = currentPage === shortcut.page;
              const IconComponent = shortcut.icon;
              
              return (
                <button 
                  key={i} 
                  className="relative group flex flex-col items-center justify-center shrink-0 rounded-2xl p-1 transition-all active:scale-95 outline-none"
                  onClick={() => {
                    onPageChange(shortcut.page);
                    setIsMoreOpen(false);
                  }}
                  aria-label={`Navigate to ${shortcut.label}`}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110' 
                        : 'text-slate-800 dark:text-slate-200 opacity-90 hover:opacity-100 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110'
                      }
                    `}
                  >
                    <IconComponent 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={`transition-all duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} 
                    />
                  </div>

                  <span className={`text-[9px] font-bold mt-0.5 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {shortcut.label}
                  </span>
                </button>
              );
            })}

            {/* "More" Toggle Button */}
            <button 
              className="relative group flex flex-col items-center justify-center shrink-0 rounded-2xl p-1 transition-all active:scale-95 outline-none"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              aria-label="Toggle secondary menu"
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out
                  ${isSecondaryActive || isMoreOpen
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110' 
                    : 'text-slate-800 dark:text-slate-200 opacity-90 hover:opacity-100 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110'
                  }
                `}
              >
                <MoreHorizontal 
                  size={20} 
                  strokeWidth={isSecondaryActive || isMoreOpen ? 2.5 : 2} 
                  className={`transition-all duration-300 ${isMoreOpen ? 'rotate-90' : ''}`}
                />
              </div>

              <span className={`text-[9px] font-bold mt-0.5 transition-colors ${isSecondaryActive || isMoreOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                More
              </span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
