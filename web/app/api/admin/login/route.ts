import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE, SESSION_TTL } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) {
    return NextResponse.json(
      { error: "Admin not configured. Set ADMIN_PASSWORD and SESSION_SECRET." },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.password !== password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await signSession(secret);
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return res;
}
