"use client";

import { useState } from "react";

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return "880" + digits.slice(1);
  return digits;
}

export default function ShareTrackingActions({
  trackingId,
  receiverName,
  receiverPhone,
}: {
  trackingId: string;
  receiverName: string;
  receiverPhone: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/t/${trackingId}` : "";
  const message = `Hi ${receiverName}, track your LogiExpress delivery here: ${url}`;
  const waLink = `https://wa.me/${toWhatsAppNumber(receiverPhone)}?text=${encodeURIComponent(message)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={handleCopy} className="btn-secondary py-2 text-sm">
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 text-sm">
        Send via WhatsApp
      </a>
    </div>
  );
}
