"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { useAppStore } from "@/lib/AppContext";
import { getCurrencySymbol } from "@/lib/store";

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
  const { state } = useAppStore();
  const symbol = getCurrencySymbol(state.userProfile.country);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--primary)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Clean, subtle horizontal grid lines */}
        <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3" />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 500 }}
          dy={10}
          minTickGap={20}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 500 }}
          tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`}
          dx={-5}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            borderRadius: "1rem",
            border: "1px solid var(--border-main)",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            padding: "10px 14px",
          }}
          itemStyle={{ color: "var(--primary)", fontWeight: "700", fontSize: 14 }}
          formatter={(value) => [`${symbol}${Number(value).toLocaleString()}`, "Balance"]}
          labelStyle={{ fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px", fontSize: 12 }}
          cursor={{ stroke: "var(--border-main)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <ReferenceLine y={0} stroke="var(--border-main)" strokeWidth={1} />
        
        <Area
          type="monotone"
          dataKey="balance"
          stroke="var(--primary)"
          strokeWidth={3}
          fill="url(#cashGrad)"
          activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--bg)", strokeWidth: 2 }}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
