"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/signup";

  return (
    <>
      {!isPublicRoute && <Sidebar />}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </>
  );
}
