import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Single job: refresh the Supabase auth cookie on every non-static request.
// All actual auth gating lives in the page server components + route handlers
// (see /book, /account, /admin and their API counterparts). This separation
// matches the @supabase/ssr canonical pattern and the working healthy-food
// implementation — earlier versions did auth gating here too, which dropped
// freshly-refreshed cookies during redirect responses.
//
// Next.js 16 calls this convention "proxy" (file: proxy.ts), formerly middleware.ts.

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
