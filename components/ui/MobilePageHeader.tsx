"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

interface MobilePageHeaderProps {
  title: React.ReactNode;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({
  title,
  onBack,
  rightAction
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 dark:border-white/5 shrink-0 w-full mb-2">
      <button 
        type="button"
        onClick={onBack}
        className="mobile-back-button active:scale-95 transition-all shrink-0"
      >
        <ChevronLeft size={14} strokeWidth={3} />
        <span>Home</span>
      </button>
      <div className="text-base font-black text-white tracking-tighter truncate px-2">
        {title}
      </div>
      <div className="shrink-0 flex items-center justify-end min-w-[40px]">
        {rightAction || <div className="w-9 h-9" />}
      </div>
    </div>
  );
};
