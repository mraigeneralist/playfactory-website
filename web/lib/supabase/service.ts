import { createClient as createBaseClient } from "@supabase/supabase-js";

// Service-role client. NEVER import from anything that runs in the browser.
// Bypasses RLS — only use in server-side admin paths (admin reads/writes,
// owner notification logic, etc).
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service role not configured");
  }
  return createBaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
