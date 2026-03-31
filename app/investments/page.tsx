"use client";

import { Zap, RefreshCw, Info, Activity, Flame, Bot, DollarSign, PieChart as PieChartIcon, TrendingUp, TrendingDown } from "lucide-react";
import MarketPulseChart from "@/components/charts/MarketPulseChart";
import AllocationChart from "@/components/charts/AllocationChart";

export default function Investments() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-emerald-50 text-[#2a5c54] font-bold text-sm italic">
               V
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Vylos</span>
          </div>
          <div className="flex items-center gap-4">
             <Zap className="w-8 h-8 text-orange-500 fill-orange-500" />
             <h2 className="text-4xl font-black text-gray-900 tracking-tight">Market Intelligence</h2>
          </div>
          <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
            Real-time AI analysis & personalized opportunities
          </p>
        </div>
        
        <div className="text-right">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-full text-sm font-bold text-[#2a5c54] transition">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
          <p className="text-xs text-gray-400 font-medium mt-2 pr-2">Updated: 10:48:03 PM</p>
        </div>
      </header>

      {/* ADVISORY BANNER */}
      <div className="bg-[#eef8fc] border border-[#d6eff8] rounded-2xl p-4 flex items-start gap-3">
         <Info className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
         <p className="text-sm font-medium text-[#1e3a8a] leading-relaxed">
           <strong className="font-bold">Advisory Only:</strong> You cannot purchase stocks directly on this platform. Vylos provides AI-driven advice on high-potential opportunities for you to execute on your preferred brokerage.
         </p>
      </div>

      {/* TOP CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Market Pulse (Left 2/3) */}
         <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                 <Activity className="w-6 h-6 text-gray-900" />
                 <h3 className="text-xl font-bold text-gray-900 tracking-tight">Market Pulse</h3>
               </div>
               <span className="bg-red-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
                 Live
               </span>
            </div>
            
            <div className="flex-1 min-h-[200px] w-full -ml-4">
               <MarketPulseChart />
            </div>

            <div className="flex items-center justify-center gap-8 mt-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                  <span className="text-xs font-bold text-gray-600">S&P 500 <span className="text-green-500">+0.85%</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-xs font-bold text-gray-600">NASDAQ <span className="text-green-500">+1.20%</span></span>
               </div>
            </div>
         </div>

         {/* Smart Allocation (Right 1/3) */}
         <div className="bg-[#1e3a8a] rounded-[2rem] p-8 shadow-md flex flex-col text-white">
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-2">
                 <PieChartIcon className="w-6 h-6 text-blue-200" />
                 <h3 className="text-2xl font-black tracking-tight">Smart Allocation</h3>
               </div>
               <p className="text-sm text-blue-200 font-medium">Based on your available capital: $3,000</p>
            </div>
            
            <div className="flex-1 w-full flex items-center justify-center min-h-[160px] mb-8">
               <div className="w-48 h-48">
                  <AllocationChart />
               </div>
            </div>

            <div className="space-y-3 mt-auto">
               <div className="flex items-center justify-between text-xs font-bold text-blue-200">
                  <span className="text-[#3b82f6]">60% Safe (Index)</span>
                  <span className="text-[#eab308]">30% Growth</span>
               </div>
               <div className="h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#3b82f6]" style={{ width: '60%' }} />
                  <div className="h-full bg-[#22c55e]" style={{ width: '30%' }} />
                  <div className="h-full bg-[#eab308]" style={{ width: '10%' }} />
               </div>
            </div>
         </div>
      </div>

      {/* BOTTOM LISTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* Market Movers */}
         <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-2 mb-6 ml-2">
               <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
               <h3 className="text-xl font-bold text-gray-900 tracking-tight">Market Movers</h3>
            </div>
            
            <div className="flex flex-col gap-1">
               {/* Item AAPL */}
               <div className="flex items-center justify-between py-4 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div>
                     <h4 className="font-bold text-gray-900">AAPL</h4>
                     <p className="text-xs font-medium text-gray-400">Apple Inc.</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-gray-900">$242.50</p>
                     <p className="text-xs font-bold text-green-500 flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" />+0.62%</p>
                  </div>
               </div>
               {/* Item NVDA */}
               <div className="flex items-center justify-between py-4 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div>
                     <h4 className="font-bold text-gray-900">NVDA</h4>
                     <p className="text-xs font-medium text-gray-400">NVIDIA Corporation</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-gray-900">$148.90</p>
                     <p className="text-xs font-bold text-red-500 flex items-center justify-end gap-1"><TrendingDown className="w-3 h-3" />-1.39%</p>
                  </div>
               </div>
               {/* Item TSLA */}
               <div className="flex items-center justify-between py-4 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div>
                     <h4 className="font-bold text-gray-900">TSLA</h4>
                     <p className="text-xs font-medium text-gray-400">Tesla, Inc.</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-gray-900">$985.00</p>
                     <p className="text-xs font-bold text-green-500 flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" />+1.56%</p>
                  </div>
               </div>
               {/* Item AMD */}
               <div className="flex items-center justify-between py-4 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div>
                     <h4 className="font-bold text-gray-900">AMD</h4>
                     <p className="text-xs font-medium text-gray-400">Advanced Micro Devices</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-gray-900">$180.45</p>
                     <p className="text-xs font-bold text-green-500 flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" />+1.95%</p>
                  </div>
               </div>
               {/* Item AMZN */}
               <div className="flex items-center justify-between py-4 px-2 group hover:bg-gray-50 rounded-xl transition">
                  <div>
                     <h4 className="font-bold text-gray-900">AMZN</h4>
                     <p className="text-xs font-medium text-gray-400">Amazon.com, Inc.</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-gray-900">$195.30</p>
                     <p className="text-xs font-bold text-red-500 flex items-center justify-end gap-1"><TrendingDown className="w-3 h-3" />-0.23%</p>
                  </div>
               </div>
            </div>
         </div>

         {/* AI Top Picks */}
         <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6 ml-2">
               <Bot className="w-6 h-6 text-purple-500" />
               <h3 className="text-xl font-bold text-gray-900 tracking-tight">AI Top Picks</h3>
               <span className="text-[10px] font-bold text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
                 For Your Budget
               </span>
            </div>
            
            <div className="flex flex-col gap-1">
               {/* Item 1 */}
               <div className="flex items-center justify-between py-3 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">V</div>
                     <div>
                        <h4 className="font-bold text-gray-900">Vanguard S&P 500 ETF</h4>
                        <div className="flex items-center gap-1 mt-1">
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Index</span>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Low Risk</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-gray-900">$480.5</span>
                     <button className="w-8 h-8 rounded-full bg-[#2a5c54] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                        <DollarSign className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               {/* Item 2 */}
               <div className="flex items-center justify-between py-3 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">Q</div>
                     <div>
                        <h4 className="font-bold text-gray-900">Invesco QQQ Trust</h4>
                        <div className="flex items-center gap-1 mt-1">
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Tech</span>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Medium Risk</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-gray-900">$440.2</span>
                     <button className="w-8 h-8 rounded-full bg-[#2a5c54] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                        <DollarSign className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Item 3 */}
               <div className="flex items-center justify-between py-3 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">O</div>
                     <div>
                        <h4 className="font-bold text-gray-900">Realty Income Corp</h4>
                        <div className="flex items-center gap-1 mt-1">
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Real Estate</span>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Low Risk</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-gray-900">$54.3</span>
                     <button className="w-8 h-8 rounded-full bg-[#2a5c54] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                        <DollarSign className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Item 4 */}
               <div className="flex items-center justify-between py-3 px-2 border-b border-gray-50 group hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">K</div>
                     <div>
                        <h4 className="font-bold text-gray-900">Coca-Cola Company</h4>
                        <div className="flex items-center gap-1 mt-1">
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Consumer</span>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Low Risk</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-gray-900">$62.1</span>
                     <button className="w-8 h-8 rounded-full bg-[#2a5c54] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                        <DollarSign className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Item 5 */}
               <div className="flex items-center justify-between py-3 px-2 group hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">P</div>
                     <div>
                        <h4 className="font-bold text-gray-900">Palantir Technologies</h4>
                        <div className="flex items-center gap-1 mt-1">
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Tech</span>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">High Risk</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-gray-900">$24.5</span>
                     <button className="w-8 h-8 rounded-full bg-[#2a5c54] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                        <DollarSign className="w-4 h-4" />
                     </button>
                  </div>
               </div>

            </div>
         </div>
      </div>

    </div>
  );
}
