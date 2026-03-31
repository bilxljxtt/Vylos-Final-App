"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Dining Out", value: 5000 },
  { name: "Emergency Fund", value: 5331 },
  { name: "Subscriptions", value: 500 },
  { name: "Utilities", value: 8585 },
];

const COLORS = ["#fbbf24", "#a7f3d0", "#f97316", "#2a5c54"];

export default function ExpensePieChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
           contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '10px' }}
           formatter={(value) => `R${Number(value).toLocaleString()}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
