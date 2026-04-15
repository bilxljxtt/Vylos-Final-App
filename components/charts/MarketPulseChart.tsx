"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { time: "9am",  sp500: 4800, nasdaq: 15200 },
  { time: "10am", sp500: 4820, nasdaq: 15350 },
  { time: "11am", sp500: 4790, nasdaq: 15280 },
  { time: "12pm", sp500: 4850, nasdaq: 15500 },
  { time: "1pm",  sp500: 4870, nasdaq: 15620 },
  { time: "2pm",  sp500: 4845, nasdaq: 15570 },
  { time: "3pm",  sp500: 4890, nasdaq: 15750 },
  { time: "4pm",  sp500: 4920, nasdaq: 15900 },
];

export default function MarketPulseChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="sp500Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="nasdaqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Inter, sans-serif" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Inter, sans-serif" }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "1rem",
            border: "1px solid #e0e7ff",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
        />
        <Area type="monotone" dataKey="sp500"  stroke="#8b5cf6" strokeWidth={2} fill="url(#sp500Grad)"  name="S&P 500" />
        <Area type="monotone" dataKey="nasdaq" stroke="#f59e0b" strokeWidth={2} fill="url(#nasdaqGrad)" name="NASDAQ" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
