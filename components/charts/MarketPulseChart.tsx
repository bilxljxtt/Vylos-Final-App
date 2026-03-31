"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "10:00", sp500: 4100 },
  { time: "10:30", sp500: 4120 },
  { time: "11:00", sp500: 4090 },
  { time: "11:30", sp500: 4150 },
  { time: "12:00", sp500: 4170 },
  { time: "12:30", sp500: 4190 },
  { time: "1:00", sp500: 4180 },
];

export default function MarketPulseChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorSp500" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="time" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          dy={10}
        />
        <Tooltip 
           contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
           labelStyle={{ color: '#4b5563', fontWeight: 'bold' }}
        />
        <Area 
          type="monotone" 
          dataKey="sp500" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorSp500)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
