import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchMyBookings } from "@/lib/db";
import AccountClient from "./AccountClient";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, email")
    .eq("id", user.id)
    .maybeSingle();

  const bookings = await fetchMyBookings();

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <Logo className="text-2xl sm:text-3xl" />
          </Link>
          <Link
            href="/book"
            className="btn-primary rounded-full px-5 py-2 text-xs"
          >
            Book a Slot
          </Link>
        </div>
      </div>

      <AccountClient
        initialProfile={{
          email: profile?.email || user.email || "",
          name: profile?.name || "",
          phone: profile?.phone || "",
        }}
        bookings={bookings}
      />
    </div>
  );
}
