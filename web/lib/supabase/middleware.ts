import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase auth cookie if its access token is near expiry.
 * Called from proxy.ts on every non-static request.
 *
 * IMPORTANT: this function MUST NOT do auth gating (i.e. don't redirect to
 * /login here). Doing so drops the freshly-refreshed cookies, because the
 * redirect response replaces the one Supabase wrote to.
 * Page-level auth checks happen in the page server components and route
 * handlers via createClient().auth.getUser(), which is the standard
 * @supabase/ssr pattern that healthy-food uses.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return supabaseResponse;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching the user refreshes the auth cookie if needed.
  try {
    await supabase.auth.getUser();
  } catch {
    // Network blip or misconfigured URL — don't take the site down.
  }

  return supabaseResponse;
}
