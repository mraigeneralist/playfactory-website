"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO, isAfter } from "date-fns";
import { createClient } from "@/lib/supabase/browser";
import { formatINR } from "@/lib/constants";
import { formatSlotDisplay } from "@/lib/slots";
import type { MyBooking } from "@/lib/types";

interface Props {
  initialProfile: { email: string; name: string; phone: string };
  bookings: MyBooking[];
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-primary-soft text-primary-dark",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-amber-100 text-amber-800",
};

export default function AccountClient({ initialProfile, bookings }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"upcoming" | "past" | "profile">("upcoming");

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const up: MyBooking[] = [];
    const pst: MyBooking[] = [];
    bookings.forEach((b) => {
      const dt = parseISO(`${b.date}T${b.slotTime}:00`);
      if (b.status === "cancelled") pst.push(b);
      else if (isAfter(dt, now)) up.push(b);
      else pst.push(b);
    });
    up.sort((a, b) => (a.date + a.slotTime).localeCompare(b.date + b.slotTime));
    return { upcoming: up, past: pst };
  }, [bookings]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">My account</div>
          <h1 className="font-heading text-3xl font-bold text-ink">
            Hi {initialProfile.name || "there"} 👋
          </h1>
        </div>
        <button
          onClick={logout}
          className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-surface"
        >
          Sign out
        </button>
      </header>

      {/* Tab nav */}
      <div className="flex gap-1 rounded-full bg-white p-1 border border-border w-fit shadow-soft">
        {([
          ["upcoming", `Upcoming (${upcoming.length})`],
          ["past", `Past (${past.length})`],
          ["profile", "Profile"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === id
                ? "bg-primary text-white shadow-soft"
                : "text-ink-soft hover:text-primary-dark"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "upcoming" && (
        <BookingsList bookings={upcoming} emptyMsg="No upcoming slots yet. Book one →" />
      )}
      {tab === "past" && (
        <BookingsList bookings={past} emptyMsg="No past bookings." />
      )}
      {tab === "profile" && <ProfileForm initial={initialProfile} />}
    </main>
  );
}

function BookingsList({ bookings, emptyMsg }: { bookings: MyBooking[]; emptyMsg: string }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-soft">
        <div className="text-4xl mb-3">🏸</div>
        <p className="text-ink-soft mb-4">{emptyMsg}</p>
        <Link href="/book" className="btn-primary inline-flex rounded-full px-6 py-2.5 text-sm">
          Book a Slot
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      {bookings.map((b) => (
        <div
          key={b.bookingId}
          className="rounded-2xl border border-border bg-white p-5 shadow-soft flex flex-wrap items-center gap-4 justify-between"
        >
          <div>
            <div className="font-mono text-[11px] text-primary-dark font-semibold">{b.bookingId}</div>
            <div className="mt-1 font-heading text-lg font-bold text-ink">{b.sportName}</div>
            <div className="text-sm text-ink-soft">
              {format(parseISO(b.date), "EEE, d MMM yyyy")} · {formatSlotDisplay(b.slotTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-primary-dark">{formatINR(b.price)}</div>
            <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-700"}`}>
              {b.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileForm({ initial }: { initial: { email: string; name: string; phone: string } }) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const canSave = name.trim().length >= 2 && phoneValid && !saving;

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired. Sign in again.");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft max-w-xl">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Email</label>
          <input
            value={initial.email}
            disabled
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink-soft cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted">Email is your login — can't be changed here.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Phone (10 digits)</label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-border bg-surface px-3 text-sm font-semibold text-ink-soft">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="flex-1 rounded-r-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {phone.length > 0 && !phoneValid && (
            <p className="mt-1.5 text-xs text-destructive">Enter a valid 10-digit Indian mobile number.</p>
          )}
        </div>
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-xl border border-primary/30 bg-primary-soft p-3 text-sm text-primary-dark">
            Saved.
          </div>
        )}
        <button
          onClick={save}
          disabled={!canSave}
          className="btn-primary rounded-full px-6 py-2.5 text-sm disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
