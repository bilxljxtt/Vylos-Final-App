"use client";

import React from "react";
import {
  LayoutGrid,
  Wallet,
  Target,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  Calendar as CalendarIcon,
  Bell,
  Star,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { UserProfile } from "@/lib/store";
import { Permissions, FeatureName } from "@/lib/permissions";
import { VylosAvatar } from "./VylosAvatar";

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  userName: string;
  avatarUrl?: string;
  userProfile: UserProfile;
  onShowFeedback?: () => void;
}

const NAV_ITEMS: { id: string; label: string; icon: any; feature?: FeatureName }[] = [
  { id: "dashboard", label: "Home", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "goals", label: "Goals", icon: Target },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "ai", label: "Vylos Intelligence", icon: Sparkles },
  { id: "analytics", label: "Progress", icon: BarChart3 },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setPage,
  dark,
  setDark,
  userName,
  avatarUrl,
  userProfile,
  onShowFeedback,
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

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const tierLabel =
    userProfile?.subscription_tier === "internal"
      ? "Internal"
      : userProfile?.subscription_tier === "free"
      ? "Free"
      : userProfile?.subscription_tier
      ? userProfile.subscription_tier.charAt(0).toUpperCase() + userProfile.subscription_tier.slice(1)
      : "Free";

  return (
    <aside className="vylos-sidebar w-full h-full flex flex-col overflow-hidden">
      {/* ── User Profile Block ── */}
      <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-4">
        {/* Avatar */}
        <VylosAvatar size="xl" className="border-2 border-white shadow-md !rounded-full bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100" />
        {/* Name */}
        <div className="flex flex-col items-center gap-0.5 w-full text-center mt-1">
          <span className="text-sm font-semibold text-text-main leading-tight truncate max-w-full">
            {userName || "User"}
          </span>
          <span className="text-[11px] text-text-muted truncate max-w-full">
            {userProfile?.email || ""}
          </span>
        </div>
        {/* Tier Badge */}
        <div className="vylos-plus-badge mt-1">
          <Star size={10} fill="currentColor" />
          <span>Vylos{tierLabel !== "Free" ? "+" : ""}</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`sidebar-nav-item ${active ? "active" : ""}`}
            >
              <Icon
                className={`shrink-0 ${active ? "text-primary" : "text-text-muted"}`}
                size={18}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className="text-[13px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="flex flex-col gap-0.5 px-3 py-3 border-t border-border-main">
        {/* Feedback */}
        <button onClick={onShowFeedback} className="sidebar-nav-item">
          <MessageCircle size={16} className="text-text-muted shrink-0" />
          <span className="text-[13px]">Feedback</span>
        </button>

        {/* Sign Out */}
        <button onClick={handleSignOut} className="sidebar-nav-item hover:!text-red-500">
          <LogOut size={16} className="text-text-muted shrink-0" />
          <span className="text-[13px]">Sign out</span>
        </button>

        {/* Version */}
        <div className="text-center pt-1">
          <span className="text-[10px] text-text-muted/40">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
