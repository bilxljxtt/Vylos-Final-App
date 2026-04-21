"use client";

import { useState, useRef } from "react";
import { UserCircle, Bell, Settings as SettingsIcon, CreditCard, FileText, CheckCircle2, Moon, Globe, DollarSign, Landmark, Bot, Lock, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { createClient } from "@/utils/supabase/client";

type TabId = "profile" | "notifications" | "preferences" | "subscription" | "terms" | "calibration";

export default function Settings() {
  const { state, updateProfile, updateNotifications } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name:  state.userProfile.name,
    email: state.userProfile.email,
    phone: state.userProfile.phone,
  });

  // Preferences
  const [theme, setTheme]     = useState(state.userProfile.theme);
  const [language, setLanguage] = useState(state.userProfile.language);
  const [currency, setCurrency] = useState(state.userProfile.currency);

  // Upsell modal
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellPlan, setUpsellPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPersona, setAiPersona] = useState<{ persona: string; description: string } | null>(null);

  useState(() => {
    if (activeTab === "calibration") loadAIPersonality();
  });

  // Calculate Trial Remaining
  const trialDays = 7;
  const trialStart = state.userProfile.trialStartedAt ? new Date(state.userProfile.trialStartedAt) : null;
  const today = new Date();
  const diffDays = trialStart ? Math.ceil((trialStart.getTime() + trialDays * 24 * 60 * 60 * 1000 - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const daysRemaining = Math.max(0, diffDays);

  async function saveProfile() {
    if (!profileForm.name.trim()) return toast("Name cannot be empty", "error");
    setIsLoading(true);
    try {
      await updateProfile({ name: profileForm.name, email: profileForm.email, phone: profileForm.phone });
      toast("Profile saved successfully", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function savePreferences() {
    setIsLoading(true);
    try {
      await updateProfile({ theme, language, currency });
      toast("Preferences saved", "success");
    } catch (err: any) {
      toast(err.message || "Failed to save preferences", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleNotif(key: keyof typeof state.notifications) {
    setIsLoading(true);
    try {
      await updateNotifications({ [key]: !state.notifications[key] });
      toast(`${key.replace(/([A-Z])/g, " $1").trim()} ${!state.notifications[key] ? "enabled" : "disabled"}`, "info");
    } catch (err: any) {
      toast(err.message || "Failed to update notification preferences", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordReset() {
    setIsUpdatingPassword(true);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(state.userProfile.email as string, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast("Password reset link sent to your email", "success");
    } catch (err: any) {
      toast(err.message || "Failed to send reset link", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function loadAIPersonality() {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "personality", 
          data: { 
            age: state.userProfile.age, 
            income: state.userProfile.monthlyIncome, 
            risk: state.userProfile.riskTolerance,
            household: state.userProfile.householdSize
          } 
        }),
      });
      const data = await response.json();
      if (data.persona) {
        setAiPersona(data);
      }
    } catch (err) {
      console.error("AI Personality Error:", err);
    } finally {
      setAiLoading(false);
    }
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateProfile({ avatarUrl: result });
      toast("Avatar updated successfully!", "success");
    };
    reader.readAsDataURL(file);
  }

  const baseNav  = "flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm text-left transition-all relative overflow-hidden font-medium";
  const activeNav = `${baseNav} bg-primary/10 text-primary font-bold`;
  const inactiveNav = `${baseNav} text-text-muted hover:bg-border-subtle hover:text-text-main`;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">

      <header>
        <h1 className="text-4xl font-black text-text-main tracking-tight">Settings &amp; Preferences</h1>
        <p className="text-text-muted font-medium mt-2">Manage your account, notifications, and app preferences.</p>
      </header>

      <div className="bg-card rounded-[3rem] p-10 shadow-sm border border-border-subtle flex gap-12 w-full min-h-[600px] transition-colors duration-300">

        {/* LEFT NAV */}
        <nav className="w-60 flex-shrink-0 flex flex-col gap-1.5 border-r border-border-subtle pr-8">
          {([
            { id: "profile",       label: "Account & Profile",     Icon: UserCircle },
            { id: "calibration",   label: "Financial Profile",     Icon: TrendingUp },
            { id: "notifications", label: "Notifications",          Icon: Bell },
            { id: "preferences",   label: "App Preferences",        Icon: SettingsIcon },
            { id: "subscription",  label: "Subscription",           Icon: CreditCard },
            { id: "terms",         label: "Terms & Conditions",     Icon: FileText },
          ] as { id: TabId; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === "calibration") loadAIPersonality();
              }}
              className={activeTab === id ? activeNav : inactiveNav}
            >
              {activeTab === id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* RIGHT CONTENT */}
        <div className="flex-1 animate-in fade-in duration-200">

          {/* ── PROFILE ──────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-text-main mb-8">Profile Information</h2>

              <div className="flex items-center gap-5 mb-10">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-lg overflow-hidden">
                  {state.userProfile.avatarUrl ? (
                     <img src={state.userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     profileForm.name[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-full border border-border-main text-text-muted font-semibold text-sm hover:bg-border-subtle transition-colors">
                    Change Avatar
                  </button>
                  <button onClick={() => { updateProfile({ avatarUrl: "" }); toast("Avatar removed", "info"); }} className="text-red-500 font-semibold text-sm hover:text-red-700 transition-colors">Remove</button>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Full Name",     key: "name",  type: "text"  },
                  { label: "Email Address", key: "email", type: "email" },
                  { label: "Phone Number",  key: "phone", type: "tel"   },
                ].map(({ label, key, type }) => (
                  <div key={key} className="relative">
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
                    <input
                      type={type}
                      value={profileForm[key as keyof typeof profileForm]}
                      onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                      className="w-full h-12 rounded-xl border border-border-main bg-transparent px-4 font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                ))}

                <button
                  onClick={saveProfile}
                  disabled={isLoading}
                  className="mt-4 px-8 py-3 bg-primary disabled:opacity-50 hover:bg-primary-hover transition-colors text-white font-bold rounded-full shadow-md text-sm"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>

                <hr className="my-8 border-border-subtle" />
                
                <h3 className="text-sm font-bold text-text-main mb-4">Security</h3>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-text-main">Change Password</h4>
                      <p className="text-xs text-text-muted mt-1">We will send a secure link to your email to reset your password.</p>
                    </div>
                    <button
                      onClick={handlePasswordReset}
                      disabled={isUpdatingPassword}
                      className="px-5 py-2.5 bg-card border border-border-main rounded-xl text-xs font-bold text-text-main hover:bg-border-subtle transition-all disabled:opacity-50"
                    >
                      {isUpdatingPassword ? "Sending..." : "Send Reset Link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FINANCIAL PROFILE ─────────────────────────── */}
          {activeTab === "calibration" && (
            <div className="max-w-2xl space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-main">Financial Profile</h2>
                <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                   <Bot className="w-4 h-4 text-primary" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Assisted Calibration</span>
                </div>
              </div>

              {/* AI Persona Card */}
              <div className="bg-gradient-to-br from-primary to-violet-600 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden">
                 <div className="relative z-10 flex flex-col gap-1">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Financial Persona</p>
                    {aiLoading ? (
                      <div className="h-8 bg-white/20 rounded-xl animate-pulse w-1/2" />
                    ) : aiPersona ? (
                      <div className="animate-in zoom-in-95 duration-500">
                        <h3 className="text-3xl font-black mb-2">{aiPersona.persona}</h3>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-lg">&quot;{aiPersona.description}&quot;</p>
                      </div>
                    ) : (
                      <button onClick={loadAIPersonality} className="text-white/80 hover:text-white text-sm font-bold underline decoration-white/30 underline-offset-4">Generate Financial Persona</button>
                    )}
                 </div>
                 <Bot className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
              </div>
              
              <div className="bg-card border border-border-subtle shadow-sm rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                 <div className="flex flex-col gap-3 relative md:col-span-2">
                   <span className="text-[11px] font-bold text-text-muted ml-6 uppercase tracking-wider">Country of Residence</span>
                   <div className="relative">
                     <Globe className="absolute left-6 top-4 w-5 h-5 text-text-muted" />
                     <select value={state.userProfile.country || ""} onChange={(e) => { updateProfile({ country: e.target.value }); toast("Country updated", "success"); }} className="appearance-none w-full h-14 rounded-xl border border-border-main bg-bg pl-14 pr-6 font-medium text-text-main outline-none focus:border-primary transition cursor-pointer">
                        <option value="">Select Country</option>
                        <option value="South Africa (ZAR)">South Africa</option>
                        <option value="United States (USD)">United States</option>
                        <option value="United Kingdom (GBP)">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="India">India</option>
                        <option value="China">China</option>
                        <option value="Japan">Japan</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Mexico">Mexico</option>
                     </select>
                     <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-text-muted pointer-events-none" />
                   </div>
                 </div>

                 <div className="flex flex-col gap-3 relative">
                   <span className="text-[11px] font-bold text-text-muted ml-6 uppercase tracking-wider">Age</span>
                   <input type="number" min="1" value={state.userProfile.age || ""} onChange={(e) => updateProfile({ age: e.target.value ? Number(e.target.value) : undefined })} onBlur={() => toast("Age updated", "success")} className="w-full h-14 rounded-xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none focus:border-primary transition" />
                 </div>

                 <div className="flex flex-col gap-3 relative">
                   <span className="text-[11px] font-bold text-text-muted ml-6 uppercase tracking-wider">Monthly Income</span>
                   <div className="relative text-text-main font-medium">
                     <span className="absolute left-6 top-4 text-text-muted font-bold"></span>
                     <input type="number" min="1" value={state.userProfile.monthlyIncome || ""} onChange={(e) => updateProfile({ monthlyIncome: e.target.value ? Number(e.target.value) : undefined })} onBlur={() => toast("Monthly income updated", "success")} className="w-full h-14 rounded-xl border border-border-main bg-bg pl-6 pr-6 font-medium text-text-main outline-none focus:border-primary transition" />
                   </div>
                 </div>

                 <div className="flex flex-col gap-3 relative">
                   <span className="text-[11px] font-bold text-text-muted ml-6 uppercase tracking-wider">Household Size</span>
                   <div className="relative">
                     <select value={state.userProfile.householdSize || ""} onChange={(e) => { updateProfile({ householdSize: Number(e.target.value) }); toast("Household size updated", "success"); }} className="appearance-none w-full h-14 rounded-xl border border-border-main bg-bg px-6 font-medium text-text-main outline-none focus:border-primary transition cursor-pointer">
                        <option value="" disabled>Select</option>
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="3">3+ People</option>
                     </select>
                     <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-text-muted pointer-events-none" />
                   </div>
                 </div>

                 <div className="md:col-span-2 mt-4">
                  <div className="flex items-center justify-between mb-8 px-2">
                     <span className="text-[11px] font-bold text-text-muted block uppercase">Risk Tolerance</span>
                     <span className="text-sm font-bold text-primary">
                        {(state.userProfile.riskTolerance ?? 50) < 33 ? 'Conservative' : (state.userProfile.riskTolerance ?? 50) < 66 ? 'Moderate Growth' : 'Aggressive'}
                     </span>
                  </div>
                  
                  <div className="px-4 relative mb-6">
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={state.userProfile.riskTolerance ?? 50} 
                        onChange={(e) => updateProfile({ riskTolerance: Number(e.target.value) })}
                        onMouseUp={() => toast("Risk tolerance updated", "success")}
                        onTouchEnd={() => toast("Risk tolerance updated", "success")}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-border-main"
                     />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ───────────────────────── */}
          {activeTab === "notifications" && (
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-text-main mb-2">Notification Preferences</h2>
              <p className="text-text-muted font-medium text-sm mb-8">Manage how and when you receive alerts.</p>

              <div className="flex flex-col gap-0 divide-y divide-border-subtle">
                {([
                  { key: "budgetAlerts",    label: "Budget Alerts",    desc: "Get notified when you exceed 80% of your budget",     icon: Bell },
                  { key: "billReminders",   label: "Bill Reminders",   desc: "Receive alerts 3 days before upcoming bills",          icon: CreditCard },
                  { key: "securityAlerts",  label: "Security Alerts",  desc: "Login attempts and password changes",                  icon: SettingsIcon },
                ] as { key: keyof typeof state.notifications; label: string; desc: string; icon: React.ElementType }[]).map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-start justify-between py-5">
                    <div className="flex items-start gap-4">
                      <Icon className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-text-main text-sm">{label}</h4>
                        <p className="text-xs font-medium text-text-muted mt-0.5">{desc}</p>
                      </div>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleNotif(key)}
                      disabled={isLoading}
                      className={`w-11 h-6 rounded-full relative transition-all flex-shrink-0 disabled:opacity-50 ${
                        state.notifications[key] ? "bg-primary" : "bg-border-main"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                        state.notifications[key] ? "left-6" : "left-1"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PREFERENCES ─────────────────────────── */}
          {activeTab === "preferences" && (
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-text-main mb-8">App Preferences</h2>

              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-text-main mb-2 uppercase tracking-wider">
                    <Moon className="w-4 h-4 text-text-muted" /> Theme Mode
                  </label>
                  <div className="relative">
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as typeof theme)}
                      className="w-full h-12 rounded-xl border border-border-main bg-card px-4 font-medium text-text-main appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System Default</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-text-muted pointer-events-none" />
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-text-main mb-2 uppercase tracking-wider">
                    <Globe className="w-4 h-4 text-text-muted" /> Display Language
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-12 rounded-xl border border-border-main bg-card px-4 font-medium text-text-main appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option>English (US)</option>
                      <option>Afrikaans</option>
                      <option>Zulu</option>
                      <option>Xhosa</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-text-muted pointer-events-none" />
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-text-main mb-2 uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-text-muted" /> Currency Unit
                  </label>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-12 rounded-xl border border-border-main bg-card px-4 font-medium text-text-main appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option>South African Rand (R)</option>
                      <option>US Dollar ($)</option>
                      <option>British Pound (£)</option>
                      <option>Euro (€)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-text-muted pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={savePreferences}
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary disabled:opacity-50 hover:bg-primary-hover transition-colors text-white font-bold rounded-full shadow-md text-sm"
                >
                  {isLoading ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTION ────────────────────────── */}
          {activeTab === "subscription" && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-text-main">Subscription Plans</h2>
                {state.userProfile.subscriptionStatus === 'trialing' && (
                  <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest">
                    Trial: {daysRemaining} days remaining
                  </div>
                )}
              </div>
              <p className="text-text-muted font-medium text-sm mb-8">Choose the perfect plan to accelerate your financial freedom.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Starter / Basic */}
                <div className={`bg-card border shadow-sm rounded-[2.5rem] p-7 flex flex-col items-center text-center transition-all ${state.userProfile.subscriptionPlan === 'starter' ? 'border-primary ring-1 ring-primary' : 'border-border-subtle'}`}>
                  <h4 className="text-xs font-black tracking-widest uppercase text-text-muted mb-4">Starter</h4>
                  <h2 className="text-3xl font-black text-text-main mb-7">Free</h2>
                  <ul className="space-y-3 mb-8 text-left w-full">
                    {["Basic Budgeting", "Manual Transaction Entry", "1 Savings Goal"].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <CheckCircle2 className="w-4 h-4 text-primary/30 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  {state.userProfile.subscriptionPlan === 'starter' ? (
                    <div className="mt-auto w-full py-3 rounded-full bg-border-subtle text-text-muted font-bold text-sm">
                      Current Plan
                    </div>
                  ) : (
                    <button onClick={() => { updateProfile({ subscriptionPlan: 'starter', subscriptionStatus: 'active' }); toast("Downgraded to Starter", "info"); }} className="mt-auto w-full py-3 rounded-full border border-border-main text-text-muted font-bold hover:bg-border-subtle transition-all text-sm">
                      Switch to Starter
                    </button>
                  )}
                </div>

                {/* Vylos Go */}
                <div className={`border shadow-xl rounded-[2.5rem] p-7 flex flex-col items-center text-center relative transform lg:-translate-y-4 transition-all ${state.userProfile.subscriptionPlan === 'go' ? 'bg-primary border-transparent' : 'bg-card border-border-subtle'}`}>
                  {state.userProfile.subscriptionPlan !== 'go' && (
                    <span className="absolute -top-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}
                  <h4 className={`text-xs font-black tracking-widest uppercase mb-4 mt-2 ${state.userProfile.subscriptionPlan === 'go' ? 'text-white/70' : 'text-text-muted'}`}>Vylos Go</h4>
                  <div className="flex items-baseline gap-1 mb-7">
                    <h2 className={`text-3xl font-black ${state.userProfile.subscriptionPlan === 'go' ? 'text-white' : 'text-text-main'}`}>R199</h2>
                    <span className={`font-bold text-sm ${state.userProfile.subscriptionPlan === 'go' ? 'text-white/70' : 'text-text-muted'}`}>/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left w-full">
                    {["Everything in Free", "Unlimited Savings Goals", "AI Budget Insights", "Automated Bank Sync"].map((f) => (
                      <li key={f} className={`flex items-center gap-3 text-sm font-semibold ${state.userProfile.subscriptionPlan === 'go' ? 'text-white' : 'text-text-muted'}`}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${state.userProfile.subscriptionPlan === 'go' ? 'text-white/50' : 'text-primary/30'}`} /> {f}
                      </li>
                    ))}
                  </ul>
                  {state.userProfile.subscriptionPlan === 'go' ? (
                    <button onClick={() => { updateProfile({ subscriptionStatus: 'canceled' }); toast("Subscription canceled", "info"); }} className="mt-auto w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-black transition-colors text-sm">
                      {state.userProfile.subscriptionStatus === 'canceled' ? "Reactivate Plan" : "Cancel Plan"}
                    </button>
                  ) : (
                    <button
                      onClick={() => { updateProfile({ subscriptionPlan: 'go', subscriptionStatus: 'active' }); toast("Upgraded to Vylos Go!", "success"); }}
                      className="mt-auto w-full py-3 rounded-full bg-primary text-white font-black shadow-md hover:bg-primary-hover transition-colors text-sm"
                    >
                      {state.userProfile.subscriptionStatus === 'trialing' ? 'Activate Go' : 'Upgrade to Go'}
                    </button>
                  )}
                </div>

                {/* Vylos Pro */}
                <div className={`bg-card border shadow-sm rounded-[2.5rem] p-7 flex flex-col items-center text-center transition-all ${state.userProfile.subscriptionPlan === 'pro' ? 'border-primary ring-1 ring-primary' : 'border-border-subtle'}`}>
                  <h4 className="text-xs font-black tracking-widest uppercase text-text-muted mb-4">Vylos Pro</h4>
                  <div className="flex items-baseline gap-1 mb-7">
                    <h2 className="text-3xl font-black text-text-main">R399</h2>
                    <span className="text-text-muted font-bold text-sm">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left w-full">
                    {["Everything in Go", "Priority Support", "Investment Tracking", "Wealth Forecasting"].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <CheckCircle2 className="w-4 h-4 text-primary/30 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  {state.userProfile.subscriptionPlan === 'pro' ? (
                    <button onClick={() => { updateProfile({ subscriptionStatus: 'canceled' }); toast("Subscription canceled", "info"); }} className="mt-auto w-full py-3 rounded-full bg-border-subtle text-text-muted font-bold text-sm">
                      Cancel Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => { updateProfile({ subscriptionPlan: 'pro', subscriptionStatus: 'active' }); toast("Upgraded to Vylos Pro!", "success"); }}
                      className="mt-auto w-full py-3 rounded-full border border-primary text-primary font-bold hover:bg-primary/10 transition-colors text-sm"
                    >
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TERMS ───────────────────────────────── */}
          {activeTab === "terms" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-text-main mb-8">Terms &amp; Conditions</h2>

              <div className="bg-card rounded-3xl border border-border-main overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border-main flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Legal Documents</p>
                    <h3 className="text-xl font-black text-text-main">Terms &amp; Conditions</h3>
                  </div>
                  <span className="text-xs font-bold text-text-muted bg-border-subtle px-3 py-1.5 rounded-full">Updated: Jan 27, 2026</span>
                </div>

                <div className="divide-y divide-border-subtle">
                  {[
                    { icon: Landmark, title: "1. Nature of Services", expanded: true, content: "Vylos Finance provides a personal finance management tool that aggregates financial data, provides budget visualization, and offers AI-driven financial insights. The Service is designed to assist users in organizing their financial life but is not a substitute for professional financial planning." },
                    { icon: Bot,      title: "2. AI Disclaimer & No Financial Advice", expanded: false, content: "" },
                    { icon: Lock,     title: "3. Bank Integration & Data Security",    expanded: false, content: "" },
                  ].map(({ icon: Icon, title, expanded, content }) => (
                    <div key={title} className={`p-5 ${!expanded ? "hover:bg-border-subtle transition-colors cursor-pointer" : ""}`}>
                      <div className="flex items-center justify-between w-full font-bold text-sm">
                        <span className="flex items-center gap-3 text-primary">
                          <Icon className="w-4 h-4" /> {title}
                        </span>
                        {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-border-main" />}
                      </div>
                      {expanded && content && (
                        <p className="text-sm font-medium text-text-muted leading-relaxed max-w-xl ml-7 mt-3">{content}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upsell Modal */}
      <Modal isOpen={showUpsell} onClose={() => setShowUpsell(false)} title={`Upgrade to ${upsellPlan}`} maxWidth="max-w-sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-black text-xl text-text-main">Coming Soon!</h3>
          <p className="text-sm text-text-muted font-medium leading-relaxed">
            {upsellPlan} is launching soon. Drop your email and we&apos;ll notify you when it&apos;s available.
          </p>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full h-11 rounded-xl border border-border-main bg-card px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary text-text-main"
          />
          <button
            onClick={() => { setShowUpsell(false); toast("You're on the waitlist!", "success"); }}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-full text-sm transition-colors"
          >
            Notify Me
          </button>
        </div>
      </Modal>
    </div>
  );
}
