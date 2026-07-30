"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ParcelStatus, STATUS_LABEL } from "@/lib/types";

const STATUSES: ParcelStatus[] = ["pending", "picked_up", "in_transit", "delivered", "cancelled"];

export default function AssignRider({
  parcelId,
  currentRiderId,
  currentStatus,
  riders,
}: {
  parcelId: string;
  currentRiderId: string | null;
  currentStatus: ParcelStatus;
  riders: { id: string; full_name: string | null }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function updateRider(riderId: string) {
    setLoading(true);
    await supabase
      .from("parcels")
      .update({ rider_id: riderId || null })
      .eq("id", parcelId);
    setLoading(false);
    router.refresh();
  }

  async function updateStatus(status: string) {
    setLoading(true);
    await supabase
      .from("parcels")
      .update({ status })
      .eq("id", parcelId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        defaultValue={currentRiderId ?? ""}
        onChange={(e) => updateRider(e.target.value)}
        disabled={loading}
        className="input-field py-2 text-sm"
      >
        <option value="">Assign rider</option>
        {riders.map((r) => (
          <option key={r.id} value={r.id}>
            {r.full_name ?? r.id.slice(0, 8)}
          </option>
        ))}
      </select>

      <select
        defaultValue={currentStatus}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={loading}
        className="input-field py-2 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
