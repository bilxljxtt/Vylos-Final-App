"use client";

import { Share2, TrendingUp, TrendingDown, Target, Shield, MessageSquare, Send, Info } from "lucide-react";

const rankings = [
  { rank: 1, initial: "A", name: "Arav Sookoo", role: "Analyst", efficiency: "97.5%", trend: "up", isYou: false },
  { rank: 2, initial: "T", name: "Test Verify User", role: "Novice", efficiency: "100%", trend: "up", isYou: false },
  { rank: 3, initial: "J", name: "Jane Doe", role: "Novice", efficiency: "100%", trend: "up", isYou: false },
  { rank: 4, initial: "S", name: "Suresh P", role: "Broker", efficiency: "100%", trend: "up", isYou: false },
  { rank: 5, initial: "A", name: "Alice Smith", role: "Novice", efficiency: "100%", trend: "up", isYou: false },
  { rank: 11, initial: "P", name: "Prem", role: "Analyst", efficiency: "91.5%", trend: "up", isYou: false },
  { rank: 12, initial: "D", name: "Diya", role: "Analyst", efficiency: "0%", trend: "down", isYou: false },
  { rank: 13, initial: "B", name: "Bilal", role: "Analyst", efficiency: "60.8%", trend: "down", isYou: true },
];

export default function ProgressBoard() {
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
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Operational Status</h2>
          <p className="text-gray-500 font-medium mt-2 max-w-xl">
            Compare your financial efficiency against the Vylos network. Rank up by maintaining streaks and meeting budget targets.
          </p>
        </div>
        
        <div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition">
            <Share2 className="w-4 h-4" />
            Share Rank
          </button>
        </div>
      </header>

      {/* GAMIFICATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* LEFT CARD (Status) */}
         <div className="col-span-1 lg:col-span-5 relative bg-[#1c453c] rounded-[3rem] p-10 shadow-lg text-white overflow-hidden flex flex-col justify-between min-h-[400px]">
            {/* Background design accents */}
            <Target className="absolute -top-10 -right-10 w-64 h-64 text-white opacity-5" />
            
            <div className="relative z-10 flex items-start justify-between mb-8">
               <div>
                 <p className="text-emerald-300 font-bold tracking-widest text-xs uppercase mb-2">Operative Status</p>
                 <h2 className="text-6xl font-black tracking-tight mb-2">Analyst</h2>
                 <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                    Global Rank <span className="text-white">#2</span>
                 </div>
               </div>
               <div className="w-12 h-12 rounded-full border border-emerald-300 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-300" />
               </div>
            </div>

            <div className="relative z-10">
               <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-2 uppercase tracking-wider">
                  <span>XP Progress</span>
                  <span className="text-white">0 / 1500 XP</span>
               </div>
               
               <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-emerald-400" style={{ width: '0%' }} />
               </div>
               
               <p className="text-xs font-medium text-emerald-200 mb-10">1500 XP until promotion to Broker</p>

               <div className="flex items-center gap-6 pt-6 border-t border-emerald-700/50">
                  <div className="flex items-center gap-3">
                     <TrendingUp className="w-5 h-5 text-emerald-400" />
                     <div>
                        <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Streak</p>
                        <p className="font-bold text-lg">0 Days</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <Target className="w-5 h-5 text-yellow-400" />
                     <div>
                        <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Goals</p>
                        <p className="font-bold text-lg">0 Hit</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT CARD (Rankings) */}
         <div className="col-span-1 lg:col-span-7 bg-white rounded-[3rem] p-8 flex flex-col shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-6 ml-2">Operative Rankings</h3>
            
            <div className="flex-1 w-full bg-[#f9fbfb] rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col">
               {/* Table Header */}
               <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-6">Operative</div>
                  <div className="col-span-3 text-right">Efficiency <Info className="inline w-3 h-3 text-gray-400" /></div>
                  <div className="col-span-1 text-right">Trend</div>
               </div>

               {/* Table Body */}
               <div className="flex-1 overflow-y-auto w-full pb-4">
                  {rankings.map((user) => (
                    <div 
                      key={user.rank} 
                      className={`grid grid-cols-12 gap-4 px-8 py-4 items-center group transition-colors ${user.isYou ? 'bg-[#6DBB9D] text-white' : 'hover:bg-gray-50'}`}
                    >
                       {/* Rank */}
                       <div className="col-span-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${user.isYou ? 'bg-[#1c453c] text-white' : 'bg-[#1c453c] text-white'}`}>
                             {user.rank}
                          </div>
                       </div>
                       
                       {/* Operative */}
                       <div className="col-span-6 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.isYou ? 'bg-[#1c453c] text-white' : 'bg-gray-100 text-gray-400'}`}>
                             {user.initial}
                          </div>
                          <div>
                             <p className={`font-bold ${user.isYou ? 'text-white' : 'text-gray-900'}`}>
                               {user.name}
                               {user.isYou && <span className="ml-2 text-[10px] bg-[#1c453c] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-black">You</span>}
                             </p>
                             <p className={`text-xs font-medium ${user.isYou ? 'text-emerald-100' : 'text-gray-500'}`}>{user.role}</p>
                          </div>
                       </div>
                       
                       {/* Efficiency */}
                       <div className="col-span-3 text-right flex items-center justify-end">
                          <span className={`font-bold ${user.isYou ? 'text-white' : 'text-green-600'}`}>{user.efficiency}</span>
                       </div>
                       
                       {/* Trend */}
                       <div className="col-span-1 flex items-center justify-end">
                          {user.trend === 'up' ? (
                            <TrendingUp className={`w-5 h-5 ${user.isYou ? 'text-white' : 'text-green-500'}`} />
                          ) : (
                            <TrendingDown className={`w-5 h-5 ${user.isYou ? 'text-red-200' : 'text-red-500'}`} />
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* FIELD INTEL */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
           <MessageSquare className="w-5 h-5 text-gray-900" />
           <h3 className="text-xl font-bold text-gray-900 tracking-tight">Field Intel</h3>
           <span className="bg-[#2a5c54] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">Top Advice</span>
           <span className="ml-auto text-sm text-gray-500 font-medium tracking-tight">Community tips & strategies</span>
        </div>
        
        <div className="w-full relative">
           <p className="text-xs font-bold text-gray-900 mb-2">Contribute Intel</p>
           <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1c453c] flex items-center justify-center font-bold text-white flex-shrink-0">
                 B
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-[2.5rem] p-4 relative shadow-sm">
                 <textarea 
                   rows={3}
                   placeholder="Share a financial strategy with the network..."
                   className="w-full resize-none outline-none bg-transparent placeholder-gray-400 text-gray-800 text-sm font-medium"
                 />
                 <button className="absolute bottom-4 right-4 bg-[#6DBB9D] hover:bg-[#2a5c54] transition-colors rounded-full px-5 py-2 text-white text-sm font-bold shadow-sm">
                    Broadcast
                 </button>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}
