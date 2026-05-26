import { redirect } from "next/navigation";
import { getUserAndProfile, isAdmin } from "@/lib/supabase/auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user } = await getUserAndProfile();
  if (!user) redirect("/login?next=/admin");
  if (!(await isAdmin())) redirect("/");
  return <AdminDashboard />;
}
