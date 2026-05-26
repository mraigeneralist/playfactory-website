// Supabase-backed data layer. Replaces the old lib/sheets.ts.
//
// Read paths (slots) use the anon key + RLS (public reads on sports + blocked_slots).
// Write paths (createBooking) run server-side with the user's session cookie so
// RLS enforces that customers can only insert bookings tied to their own auth.uid.
// Admin reads use the service role and bypass RLS.

import { createClient as createServerSupabase } from "./supabase/server";
import { createServiceClient } from "./supabase/service";
import { generateHourlySlots } from "./slots";
import type {
  AdminBooking,
  BookingPayload,
  BookingResult,
  MyBooking,
  Slot,
} from "./types";

// ─── Public reads ────────────────────────────────────────────────────────────

export interface SportRow {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  priceINR: number;
  durationMin: number;
  courts: number;
  openTime: string;
  closeTime: string;
}

async function getSportFromDb(sportId: string): Promise<SportRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("sports")
    .select("id,name,short_name,description,icon,price_inr,duration_min,courts,open_time,close_time")
    .eq("id", sportId)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    shortName: data.short_name,
    description: data.description,
    icon: data.icon,
    priceINR: data.price_inr,
    durationMin: data.duration_min,
    courts: data.courts,
    openTime: String(data.open_time).slice(0, 5),
    closeTime: String(data.close_time).slice(0, 5),
  };
}

export async function fetchSlots(params: {
  sport: string;
  date: string;
}): Promise<Slot[]> {
  const sport = await getSportFromDb(params.sport);
  if (!sport) return [];

  const all = generateHourlySlots(sport.openTime, sport.closeTime);
  const supabase = createServiceClient();

  // Count active bookings per slot_time
  const { data: bookings } = await supabase
    .from("bookings")
    .select("slot_time")
    .eq("sport_id", params.sport)
    .eq("date", params.date)
    .in("status", ["confirmed", "completed"]);

  const counts = new Map<string, number>();
  (bookings || []).forEach((b) => {
    const t = String(b.slot_time).slice(0, 5);
    counts.set(t, (counts.get(t) || 0) + 1);
  });

  // Blocked slots (sport-specific or all-sports null)
  const { data: blocks } = await supabase
    .from("blocked_slots")
    .select("slot_time,sport_id")
    .eq("date", params.date);

  const blocked = new Set<string>();
  (blocks || []).forEach((b) => {
    if (b.sport_id === null || b.sport_id === params.sport) {
      blocked.add(String(b.slot_time).slice(0, 5));
    }
  });

  return all.map((time) => {
    const used = counts.get(time) || 0;
    const isBlocked = blocked.has(time);
    const remaining = isBlocked ? 0 : Math.max(0, sport.courts - used);
    return { time, remaining, available: remaining > 0 };
  });
}

// ─── Booking write (uses the user's session client) ──────────────────────────

export async function createBooking(
  payload: BookingPayload
): Promise<BookingResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not signed in" };
  }

  // Re-validate sport + price against DB (defense against tampering)
  const sport = await getSportFromDb(payload.sport);
  if (!sport) return { success: false, error: "Unknown sport" };
  if (sport.priceINR !== payload.priceINR) {
    return { success: false, error: "Price mismatch — please refresh." };
  }

  // Capacity check via service role (RLS would block counting other users' rows)
  const service = createServiceClient();
  const { count } = await service
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("sport_id", payload.sport)
    .eq("date", payload.date)
    .eq("slot_time", payload.slotTime)
    .in("status", ["confirmed", "completed"]);

  if ((count || 0) >= sport.courts) {
    return { success: false, error: "This slot just got fully booked. Pick another." };
  }

  // Block check
  const { data: blocks } = await service
    .from("blocked_slots")
    .select("id")
    .eq("date", payload.date)
    .eq("slot_time", payload.slotTime)
    .or(`sport_id.eq.${payload.sport},sport_id.is.null`)
    .limit(1);
  if (blocks && blocks.length > 0) {
    return { success: false, error: "This slot is blocked." };
  }

  const bookingId = generateBookingId();

  const { error } = await supabase.from("bookings").insert({
    booking_id: bookingId,
    user_id: user.id,
    sport_id: payload.sport,
    sport_name: payload.sportName,
    date: payload.date,
    slot_time: payload.slotTime,
    duration_min: payload.durationMin,
    price: payload.priceINR,
    name: payload.name,
    phone: payload.phone,
    email: payload.email || user.email || "",
    status: "confirmed",
    source: "website",
  });

  if (error) {
    console.error("[db.createBooking]", error);
    return { success: false, error: error.message };
  }

  return { success: true, bookingId };
}

function generateBookingId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `PF${stamp}-${rand}`;
}

// ─── Admin reads (service role) ──────────────────────────────────────────────

export async function fetchAllBookings(): Promise<AdminBooking[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToAdminBooking);
}

function rowToAdminBooking(r: Record<string, unknown>): AdminBooking {
  return {
    bookingId: String(r.booking_id),
    createdAt: String(r.created_at).slice(0, 19).replace("T", " "),
    sport: String(r.sport_id),
    sportName: String(r.sport_name),
    date: String(r.date),
    slotTime: String(r.slot_time).slice(0, 5),
    durationMin: Number(r.duration_min) || 0,
    price: Number(r.price) || 0,
    name: String(r.name || ""),
    phone: String(r.phone || ""),
    email: String(r.email || ""),
    status: r.status as AdminBooking["status"],
    source: r.source as AdminBooking["source"],
  };
}

// ─── Customer's own bookings (uses session client → RLS enforces ownership) ─

export async function fetchMyBookings(): Promise<MyBooking[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("booking_id, sport_name, date, slot_time, price, status, created_at")
    .order("date", { ascending: false })
    .order("slot_time", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => ({
    bookingId: String(r.booking_id),
    sportName: String(r.sport_name),
    date: String(r.date),
    slotTime: String(r.slot_time).slice(0, 5),
    price: Number(r.price) || 0,
    status: r.status as MyBooking["status"],
    createdAt: String(r.created_at).slice(0, 19).replace("T", " "),
  }));
}

// ─── Admin write helpers (service role) ──────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: AdminBooking["status"]
): Promise<{ success: boolean; error?: string }> {
  const service = createServiceClient();
  const { error } = await service
    .from("bookings")
    .update({ status })
    .eq("booking_id", bookingId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
