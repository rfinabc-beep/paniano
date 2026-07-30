"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusDef } from "@/lib/types";

export default function StatusUpdater({
  parcelId,
  status,
  statuses,
}: {
  parcelId: string;
  status: string;
  statuses: StatusDef[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const stepper = [...statuses].filter((s) => s.in_stepper).sort((a, b) => a.sort_order - b.sort_order);
  const currentIndex = stepper.findIndex((s) => s.key === status);
  const next = currentIndex >= 0 && currentIndex < stepper.length - 1 ? stepper[currentIndex + 1] : null;

  if (!next) return null;

  async function handleClick() {
    setLoading(true);
    await supabase.from("parcels").update({ status: next!.key }).eq("id", parcelId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-secondary disabled:opacity-50">
      {loading ? "Updating..." : `Mark as ${next.label}`}
    </button>
  );
}
