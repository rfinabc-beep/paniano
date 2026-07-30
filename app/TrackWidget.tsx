"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackWidget() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = trackingId.trim();
    if (!id) return;
    router.push(`/t/${encodeURIComponent(id)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        placeholder="Enter tracking ID, e.g. PT12AB34CD"
        className="input-field font-mono-track"
      />
      <button type="submit" className="btn-primary">
        Track
      </button>
    </form>
  );
}
