import { redirect } from "next/navigation";

import { DashboardLoginForm } from "@/components/dashboard/login-form";
import { getSession } from "@/lib/auth";

export default async function DashboardLoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto grid w-full max-w-lg gap-4">
      <DashboardLoginForm />
    </main>
  );
}
