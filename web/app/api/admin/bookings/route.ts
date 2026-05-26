import { NextResponse } from "next/server";
import { fetchAllBookings } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchAllBookings();
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("[admin/bookings]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 502 }
    );
  }
}
