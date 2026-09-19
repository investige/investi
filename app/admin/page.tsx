import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">წვდომა შეზღუდულია</h1>
        <p className="text-purple-200">ეს გვერდი მხოლოდ ადმინისთვისაა.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">ადმინის პანელი</h1>
      <AdminDashboard />
    </main>
  );
}
