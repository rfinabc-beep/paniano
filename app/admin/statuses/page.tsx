import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "../../components/SignOutButton";
import StatusManager from "./StatusManager";

export default async function AdminStatusesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: statuses } = await supabase.from("statuses").select("*").order("sort_order");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide text-ink">
          Logi<span className="text-rust">Express</span>
        </Link>
        <SignOutButton />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase tracking-wide text-ink">Manage statuses</h1>
        <Link href="/admin" className="font-mono-track text-sm uppercase text-ink/60 hover:text-route">
          ← Back to dashboard
        </Link>
      </div>
      <p className="mt-1 text-ink/60">
        These control the options riders and admin can set, the progress stepper on the tracking page, and the
        default note logged when a booking's status changes.
      </p>

      <div className="mt-6">
        <StatusManager initialStatuses={statuses ?? []} />
      </div>
    </main>
  );
}
