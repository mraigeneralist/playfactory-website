import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// Protect /admin/* (except /admin/login) and /api/admin/* (except login route).
// Next.js 16 calls this convention "proxy" (file: proxy.ts) — formerly middleware.ts.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public auth routes
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // No secret configured → admin disabled. Redirect to home rather than expose.
    return NextResponse.redirect(new URL("/", req.url));
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySession(secret, token);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
