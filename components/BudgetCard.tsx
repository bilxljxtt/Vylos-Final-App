"use client";

import { LucideIcon, Pencil } from "lucide-react";
import { formatMoney } from "@/lib/store";
import { useAppStore } from "@/lib/AppContext";

interface BudgetCardProps {
  title: string;
  icon: LucideIcon;
  amountSpent: number;
  amountLimit: number;
  type?: "target" | "limit";
  onEditLimit?: () => void;
}

export function BudgetCard({
  title,
  icon: Icon,
  amountSpent,
  amountLimit,
  type = "limit",
  onEditLimit,
}: BudgetCardProps) {
  const { state } = useAppStore();
  const isTarget = type === "target";

  const percentageUncapped = amountLimit > 0 ? (amountSpent / amountLimit) * 100 : 0;
  const percentage = Math.min(percentageUncapped, 100);

  const isOverLimit  = !isTarget && amountSpent > amountLimit;
  const isTargetMet  = isTarget && amountSpent >= amountLimit;

  // Colors
  let barColor = "bg-primary";
  let statusText = "Under Control";
  let statusColor = "text-primary";

  if (isTarget) {
    if (isTargetMet) {
      barColor   = "bg-emerald-500";
      statusText = "Target Met! 🎉";
      statusColor = "text-emerald-500";
    } else {
      barColor   = "bg-violet-500";
      statusText = `${percentageUncapped.toFixed(0)}% Funded`;
      statusColor = "text-violet-500";
    }
  } else {
    if (amountSpent === 0) {
      statusText = "No spend yet";
      statusColor = "text-text-muted";
    } else if (isOverLimit) {
      barColor   = "bg-red-500";
      statusText = "⚠️ Over Limit";
      statusColor = "text-red-500";
    } else if (percentageUncapped > 80) {
      barColor   = "bg-amber-500";
      statusText = "Approaching limit";
      statusColor = "text-amber-500";
    }
  }

  const formatZar = (val: number) => formatMoney(val, state.userProfile.country);

  return (
    <div className="group flex items-center bg-card rounded-2xl p-5 shadow-sm border border-border-main gap-5 hover:border-primary transition-all">
      {/* Icon */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl border border-border-subtle bg-border-subtle flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-end justify-between mb-1">
          <h4 className="text-sm font-bold text-text-main">{title}</h4>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isOverLimit ? "text-red-500" : isTarget && !isTargetMet ? "text-violet-500" : "text-text-main"}`}>
              {formatZar(amountSpent)}
            </span>
            {onEditLimit && (
              <button
                onClick={onEditLimit}
                className="transition-colors p-1.5 text-text-muted hover:text-primary rounded-full hover:bg-border-subtle bg-border-main/50"
                title="Edit limit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Limit label */}
        <div className="flex justify-end mb-2">
          <button 
            onClick={onEditLimit}
            className={`text-[10px] font-semibold tracking-wide transition-colors ${onEditLimit ? "text-primary cursor-pointer hover:underline" : "text-text-muted font-semibold"}`}
          >
            / {isTarget ? "Target" : "Limit"}: {formatZar(amountLimit)}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold ${statusColor}`}>{statusText}</span>
          <div className="flex gap-2">
            {!isTarget && (
               <span className={`text-[10px] font-bold ${amountLimit - amountSpent < 0 ? "text-red-500" : "text-emerald-500"}`}>
                 {amountLimit - amountSpent < 0 ? "Over by " : "Left: "}{formatZar(Math.abs(amountLimit - amountSpent))}
               </span>
            )}
            <span className="text-[10px] text-text-muted font-black">
              {percentageUncapped.toFixed(0)}% {isTarget ? "funded" : "used"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
