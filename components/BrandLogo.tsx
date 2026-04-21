"use client";

import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
}

export function BrandLogo({ className = "", size = "md", hideText = false }: BrandLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-lg",
    lg: "w-10 h-10 text-2xl"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${iconSizes[size]} rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20`}>
        V
      </div>
      
      {/* Brand Name */}
      {!hideText && (
        <span className={`${textSizes[size]} font-bold tracking-tight text-primary`}>
          Vylos
        </span>
      )}
    </div>
  );
}
