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

const links = [
  { name: "Dashboard",    href: "/",            icon: LayoutDashboard },
  { name: "Budget",       href: "/budget",      icon: Wallet },
  { name: "Goals",        href: "/goals",       icon: Target },
  { name: "AI Architect", href: "/update",      icon: Cpu },
  { name: "Progress",     href: "/progress",    icon: Trophy },
  { name: "Settings",     href: "/settings",    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { toast } = useToast();

  function handleLogout() {
    toast("Logged out successfully", "info");
    setTimeout(() => router.push("/signup"), 800);
  }

  return (
    <aside className="w-[240px] flex-shrink-0 min-h-screen bg-sidebar border-r border-border-main flex flex-col pt-8 pb-8 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 mb-10">
        <div className="w-9 h-9 rounded-xl bg-text-main flex items-center justify-center shadow-sm">
          <span className="text-bg font-black text-sm tracking-tight">V</span>
        </div>
        <span className="text-xl font-black tracking-tight text-text-main">Vylos</span>
      </div>

      {/* User */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-border-subtle border border-transparent transition-colors">
          <div className="w-9 h-9 rounded-full bg-text-main text-bg flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            B
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-main truncate">Bilal</p>
            <p className="text-[10px] text-text-muted font-medium">Analyst · Rank #13</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted px-3 mb-2">
          Navigation
        </p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                isActive
                  ? "bg-border-subtle text-text-main"
                  : "text-text-muted hover:bg-border-subtle hover:text-text-main"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-text-muted group-hover:text-text-main"}`}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 mt-4 pt-4 border-t border-border-main">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:bg-border-subtle transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
