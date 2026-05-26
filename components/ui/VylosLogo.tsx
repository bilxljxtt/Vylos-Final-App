"use client";

import React, { useState } from "react";
import Image from "next/image";

interface VylosLogoProps {
  className?: string;
  size?: "small" | "medium" | "large" | "hero";
  iconOnly?: boolean;
}

export const VylosLogo: React.FC<VylosLogoProps> = ({ 
  className = "", 
  size = "medium",
  iconOnly = false
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    small: "h-6",
    medium: "h-10",
    large: "h-16",
    hero: "h-32",
  };

  const textClasses = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl",
    hero: "text-7xl",
  };

  const imgHeightClass = sizeClasses[size] || sizeClasses.medium;
  const textSizeClass = textClasses[size] || textClasses.medium;

  return (
    <div className={`relative flex items-center gap-3 select-none ${className}`}>
      {hasError ? (
        <span className={`font-black tracking-tighter text-slate-900 dark:text-white ${textSizeClass}`}>
          {iconOnly ? "V" : "Vylos"}
        </span>
      ) : (
        <>
          <div className={`${imgHeightClass} aspect-square rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0 border border-white/10 drop-shadow-sm`}>
            <img
              src="/vylos%20branded%20logo.jpeg?v=1"
              alt="Vylos Logo"
              onError={() => setHasError(true)}
              className="h-full w-full object-cover scale-[0.95] translate-x-[-1.02%] translate-y-[3.6%] transition-transform duration-300"
              draggable={false}
            />
          </div>
          {!iconOnly && (
            <span className={`font-black tracking-tighter leading-tight overflow-visible pb-1 ${textSizeClass} vylos-wordmark`}>
              Vylos
            </span>
          )}
        </>
      )}
    </div>
  );
};
