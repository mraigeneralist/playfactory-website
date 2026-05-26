"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/constants";
import { formatSlotDisplay } from "@/lib/slots";
import type { AdminBooking } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-primary-soft text-primary-dark",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-amber-100 text-amber-800",
};

export default function BookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const sports = useMemo(() => {
    const s = new Set<string>();
    bookings.forEach((b) => s.add(b.sport));
    return Array.from(s).sort();
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (sport !== "all" && b.sport !== sport) return false;
      if (status !== "all" && b.status !== status) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.bookingId.toLowerCase().includes(q)
      );
    });
  }, [bookings, query, sport, status]);

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">
      <div className="flex flex-wrap gap-3 items-center p-4 border-b border-border bg-surface">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone or ID…"
          className="flex-1 min-w-[200px] rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">All sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No-show</option>
        </select>
        <span className="text-xs text-muted">{filtered.length} of {bookings.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-border">
              <th className="px-4 py-3 font-semibold">Booking</th>
              <th className="px-4 py-3 font-semibold">Sport</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No bookings match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.bookingId} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-primary-dark font-semibold">{b.bookingId}</div>
                    <div className="text-[11px] text-muted">{b.createdAt}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{b.sportName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-ink">{b.date}</div>
                    <div className="text-xs text-muted">{formatSlotDisplay(b.slotTime)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{b.name}</div>
                    <div className="text-xs text-muted">
                      <a className="hover:text-primary-dark" href={`tel:${b.phone}`}>{b.phone}</a>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary-dark whitespace-nowrap">
                    {formatINR(b.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-700"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted">{b.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
