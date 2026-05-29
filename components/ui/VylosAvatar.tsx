"use client";

import React from "react";
import { User } from "lucide-react";

interface VylosAvatarProps {
  url?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function VylosAvatar({ size = "md", className = "" }: VylosAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 28,
    xl: 40,
    "2xl": 56,
  };

  return (
    <div 
      className={`relative rounded-full flex items-center justify-center shrink-0 border border-white/20 dark:border-white/10 bg-slate-100 dark:bg-white/5 backdrop-blur-md shadow-lg ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <User 
        size={iconSizes[size] || 22} 
        className="text-slate-700 dark:text-white/80" 
        strokeWidth={2.5}
      />
    </div>
  );
}
