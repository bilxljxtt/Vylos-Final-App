"use client";

import React, { useState } from "react";
import { User, FileText, Moon, Sun, Save, CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { ViewContainer } from "../ui/ViewContainer";
import { ToastType } from "../Toast";

interface SettingsViewProps {
  state: any;
  updateProfile: (profile: any) => Promise<void>;
  showToast: (msg: string, type?: ToastType) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  setPage: (page: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ state, updateProfile, showToast, dark, setDark, setPage }) => {
  const [activeSection, setActiveSection] = useState("profile");
  const [name, setName] = useState(state.userProfile.name || "");
  const [currency, setCurrency] = useState(state.userProfile.currency || "USD");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const sections = [
    { id: "profile", label: "Profile", sub: "Manage your personal information", icon: <User size={18} /> },
    { id: "subscription", label: "Subscription", sub: "Billing & Plan Management", icon: <CreditCard size={18} /> },
    { id: "legal", label: "Legal", sub: "Terms and Conditions", icon: <FileText size={18} /> },
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name,
        currency,
        theme: dark ? "Dark" : "Light"
      });
      showToast("Profile saved successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save profile", "error");
    }
    setLoading(false);
  };

  const handleThemeToggle = () => {
    const newDark = !dark;
    setDark(newDark);
    updateProfile({ theme: newDark ? "Dark" : "Light" }).catch(e => console.error(e));
  };

  return (
    <ViewContainer className="flex flex-col pt-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col mb-10">
        <h1 className="text-4xl font-black text-text-main tracking-tight mb-2">Settings</h1>
        <p className="text-text-muted font-medium">Manage your account and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: Navigation Sidebar */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                if (section.id === "legal") {
                  setShowTerms(true);
                } else {
                  setActiveSection(section.id);
                  setShowTerms(false);
                }
              }}
              className={`
                flex items-center gap-4 p-5 rounded-2xl border transition-all text-left
                ${activeSection === section.id && !showTerms
                  ? "bg-card border-border-main shadow-sm" 
                  : section.id === "legal" && showTerms
                    ? "bg-card border-border-main shadow-sm"
                    : "bg-transparent border-transparent hover:bg-border-main/20 text-text-muted hover:text-text-main"
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0
                ${(activeSection === section.id && !showTerms) || (section.id === "legal" && showTerms)
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : "bg-border-main/50 text-text-muted"
                }
              `}>
                {section.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight">{section.label}</span>
                <span className="text-[10px] font-medium opacity-60">{section.sub}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {!showTerms ? (
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-main/30">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black text-text-main tracking-tight">Profile Information</h2>
                  <p className="text-sm font-medium text-text-muted opacity-80 mt-1">Update your personal information and display preferences.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-border-main rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Email Address (Read-only)</label>
                    <input 
                      type="email" 
                      value={state.userProfile.email || ""}
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-border-main rounded-xl px-4 py-3 text-text-muted opacity-70 outline-none font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-main/30">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Preferred Currency</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-border-main rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="South African Rand (ZAR)">South African Rand (ZAR) - R</option>
                      <option value="US Dollar (USD)">US Dollar (USD) - $</option>
                      <option value="Euro (EUR)">Euro (EUR) - €</option>
                      <option value="British Pound (GBP)">British Pound (GBP) - £</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">App Theme</label>
                    <div className="flex items-center gap-4 mt-1">
                      <button 
                        onClick={handleThemeToggle}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold transition-all ${
                          !dark ? "bg-primary text-white border-primary" : "bg-card border-border-main text-text-muted hover:text-text-main"
                        }`}
                      >
                        <Sun size={18} strokeWidth={2.5} />
                        Light
                      </button>
                      <button 
                        onClick={handleThemeToggle}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold transition-all ${
                          dark ? "bg-slate-800 text-white border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]" : "bg-card border-border-main text-text-muted hover:text-text-main"
                        }`}
                      >
                        <Moon size={18} strokeWidth={2.5} />
                        Dark
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          ) : activeSection === "subscription" ? (
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-main/30">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black text-text-main tracking-tight">Subscription & Billing</h2>
                  <p className="text-sm font-medium text-text-muted opacity-80 mt-1">Manage your plan and billing preferences.</p>
                </div>
              </div>

              <div className="bg-bg-mint border border-primary/20 rounded-[2rem] p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <Zap size={32} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Current Plan</span>
                    <h3 className="text-2xl font-black text-text-main capitalize">
                      {state.userProfile.subscriptionPlan || "Starter"} Plan
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-text-muted capitalize">Status: {state.userProfile.subscriptionStatus || "Active"}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setPage("pricing")}
                  className="px-8 py-4 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  Change Plan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] border border-border-main bg-card/50">
                   <h4 className="text-sm font-black text-text-main mb-2">Billing Method</h4>
                   <p className="text-xs font-medium text-text-muted mb-4">No payment method on file. Free trial active.</p>
                   <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Update Payment</button>
                </div>
                <div className="p-6 rounded-[2rem] border border-border-main bg-card/50">
                   <h4 className="text-sm font-black text-text-main mb-2">Next Invoice</h4>
                   <p className="text-xs font-medium text-text-muted mb-4">You are currently on a free plan.</p>
                   <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">View Billing History</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border-main rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-2xl font-black text-text-main tracking-tight mb-6">Terms and Conditions</h2>
              <div className="prose prose-sm dark:prose-invert text-text-muted">
                <p><strong>Last Updated: June 2024</strong></p>
                <p>Welcome to Vylos. By using our application, you agree to these Terms and Conditions. Please read them carefully.</p>
                <h3 className="text-text-main font-bold mt-6 mb-2">1. User Accounts</h3>
                <p>You must maintain the security of your account. You are fully responsible for all activities that occur under the account.</p>
                <h3 className="text-text-main font-bold mt-6 mb-2">2. Financial Data</h3>
                <p>Vylos provides financial insights based on the data you provide. We do not guarantee the absolute accuracy of projections and cannot be held liable for financial decisions made based on this software.</p>
                <h3 className="text-text-main font-bold mt-6 mb-2">3. Privacy</h3>
                <p>Your data is encrypted. We do not sell your personal financial data to third parties. Refer to our Privacy Policy for more details.</p>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </ViewContainer>
  );
};
