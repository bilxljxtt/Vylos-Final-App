"use client";

import { Bell, FileText, CreditCard, Activity, Search, Filter, Plus, Info, TrendingUp, Trash2, CalendarCheck, Wallet } from "lucide-react";
import CashFlowChart from "@/components/charts/CashFlowChart";
import ExpensePieChart from "@/components/charts/ExpensePieChart";

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-emerald-50">
            <span className="text-[#2a5c54] font-bold text-xl italic tracking-tighter">VYLOS</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Command</h1>
            <p className="text-gray-500 font-medium mt-1">Welcome back, Bilal. Your systems are online.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-[#2a5c54] shadow-sm hover:bg-gray-50 transition">
            <CreditCard className="w-4 h-4" />
            Link Account
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 shadow-sm hover:bg-gray-50 transition">
            <FileText className="w-4 h-4" />
          </button>
          <button className="relative p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 shadow-sm hover:bg-gray-50 transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </header>

      {/* FINANCIAL HEALTH SCORE */}
      <section className="bg-[#2a5c54] rounded-[2.5rem] p-10 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <p className="text-emerald-100 uppercase tracking-widest text-xs font-bold font-mono">FINANCIAL HEALTH SCORE</p>
          <h2 className="text-6xl font-black">465</h2>
          <p className="text-emerald-50 font-medium flex items-center gap-2">
            Needs Attention <TrendingUp className="w-4 h-4" />
          </p>
        </div>
        <div className="relative z-10 text-right space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-white/10 mb-2">
            <Activity className="w-5 h-5 text-emerald-100" />
          </div>
          <p className="text-emerald-100 tracking-wide text-sm font-medium">Total Net Worth</p>
          <h3 className="text-4xl font-bold">R20,584.00</h3>
        </div>
        
        {/* Subtle background decoration to mimic the curved lighting in the image */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#336b63] rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      </section>

      {/* CHARTS ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Net Cash Flow Trend</h3>
            <p className="text-sm text-gray-400">Cumulative Income vs Expenses</p>
          </div>
          <div className="h-[280px] w-full mt-6">
             <CashFlowChart />
          </div>
        </div>
        
        {/* Expenses Pie */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Expenses by Category</h3>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center">
             <ExpensePieChart />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm font-medium">
             <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="text-amber-500">Dining Out</span></div>
             <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-200"></span><span className="text-emerald-300">Emergency Fund</span></div>
             <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span className="text-orange-500">Subscriptions</span></div>
             <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#2a5c54]"></span><span className="text-[#2a5c54]">Utilities</span></div>
          </div>
        </div>
      </section>

      {/* DATA ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks / Tables */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real-time Transactions */}
          <div className="bg-transparent">
            <div className="flex items-center justify-between xl:flex-row flex-col gap-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900">Real-time Transactions</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white rounded-full border border-gray-200 text-sm focus:outline-none w-48 shadow-sm" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#2a5c54] text-white rounded-full text-sm font-semibold shadow-sm hover:bg-[#1f4740] transition">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 font-bold uppercase tracking-wider hidden sm:table-header-group">
                     <tr>
                        <th className="pb-4 font-bold">DATE</th>
                        <th className="pb-4 font-bold">MERCHANT</th>
                        <th className="pb-4 font-bold text-center">CATEGORY</th>
                        <th className="pb-4 font-bold text-right">AMOUNT</th>
                        <th className="pb-4 font-bold text-center">ACTIONS</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    <tr className="group">
                        <td className="py-4 font-medium text-gray-600">3/26/2026</td>
                        <td className="py-4 font-semibold text-gray-800">lkj</td>
                        <td className="py-4 text-center"><span className="inline-flex bg-gray-100 text-[#2a5c54] font-bold px-3 py-1 rounded-full text-xs">Utilities</span></td>
                        <td className="py-4 font-bold text-right text-gray-900">-R8,585.00</td>
                        <td className="py-4 text-center"><button className="text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                    </tr>
                    <tr className="group">
                        <td className="py-4 font-medium text-gray-600">3/11/2026</td>
                        <td className="py-4 font-semibold text-gray-800">hfghgh</td>
                        <td className="py-4 text-center"><span className="inline-flex bg-gray-100 text-[#2a5c54] font-bold px-3 py-1 rounded-full text-xs">Emergency Fund</span></td>
                        <td className="py-4 font-bold text-right text-emerald-500">+R5,331.00</td>
                        <td className="py-4 text-center"><button className="text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                    </tr>
                    <tr className="group">
                        <td className="py-4 font-medium text-gray-600">3/10/2026</td>
                        <td className="py-4 font-semibold text-gray-800">fghghg</td>
                        <td className="py-4 text-center"><span className="inline-flex bg-gray-100 text-[#2a5c54] font-bold px-3 py-1 rounded-full text-xs">Side Hustle</span></td>
                        <td className="py-4 font-bold text-right text-emerald-500">+R10,000.00</td>
                        <td className="py-4 text-center"><button className="text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                    </tr>
                    <tr className="group">
                        <td className="py-4 font-medium text-gray-600">3/5/2026</td>
                        <td className="py-4 font-semibold text-gray-800">jhgkj</td>
                        <td className="py-4 text-center"><span className="inline-flex bg-gray-100 text-[#2a5c54] font-bold px-3 py-1 rounded-full text-xs">Dining Out</span></td>
                        <td className="py-4 font-bold text-right text-gray-900">-R5,000.00</td>
                        <td className="py-4 text-center"><button className="text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                    </tr>
                     <tr className="group">
                        <td className="py-4 font-medium text-gray-600">3/1/2026</td>
                        <td className="py-4 font-semibold text-gray-800">Amazon Prime (Recurring)</td>
                        <td className="py-4 text-center"><span className="inline-flex bg-gray-100 text-[#2a5c54] font-bold px-3 py-1 rounded-full text-xs">Subscriptions</span></td>
                        <td className="py-4 font-bold text-right text-gray-900">-R500.00</td>
                        <td className="py-4 text-center"><button className="text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                    </tr>
                  </tbody>
               </table>
               
               <div className="flex justify-center mt-6">
                 <div className="flex items-center gap-2">
                   <button className="text-gray-400 hover:text-gray-900">&lt;</button>
                   <button className="w-7 h-7 bg-[#2a5c54] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">1</button>
                   <button className="text-gray-400 hover:text-gray-900">&gt;</button>
                 </div>
               </div>
            </div>
          </div>
          
          {/* Recurring Subscriptions */}
          <div className="bg-transparent mt-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recurring Subscriptions</h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-[#2a5c54] shadow-sm hover:bg-gray-50 transition">
                  <CalendarCheck className="w-4 h-4" /> Check Due Now
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#2a5c54] text-white rounded-full text-sm font-semibold shadow-sm hover:bg-[#1f4740] transition">
                  <Plus className="w-4 h-4" /> Add Subscription
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 font-bold uppercase tracking-wider hidden sm:table-header-group">
                     <tr>
                        <th className="pb-4 font-bold">DESCRIPTION</th>
                        <th className="pb-4 font-bold">FREQUENCY</th>
                        <th className="pb-4 font-bold">NEXT DUE</th>
                        <th className="pb-4 font-bold">AMOUNT</th>
                        <th className="pb-4 font-bold text-center">ACTIONS</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    <tr className="group">
                        <td className="py-4">
                          <p className="font-bold text-gray-800">Amazon Prime</p>
                          <p className="text-xs text-gray-400 mt-0.5">Subscriptions</p>
                        </td>
                        <td className="py-4"><span className="inline-flex bg-[#6DBB9D] text-white font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase shadow-sm">Monthly</span></td>
                        <td className="py-4 font-medium text-gray-600">4/1/2026</td>
                        <td className="py-4 font-bold text-gray-900">R500.00</td>
                        <td className="py-4 text-center"><button className="text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>
          
        </div>

        {/* Goals & Progress (Side Widgets) */}
        <div className="space-y-6">
          
          {/* Savings Goals */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">SAVINGS GOALS</h3>
               <div className="p-1.5 bg-[#f0f9f6] rounded-full text-[#6DBB9D]">
                 <TrendingUp className="w-4 h-4" />
               </div>
            </div>
            
            <div className="space-y-4">
              {/* Goal Card 1 */}
              <div className="bg-[#f0f6f5] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Emergency Fund</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-1">R5,331.00 / R90,000.00</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              
              {/* Goal Card 2 */}
              <div className="bg-[#f0f6f5] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">M5</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-1">R0.00 / R2,000,000.00</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="mt-8 flex items-end justify-between">
               <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Total Saved</p>
                  <h3 className="text-3xl font-bold text-gray-900">R5,331.00</h3>
               </div>
               <button className="text-sm font-bold text-[#2a5c54] flex items-center gap-1 hover:text-[#1f4740] transition">
                 Details &rarr;
               </button>
            </div>
          </div>
          
          {/* Budget Progress */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">BUDGET PROGRESS</h3>
               <div className="p-1.5 bg-[#f0f9f6] rounded-full text-[#6DBB9D]">
                 <Wallet className="w-4 h-4" />
               </div>
            </div>
            
            <div className="mt-4">
               <div className="flex items-center justify-between mb-2">
                 <p className="font-bold text-sm text-gray-800">Total Monthly Budget</p>
                 <p className="font-bold text-sm text-[#2a5c54]">68% Used</p>
               </div>
               
               <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden my-3">
                  <div className="bg-[#2a5c54] h-full rounded-full" style={{ width: '68%' }}></div>
               </div>
               
               <div className="flex items-center justify-between mt-2">
                 <p className="text-xs font-semibold text-gray-400">R19,416.00 spent</p>
                 <p className="text-xs font-semibold text-gray-400">R28,625.00 limit</p>
               </div>
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}
