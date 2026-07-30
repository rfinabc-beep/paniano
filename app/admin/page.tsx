import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Parcel } from "@/lib/types";
import SignOutButton from "../components/SignOutButton";
import StatusBadge from "../components/StatusBadge";
import AssignRider from "./AssignRider";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: parcels }, { data: riders }] = await Promise.all([
    supabase.from("parcels").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("role", "rider"),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide text-ink">
          পথ<span className="text-rust">.</span>
        </Link>
        <SignOutButton />
      </div>

      <h1 className="mt-8 font-display text-3xl uppercase tracking-wide text-ink">অ্যাডমিন ড্যাশবোর্ড</h1>
      <p className="mt-1 text-ink/60">মোট বুকিং: {parcels?.length ?? 0}</p>

      <div className="mt-6 flex flex-col gap-3">
        {(parcels as Parcel[] | null)?.length ? (
          (parcels as Parcel[]).map((p) => (
            <div key={p.id} className="card flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono-track text-sm text-rust">{p.tracking_id}</p>
                <StatusBadge status={p.status} />
              </div>
              <div className="grid gap-2 text-sm text-ink/80 md:grid-cols-2">
                <p><span className="text-ink/50">প্রেরক:</span> {p.sender_name} ({p.sender_phone})</p>
                <p><span className="text-ink/50">প্রাপক:</span> {p.receiver_name} ({p.receiver_phone})</p>
                <p><span className="text-ink/50">পিকআপ:</span> {p.pickup_address}</p>
                <p><span className="text-ink/50">ডেলিভারি:</span> {p.delivery_address}</p>
                <p><span className="text-ink/50">মূল্য:</span> ৳{p.price}</p>
              </div>
              <AssignRider
                parcelId={p.id}
                currentRiderId={p.rider_id}
                currentStatus={p.status}
                riders={riders ?? []}
              />
            </div>
          ))
        ) : (
          <p className="card text-ink/60">এখনো কোনো বুকিং নেই।</p>
        )}
      </div>
    </main>
  );
}
