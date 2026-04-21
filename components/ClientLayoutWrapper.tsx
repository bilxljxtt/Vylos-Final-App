"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/lib/AppContext";
import AIChat from "./ai/AIChat";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, sessionUser, isAuthLoaded } = useAppStore();
  
  // Designate routes that should NEVER show the sidebar
  const isAuthPage = ["/login", "/signup"].includes(pathname);
  // Show sidebar only if logged in AND not on an auth page.
  // When user is on "/" and logged in, showSidebar will be true.
  // When user is on "/" and NOT logged in, showSidebar will be false because sessionUser is null.
  const showSidebar = isAuthLoaded && !!sessionUser && !isAuthPage;

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

  if (!isAuthLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen w-full ${showSidebar ? "flex-row" : "flex-col"}`}>
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? "overflow-y-auto" : ""}`}>
        {children}
      </main>
      {showSidebar && <AIChat />}
    </div>
  );
}
