"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusDef } from "@/lib/types";

function slugify(label: string) {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || `status_${Date.now()}`
  );
}

function StatusRow({
  status,
  onUpdated,
  onDeleted,
}: {
  status: StatusDef;
  onUpdated: (patch: Partial<StatusDef>) => void;
  onDeleted: () => void;
}) {
  const supabase = createClient();
  const [label, setLabel] = useState(status.label);
  const [defaultNote, setDefaultNote] = useState(status.default_note ?? "");
  const [inStepper, setInStepper] = useState(status.in_stepper);
  const [isException, setIsException] = useState(status.is_exception);
  const [sortOrder, setSortOrder] = useState(status.sort_order);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setError(null);
    const patch = {
      label,
      default_note: defaultNote || null,
      in_stepper: inStepper,
      is_exception: isException,
      sort_order: sortOrder,
    };
    const { error: updateError } = await supabase.from("statuses").update(patch).eq("key", status.key);
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onUpdated(patch);
  }

  async function remove() {
    if (!confirm(`Delete status "${status.label}"? This fails if any booking currently uses it.`)) return;
    setLoading(true);
    setError(null);
    const { error: deleteError } = await supabase.from("statuses").delete().eq("key", status.key);
    setLoading(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    onDeleted();
  }

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono-track text-xs text-ink/40">{status.key}</span>
        <input value={label} onChange={(e) => setLabel(e.target.value)} className="input-field flex-1 min-w-[160px]" />
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
          className="input-field w-20"
          title="Order"
        />
      </div>
      <input
        value={defaultNote}
        onChange={(e) => setDefaultNote(e.target.value)}
        placeholder="Default timeline note (optional)"
        className="input-field text-sm"
      />
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={inStepper} onChange={(e) => setInStepper(e.target.checked)} />
          Show in progress stepper
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isException} onChange={(e) => setIsException(e.target.checked)} />
          Exception style (like Cancelled)
        </label>
      </div>
      {error && <p className="text-sm text-rust">{error}</p>}
      <div className="flex gap-3">
        <button onClick={save} disabled={loading} className="btn-secondary py-2 text-sm disabled:opacity-50">
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={remove} disabled={loading} className="font-mono-track text-xs uppercase text-rust">
          Delete
        </button>
      </div>
    </div>
  );
}

export default function StatusManager({ initialStatuses }: { initialStatuses: StatusDef[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [statuses, setStatuses] = useState(initialStatuses);
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addStatus(e: React.FormEvent) {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;

    setLoading(true);
    setError(null);
    const key = slugify(label);
    const maxOrder = statuses.reduce((m, s) => Math.max(m, s.sort_order), 0);

    const { data, error: insertError } = await supabase
      .from("statuses")
      .insert({ key, label, sort_order: maxOrder + 1, in_stepper: true, is_exception: false })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNewLabel("");
    if (data) setStatuses((s) => [...s, data as StatusDef]);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={addStatus} className="card flex flex-wrap items-center gap-3">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New status label, e.g. At sorting hub"
          className="input-field flex-1 min-w-[200px]"
        />
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "Adding..." : "+ Add status"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-rust">{error}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {[...statuses]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((s) => (
            <StatusRow
              key={s.key}
              status={s}
              onUpdated={(patch) => {
                setStatuses((prev) => prev.map((row) => (row.key === s.key ? { ...row, ...patch } : row)));
                router.refresh();
              }}
              onDeleted={() => {
                setStatuses((prev) => prev.filter((row) => row.key !== s.key));
                router.refresh();
              }}
            />
          ))}
      </div>
    </div>
  );
}
