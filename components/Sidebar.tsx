"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  Target, 
  RefreshCw, 
  TrendingUp, 
  Trophy, 
  Settings, 
  LogOut 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Budget", href: "/budget", icon: Wallet },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Update", href: "/update", icon: RefreshCw },
    { name: "Investments", href: "/investments", icon: TrendingUp },
    { name: "Progress Board", href: "/progress", icon: Trophy },
    { name: "Settings", href: "/settings", icon: Settings }
  ];

  return (
    <aside className="w-[260px] flex-shrink-0 min-h-screen bg-white flex flex-col pt-8 pb-8 border-r border-gray-100">
      <div className="flex items-center gap-3 px-8 mb-10">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
          <span className="text-emerald-700 font-bold text-sm">V</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">Vylos</span>
      </div>

      <div className="px-8 mb-10">
        <div className="w-10 h-10 rounded-full bg-[#2a5c54] text-white flex items-center justify-center font-semibold mb-2 shadow-sm">
          B
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-colors ${
                isActive 
                  ? "bg-[#6DBB9D]/80 text-[#143d35] shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#2a5c54]" : ""}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-8 mt-auto">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
