"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { VEHICLE_TYPES, VehicleType } from "@/lib/types";
import VehicleIcon from "../components/VehicleIcon";

const BASE_RATE: Record<VehicleType, number> = {
  Bike: 40,
  Car: 80,
  Van: 150,
  Truck: 300,
};

export default function BookingForm({
  userId,
  startOpen = false,
}: {
  userId?: string;
  startOpen?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(startOpen);
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
    vehicle_type: "Bike" as VehicleType,
  });
  const [stops, setStops] = useState<string[]>([]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addStop() {
    setStops((s) => [...s, ""]);
  }

  function updateStop(index: number, value: string) {
    setStops((s) => s.map((st, i) => (i === index ? value : st)));
  }

  function removeStop(index: number) {
    setStops((s) => s.filter((_, i) => i !== index));
  }

  function resetForm() {
    setForm({
      sender_name: "",
      sender_phone: "",
      pickup_address: "",
      receiver_name: "",
      receiver_phone: "",
      delivery_address: "",
      parcel_type: "Document",
      weight_kg: "1",
      vehicle_type: "Bike",
    });
    setStops([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const weight = parseFloat(form.weight_kg) || 1;
    const price = BASE_RATE[form.vehicle_type] + weight * 20;
    const stopsPayload = stops.filter((s) => s.trim()).map((address) => ({ address }));

    if (!userId) {
      const { data: trackingId, error: rpcError } = await supabase.rpc("book_guest_parcel", {
        p_sender_name: form.sender_name,
        p_sender_phone: form.sender_phone,
        p_pickup_address: form.pickup_address,
        p_receiver_name: form.receiver_name,
        p_receiver_phone: form.receiver_phone,
        p_delivery_address: form.delivery_address,
        p_parcel_type: form.parcel_type,
        p_weight_kg: weight,
        p_price: price,
        p_vehicle_type: form.vehicle_type,
        p_stops: stopsPayload,
      });

      setLoading(false);

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      if (trackingId) {
        router.push(`/track/${trackingId}`);
      }
      return;
    }

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
      vehicle_type: form.vehicle_type,
      stops: stopsPayload,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setOpen(false);
    resetForm();
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
    <form onSubmit={handleSubmit} className="card mt-4 flex flex-col gap-6">
      {/* Route */}
      <div>
        <p className="font-mono-track text-xs uppercase text-ink/50">Route (max. 6 stops)</p>
        <div className="mt-3 flex flex-col">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-route" />
            <input
              required
              value={form.pickup_address}
              onChange={(e) => update("pickup_address", e.target.value)}
              placeholder="Pickup location"
              className="input-field"
            />
          </div>

          {stops.map((stop, i) => (
            <div key={i} className="mt-3 flex items-center gap-3 pl-[3px]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-line" />
              <input
                required
                value={stop}
                onChange={(e) => updateStop(i, e.target.value)}
                placeholder={`Stop ${i + 1}`}
                className="input-field"
              />
              <button
                type="button"
                onClick={() => removeStop(i)}
                className="shrink-0 font-mono-track text-xs uppercase text-rust"
                aria-label="Remove stop"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-3 flex items-center gap-3">
            <svg width="10" height="10" viewBox="0 0 24 24" className="shrink-0 text-rust">
              <path d="M12 2 L20 20 H4 Z" fill="currentColor" />
            </svg>
            <input
              required
              value={form.delivery_address}
              onChange={(e) => update("delivery_address", e.target.value)}
              placeholder="Drop-off location"
              className="input-field"
            />
          </div>
        </div>

        {stops.length < 6 && (
          <button
            type="button"
            onClick={addStop}
            className="mt-3 font-mono-track text-xs uppercase text-route hover:text-ink"
          >
            + Add stop
          </button>
        )}
      </div>

      {/* Vehicle type */}
      <div>
        <p className="font-mono-track text-xs uppercase text-ink/50">Vehicle type</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {VEHICLE_TYPES.map((v) => {
            const selected = form.vehicle_type === v.type;
            return (
              <button
                key={v.type}
                type="button"
                onClick={() => update("vehicle_type", v.type)}
                className={`flex flex-col items-center gap-2 border-2 px-3 py-4 text-center transition-colors ${
                  selected ? "border-route bg-route/5" : "border-line hover:border-ink/30"
                }`}
              >
                <VehicleIcon type={v.type} className={`h-9 w-9 ${selected ? "text-route" : "text-ink/60"}`} />
                <span className="font-display text-sm uppercase text-ink">{v.label}</span>
                <span className="text-xs text-ink/50">{v.blurb}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sender / receiver */}
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
        {open && !startOpen && (
          <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
