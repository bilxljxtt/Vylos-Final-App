"use client";

import { useState } from "react";
import { UserCircle, Bell, Settings as SettingsIcon, CreditCard, FileText, CheckCircle2, ShieldCheck, Moon, Globe, DollarSign, Landmark, Bot, Lock, ChevronUp, ChevronDown } from "lucide-react";

type TabId = 'profile' | 'notifications' | 'preferences' | 'subscription' | 'terms';

const AccountProfile = () => (
   <div className="flex-1 max-w-2xl pl-8 animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-8">Profile Information</h3>
      
      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-12">
         <div className="w-20 h-20 rounded-full bg-[#2a5c54] flex items-center justify-center shadow-lg text-white font-black text-2xl">
            B
         </div>
         <div className="flex items-center gap-4">
            <button className="px-6 py-2 rounded-full border border-gray-200 text-gray-600 font-bold text-sm shadow-sm hover:bg-gray-50 transition">
               Change Avatar
            </button>
            <button className="text-red-500 font-bold text-sm hover:text-red-700 transition">
               Remove
            </button>
         </div>
      </div>

      {/* Forms Layout */}
      <div className="space-y-6">
         <div className="flex flex-col gap-2 relative">
            <span className="absolute -top-2 left-6 bg-white px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Full Name</span>
            <input 
               type="text" 
               className="w-full h-14 rounded-full border border-gray-200 bg-transparent px-8 font-medium text-gray-900 outline-none focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
               defaultValue="Bilal"
            />
         </div>

         <div className="flex flex-col gap-2 relative">
            <span className="absolute -top-2 left-6 bg-white px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</span>
            <input 
               type="email" 
               className="w-full h-14 rounded-full border border-gray-200 bg-transparent px-8 font-medium text-gray-900 outline-none focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
               defaultValue="bilal.t@gmail.com"
            />
         </div>

         <div className="flex flex-col gap-2 relative">
            <span className="absolute -top-2 left-6 bg-white px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Phone Number</span>
            <input 
               type="text" 
               className="w-full h-14 rounded-full border border-gray-200 bg-transparent px-8 font-medium text-gray-900 outline-none focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
               defaultValue="0731099565"
            />
         </div>

         <button className="mt-8 px-8 py-3 bg-[#2a5c54] hover:bg-[#1a3832] transition text-white font-bold rounded-full shadow-md">
           Save Changes
         </button>
      </div>
   </div>
);

const Notifications = () => (
   <div className="flex-1 max-w-3xl pl-8 animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Notification Preferences</h3>
      <p className="text-gray-500 font-medium text-sm mb-10">Manage how and when you receive alerts.</p>
      
      <div className="flex flex-col gap-2">
         {/* Item 1 */}
         <div className="flex items-start justify-between py-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
               <Bell className="w-5 h-5 text-gray-500 mt-1" />
               <div>
                  <h4 className="font-bold text-gray-900 mb-0.5">Budget Alerts</h4>
                  <p className="text-sm font-medium text-gray-500">Get notified when you exceed 80% of your budget</p>
               </div>
            </div>
            {/* Custom Teal Toggle On */}
            <div className="w-12 h-6 bg-[#2a5c54] rounded-full relative cursor-pointer shadow-inner">
               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
         </div>
         
         {/* Item 2 */}
         <div className="flex items-start justify-between py-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
               <CreditCard className="w-5 h-5 text-gray-500 mt-1" />
               <div>
                  <h4 className="font-bold text-gray-900 mb-0.5">Bill Reminders</h4>
                  <p className="text-sm font-medium text-gray-500">Receive alerts 3 days before upcoming bills</p>
               </div>
            </div>
            {/* Custom Teal Toggle On */}
            <div className="w-12 h-6 bg-[#2a5c54] rounded-full relative cursor-pointer shadow-inner">
               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
         </div>

         {/* Item 3 */}
         <div className="flex items-start justify-between py-6">
            <div className="flex items-start gap-4">
               <ShieldCheck className="w-5 h-5 text-gray-500 mt-1" />
               <div>
                  <h4 className="font-bold text-gray-900 mb-0.5">Security Alerts</h4>
                  <p className="text-sm font-medium text-gray-500">Login attempts and password changes</p>
               </div>
            </div>
            {/* Custom Transparent Toggle Off */}
            <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer shadow-inner">
               <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
         </div>
      </div>
   </div>
);

const AppPreferences = () => (
   <div className="flex-1 max-w-2xl pl-8 animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-8">App Preferences</h3>
      
      {/* Appearance */}
      <div className="mb-12">
         <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
           <Moon className="w-4 h-4 text-gray-500" /> Appearance
         </h4>
         <div className="flex items-center gap-4 ml-6">
            {/* Custom Transparent Toggle Off */}
            <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer shadow-inner">
               <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
            <span className="font-medium text-gray-700">Light Mode</span>
         </div>
      </div>

      {/* Localization */}
      <div>
         <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
           Localization
         </h4>
         
         <div className="space-y-6 ml-1">
            <div className="flex flex-col gap-2 relative">
               <span className="flex items-center gap-1.5 text-xs font-medium text-gray-900 mb-1">
                 <Globe className="w-4 h-4 text-gray-500" /> Display Language
               </span>
               <select className="w-full h-12 rounded-2xl border border-gray-200 bg-transparent px-4 font-medium text-gray-900 outline-none appearance-none cursor-pointer focus:border-[#2a5c54] transition">
                  <option>English (US)</option>
               </select>
               <ChevronDown className="absolute right-4 bottom-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex flex-col gap-2 relative">
               <span className="flex items-center gap-1.5 text-xs font-medium text-gray-900 mb-1">
                 <DollarSign className="w-4 h-4 text-gray-500" /> Currency Unit
               </span>
               <select className="w-full h-12 rounded-2xl border border-gray-200 bg-transparent px-4 font-medium text-gray-900 outline-none appearance-none cursor-pointer focus:border-[#2a5c54] transition">
                  <option>South African Rand (R)</option>
               </select>
               <ChevronDown className="absolute right-4 bottom-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
         </div>
      </div>
   </div>
);

const Subscription = () => (
   <div className="flex-1 pl-8 w-full animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Subscription Plans</h3>
      <p className="text-gray-500 font-medium text-sm mb-10">Choose the perfect plan to accelerate your financial freedom.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* Starter Card */}
         <div className="bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center">
            <h4 className="text-xs font-black tracking-widest uppercase text-gray-500 mb-4">Starter</h4>
            <h2 className="text-4xl font-black text-gray-900 mb-8">Free</h2>
            
            <ul className="space-y-4 mb-10 text-left w-full">
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" /> Basic Budgeting
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" /> Manual Transaction Entry
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" /> 1 Savings Goal
               </li>
            </ul>
            
            <button className="mt-auto w-full py-3 rounded-full border border-gray-200 text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition">
               Current Plan
            </button>
         </div>

         {/* Vylos Go Card */}
         <div className="bg-[#6DBB9D] border border-transparent shadow-lg rounded-[2.5rem] p-8 flex flex-col items-center text-center relative transform lg:-translate-y-4">
            <span className="absolute -top-3 bg-[#1c453c] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
               Most Popular
            </span>
            <h4 className="text-xs font-black tracking-widest uppercase text-emerald-900 mb-4 mt-2">Vylos Go</h4>
            <div className="flex items-baseline gap-1 mb-8">
               <h2 className="text-4xl font-black text-gray-900">R199</h2>
               <span className="text-emerald-900 font-bold text-sm">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-10 text-left w-full text-emerald-900">
               <li className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" /> Everything in Free
               </li>
               <li className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" /> Unlimited Savings Goals
               </li>
               <li className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" /> AI Budget Insights
               </li>
               <li className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" /> Automated Bank Sync
               </li>
            </ul>
            
            <button className="mt-auto w-full py-3 rounded-full bg-[#1c453c] hover:bg-gray-900 text-white font-bold shadow-md transition-colors">
               Upgrade to Go
            </button>
         </div>

         {/* Vylos Pro Card */}
         <div className="bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center">
            <h4 className="text-xs font-black tracking-widest uppercase text-gray-500 mb-4">Vylos Pro</h4>
            <div className="flex items-baseline gap-1 mb-8">
               <h2 className="text-4xl font-black text-gray-900">R399</h2>
               <span className="text-gray-400 font-bold text-sm">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-10 text-left w-full">
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" /> Everything in Go
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" /> Priority Support
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" /> Investment Tracking
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" /> Wealth Forecasting
               </li>
            </ul>
            
            <button className="mt-auto w-full py-3 rounded-full border border-[#6DBB9D] text-[#2a5c54] font-bold shadow-sm hover:bg-emerald-50 transition">
               Upgrade to Pro
            </button>
         </div>

      </div>
   </div>
);

const TermsConditions = () => (
   <div className="flex-1 max-w-3xl pl-8 animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-8">Terms & Conditions</h3>
      
      <div className="w-full bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
         
         {/* Document Header */}
         <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#2a5c54] mb-1">Legal Documents</p>
               <h4 className="text-2xl font-black text-gray-900 tracking-tight">Terms & Conditions</h4>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
               Last Updated: Jan 27, 2026
            </span>
         </div>

         {/* Scrollable list */}
         <div className="flex-1 overflow-y-auto max-h-[400px]">
            {/* Accordion 1 (Expanded) */}
            <div className="p-6 border-b border-gray-100">
               <button className="flex items-center justify-between w-full text-left font-bold text-[#2a5c54] mb-4">
                  <span className="flex items-center gap-3"><Landmark className="w-5 h-5" /> 1. Nature of Services</span>
                  <ChevronUp className="w-5 h-5 text-gray-400" />
               </button>
               <p className="text-sm font-medium text-gray-600 leading-relaxed max-w-2xl ml-8">
                  Vylos Finance provides a personal finance management tool that aggregates financial data, provides budget visualization, and offers AI-driven financial insights. The Service is designed to assist users in organizing their financial life but is <strong className="font-bold text-gray-900">not</strong> a substitute for professional financial planning.
               </p>
            </div>

            {/* Accordion 2 */}
            <button className="p-6 border-b border-gray-100 flex items-center justify-between w-full text-left font-bold text-gray-600 hover:bg-gray-50 transition-colors">
               <span className="flex items-center gap-3"><Bot className="w-5 h-5 text-gray-400" /> 2. AI Disclaimer & No Financial Advice</span>
               <ChevronDown className="w-5 h-5 text-gray-300" />
            </button>

            {/* Accordion 3 */}
            <button className="p-6 border-b border-gray-100 flex items-center justify-between w-full text-left font-bold text-gray-600 hover:bg-gray-50 transition-colors">
               <span className="flex items-center gap-3"><Lock className="w-5 h-5 text-gray-400" /> 3. Bank Integration & Data Security</span>
               <ChevronDown className="w-5 h-5 text-gray-300" />
            </button>
         </div>

      </div>
   </div>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const baseNavClass = "flex items-center gap-4 px-6 py-4 rounded-xl text-sm text-left transition-all relative overflow-hidden";
  const activeNavClass = `${baseNavClass} font-bold bg-[#f0f9f6] text-[#2a5c54] shadow-sm`;
  const inactiveNavClass = `${baseNavClass} font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900`;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-emerald-50 text-[#2a5c54] font-bold text-xl italic tracking-tighter">
               VYLOS
            </div>
            <h1 className="text-3xl font-black text-[#2a5c54] tracking-widest uppercase">Vylos</h1>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Settings & Preferences</h2>
        </div>
      </header>

      {/* SETTINGS BUCKET */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex gap-12 w-full min-h-[600px]">
         
         {/* LEFT NAV */}
         <nav className="w-64 flex-shrink-0 flex flex-col gap-2 border-r border-gray-100 pr-8">
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' ? activeNavClass : inactiveNavClass}
            >
               {activeTab === 'profile' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2a5c54]" />}
               <UserCircle className="w-5 h-5" /> Account & Profile
            </button>

            <button 
               onClick={() => setActiveTab('notifications')}
               className={activeTab === 'notifications' ? activeNavClass : inactiveNavClass}
            >
               {activeTab === 'notifications' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2a5c54]" />}
               <Bell className="w-5 h-5" /> Notifications
            </button>

            <button 
               onClick={() => setActiveTab('preferences')}
               className={activeTab === 'preferences' ? activeNavClass : inactiveNavClass}
            >
               {activeTab === 'preferences' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2a5c54]" />}
               <SettingsIcon className="w-5 h-5" /> App Preferences
            </button>

            <button 
               onClick={() => setActiveTab('subscription')}
               className={activeTab === 'subscription' ? activeNavClass : inactiveNavClass}
            >
               {activeTab === 'subscription' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2a5c54]" />}
               <CreditCard className="w-5 h-5" /> Subscription
            </button>

            <button 
               onClick={() => setActiveTab('terms')}
               className={activeTab === 'terms' ? activeNavClass : inactiveNavClass}
            >
               {activeTab === 'terms' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2a5c54]" />}
               <FileText className="w-5 h-5" /> Terms & Conditions
            </button>
            
         </nav>

         {/* RIGHT CONTENT (ROUTER) */}
         {activeTab === 'profile' && <AccountProfile />}
         {activeTab === 'notifications' && <Notifications />}
         {activeTab === 'preferences' && <AppPreferences />}
         {activeTab === 'subscription' && <Subscription />}
         {activeTab === 'terms' && <TermsConditions />}

      </div>
    </div>
  );
}
