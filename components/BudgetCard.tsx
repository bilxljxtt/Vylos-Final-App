"use client";

import { LucideIcon } from "lucide-react";

interface BudgetCardProps {
  title: string;
  icon: LucideIcon;
  amountSpent: number;
  amountLimit: number;
  type?: "target" | "limit";
}

export function BudgetCard({
  title,
  icon: Icon,
  amountSpent,
  amountLimit,
  type = "limit"
}: BudgetCardProps) {
  const isTarget = type === "target";
  
  // Prevent division by zero mathematically, default to 0% width
  const percentageUncapped = amountLimit > 0 ? (amountSpent / amountLimit) * 100 : 0;
  const percentage = Math.min(percentageUncapped, 100);
  
  // Logic states
  const isOverLimit = !isTarget && amountSpent > amountLimit;
  const isTargetMet = isTarget && amountSpent >= amountLimit;

  // Determine colors based on thresholds
  let barColorClass = "bg-[#2a5c54]"; // Default teal green for under control limits
  let statusText = "Under Control";
  let statusColorClass = "text-[#2a5c54]";
  
  if (isTarget) {
     if (isTargetMet) {
        barColorClass = "bg-[#2a5c54]"; // Solid green
        statusText = "Target Met! 🎉";
        statusColorClass = "text-[#2a5c54] font-bold";
     } else {
        barColorClass = "bg-[#99d6c3]"; // Lighter teal tracking progress
        statusText = `${percentageUncapped.toFixed(0)}% Funded`;
        statusColorClass = "text-[#2a5c54]";
     }
  } else {
     if (isOverLimit) {
        barColorClass = "bg-red-500";
        statusText = "⚠️ Over Limit ⚠️";
        statusColorClass = "text-red-500";
     }
  }

  // Formatting helpers
  const formatZar = (val: number) => 
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
      .format(val).replace('ZAR', 'R');

  return (
    <div className="flex items-center bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-500" strokeWidth={2} />
      </div>
      
      <div className="flex-1 min-w-0">
         {/* Top Row: Title vs Spent Amount */}
         <div className="flex items-end justify-between mb-1">
            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
            <div className="text-right">
               <span className={`text-sm font-bold ${isOverLimit ? 'text-red-500' : isTarget && !isTargetMet ? 'text-[#2a5c54]' : 'text-gray-900'}`}>
                 {formatZar(amountSpent)}
               </span>
            </div>
         </div>
         
         {/* Middle Row: Progress Track */}
         <div className="flex justify-end mb-2">
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide">
              / {isTarget ? 'Target' : 'Limit'}: {formatZar(amountLimit)}
            </span>
         </div>
         
         {/* The Progress Bar */}
         <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${barColorClass}`} 
              style={{ width: `${percentage}%` }}
            />
         </div>
         
         {/* Bottom Row: Status Text */}
         <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${statusColorClass}`}>
              {statusText}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {isTarget ? 'funded' : 'used'}
            </span>
         </div>
      </div>
    </div>
  );
}
