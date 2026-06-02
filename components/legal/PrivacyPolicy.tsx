"use client";

import React from "react";
import { VylosLogo } from "../ui/VylosLogo";

export function PrivacyPolicy() {
  return (
    <div className="space-y-8 text-text-main leading-relaxed">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <div className="mb-2">
          <VylosLogo iconOnly size="large" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-text-main">Vylos</h1>
        <p className="text-sm font-bold text-primary uppercase tracking-widest">Privacy Policy</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-text-main border-l-4 border-primary pl-4">VYLOS PRIVACY POLICY</h2>
        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-text-muted uppercase tracking-wider bg-card p-4 rounded-2xl border border-border-main">
          <div>Effective Date: May 26, 2026</div>
          <div>Last Updated: May 26, 2026</div>
        </div>
      </section>

      <div className="space-y-6 text-text-main/80 font-medium">
        <section className="space-y-2">
          <h3 className="text-xl font-black text-text-main uppercase tracking-tight">1. Information We Collect</h3>
          <p className="text-text-muted">Vylos collects financial data you provide (transactions, budgets, goals) to power our intelligence engine. We also collect basic profile information like your name and email.</p>
        </section>
        <section className="space-y-2">
          <h3 className="text-xl font-black text-text-main uppercase tracking-tight">2. How We Use Your Data</h3>
          <p className="text-text-muted">Your data is used exclusively to provide personalised financial insights, track your progress, and help you achieve your savings goals. We do not sell your personal financial records to third parties.</p>
        </section>
        <section className="space-y-2">
          <h3 className="text-xl font-black text-text-main uppercase tracking-tight">3. Data Security</h3>
          <p className="text-text-muted">All data is stored securely using industry-standard encryption. Financial records are isolated per user using row-level security (RLS) controls to ensure privacy.</p>
        </section>
        <section className="space-y-2">
          <h3 className="text-xl font-black text-text-main uppercase tracking-tight">4. Your Rights</h3>
          <p className="text-text-muted">You have the right to export or delete your data at any time through the Settings panel. Deleting your account will permanently remove all associated financial records.</p>
        </section>
      </div>
    </div>
  );
}
