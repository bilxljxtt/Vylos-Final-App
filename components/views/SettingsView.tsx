"use client";

import React, { useState } from "react";
import { 
  Camera, Edit2, ShieldCheck, Lock, Bell, 
  LogOut, ChevronRight, Globe, Moon, Sun,
  Smartphone, Mail, User, Phone, CheckCircle2,
  UserCircle, Palette, Zap, CreditCard, Shield,
  ExternalLink, ChevronDown
} from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { AppState, UserProfile, NotificationPrefs } from "@/lib/store";
import { createClient } from "@/utils/supabase/client";
import { AvatarPickerModal } from "../modals/AvatarPickerModal";
import { VylosAvatar } from "../ui/VylosAvatar";

interface SettingsViewProps {
  state: AppState;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  showToast: (message: string, type?: any) => void;
  dark: boolean;
  setDark: (val: boolean) => void;
  setPage: (val: string) => void;
  onUpgrade: (title: string) => void;
}

export function SettingsView({ 
  state, 
  updateProfile, 
  showToast, 
  dark, 
  setDark, 
  setPage, 
  onUpgrade 
}: SettingsViewProps) {
  const { updateNotifications } = useAppStore();
  const supabase = createClient();

  const [profile, setProfile] = useState({
    name: state.userProfile.name || "",
    email: state.userProfile.email || "",
    phone: state.userProfile.phone || "",
    currency: state.userProfile.currency || "R",
    theme: state.userProfile.theme || (dark ? "Dark" : "Light")
  });

  const [toggles, setToggles] = useState<NotificationPrefs>({
    budgetAlerts: state.notifications.budgetAlerts,
    goalUpdates: state.notifications.goalUpdates,
    billReminders: state.notifications.billReminders,
    weeklySummary: state.notifications.weeklySummary,
    securityAlerts: state.notifications.securityAlerts || true,
  });

  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleToggle = (key: keyof NotificationPrefs) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        currency: profile.currency,
        theme: profile.theme as any
      });
      await updateNotifications(toggles);
      showToast("Settings updated successfully!", "success");
    } catch (err: any) {
      showToast("Error saving settings: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast("Logout failed: " + error.message, "error");
    } else {
      window.location.href = "/login";
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setProfile(prev => ({ ...prev, theme: newTheme as any }));
    if (newTheme === "Dark") setDark(true);
    else if (newTheme === "Light") setDark(false);
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
    }
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button 
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none vylos-focus ${checked ? 'bg-primary' : 'bg-border-main'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xl ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
    </button>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
             <Zap size={12} className="text-primary" />
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">Configuration Console</span>
          </div>
          <h2 className="text-5xl font-black text-text-main tracking-tighter leading-none">Settings</h2>
          <p className="text-sm font-bold text-text-muted mt-2 opacity-60">Manage your Vylos identity and platform preferences.</p>
        </div>
        <button 
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`px-10 py-5 bg-primary hover:bg-emerald-400 text-white rounded-[22px] text-[14px] font-black shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-3 vylos-focus uppercase tracking-widest ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Synchronizing...' : 'Save Changes'}
          <CheckCircle2 size={18} strokeWidth={3} />
        </button>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Profile Glass Card */}
          <div className="vylos-glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <UserCircle size={140} />
            </div>
            
            <div className="relative mb-8">
              <VylosAvatar 
                url={state.userProfile.avatarUrl} 
                name={state.userProfile.name} 
                size="2xl" 
                className="!rounded-[2.5rem] bg-black/10 dark:bg-white/10 border-4 border-white/20 shadow-2xl" 
              />
              <button 
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="absolute bottom-[-4px] right-[-4px] w-12 h-12 bg-white/10 dark:bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 text-primary hover:scale-110 transition-transform vylos-focus group/avatar"
                title="Choose Avatar"
                aria-label="Choose built-in avatar"
              >
                <Edit2 size={20} strokeWidth={2.5} className="group-hover/avatar:rotate-12 transition-transform" />
              </button>
            </div>

            <h3 className="text-2xl font-black text-text-main mb-1 tracking-tight">{state.userProfile.name || "Vylos User"}</h3>
            <p className="text-sm font-bold text-text-muted mb-6 opacity-60">{state.userProfile.email}</p>
            
            <div className="flex items-center gap-2 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full mb-10">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                {state.userProfile.subscription_tier === 'free' ? 'Standard Tier' : 'Premium Member'}
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-black/5 dark:bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50 mb-1">Rank</span>
                <span className="text-lg font-black text-text-main">{state.userProfile.currentRank || "Novice"}</span>
              </div>
              <div className="bg-black/5 dark:bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50 mb-1">XP Points</span>
                <span className="text-lg font-black text-text-main">{state.userProfile.totalXp?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Security & Actions */}
          <div className="vylos-glass-panel p-8 flex flex-col gap-4">
            <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.3em] mb-4 px-4 opacity-40">Account Integrity</h4>
            
            <button 
              type="button"
              onClick={() => showToast("Security link dispatched to email.", "info")}
              className="flex items-center justify-between w-full p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] transition-all group vylos-focus border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Lock size={20} /></div>
                <span className="text-sm font-black text-text-main">Rotate Password</span>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-between w-full p-5 bg-red-500/5 hover:bg-red-500/10 rounded-[2rem] transition-all group border border-red-500/10 vylos-focus"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><LogOut size={20} /></div>
                <span className="text-sm font-black text-red-600">Terminate Session</span>
              </div>
              <ChevronRight size={18} className="text-red-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Identity Section */}
          <div className="vylos-glass-panel p-10 flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3.5 bg-primary rounded-3xl text-white shadow-2xl shadow-primary/30">
                <Edit2 size={24} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-text-main tracking-tighter">Public Identity</h4>
                <p className="text-xs font-bold text-text-muted opacity-60">Manage your profile visibility and contact info.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Display Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full vylos-glass-input rounded-[2rem] pl-14 pr-6 py-5 text-sm font-black text-text-main outline-none transition-all placeholder:text-text-muted/30 vylos-focus"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 opacity-60">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Email Identity (Read-Only)</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-6 py-5 text-sm font-black text-text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Phone Link</label>
                <div className="relative">
                  <Phone size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
                  <input 
                    type="tel" 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="+27 00 000 0000"
                    className="w-full vylos-glass-input rounded-[2rem] pl-14 pr-6 py-5 text-sm font-black text-text-main outline-none transition-all placeholder:text-text-muted/30 vylos-focus"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Fiscal Currency</label>
                <div className="relative">
                  <Globe size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
                  <select 
                    value={profile.currency}
                    onChange={e => setProfile({...profile, currency: e.target.value})}
                    className="w-full vylos-glass-input rounded-[2rem] pl-14 pr-12 py-5 text-sm font-black text-text-main outline-none transition-all appearance-none cursor-pointer vylos-focus"
                  >
                    <option value="R">ZAR (R)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Visual Interface */}
            <div className="vylos-glass-panel p-10 flex flex-col">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3.5 bg-indigo-500 rounded-3xl text-white shadow-2xl shadow-indigo-500/30">
                  <Palette size={24} />
                </div>
                <h4 className="text-xl font-black text-text-main tracking-tight">App Experience</h4>
              </div>
              <div className="flex flex-col gap-8">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main">Vylos Theme</span>
                    <span className="text-[11px] font-bold text-text-muted opacity-60">System default or manual override</span>
                  </div>
                  <div className="flex bg-black/10 dark:bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                    {["System Default", "Light", "Dark"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleThemeChange(t)}
                        className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all vylos-focus ${
                          profile.theme === t 
                            ? 'bg-primary text-white shadow-xl border border-white/20' 
                            : 'text-text-muted hover:text-text-main'
                        }`}
                      >
                        {t === "System Default" ? "System" : t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center bg-black/10 dark:bg-white/5 p-5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main">Trust Badges</span>
                    <span className="text-[11px] font-bold text-text-muted opacity-60">Show security status in UI</span>
                  </div>
                  <ToggleSwitch checked={true} onChange={() => {}} />
                </div>
              </div>
            </div>

            {/* Neural Notifications */}
            <div className="vylos-glass-panel p-10 flex flex-col">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3.5 bg-emerald-500 rounded-3xl text-white shadow-2xl shadow-emerald-500/30">
                  <Bell size={24} />
                </div>
                <h4 className="text-xl font-black text-text-main tracking-tight">Intelligence Alerts</h4>
              </div>

              <div className="flex flex-col gap-6">
                {[
                  { k: 'budgetAlerts', t: 'Budget Guard', d: 'Alert at 80% limit' },
                  { k: 'billReminders', t: 'Payment Engine', d: 'Upcoming bill alerts' },
                  { k: 'goalUpdates', t: 'Milestone Pulse', d: 'Goal achievement pings' },
                  { k: 'securityAlerts', t: 'Shield Alerts', d: 'Login & auth changes' },
                ].map((item) => (
                  <div key={item.k} className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-text-main leading-tight">{item.t}</span>
                      <span className="text-[10px] font-bold text-text-muted opacity-60 uppercase tracking-widest mt-0.5">{item.d}</span>
                    </div>
                    <ToggleSwitch 
                      checked={toggles[item.k as keyof NotificationPrefs]} 
                      onChange={() => handleToggle(item.k as keyof NotificationPrefs)} 
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      <AvatarPickerModal 
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatarId={state.userProfile.avatarUrl}
        onSelect={(id) => updateProfile({ avatarUrl: id })}
      />
    </div>
  );
}
