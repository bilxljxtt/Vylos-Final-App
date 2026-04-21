"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Target,
  Cpu,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";
import { useToast } from "./Toast";
import { useAppStore } from "@/lib/AppContext";
import { createClient } from "@/utils/supabase/client";
import { BrandLogo } from "./BrandLogo";
import { useTranslation } from "@/lib/i18n";

const links = [
  { name: "dashboard",    href: "/",            icon: LayoutDashboard },
  { name: "budgets",      href: "/budget",      icon: Wallet },
  { name: "goals",        href: "/goals",       icon: Target },
  { name: "AI Advisor",   href: "/update",      icon: Cpu }, // Kept as AI Advisor for consistency
  { name: "progress",     href: "/progress",    icon: Trophy },
  { name: "settings",     href: "/settings",    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { toast } = useToast();
  const { state } = useAppStore();
  const supabase = createClient();
  const { t } = useTranslation();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast("Logged out successfully.", "info");
    router.push("/login");
  }

  return (
    <aside className="w-[220px] flex-shrink-0 min-h-screen bg-sidebar border-r border-border-main flex flex-col pt-8 pb-8 transition-colors duration-300">
      {/* Logo */}
      <div className="px-6 mb-12">
        <BrandLogo size="md" />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1.5 px-4 mt-2">

        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[13px] transition-all relative ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-text-muted hover:bg-border-subtle hover:text-text-main"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-text-muted group-hover:text-text-main"}`}
              />
              {t(link.name)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Identity Block */}
      <div className="px-4 mt-auto pt-6 flex flex-col gap-2">
        <Link 
          href="/settings"
          className="flex items-center gap-2 p-2 rounded-xl transition-colors cursor-pointer hover:bg-border-subtle"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 overflow-hidden relative">
            {state.userProfile.avatarUrl ? (
              <img src={state.userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              state.userProfile.name[0]?.toUpperCase() || "A"
            )}
          </div>
          <div className="min-w-0 flex-1 flex items-center justify-between">
            <p className="text-sm font-bold text-text-main truncate">{state.userProfile.name || "Alex Morgan"}</p>
            <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[9px] font-bold tracking-wider ml-1">PRO</span>
          </div>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          {t("settings")} - Sign Out
        </button>
      </div>
    </aside>
  );
}
