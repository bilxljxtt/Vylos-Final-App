"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/lib/AppContext";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useAppStore();
  const isPublicRoute = pathname === "/signup";

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme() {
      if (state.userProfile.theme === "Dark") {
        root.classList.add("dark");
      } else if (state.userProfile.theme === "System Default") {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } else {
        root.classList.remove("dark");
      }
    }

    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [state.userProfile.theme]);

  return (
    <>
      {!isPublicRoute && <Sidebar />}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </>
  );
}
