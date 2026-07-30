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
    router.push(`/track/${encodeURIComponent(id)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        placeholder="ট্র্যাকিং আইডি লিখুন, যেমন: PT12AB34CD"
        className="input-field font-mono-track"
      />
      <button type="submit" className="btn-primary">
        ট্র্যাক করুন
      </button>
    </form>
  );
}
