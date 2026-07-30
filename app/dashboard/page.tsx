import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Parcel } from "@/lib/types";
import BookingForm from "./BookingForm";
import SignOutButton from "../components/SignOutButton";
import StatusBadge from "../components/StatusBadge";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: parcels } = await supabase
    .from("parcels")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide text-ink">
          Logi<span className="text-rust">Express</span>
        </Link>
        <SignOutButton />
      </div>

      <h1 className="mt-8 font-display text-3xl uppercase tracking-wide text-ink">My parcels</h1>
      <div className="mt-4">
        <BookingForm userId={user.id} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {(parcels as Parcel[] | null)?.length ? (
          (parcels as Parcel[]).map((p) => (
            <Link
              key={p.id}
              href={`/track/${p.tracking_id}`}
              className="card flex flex-wrap items-center justify-between gap-3 hover:border-route"
            >
              <div>
                <p className="font-mono-track text-sm text-rust">{p.tracking_id}</p>
                <p className="mt-1 text-ink">{p.receiver_name} — {p.delivery_address}</p>
              </div>
              <StatusBadge status={p.status} />
            </Link>
          ))
        ) : (
          <p className="card text-ink/60">No bookings yet. Use the button above to make your first booking.</p>
        )}
      </div>
    </main>
  );
}
