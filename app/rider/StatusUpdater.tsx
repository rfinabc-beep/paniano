"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ParcelStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<ParcelStatus, { next: ParcelStatus; label: string }>> = {
  pending: { next: "picked_up", label: "Mark as picked up" },
  picked_up: { next: "in_transit", label: "Start delivery" },
  in_transit: { next: "delivered", label: "Mark as delivered" },
};

export default function StatusUpdater({ parcelId, status }: { parcelId: string; status: ParcelStatus }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const step = NEXT_STATUS[status];
  if (!step) return null;

  async function handleClick() {
    setLoading(true);
    await supabase.from("parcels").update({ status: step!.next }).eq("id", parcelId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-secondary disabled:opacity-50">
      {loading ? "Updating..." : step.label}
    </button>
  );
}
