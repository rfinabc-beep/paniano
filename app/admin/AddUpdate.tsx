"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ParcelStatus } from "@/lib/types";

export default function AddUpdate({ parcelId, currentStatus }: { parcelId: string; currentStatus: ParcelStatus }) {
  const router = useRouter();
  const supabase = createClient();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = note.trim();
    if (!text) return;

    setLoading(true);
    await supabase.from("status_history").insert({
      parcel_id: parcelId,
      status: currentStatus,
      note: text,
    });
    setLoading(false);
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a delivery timeline update (shown on tracking page)"
        className="input-field py-2 text-sm"
      />
      <button type="submit" disabled={loading || !note.trim()} className="btn-secondary shrink-0 py-2 text-sm disabled:opacity-50">
        {loading ? "Adding..." : "Add update"}
      </button>
    </form>
  );
}
