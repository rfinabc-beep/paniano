"use client";

import { useState } from "react";

export default function ShareLink({ trackingId }: { trackingId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/t/${trackingId}` : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; the input remains selectable as a fallback
    }
  }

  return (
    <div className="card mt-6">
      <p className="font-display text-base uppercase text-ink">Share tracking link</p>
      <p className="mt-1 text-sm text-ink/60">Share this link with the recipient so they can follow the delivery.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="input-field font-mono-track text-sm"
        />
        <button onClick={handleCopy} className="btn-primary shrink-0">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
