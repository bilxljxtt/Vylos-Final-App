"use client";

import React from "react";
import { getAvatarUrl } from "@/lib/avatars";

/**
 * Vylos Avatar System
 * Uses DiceBear Avataaars (MIT License - safe for commercial use)
 * Supports priority rendering: ID -> URL -> Default Generated -> Branded Initials
 */

interface VylosAvatarProps {
  url?: string; // This can now be an ID or a URL
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function VylosAvatar({ url, name, size = "md", className = "" }: VylosAvatarProps) {
  const finalUrl = getAvatarUrl(url, name);
  const initials = (name || "V")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-12 h-12 text-xs",
    lg: "w-16 h-16 text-sm",
    xl: "w-24 h-24 text-xl",
    "2xl": "w-32 h-32 text-2xl",
  };

  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/40 bg-white/20 backdrop-blur-md shadow-lg ${sizeClasses[size]} ${className}`}
    >
      <img 
        src={finalUrl} 
        alt="" 
        aria-hidden="true"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback: Gradient + Initials
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.classList.add("bg-gradient-to-br", "from-blue-600", "to-cyan-400");
            const initialsEl = parent.querySelector(".vylos-initials");
            if (initialsEl) initialsEl.classList.remove("opacity-0");
          }
        }}
      />
      <span className="vylos-initials absolute font-black text-white tracking-tighter opacity-0">
        {initials}
      </span>
    </div>
  );
}
