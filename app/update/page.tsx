"use client";

import { Wallet, MapPin, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface QuickCommandCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function QuickCommandCard({ icon: Icon, title, description }: QuickCommandCardProps) {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative hover:border-[#6DBB9D] transition-colors cursor-pointer group">
      <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-gray-300 group-hover:text-[#2a5c54] transition-colors" opacity={0.5} />
      
      <div className="w-10 h-10 rounded-full bg-[#f0f9f6] flex items-center justify-center border border-emerald-50 mb-4">
         <Icon className="w-5 h-5 text-[#2a5c54]" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">{title}</h3>
      <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-[200px]">
         {description}
      </p>
    </div>
  );
}

export default function Update() {
  return (
    <div className="min-h-full flex flex-col items-center justify-start pt-16 px-8 max-w-4xl mx-auto pb-20">
      
      {/* Center Hero */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="flex items-center gap-6 mb-10">
           <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg border-8 border-[#f4f9f8]">
              <div className="w-24 h-24 rounded-full border border-gray-100 flex items-center justify-center p-2 shadow-sm">
                 <span className="text-[#2a5c54] font-bold text-xl italic tracking-tighter">VYLOS</span>
              </div>
           </div>
           <h1 className="text-5xl font-black text-[#2a5c54] tracking-widest uppercase">Vylos</h1>
        </div>
        
        <h2 className="text-5xl font-black text-[#1a3832] tracking-tight mb-4">
           AI Budget Architect
        </h2>
        <p className="text-gray-600 font-medium max-w-lg mx-auto leading-relaxed">
           Describe your financial evolution. Our AI engine will dismantle and reconstruct your entire budget blueprint to match your new reality.
        </p>
      </div>

      {/* Giant Input Component */}
      <div className="w-full bg-white rounded-[4rem] p-10 shadow-sm border border-gray-100 flex flex-col relative mb-16 h-80">
        <textarea 
          placeholder="Input Financial Parameters"
          className="w-full flex-1 resize-none bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-lg leading-relaxed pt-2"
        />
        
        {/* Footer Area of the Input */}
        <div className="flex items-center justify-between mt-4">
           <div className="flex items-center gap-2 text-[#6DBB9D] font-bold text-sm">
             <Sparkles className="w-4 h-4" />
             AI Model v2.0 Ready
           </div>
           
           <button className="flex items-center gap-2 px-6 py-3 bg-[#2a5c54] hover:bg-[#1a3832] transition-colors rounded-full text-white font-bold shadow-md">
             <Sparkles className="w-4 h-4" />
             Generate Protocol
           </button>
        </div>
      </div>

      {/* Quick Commands Section */}
      <div className="w-full">
        <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-6 ml-2">QUICK COMMANDS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <QuickCommandCard 
             icon={Wallet} 
             title="Income Change" 
             description='"I just got a raise to R850,000/year and want to adjust my bud..."' 
           />
           <QuickCommandCard 
             icon={MapPin} 
             title="Relocation" 
             description='"I moved to Cape Town. My rent is now R15,000 and transpor..."' 
           />
           <QuickCommandCard 
             icon={ShieldAlert} 
             title="Debt Consolidation" 
             description='"I want to focus purely on paying off my credit card debt of ..."' 
           />
        </div>
      </div>

    </div>
  );
}
