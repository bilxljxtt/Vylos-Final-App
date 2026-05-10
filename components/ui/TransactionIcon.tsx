"use client";

import React, { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 rounded-xl text-sm",
    md: "w-11 h-11 rounded-[14px] text-lg",
    lg: "w-14 h-14 rounded-2xl text-xl",
  };

  const containerSize = sizeClasses[size];

  const logoUrl = 'logo' in iconData ? iconData.logo : undefined;

  // If we have a logo and it hasn't errored out, try to show it
  if (logoUrl && !imgError) {
    return (
      <div className={`flex items-center justify-center shrink-0 shadow-lg border border-white/10 overflow-hidden ${containerSize} ${iconData.bg} ${className}`}>
        <img 
          src={logoUrl} 
          alt={merchant} 
          className="w-full h-full object-contain p-1.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

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
