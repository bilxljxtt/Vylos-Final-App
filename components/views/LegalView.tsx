"use client";

import React from "react";
import { ViewContainer } from "../ui/ViewContainer";
import { Shield, FileText, ChevronLeft } from "lucide-react";
import { MobilePageHeader } from "../ui/MobilePageHeader";

interface LegalViewProps {
  type: "privacy" | "terms";
  onBack: () => void;
  isMobile?: boolean;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onBack, isMobile = false }) => {
  const isPrivacy = type === "privacy";

  return (
    <ViewContainer className={`flex flex-col pt-4 pb-20 max-w-3xl mx-auto ${isMobile ? 'px-3 max-w-md' : ''}`}>
      {isMobile ? (
        <MobilePageHeader 
          title={isPrivacy ? "Privacy Policy" : "Terms of Service"} 
          onBack={onBack} 
        />
      ) : (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Back to Dashboard</span>
        </button>
      )}

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          {isPrivacy ? <Shield size={24} /> : <FileText size={24} />}
        </div>
        <div>
          <p className="text-text-muted font-medium">Last Updated: May 1, 2026</p>
        </div>
      </div>

      <div className="vylos-glass-readable p-10 prose prose-slate dark:prose-invert max-w-none">
        {isPrivacy ? (
          <div className="space-y-6 text-text-main/80 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">1. Information We Collect</h2>
              <p>Vylos collects financial data you provide (transactions, budgets, goals) to power our intelligence engine. We also collect basic profile information like your name and email.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">2. How We Use Your Data</h2>
              <p>Your data is used exclusively to provide personalized financial insights, track your progress, and help you achieve your savings goals. We do not sell your personal financial records to third parties.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">3. Data Security</h2>
              <p>All data is stored securely using industry-standard encryption. Financial records are isolated per user using Supabase Row Level Security (RLS) to ensure privacy.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">4. Your Rights</h2>
              <p>You have the right to export or delete your data at any time through the Settings panel. Deleting your account will permanently remove all associated financial records.</p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-text-main/80 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">1. Acceptance of Terms</h2>
              <p>By using Vylos, you agree to these terms. If you do not agree, please do not use the platform.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">2. Financial Disclaimer</h2>
              <p>Vylos is a financial tracking and intelligence tool. It does not provide professional financial, investment, or tax advice. Always consult with a certified professional before making major financial decisions.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">3. User Responsibility</h2>
              <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-text-main mb-3 uppercase tracking-tight">4. Limitation of Liability</h2>
              <p>Vylos is provided "as is". We are not liable for any financial losses or damages resulting from the use of our automated insights or tracking features.</p>
            </section>
          </div>
        )}
      </div>
    </ViewContainer>
  );
};
