import { NextResponse } from "next/server";
import { z } from "zod";
import { SPORTS, type SportId } from "@/lib/constants";
import { createBooking } from "@/lib/db";
import { sendBookingEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

const SPORT_IDS = SPORTS.map((s) => s.id) as [SportId, ...SportId[]];

const BookingSchema = z.object({
  sport: z.enum(SPORT_IDS),
  sportName: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMin: z.number().int().positive(),
  priceINR: z.number().int().nonnegative(),
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, error: first?.message || "Invalid booking" },
      { status: 400 }
    );
  }

  const result = await createBooking(parsed.data);
  if (!result.success) {
    const code = result.error === "Not signed in" ? 401 : 400;
    return NextResponse.json(
      { success: false, error: result.error || "Booking failed" },
      { status: code }
    );
  }

  // Fire-and-forget email notification. Don't block the response on it.
  sendBookingEmails({
    bookingId: result.bookingId!,
    sportName: parsed.data.sportName,
    date: parsed.data.date,
    slotTime: parsed.data.slotTime,
    durationMin: parsed.data.durationMin,
    priceINR: parsed.data.priceINR,
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
  }).catch((err) => console.error("[booking] email dispatch failed:", err));

  return NextResponse.json({ success: true, bookingId: result.bookingId });
}
