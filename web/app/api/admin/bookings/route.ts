import { NextResponse } from "next/server";
import { fetchAllBookings, updateBookingStatus } from "@/lib/db";
import { isAdmin } from "@/lib/supabase/auth";
import type { AdminBooking } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const bookings = await fetchAllBookings();
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("[admin/bookings] GET", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 502 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { bookingId?: string; status?: AdminBooking["status"] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { bookingId, status } = body;
  if (!bookingId || !status) {
    return NextResponse.json({ error: "Missing bookingId or status" }, { status: 400 });
  }
  if (!["confirmed", "cancelled", "no_show", "completed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const result = await updateBookingStatus(bookingId, status);
  if (!result.success) {
    return NextResponse.json({ error: result.error || "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
