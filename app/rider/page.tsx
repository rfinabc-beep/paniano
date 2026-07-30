import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Parcel } from "@/lib/types";
import SignOutButton from "../components/SignOutButton";
import StatusBadge from "../components/StatusBadge";
import StatusUpdater from "./StatusUpdater";

export default async function RiderPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: parcels } = await supabase
    .from("parcels")
    .select("*")
    .eq("rider_id", user.id)
    .in("status", ["pending", "picked_up", "in_transit"])
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide text-ink">
          পথ<span className="text-rust">.</span>
        </Link>
        <SignOutButton />
      </div>

      <h1 className="mt-8 font-display text-3xl uppercase tracking-wide text-ink">আমার ডেলিভারি তালিকা</h1>

      <div className="mt-6 flex flex-col gap-3">
        {(parcels as Parcel[] | null)?.length ? (
          (parcels as Parcel[]).map((p) => (
            <div key={p.id} className="card flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono-track text-sm text-rust">{p.tracking_id}</p>
                <StatusBadge status={p.status} />
              </div>
              <div className="grid gap-2 text-sm text-ink/80 md:grid-cols-2">
                <p><span className="text-ink/50">পিকআপ:</span> {p.pickup_address}</p>
                <p><span className="text-ink/50">ডেলিভারি:</span> {p.delivery_address}</p>
                <p><span className="text-ink/50">প্রাপক:</span> {p.receiver_name} ({p.receiver_phone})</p>
                <p><span className="text-ink/50">ওজন:</span> {p.weight_kg} কেজি</p>
              </div>
              <div>
                <StatusUpdater parcelId={p.id} status={p.status} />
              </div>
            </div>
          ))
        ) : (
          <p className="card text-ink/60">আপাতত কোনো পার্সেল বরাদ্দ নেই।</p>
        )}
      </div>
    </main>
  );
}
