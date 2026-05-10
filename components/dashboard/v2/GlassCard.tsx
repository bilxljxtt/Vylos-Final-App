"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  p?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", p = "p-8" }) => {
  return (
    <div className={`vylos-glass-readable ${p} ${className} transition-all duration-500 hover:scale-[1.01] overflow-hidden`}>
      {children}
    </div>
  );
};
