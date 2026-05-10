"use client";

import React from "react";
import { Check, Sparkles, Shield, Rocket, Target } from "lucide-react";
import { ViewContainer } from "../ui/ViewContainer";

export const PricingView: React.FC = () => {
  const plans = [
    {
      name: "FREE",
      price: "R0",
      description: "Basic tools to start your journey.",
      icon: <Target className="text-text-muted" />,
      features: [
        "Budgeting",
        "Transactions",
        "Basic insights",
        "Goal tracking",
        "Up to 1 account"
      ],
      buttonText: "Current Plan",
      primary: false
    },
    {
      name: "BASIC PREMIUM",
      price: "R49",
      description: "More power for individual tracking.",
      icon: <Shield className="text-primary" />,
      features: [
        "All Free features",
        "Advanced analytics",
        "Multi-account tracking",
        "Personalised insights",
        "Priority support"
      ],
      buttonText: "Upgrade Now",
      primary: true
    },
    {
      name: "ADVANCED",
      price: "R99",
      description: "Deep insights and predictions.",
      icon: <Sparkles className="text-primary" />,
      features: [
        "All Basic features",
        "Deeper financial insights",
        "Predictive recommendations",
        "Trend reports",
        "Export & integrations"
      ],
      buttonText: "Go Advanced",
      primary: true
    },
    {
      name: "SME TOOLS",
      price: "R149",
      description: "Built for small businesses.",
      icon: <Rocket className="text-primary" />,
      features: [
        "All Advanced features",
        "Business expense tracking",
        "Team access",
        "SME dashboards",
        "API access"
      ],
      buttonText: "Contact Sales",
      primary: true
    }
  ];

  return (
    <ViewContainer className="flex flex-col pt-8 pb-20">
      <div className="flex flex-col mb-12">
        <h1 className="text-4xl font-black text-text-main tracking-tight mb-2">Upgrade Your Experience</h1>
        <p className="text-text-muted font-medium">Choose the plan that fits your financial goals. Unlock advanced AI features and deeper insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${plan.name === "ADVANCED" ? 'ring-2 ring-primary border-primary/20' : ''}`}
          >
            {plan.name === "ADVANCED" && (
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-border-main/50 flex items-center justify-center mb-6">
                {plan.icon}
              </div>
              <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-text-main">{plan.price}</span>
                <span className="text-xs font-bold text-text-muted">/mo</span>
              </div>
              <p className="text-xs font-medium text-text-muted leading-relaxed">{plan.description}</p>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-primary" strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-text-main/80">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                ${plan.name === "FREE" 
                  ? 'bg-border-main/50 text-text-muted cursor-default' 
                  : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-emerald-400 active:scale-95'}
              `}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 p-10 bg-primary/5 border border-primary/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-xl font-black text-text-main tracking-tight">Need a custom plan?</h3>
          <p className="text-sm font-medium text-text-muted leading-relaxed">
            We offer enterprise-grade solutions for large organizations and financial institutions.
          </p>
        </div>
        <button className="px-10 py-4 bg-card text-text-main border border-border-main rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-border-main transition-all active:scale-95">
          Contact Enterprise
        </button>
      </div>

      <div className="mt-12 px-2">
        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Future Revenue Streams</h4>
        <div className="flex flex-wrap gap-x-8 gap-y-2 opacity-50">
          {["Bank integrations", "API monetisation", "Financial institution partnerships", "SME financial services"].map(item => (
            <span key={item} className="text-[10px] font-bold text-text-muted italic">{item}</span>
          ))}
        </div>
      </div>
    </ViewContainer>
  );
};
