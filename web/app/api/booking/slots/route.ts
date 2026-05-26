import { NextResponse } from "next/server";
import { SPORTS, type SportId } from "@/lib/constants";
import { generateHourlySlots } from "@/lib/slots";
import { fetchSlots } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sport = url.searchParams.get("sport") as SportId | null;
  const date = url.searchParams.get("date");

  if (!sport || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const config = SPORTS.find((s) => s.id === sport);
  if (!config) {
    return NextResponse.json({ error: "Unknown sport" }, { status: 400 });
  }

  // If Sheets isn't configured yet, fall back to "all slots open" so the dev
  // experience still works end-to-end. In production we expect Sheets to be set.
  try {
    const slots = await fetchSlots({ sport, date });
    if (slots && slots.length > 0) {
      return NextResponse.json({ slots });
    }
  } catch (err) {
    console.warn("[slots] Sheets unavailable, returning open slots:", err);
  }

  const all = generateHourlySlots(config.openTime, config.closeTime);
  const slots = all.map((time) => ({
    time,
    remaining: config.courts,
    available: true,
  }));
  return NextResponse.json({ slots });
}
