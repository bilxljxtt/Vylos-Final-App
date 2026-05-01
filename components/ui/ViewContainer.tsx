"use client";

import React from "react";

interface ViewContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ViewContainer({ children, className = "" }: ViewContainerProps) {
  return (
    <div className={`w-full max-w-[1440px] mx-auto px-8 pb-12 ${className}`}>
      {children}
    </div>
  );
}
