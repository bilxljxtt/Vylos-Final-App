"use client";

import React from "react";
import { Check, Sparkles, Shield, Rocket, Target, Zap, Crown, ArrowRight } from "lucide-react";
import { GlassCard } from "../dashboard/v2/GlassCard";
import { ViewContainer } from "../ui/ViewContainer";

interface PricingViewProps {
  onUpgrade: (title: string) => void;
  user: import("@/lib/store").UserProfile;
}

export const PricingView: React.FC<PricingViewProps> = ({ onUpgrade, user }) => {
  const currentTier = user.subscription_tier || 'free';

  const plans = [
    {
      name: "FREE",
      price: "0",
      description: "Fundamental tracking for the disciplined builder.",
      icon: <Target className="text-blue-400" size={24} />,
      features: [
        "Manual transactions",
        "Personal dashboard",
        "Standard budgets",
        "Goal tracking",
        "Weekly reports",
      ],
      buttonText: currentTier === 'free' ? "Active Plan" : "Downgrade",
      disabled: currentTier === 'free',
      tier: 'free',
      color: 'blue'
    },
    {
      name: "INDIVIDUAL",
      price: "49",
      description: "Advanced insights for personal financial mastery.",
      icon: <Shield className="text-emerald-400" size={24} />,
      features: [
        "All Free features",
        "Full analytics suite",
        "Transaction imports",
        "Advanced reports",
        "Vylos Advisor (Limited)"
      ],
      buttonText: currentTier === 'individual' ? "Active Plan" : "Upgrade Now",
      disabled: currentTier === 'individual',
      tier: 'individual',
      color: 'emerald'
    },
    {
      name: "ENTREPRENEUR",
      price: "99",
      description: "Seamless blend of personal and business intelligence.",
      icon: <Crown className="text-amber-400" size={24} />,
      features: [
        "All Individual features",
        "Business expense suite",
        "Priority bank imports",
        "Expanded AI Advisor",
        "Custom reminders"
      ],
      buttonText: currentTier === 'entrepreneur' ? "Active Plan" : "Go Pro",
      disabled: currentTier === 'entrepreneur',
      popular: true,
      tier: 'entrepreneur',
      color: 'amber'
    },
    {
      name: "BUSINESS",
      price: "249",
      description: "Scale your empire with team-wide financial clarity.",
      icon: <Rocket className="text-purple-400" size={24} />,
      features: [
        "All Entrepreneur features",
        "Multi-user dashboard",
        "Team access control",
        "Unlimited AI Advisor",
        "Priority 24/7 support"
      ],
      buttonText: currentTier === 'business' ? "Active Plan" : "Scale Up",
      disabled: currentTier === 'business',
      tier: 'business',
      color: 'purple'
    }
  ];

  return (
    <ViewContainer className="flex flex-col pt-8 pb-4 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
          <Zap size={14} className="text-white fill-white/20" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Tier Selection</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
          Elevate your <span className="text-white italic font-serif opacity-90">financial reach.</span>
        </h1>
        <p className="text-white/80 max-w-2xl text-sm md:text-base font-medium leading-relaxed">
          Choose a plan tailored to your journey. From personal tracking to business intelligence, 
          Vylos provides the tools to build your legacy.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {plans.map((plan) => {
          const isSelected = currentTier === plan.tier;
          return (
            <GlassCard 
              key={plan.name}
              p="p-0"
              className={`flex flex-col h-full relative group transition-all duration-500 !bg-transparent border-none shadow-none ${
                plan.popular ? 'ring-2 ring-blue-500/50 shadow-blue-500/20' : ''
              } ${isSelected ? 'scale-95 opacity-90' : ''}`}
            >
              <div className="vylos-glass-readable p-8 flex flex-col h-full !rounded-[32px]">
              {/* Top Highlight for Popular */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 z-20" />
              )}

              {/* Card Content */}
              <div className="p-8 flex flex-col h-full">
                {/* Badge */}
                <div className="flex justify-between items-start mb-10">
                  <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    {plan.icon}
                  </div>
                  {plan.popular && (
                    <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 animate-pulse">
                      Popular
                    </div>
                  )}
                  {isSelected && !plan.popular && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-300">
                      Current
                    </div>
                  )}
                </div>

                {/* Pricing Info */}
                <div className="mb-8">
                  <h3 className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">R{plan.price}</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-400 tracking-tight">/ month</span>
                  </div>
                  <p className="mt-4 text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="flex-1 space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 group/feat">
                      <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-blue-600 transition-colors">
                        <Check size={10} className="text-blue-600 dark:text-blue-400 group-hover/feat:text-white" strokeWidth={3} />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover/feat:text-slate-900 dark:group-hover/feat:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => !plan.disabled && onUpgrade(plan.name)}
                  disabled={plan.disabled}
                  className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${
                    plan.disabled 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default' 
                      : 'bg-blue-600 text-white shadow-2xl shadow-blue-500/20 hover:bg-blue-500 active:scale-[0.98]'
                  }`}
                >
                  <span className="relative z-10">{plan.buttonText}</span>
                  {!plan.disabled && (
                    <ArrowRight size={16} strokeWidth={3} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                  )}
                  {/* Hover Reflection Effect */}
                  {!plan.disabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
          );
        })}
      </div>

      {/* Enterprise / Custom Section */}
      <div className="mt-24 relative group">
        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="vylos-glass-readable p-10 md:p-16 relative z-10 overflow-visible">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex flex-col gap-6 max-w-xl text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 border border-blue-100 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                  <Rocket size={28} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Vylos for Enterprise</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed">
                Empower your large-scale organisation with custom integrations, dedicated account managers, 
                and private AI models. Built for financial institutions and high-volume asset managers.
              </p>
            </div>
            
            <button 
              onClick={() => onUpgrade("Enterprise Solution")}
              className="px-12 py-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 shrink-0"
            >
              Contact Solutions
            </button>
          </div>
        </div>
      </div>

      {/* Roadmap / Future Footer */}
      <div className="mt-20 border-t border-white/10 pt-12 flex flex-col gap-8 opacity-60 hover:opacity-100 transition-opacity">
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6">Upcoming Infrastructure</h4>
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            {[
              { label: "Global Bank Aggregation", icon: <Shield size={12} /> },
              { label: "Institutional API Access", icon: <Target size={12} /> },
              { label: "B2B Financial Reporting", icon: <Check size={12} /> },
              { label: "Wealth Management Portals", icon: <Sparkles size={12} /> }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-blue-200">{item.icon}</span>
                <span className="text-[11px] font-black text-white tracking-widest uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ViewContainer>
  );
};
