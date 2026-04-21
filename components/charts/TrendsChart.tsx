"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAppStore } from "@/lib/AppContext";
import { getCurrencySymbol } from "@/lib/store";

export default function TrendsChart() {
  const { state } = useAppStore();
  const symbol = getCurrencySymbol(state.userProfile.country);

  // Group transactions by date
  const groupedData: Record<string, { date: string; income: number; expenses: number }> = {};
  
  // Sort transactions by date
  const sortedTxs = [...state.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedTxs.forEach(tx => {
    const date = tx.date;
    if (!groupedData[date]) {
      groupedData[date] = { date, income: 0, expenses: 0 };
    }
    if (tx.amount > 0) {
      groupedData[date].income += tx.amount;
    } else {
      groupedData[date].expenses += Math.abs(tx.amount);
    }
  });

  const data = Object.values(groupedData).slice(-30); // Last 30 days of data points

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            tickFormatter={(val) => `${symbol}${val > 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--card)", 
              border: "1px solid var(--border-main)", 
              borderRadius: "1rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}
            labelStyle={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}
            formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`]}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="Income"
            stroke="var(--primary)" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--bg)" }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            name="Expenses"
            stroke="#ef4444" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "#ef4444", strokeWidth: 2, stroke: "var(--bg)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
