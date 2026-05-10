"use client";

import React from "react";

interface ViewContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ViewContainer({ children, className = "" }: ViewContainerProps) {
  return (
    <div className={`w-full max-w-[1400px] mx-auto ${className}`}>
      {children}
    </div>
  );
}
