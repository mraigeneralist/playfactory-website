import { NextResponse } from "next/server";
import { SPORTS, type SportId } from "@/lib/constants";
import { fetchSlots } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sport = url.searchParams.get("sport") as SportId | null;
  const date = url.searchParams.get("date");

  if (!sport || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  if (!SPORTS.find((s) => s.id === sport)) {
    return NextResponse.json({ error: "Unknown sport" }, { status: 400 });
  }

  try {
    const slots = await fetchSlots({ sport, date });
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("[slots]", err);
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}
