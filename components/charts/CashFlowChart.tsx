"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [
  { name: "Mar 1", balance: -500 },
  { name: "Mar 5", balance: 0 },
  { name: "Mar 10", balance: 4500 },
  { name: "Mar 11", balance: 2000 },
  { name: "Mar 26", balance: -8585 },
];

export default function CashFlowChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
      >
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          tickFormatter={(value) => `R${value}`}
          dx={-10}
        />
        <Tooltip 
           contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
           itemStyle={{ color: '#2a5c54', fontWeight: 'bold' }}
           formatter={(value) => [`R${value}`, "Balance"]}
           labelStyle={{ fontWeight: "bold", color: "#6b7280", "marginBottom": "4px" }}
        />
        <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />
        <Line 
          type="monotone" 
          dataKey="balance" 
          stroke="#2a5c54" 
          strokeWidth={3} 
          dot={{ r: 4, fill: "#2a5c54", strokeWidth: 2, stroke: "#fff" }} 
          activeDot={{ r: 6, fill: "#2a5c54", stroke: "#fff", strokeWidth: 2 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
