"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useToast } from "@/components/Toast";

export const TopHeader: React.FC<{ title: string }> = ({ title }) => {
  const { toast: showToast } = useToast();

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-bg/80 sticky top-0 z-20 backdrop-blur-md border-b border-border-main">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-black text-text-main uppercase tracking-widest">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={() => showToast("No new notifications", "info")}
          className="relative text-text-muted hover:text-text-main transition-colors group"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border-strong shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
            alt="User avatar" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
