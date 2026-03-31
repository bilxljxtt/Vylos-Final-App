"use client";

import { BudgetCard } from "@/components/BudgetCard";
import { 
  Pencil, 
  Download, 
  Lightbulb, 
  TrendingUp,
  ShoppingCart,
  Repeat,
  Target,
  Home,
  Film,
  Car,
  ShoppingBag,
  Droplet,
  Receipt,
  Utensils,
  ShieldAlert,
  CheckSquare
} from "lucide-react";

export default function Budget() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-emerald-50">
               <span className="text-[#2a5c54] font-bold text-xl italic tracking-tighter">VYLOS</span>
            </div>
            <h1 className="text-3xl font-black text-[#2a5c54] tracking-wider uppercase">Vylos</h1>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Strategic Calibration</h2>
          <p className="text-gray-500 font-medium mt-2 max-w-xl">
            Optimize your capital allocation. Adjust your strategy manually or leverage AI to recalibrate based on recent activity.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-[#2a5c54] shadow-sm hover:bg-gray-50 transition">
            <Pencil className="w-4 h-4" />
            Refine Blueprint
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-[#2a5c54] shadow-sm hover:bg-gray-50 transition">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* AI BUDGET ADVISOR */}
      <section className="bg-[#2a5c54] rounded-[2rem] pt-8 px-8 pb-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
             <Lightbulb className="w-5 h-5 text-white" />
           </div>
           <div>
              <h3 className="text-xl font-bold text-white">AI Budget Advisor</h3>
              <p className="text-emerald-100 text-sm">Real-time financial strategy & optimization</p>
           </div>
        </div>
        
        <div className="relative z-10 bg-white rounded-3xl p-6 shadow-sm">
           {/* Insight Box 1 */}
           <div className="bg-[#f0f9f6] rounded-2xl p-6 border border-emerald-50 mb-4">
              <div className="flex items-center gap-2 mb-2">
                 <TrendingUp className="w-5 h-5 text-emerald-600" />
                 <h4 className="font-bold text-lg text-emerald-800">Positive Projected Variance: +R9,209.00</h4>
              </div>
              <p className="text-emerald-700 font-medium text-sm mb-4">You are saving more than expected!</p>
              <p className="text-gray-600 text-sm">
                 Status Update: You have a total budget of R28,625.00. So far you've spent R19,416.00.
              </p>
           </div>
           
           {/* Insight Box 2 */}
           <div className="bg-[#f0f9f6] rounded-2xl p-6 border border-emerald-50">
              <p className="text-gray-800 font-medium text-sm mb-4">
                 Key Insight: Your highest spend is in Utilities (R8,585.00).
              </p>
              <div className="flex items-center gap-2 mb-2">
                 <CheckSquare className="w-5 h-5 text-emerald-500" />
                 <p className="font-bold text-emerald-700 text-sm">You are saving R9,209.00 this month!</p>
              </div>
              <p className="text-gray-600 text-sm">
                 This is excellent because it directly increases your Net Worth and builds your financial safety net. Keep it up!
              </p>
           </div>
        </div>
      </section>

      {/* ALLOCATION PROTOCOL (11 Categories Grid) */}
      <section>
        <div className="flex items-baseline gap-4 mb-6">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Allocation Protocol</h3>
          <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-gray-500 shadow-sm border border-gray-100">11 Categories</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Row 1 */}
           <BudgetCard title="Groceries" icon={ShoppingCart} amountSpent={0} amountLimit={3150} type="limit" />
           <BudgetCard title="Subscriptions" icon={Repeat} amountSpent={500} amountLimit={900} type="limit" />
           {/* Row 2 */}
           <BudgetCard title="Investments" icon={TrendingUp} amountSpent={0} amountLimit={3000} type="target" />
           <BudgetCard title="Savings" icon={Target} amountSpent={5331} amountLimit={1500} type="target" />
           {/* Row 3 */}
           <BudgetCard title="Entertainment" icon={Film} amountSpent={0} amountLimit={900} type="limit" />
           <BudgetCard title="Housing" icon={Home} amountSpent={0} amountLimit={9000} type="limit" />
           {/* Row 4 */}
           <BudgetCard title="Transport" icon={Car} amountSpent={0} amountLimit={1575} type="limit" />
           <BudgetCard title="Shopping" icon={ShoppingBag} amountSpent={0} amountLimit={900} type="limit" />
           {/* Row 5 */}
           <BudgetCard title="Utilities" icon={Droplet} amountSpent={8585} amountLimit={5000} type="limit" />
           <BudgetCard title="Bills" icon={Receipt} amountSpent={0} amountLimit={1500} type="limit" />
           {/* Row 6 */}
           <BudgetCard title="Dining Out" icon={Utensils} amountSpent={5000} amountLimit={1200} type="limit" />
        </div>
      </section>

      {/* LINKED FINANCIAL TARGETS */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Linked Financial Targets</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <BudgetCard title="Emergency Fund" icon={ShieldAlert} amountSpent={5331} amountLimit={90000} type="target" />
           <BudgetCard title="M5" icon={Target} amountSpent={0} amountLimit={2000000} type="target" />
        </div>
      </section>

    </div>
  );
}
