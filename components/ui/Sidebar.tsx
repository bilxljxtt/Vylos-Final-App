"use client";

import React from "react";
import { 
  LayoutGrid, 
  Wallet, 
  Target, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  CreditCard,
  Calendar as CalendarIcon,
  Zap,
  MessageCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  userName: string;
  avatarUrl?: string;
  isPro?: boolean;
  onShowFeedback?: () => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "goals", label: "Goals", icon: Target },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "ai", label: "Vylos Advisor", icon: MessageSquare },
  { id: "analytics", label: "Progress", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setPage, 
  dark, 
  setDark, 
  userName,
  avatarUrl,
  isPro = true,
  onShowFeedback
}) => {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Signed out successfully", "success");
      router.push("/login");
    }
  }

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-border-main flex flex-col py-8 px-6 shrink-0 sticky top-0 transition-all duration-300">
      {/* Logo Section */}
      <div className="flex items-center gap-4 mb-12 px-1">
        <div className="w-12 h-12 rounded-full border border-[#00A86B]/10 flex items-center justify-center overflow-hidden shrink-0">
          <img src="/logo.png" alt="Vylos Logo" className="w-full h-full object-cover scale-[1.1]" />
        </div>
        <span className="text-3xl font-bold tracking-tight text-[#00A86B]">
          Vylos
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                ${active 
                  ? "bg-bg-mint text-primary shadow-sm shadow-primary/5" 
                  : "text-text-muted hover:bg-border-main hover:text-text-main"
                }
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto flex flex-col gap-4 pt-6">
        {/* Feedback Button */}
        <button 
          onClick={onShowFeedback}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-border-main hover:text-text-main transition-all group"
        >
          <MessageCircle className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="tracking-tight">Give Feedback</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center justify-between gap-3 bg-card border border-border-main p-3 rounded-2xl shadow-sm hover:border-border-strong transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fd8489] via-[#f9a6d4] to-[#80aefe] flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform shrink-0 overflow-hidden">
               {avatarUrl ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-text-main truncate tracking-tight">{userName}</span>
              {isPro && (
                <span className="text-[9px] font-bold text-primary flex items-center gap-1">
                  Vylos Intelligence
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all group"
            title="Sign Out"
          >
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Version */}
        <div className="flex items-center justify-center px-2">
          <span className="text-[10px] font-bold text-text-muted/50">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
