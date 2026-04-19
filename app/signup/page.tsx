"use client";

import { Eye, Phone, Globe, ShieldCheck, Lock, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [riskValue, setRiskValue] = useState(65);

  return (
    <div className="min-h-full w-full flex flex-col items-center bg-[#f5f9f8] px-4 py-8 pb-32">
       
       {/* Public Navbar */}
       <nav className="w-full max-w-7xl flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-emerald-50 text-[#2a5c54] font-bold text-lg italic tracking-tighter">
               VYLOS
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight uppercase">Vylos</span>
          </div>
          <div className="text-sm font-medium text-gray-600">
             Already have an account? <Link href="/" className="font-bold text-gray-900 hover:text-[#2a5c54] transition-colors">Log in</Link>
          </div>
       </nav>

       {/* Hero Intro */}
       <div className="flex flex-col items-center text-center max-w-2xl mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-4">
             Secure Your Financial Future
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
             We need a few details to tailor your AI financial plan.<br/>
             Let's build your financial blueprint together.
          </p>

          <div className="bg-[#f59e0b] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md flex items-center gap-2">
             <span className="text-[10px] tracking-widest uppercase">///</span>
             This is a Beta test. We do not store your actual bank credentials.
          </div>
       </div>

       {/* Mega Signup Form Card */}
       <div className="w-full max-w-5xl bg-white rounded-[3rem] p-10 md:p-14 shadow-sm border border-gray-100 flex flex-col space-y-16">
          
          {/* Section 1: Credentials */}
          <section>
             <h3 className="text-xl font-bold text-gray-900 tracking-tight">Account Credentials</h3>
             <p className="text-sm font-medium text-gray-500 mb-8 mt-1">These will be used to sign in to your account.</p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 relative">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Full Name</span>
                   <input 
                      type="text" 
                      placeholder="Jane Doe"
                      className="w-full h-14 rounded-full border border-gray-200 bg-transparent px-6 font-medium text-gray-900 outline-none placeholder-gray-400 focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
                   />
                </div>
                
                <div className="flex flex-col gap-2 relative">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Phone Number</span>
                   <div className="relative">
                     <Phone className="absolute left-6 top-4 w-5 h-5 text-gray-400" />
                     <input 
                        type="text" 
                        placeholder="(082) 123-4567"
                        className="w-full h-14 rounded-full border border-gray-200 bg-transparent pl-14 pr-6 font-medium text-gray-900 outline-none placeholder-gray-400 focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
                     />
                   </div>
                </div>

                <div className="flex flex-col gap-2 relative md:col-span-2">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Email Address</span>
                   <input 
                      type="email" 
                      placeholder="name@example.com"
                      className="w-full h-14 rounded-full border border-gray-200 bg-transparent px-6 font-medium text-gray-900 outline-none placeholder-gray-400 focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
                   />
                </div>

                <div className="flex flex-col gap-2 relative md:col-span-2">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Password</span>
                   <div className="relative">
                     <input 
                        type="password" 
                        placeholder="Create a secure password"
                        className="w-full h-14 rounded-full border border-gray-200 bg-transparent px-6 font-medium text-gray-900 outline-none placeholder-gray-400 focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition pr-14"
                     />
                     <button className="absolute right-5 top-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-5 h-5" />
                     </button>
                   </div>
                </div>
             </div>
          </section>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Section 2: Calibration */}
          <section>
             <h3 className="text-xl font-bold text-gray-900 tracking-tight">Economic Status Calibration</h3>
             <p className="text-sm font-medium text-gray-500 mb-8 mt-1">Precise demographic data is required for algorithmic modeling.</p>

             <div className="bg-[#f9fbfb] border border-gray-100 rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
               
               <div className="flex flex-col gap-2 relative md:col-span-2">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Country of Residence</span>
                   <div className="relative">
                     <Globe className="absolute left-6 top-4 w-5 h-5 text-gray-400" />
                     <select className="appearance-none w-full h-14 rounded-full border border-gray-200 bg-transparent pl-14 pr-6 font-medium text-gray-900 outline-none focus:border-[#2a5c54] transition cursor-pointer">
                        <option>South Africa (ZAR)</option>
                     </select>
                   </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Chronological Age</span>
                   <input 
                      type="number" 
                      placeholder="32"
                      className="w-full h-14 rounded-full border border-gray-200 bg-transparent px-6 font-medium text-gray-900 outline-none placeholder-gray-400 focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
                   />
                </div>

                <div className="flex flex-col gap-2 relative">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Total Household Income</span>
                   <div className="relative text-gray-900 font-medium">
                     <span className="absolute left-6 top-4 text-gray-500 font-bold">R</span>
                     <input 
                        type="text" 
                        placeholder="1,250,000"
                        className="w-full h-14 rounded-full border border-gray-200 bg-transparent pl-12 pr-6 font-medium text-gray-900 outline-none placeholder-gray-400 focus:border-[#2a5c54] focus:ring-1 focus:ring-[#2a5c54] transition"
                     />
                   </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                   <span className="text-[11px] font-bold text-gray-900 ml-4">Household Size</span>
                   <select defaultValue="" className="appearance-none w-full h-14 rounded-full border border-gray-200 bg-transparent px-6 font-medium text-gray-900 outline-none focus:border-[#2a5c54] transition cursor-pointer">
                      <option value="" disabled>Select size</option>
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3+ People</option>
                   </select>
                </div>

             </div>
          </section>

          {/* Section 3: Financial Goals */}
          <section>
             <h3 className="text-xl font-bold text-gray-900 tracking-tight">Financial Goals & Risk</h3>
             <p className="text-sm font-medium text-gray-500 mb-8 mt-1">Select your strategic objectives and define your volatility threshold.</p>

             <div className="bg-[#f9fbfb] border border-gray-100 rounded-[2rem] p-8 relative flex flex-col gap-10">
               
               <div>
                  <span className="text-[11px] font-bold text-gray-900 ml-2 block mb-4">Strategic Objectives</span>
                  <div className="flex flex-wrap gap-3">
                     <button className="px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm font-medium text-sm text-gray-700 hover:border-[#6DBB9D] hover:text-[#2a5c54] transition-all">
                        Retirement Planning
                     </button>
                     <button className="px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm font-medium text-sm text-gray-700 hover:border-[#6DBB9D] hover:text-[#2a5c54] transition-all">
                        Debt Repayment
                     </button>
                     <button className="px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm font-medium text-sm text-gray-700 hover:border-[#6DBB9D] hover:text-[#2a5c54] transition-all">
                        Real Estate Investment
                     </button>
                     <button className="px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm font-medium text-sm text-gray-700 hover:border-[#6DBB9D] hover:text-[#2a5c54] transition-all">
                        Tax Optimization
                     </button>
                  </div>
               </div>

               <div>
                  <div className="flex items-center justify-between mb-8 px-2">
                     <span className="text-[11px] font-bold text-gray-900 block">Risk Tolerance Index</span>
                     <span className="text-sm font-bold text-[#2a5c54]">
                        {riskValue < 33 ? 'Conservative' : riskValue < 66 ? 'Moderate Growth' : 'Aggressive'}
                     </span>
                  </div>
                  
                  <div className="px-4 relative mb-6">
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={riskValue} 
                        onChange={(e) => setRiskValue(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2a5c54]"
                        style={{ background: `linear-gradient(to right, #2a5c54 ${riskValue}%, #e5e7eb ${riskValue}%)` }}
                     />
                     <div className="absolute top-1/2 -mt-2 -ml-3 w-5 h-5 bg-[#2a5c54] rounded-full shadow-md pointer-events-none transition-transform" style={{ left: `calc(${riskValue}%)` }} />
                  </div>
                  
                  <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                     <span>Conservative</span>
                     <span>Moderate</span>
                     <span>Aggressive</span>
                  </div>
               </div>

             </div>
          </section>

          {/* Form Footer Action */}
          <div className="flex flex-col gap-4 mt-8">
             <div className="bg-[#f4f7f6] rounded-full py-4 flex items-center justify-center gap-2 text-gray-500 text-xs font-bold tracking-tight">
                <Lock className="w-4 h-4" /> Bank-level 256-bit encryption protocol
             </div>
             <button 
                onClick={() => router.push("/")}
                className="w-full h-16 rounded-full bg-[#2a5c54] hover:bg-[#1a3832] transition-colors text-white font-bold text-lg shadow-lg"
             >
                Initialize Account
             </button>
             <p className="text-center text-xs font-medium text-gray-400 mt-2">
                By proceeding, you agree to our Terms of Service and Privacy Policy.
             </p>
          </div>

       </div>
    </div>
  );
}
