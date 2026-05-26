"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, subDays, parseISO, isValid } from "date-fns";
import { formatINR } from "@/lib/constants";
import Logo from "@/components/Logo";
import type { AdminBooking } from "@/lib/types";
import StatCard from "@/components/admin/StatCard";
import BookingsTable from "@/components/admin/BookingsTable";
import { RevenueByDayChart, BookingsBySportChart } from "@/components/admin/Charts";

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function monthStr() {
  return format(new Date(), "yyyy-MM");
}

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/bookings");
        if (res.status === 401 || res.status === 403) {
          router.replace("/login?next=/admin");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(data.error || "Could not load bookings");
        else setBookings(data.bookings || []);
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login?next=/admin");
  }

  async function updateStatus(bookingId: string, status: AdminBooking["status"]) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === bookingId ? { ...b, status } : b))
      );
    }
  }

  // ── derived metrics ───────────────────────────────────────────────────────
  const today = todayStr();
  const month = monthStr();

  const active = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled" && b.status !== "no_show"),
    [bookings]
  );

  const stats = useMemo(() => {
    const todays = active.filter((b) => b.date === today);
    const thisMonth = active.filter((b) => b.date.startsWith(month));
    return {
      todayCount: todays.length,
      todayRevenue: todays.reduce((s, b) => s + b.price, 0),
      monthCount: thisMonth.length,
      monthRevenue: thisMonth.reduce((s, b) => s + b.price, 0),
      totalCount: active.length,
      totalRevenue: active.reduce((s, b) => s + b.price, 0),
    };
  }, [active, today, month]);

  const revenueByDay = useMemo(() => {
    const days: { name: string; value: number; iso: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      days.push({ name: format(d, "EEE"), iso: format(d, "yyyy-MM-dd"), value: 0 });
    }
    active.forEach((b) => {
      const day = days.find((d) => d.iso === b.date);
      if (day) day.value += b.price;
    });
    return days.map(({ name, value }) => ({ name, value }));
  }, [active]);

  const bookingsBySport = useMemo(() => {
    const map = new Map<string, number>();
    active.forEach((b) => map.set(b.sportName, (map.get(b.sportName) || 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [active]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return active
      .filter((b) => {
        const d = parseISO(`${b.date}T${b.slotTime}:00`);
        return isValid(d) && d >= now;
      })
      .sort((a, b) =>
        a.date === b.date ? a.slotTime.localeCompare(b.slotTime) : a.date.localeCompare(b.date)
      )
      .slice(0, 5);
  }, [active]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/admin" className="inline-flex flex-col items-start gap-0.5">
            <Logo className="text-xl sm:text-2xl" />
            <span className="text-[10px] uppercase tracking-wider text-muted leading-tight">Owner dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-surface"
            >
              View site →
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-surface"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center text-muted">Loading…</div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <>
            {/* Top stats */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard accent="primary" label="Today's bookings" value={String(stats.todayCount)} hint={today} />
              <StatCard accent="primary" label="Today's revenue" value={formatINR(stats.todayRevenue)} />
              <StatCard label="This month" value={String(stats.monthCount)} hint={`${formatINR(stats.monthRevenue)} revenue`} />
              <StatCard label="All-time" value={String(stats.totalCount)} hint={`${formatINR(stats.totalRevenue)} revenue`} />
            </section>

            {/* Charts */}
            <section className="grid gap-4 lg:grid-cols-2">
              <RevenueByDayChart data={revenueByDay} />
              <BookingsBySportChart data={bookingsBySport} />
            </section>

            {/* Upcoming */}
            <section>
              <h2 className="font-heading text-lg font-bold text-ink mb-3">Next 5 slots</h2>
              {upcoming.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted shadow-soft">
                  Nothing on the calendar.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  {upcoming.map((b) => (
                    <div key={b.bookingId} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                      <div className="text-[10px] uppercase tracking-wider text-muted">{b.date}</div>
                      <div className="font-heading text-lg font-bold text-primary-dark">{b.slotTime}</div>
                      <div className="text-sm text-ink mt-1">{b.sportName}</div>
                      <div className="text-xs text-ink-soft mt-1">{b.name} · {b.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Full table */}
            <section>
              <h2 className="font-heading text-lg font-bold text-ink mb-3">All bookings</h2>
              <BookingsTable bookings={bookings} onUpdateStatus={updateStatus} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
