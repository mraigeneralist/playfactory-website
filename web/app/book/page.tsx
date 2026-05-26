import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/auth";
import BookFlow from "./BookFlow";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  // Server-side auth gate. If the user isn't signed in, redirect to /login
  // immediately — no client-side flash, no race with cookie writes.
  const { user, profile } = await getUserAndProfile();
  if (!user || !profile) {
    redirect("/login?next=/book");
  }

  const { sport } = await searchParams;

  return (
    <BookFlow
      initialProfile={profile}
      preselectSportId={sport ?? null}
    />
  );
}
