import { createClient } from "./server";

/**
 * Read the current user + their profile (name/phone/email) on the server.
 * Returns { user, profile } both possibly null. Use in server components and
 * route handlers — never client code.
 *
 * Perf note: getUser() validates the JWT with the Supabase auth server
 * (~80-200ms). The profile select runs in parallel where possible. The
 * proxy already calls getUser() on every request, but Supabase strongly
 * recommends server components also call it to validate — we honour that.
 */
export async function getUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("name,phone,email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: {
      id: user.id,
      name: (profile?.name as string) || "",
      phone: (profile?.phone as string) || "",
      email: (profile?.email as string) || user.email || "",
    },
  };
}

/**
 * Returns true if the logged-in user's email matches ADMIN_EMAIL.
 * Used by /admin server components and /api/admin route handlers.
 */
export async function isAdmin(): Promise<boolean> {
  const { user } = await getUserAndProfile();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!user || !adminEmail) return false;
  return user.email?.toLowerCase() === adminEmail;
}
