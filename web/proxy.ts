import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Runs on (almost) every request. Two jobs:
//   1. Refresh the Supabase auth cookie if its access token is near expiry.
//      Without this running site-wide, the user's session silently dies after
//      ~1 hour and they get bounced to /login on the next protected page.
//   2. Gate /book, /account, /admin behind a valid session, and /admin behind
//      ADMIN_EMAIL specifically.
//
// Next.js 16 calls this the "proxy" convention (file: proxy.ts).

const REQUIRES_AUTH = [/^\/book(\/|$)/, /^\/account(\/|$)/, /^\/api\/account(\/|$)/, /^\/api\/booking$/];
const REQUIRES_ADMIN = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/];

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Don't crash the site if env vars are missing (e.g. during first deploy
  // before envs are configured).
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
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
  });

  // Touching the user refreshes the auth cookie if needed.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Network blip or misconfigured URL — don't take the site down.
  }

  const { pathname } = req.nextUrl;
  const needsAuth = REQUIRES_AUTH.some((re) => re.test(pathname));
  const needsAdmin = REQUIRES_ADMIN.some((re) => re.test(pathname));

  if ((needsAuth || needsAdmin) && !user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
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
  // Run on everything EXCEPT static assets and Next internals.
  // Matches healthy-food's working pattern.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
