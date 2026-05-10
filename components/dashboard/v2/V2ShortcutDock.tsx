"use client";

import React from "react";
import { Permissions } from "@/lib/permissions";
import { UserProfile } from "@/lib/store";
import { Home, Calendar, Wallet, Target, CreditCard, Sparkles, TrendingUp, Bell, Settings } from "lucide-react";

interface V2ShortcutDockProps {
  onPageChange: (page: string) => void;
  currentPage: string;
  userProfile: UserProfile;
}

export const V2ShortcutDock: React.FC<V2ShortcutDockProps> = ({ onPageChange, currentPage, userProfile }) => {
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

  return (
    <>
      {/* Bottom background support overlay for contrast */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-200/40 via-slate-100/10 to-transparent dark:from-slate-900/60 dark:via-slate-900/20 pointer-events-none z-[90] backdrop-blur-[2px]" />
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none w-full px-4">
        
        {/* Liquid Glass Pill Container */}
        <div 
          className="pointer-events-auto flex items-center justify-center gap-1 md:gap-2 px-3 py-2 rounded-full border border-white/40 dark:border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-x-auto no-scrollbar max-w-full bg-white/20 dark:bg-black/30 backdrop-blur-2xl"
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
                {/* Removed tooltip label */}

                {/* Icon Container */}
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

                {/* Permanent Label below icon */}
                <span className={`text-[10px] font-bold mt-1 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  {shortcut.label}
                </span>
              </button>
            )
          })}
        </div>

      </div>
    </>
  );
};
