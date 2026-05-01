"use client";

import React from "react";
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, TrendingDown } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";

export const DashboardAIInsight: React.FC<{ engineOutput: any; trends: any; spendByCat: any }> = ({ engineOutput, trends, spendByCat }) => {
  const { formatCurrency } = useAppStore();

  let insightMessage = engineOutput.insightSummary;
  let insightIcon = <Sparkles size={14} className="text-primary" />;
  let alertType = "positive";

  if (engineOutput.healthScore < 40 || engineOutput.burnRateMonths < 1) {
    insightIcon = <AlertTriangle size={14} className="text-red-500" />;
    alertType = "warning";
  } else if (engineOutput.healthScore < 60) {
    insightIcon = <TrendingDown size={14} className="text-amber-500" />;
    alertType = "alert";
  } else if (engineOutput.healthScore >= 80) {
    insightIcon = <TrendingUp size={14} className="text-emerald-500" />;
    alertType = "positive";
  } else {
    insightIcon = <Sparkles size={14} className="text-blue-500" />;
    alertType = "info";
  }

  const bgColors = {
    positive: "bg-emerald-500/10 border-emerald-500/20",
    warning: "bg-red-500/10 border-red-500/20",
    alert: "bg-amber-500/10 border-amber-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
  };

  const textColors = {
    positive: "text-emerald-500",
    warning: "text-red-500",
    alert: "text-amber-500",
    info: "text-blue-500",
  };

  return (
    <div className={`p-5 ${bgColors[alertType as keyof typeof bgColors]} rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shadow-sm`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {insightIcon}
          <span className={`text-[10px] font-black ${textColors[alertType as keyof typeof textColors]} uppercase tracking-widest`}>
            Vylos Intelligence
          </span>
        </div>
        <p className="text-sm font-bold text-text-main leading-relaxed">
          {insightMessage}
        </p>
      </div>
      <button className={`shrink-0 px-4 py-2 bg-card rounded-xl border border-border-main text-xs font-black text-text-main flex items-center gap-2 hover:border-border-strong transition-all shadow-sm`}>
        View Details <ArrowRight size={14} className="text-text-muted" />
      </button>
    </div>
  );
};
