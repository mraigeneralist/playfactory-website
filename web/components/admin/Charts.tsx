"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatINR } from "@/lib/constants";

const GREENS = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#15803d"];

interface Pair { name: string; value: number }

export function RevenueByDayChart({ data }: { data: Pair[] }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
        Revenue — last 7 days
      </div>
      <div className="font-heading text-lg font-bold text-ink mb-4">
        {formatINR(data.reduce((a, b) => a + b.value, 0))}
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <XAxis dataKey="name" stroke="#6b7c73" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7c73" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
            <Tooltip
              cursor={{ fill: "rgba(22,163,74,0.06)" }}
              contentStyle={{ borderRadius: 10, border: "1px solid #e3ede7", fontSize: 13 }}
              formatter={(v) => [formatINR(Number(v)), "Revenue"]}
            />
            <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BookingsBySportChart({ data }: { data: Pair[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
        Bookings by sport
      </div>
      <div className="font-heading text-lg font-bold text-ink mb-4">{total} total</div>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={GREENS[i % GREENS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #e3ede7", fontSize: 13 }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
