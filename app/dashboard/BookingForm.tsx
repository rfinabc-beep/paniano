"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BookingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    sender_name: "",
    sender_phone: "",
    pickup_address: "",
    receiver_name: "",
    receiver_phone: "",
    delivery_address: "",
    parcel_type: "Document",
    weight_kg: "1",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const weight = parseFloat(form.weight_kg) || 1;
    const price = 60 + weight * 20;

    const { error: insertError } = await supabase.from("parcels").insert({
      customer_id: userId,
      sender_name: form.sender_name,
      sender_phone: form.sender_phone,
      pickup_address: form.pickup_address,
      receiver_name: form.receiver_name,
      receiver_phone: form.receiver_phone,
      delivery_address: form.delivery_address,
      parcel_type: form.parcel_type,
      weight_kg: weight,
      price,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setOpen(false);
    setForm({
      sender_name: "",
      sender_phone: "",
      pickup_address: "",
      receiver_name: "",
      receiver_phone: "",
      delivery_address: "",
      parcel_type: "Document",
      weight_kg: "1",
    });
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        + New booking
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-4 flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          value={form.sender_name}
          onChange={(e) => update("sender_name", e.target.value)}
          placeholder="Sender name"
          className="input-field"
        />
        <input
          required
          value={form.sender_phone}
          onChange={(e) => update("sender_phone", e.target.value)}
          placeholder="Sender mobile"
          className="input-field"
        />
      </div>
      <input
        required
        value={form.pickup_address}
        onChange={(e) => update("pickup_address", e.target.value)}
        placeholder="Pickup address"
        className="input-field"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          value={form.receiver_name}
          onChange={(e) => update("receiver_name", e.target.value)}
          placeholder="Receiver name"
          className="input-field"
        />
        <input
          required
          value={form.receiver_phone}
          onChange={(e) => update("receiver_phone", e.target.value)}
          placeholder="Receiver mobile"
          className="input-field"
        />
      </div>
      <input
        required
        value={form.delivery_address}
        onChange={(e) => update("delivery_address", e.target.value)}
        placeholder="Delivery address"
        className="input-field"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={form.parcel_type}
          onChange={(e) => update("parcel_type", e.target.value)}
          className="input-field"
        >
          <option>Document</option>
          <option>Clothing</option>
          <option>Electronics</option>
          <option>Food</option>
          <option>Other</option>
        </select>
        <input
          required
          type="number"
          min="0.1"
          step="0.1"
          value={form.weight_kg}
          onChange={(e) => update("weight_kg", e.target.value)}
          placeholder="Weight (kg)"
          className="input-field"
        />
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "Booking..." : "Confirm booking"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
