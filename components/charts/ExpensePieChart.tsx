"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface ExpensePieChartProps {
  data?: DataPoint[];
}

const defaultData: DataPoint[] = [
  { name: "Dining Out",    value: 5000 },
  { name: "Emergency Fund",value: 5331 },
  { name: "Subscriptions", value: 500 },
  { name: "Utilities",     value: 8585 },
];

const COLORS = ["#f59e0b", "#4f46e5", "#f43f5e", "#8b5cf6", "#10b981", "#0ea5e9"];

export default function ExpensePieChart({ data = defaultData }: ExpensePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "1rem",
            border: "1px solid #e0e7ff",
            boxShadow: "0 10px 25px -5px rgba(79,70,229,0.15)",
            padding: "8px 12px",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
          }}
          formatter={(value, name) => [`R${Number(value).toLocaleString()}`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
