"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  name: string;
  balance: number;
}

interface CashFlowChartProps {
  data?: DataPoint[];
}

const defaultData: DataPoint[] = [
  { name: "Mar 1",  balance: -500 },
  { name: "Mar 5",  balance: 0 },
  { name: "Mar 10", balance: 4500 },
  { name: "Mar 11", balance: 2000 },
  { name: "Mar 26", balance: -8585 },
];

export default function CashFlowChart({ data = defaultData }: CashFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Inter, sans-serif" }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Inter, sans-serif" }}
          tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
          dx={-5}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "1rem",
            border: "1px solid #e0e7ff",
            boxShadow: "0 10px 25px -5px rgba(79,70,229,0.15)",
            padding: "10px 14px",
            fontFamily: "Inter, sans-serif",
          }}
          itemStyle={{ color: "#4f46e5", fontWeight: "700", fontSize: 13 }}
          formatter={(value) => [`R${Number(value).toLocaleString()}`, "Balance"]}
          labelStyle={{ fontWeight: "700", color: "#6b7280", marginBottom: "4px", fontSize: 12 }}
        />
        <ReferenceLine y={0} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#4f46e5"
          strokeWidth={2.5}
          fill="url(#cashGrad)"
          dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
