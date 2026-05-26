"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatINR } from "@/lib/constants";

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

// Tiny helper: strip the "— 1 Hour" suffix our sport names carry so the chart
// row stays scannable. Falls back to the full name if there's nothing to trim.
function shortenSport(name: string): string {
  return name.split("—")[0].trim() || name;
}

export function BookingsBySportChart({ data }: { data: Pair[] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((a, b) => a + b.value, 0);
  const max = sorted[0]?.value || 1;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted">
            Bookings by sport
          </div>
          <div className="font-heading text-lg font-bold text-ink mt-0.5">
            {total} <span className="text-sm font-medium text-muted">total</span>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted">No bookings yet.</div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((row) => {
            const widthPct = (row.value / max) * 100;
            const sharePct = total > 0 ? Math.round((row.value / total) * 100) : 0;
            return (
              <li key={row.name} className="group">
                <div className="flex items-baseline justify-between text-sm mb-1.5">
                  <span className="font-medium text-ink truncate pr-3">
                    {shortenSport(row.name)}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted text-xs">
                    <span className="font-semibold text-ink">{row.value}</span>
                    <span className="mx-1">·</span>
                    {sharePct}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-[width] duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
