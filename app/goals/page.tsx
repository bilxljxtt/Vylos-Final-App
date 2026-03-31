"use client";

import { Shield, Pencil, Trash2, Plus } from "lucide-react";

interface GoalCardProps {
  title: string;
  currentAmount: number;
  targetAmount: number;
}

function GoalCard({ title, currentAmount, targetAmount }: GoalCardProps) {
  // Safe math
  const percentageUncapped = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const percentage = Math.min(percentageUncapped, 100);
  
  // Format ZAR natively
  const formatZar = (val: number) => 
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
      .format(val).replace('ZAR', 'R');

  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 flex items-center gap-8 relative overflow-hidden group">
      {/* Icon Hexagon Block */}
      <div className="w-16 h-16 rounded-full bg-[#f0f9f6] flex items-center justify-center border border-emerald-50 flex-shrink-0">
         <Shield className="w-6 h-6 text-[#2a5c54]" strokeWidth={1.5} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
         <div className="flex items-start justify-between mb-4">
            <div>
               <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
               <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold text-[#2a5c54]">{formatZar(currentAmount)}</span>
                  <span className="text-sm font-medium text-gray-400">of {formatZar(targetAmount)}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-gray-400 hover:text-gray-900 transition-colors">
                 <Pencil className="w-4 h-4" />
               </button>
               <button className="text-red-400 hover:text-red-600 transition-colors">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
         </div>
         
         {/* Tracking Bar */}
         <div className="flex items-end gap-4">
            <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden mb-1">
               <div 
                 className="bg-[#2a5c54] h-full rounded-full transition-all duration-1000"
                 style={{ width: `${percentage}%` }}
               />
            </div>
            <span className="text-xs font-black text-gray-900">{percentage.toFixed(0)}%</span>
         </div>
      </div>
    </div>
  );
}

export default function Goals() {
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
           Savings & Goals
        </h2>
        <p className="text-gray-600 font-medium max-w-lg mx-auto leading-relaxed">
           Track your progress towards financial freedom. Use these buckets to strategically allocate your capital for future objectives.
        </p>
      </div>

      {/* Goal Cards Stack */}
      <div className="w-full space-y-6">
        <GoalCard 
          title="Emergency Fund" 
          currentAmount={5331} 
          targetAmount={90000} 
        />
        
        <GoalCard 
          title="M5" 
          currentAmount={0} 
          targetAmount={2000000} 
        />
        
        {/* Initialize Target Button */}
        <button className="w-full h-32 rounded-[3rem] border-2 border-dashed border-gray-200 hover:border-[#6DBB9D] bg-transparent hover:bg-white transition-all flex flex-col items-center justify-center text-gray-500 hover:text-[#2a5c54] gap-3">
           <div className="w-10 h-10 rounded-full bg-[#f0f9f6] flex items-center justify-center border border-emerald-50">
             <Plus className="w-5 h-5" strokeWidth={2} />
           </div>
           <span className="font-bold text-gray-800">Initialize New Savings Target</span>
        </button>
      </div>

    </div>
  );
}
