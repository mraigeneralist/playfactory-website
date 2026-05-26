import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Auth gate for /book, /account, and /admin via Supabase Auth.
// Anonymous browsing of the home page, /coaching, /memberships etc. is fine —
// only the routes below require a session.
//
// Next.js 16 calls this convention "proxy" (file: proxy.ts) — formerly middleware.ts.

const REQUIRES_AUTH = [/^\/book(\/|$)/, /^\/account(\/|$)/, /^\/api\/account(\/|$)/, /^\/api\/booking$/];
const REQUIRES_ADMIN = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/];
const PUBLIC_AUTH_ROUTES = ["/login", "/signup", "/auth/callback", "/auth/forgot"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public auth screens: always let through.
  if (PUBLIC_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAuth = REQUIRES_AUTH.some((re) => re.test(pathname));
  const needsAdmin = REQUIRES_ADMIN.some((re) => re.test(pathname));

  if ((needsAuth || needsAdmin) && !user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && user) {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/book/:path*",
    "/account/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/account/:path*",
    "/api/booking",
  ],
};
