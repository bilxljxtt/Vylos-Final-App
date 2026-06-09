"use client";

import React from 'react';
import { getTransactionIcon } from '@/lib/merchantIcons';

interface TransactionIconProps {
  merchant: string;
  category: string;
  type?: 'income' | 'expense';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TransactionIcon: React.FC<TransactionIconProps> = ({ 
  merchant, category, type = 'expense', size = 'md', className = "" 
}) => {
  const iconData = getTransactionIcon(merchant, category, type);

  const sizeClasses = {
    sm: "w-8 h-8 rounded-xl text-sm",
    md: "w-11 h-11 rounded-[14px] text-lg",
    lg: "w-14 h-14 rounded-2xl text-xl",
  };

  const containerSize = sizeClasses[size];

  // Fallback to Icon or Initials
  return (
    <div className={`flex items-center justify-center shrink-0 shadow-lg border border-white/10 ${containerSize} ${iconData.bg} ${className}`}>
      {iconData.icon || (
        <span className="font-black uppercase tracking-tighter">
          {(merchant || category || "?")[0]}
        </span>
      )}
    </div>
  );
};
