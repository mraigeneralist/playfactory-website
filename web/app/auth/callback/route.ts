import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase email-confirm + magic-link land here. Exchange the code for a
// session, then redirect to whatever ?next= says (or /account by default).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/account";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
