"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusDef } from "@/lib/types";

export default function AssignRider({
  parcelId,
  currentRiderId,
  currentStatus,
  riders,
  statuses,
}: {
  parcelId: string;
  currentRiderId: string | null;
  currentStatus: string;
  riders: { id: string; full_name: string | null }[];
  statuses: StatusDef[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const sortedStatuses = [...statuses].sort((a, b) => a.sort_order - b.sort_order);

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
        {sortedStatuses.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
