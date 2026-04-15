"use client";

import { useState } from "react";
import { UserCircle, Bell, Settings as SettingsIcon, CreditCard, FileText, CheckCircle2, Moon, Globe, DollarSign, Landmark, Bot, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";

type TabId = "profile" | "notifications" | "preferences" | "subscription" | "terms";

export default function Settings() {
  const { state, updateProfile, updateNotifications } = useAppStore();
  const { toast } = useToast();

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

  function saveProfile() {
    if (!profileForm.name.trim()) return toast("Name cannot be empty", "error");
    updateProfile({ name: profileForm.name, email: profileForm.email, phone: profileForm.phone });
    toast("Profile saved successfully", "success");
  }

  function savePreferences() {
    updateProfile({ theme, language, currency });
    toast("Preferences saved", "success");
  }

  function toggleNotif(key: keyof typeof state.notifications) {
    updateNotifications({ [key]: !state.notifications[key] });
    toast(`${key.replace(/([A-Z])/g, " $1").trim()} ${!state.notifications[key] ? "enabled" : "disabled"}`, "info");
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
            { id: "notifications", label: "Notifications",          Icon: Bell },
            { id: "preferences",   label: "App Preferences",        Icon: SettingsIcon },
            { id: "subscription",  label: "Subscription",           Icon: CreditCard },
            { id: "terms",         label: "Terms & Conditions",     Icon: FileText },
          ] as { id: TabId; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  {profileForm.name[0]?.toUpperCase()}
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-full border border-border-main text-text-muted font-semibold text-sm hover:bg-border-subtle transition-colors">
                    Change Avatar
                  </button>
                  <button className="text-red-500 font-semibold text-sm hover:text-red-700 transition-colors">Remove</button>
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
                  className="mt-4 px-8 py-3 bg-primary hover:bg-primary-hover transition-colors text-white font-bold rounded-full shadow-md text-sm"
                >
                  Save Changes
                </button>
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
                      className={`w-11 h-6 rounded-full relative transition-all flex-shrink-0 ${
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
                  className="px-8 py-3 bg-primary hover:bg-primary-hover transition-colors text-white font-bold rounded-full shadow-md text-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTION ────────────────────────── */}
          {activeTab === "subscription" && (
            <div className="w-full">
              <h2 className="text-xl font-bold text-text-main mb-2">Subscription Plans</h2>
              <p className="text-text-muted font-medium text-sm mb-8">Choose the perfect plan to accelerate your financial freedom.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Starter */}
                <div className="bg-card border border-border-subtle shadow-sm rounded-[2.5rem] p-7 flex flex-col items-center text-center">
                  <h4 className="text-xs font-black tracking-widest uppercase text-text-muted mb-4">Starter</h4>
                  <h2 className="text-3xl font-black text-text-main mb-7">Free</h2>
                  <ul className="space-y-3 mb-8 text-left w-full">
                    {["Basic Budgeting", "Manual Transaction Entry", "1 Savings Goal"].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <CheckCircle2 className="w-4 h-4 border-border-main flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-auto w-full py-3 rounded-full border border-border-main text-text-muted font-bold shadow-sm text-sm cursor-default">
                    Current Plan
                  </button>
                </div>

                {/* Vylos Go */}
                <div className="bg-primary border-transparent shadow-xl rounded-[2.5rem] p-7 flex flex-col items-center text-center relative transform lg:-translate-y-4">
                  <span className="absolute -top-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </span>
                  <h4 className="text-xs font-black tracking-widest uppercase text-white/70 mb-4 mt-2">Vylos Go</h4>
                  <div className="flex items-baseline gap-1 mb-7">
                    <h2 className="text-3xl font-black text-white">R199</h2>
                    <span className="text-white/70 font-bold text-sm">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left w-full text-white">
                    {["Everything in Free", "Unlimited Savings Goals", "AI Budget Insights", "Automated Bank Sync"].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-white/50 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setUpsellPlan("Vylos Go"); setShowUpsell(true); }}
                    className="mt-auto w-full py-3 rounded-full bg-white text-primary font-black shadow-md transition-colors text-sm"
                  >
                    Upgrade to Go
                  </button>
                </div>

                {/* Vylos Pro */}
                <div className="bg-card border border-border-subtle shadow-sm rounded-[2.5rem] p-7 flex flex-col items-center text-center">
                  <h4 className="text-xs font-black tracking-widest uppercase text-text-muted mb-4">Vylos Pro</h4>
                  <div className="flex items-baseline gap-1 mb-7">
                    <h2 className="text-3xl font-black text-text-main">R399</h2>
                    <span className="text-text-muted font-bold text-sm">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left w-full">
                    {["Everything in Go", "Priority Support", "Investment Tracking", "Wealth Forecasting"].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <CheckCircle2 className="w-4 h-4 text-primary/50 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setUpsellPlan("Vylos Pro"); setShowUpsell(true); }}
                    className="mt-auto w-full py-3 rounded-full border border-primary text-primary font-bold hover:bg-primary/10 transition-colors text-sm"
                  >
                    Upgrade to Pro
                  </button>
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
