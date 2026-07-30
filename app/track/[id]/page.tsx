import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ParcelStatus, StatusHistoryRow } from "@/lib/types";

interface TrackResult {
  tracking_id: string;
  status: ParcelStatus;
  parcel_type: string;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  updated_at: string;
}

const STAGES: { status: ParcelStatus; label: string }[] = [
  { status: "pending", label: "Accepted" },
  { status: "picked_up", label: "Picked Up" },
  { status: "in_transit", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
];

interface TimelineGroup {
  status: ParcelStatus;
  entries: StatusHistoryRow[];
}

function groupHistory(history: StatusHistoryRow[]): TimelineGroup[] {
  const groups: TimelineGroup[] = [];
  for (const row of history) {
    const last = groups[groups.length - 1];
    if (last && last.status === row.status) {
      last.entries.push(row);
    } else {
      groups.push({ status: row.status, entries: [row] });
    }
  }
  return groups;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TrackPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc("track_parcel", { p_tracking_id: params.id })
    .maybeSingle<TrackResult>();

  const { data: historyData } = await supabase.rpc("track_parcel_history", {
    p_tracking_id: params.id,
  });
  const history = (historyData as StatusHistoryRow[] | null) ?? [];
  const groups = groupHistory(history);

  const isCancelled = data?.status === "cancelled";
  const stageIndex = data ? STAGES.findIndex((s) => s.status === data.status) : -1;
  const progressPct = stageIndex <= 0 ? 4 : (stageIndex / (STAGES.length - 1)) * 100;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="font-display text-2xl uppercase tracking-wide text-ink">
        Logi<span className="text-rust">Express</span>
      </Link>

      <h1 className="mt-8 font-mono-track text-2xl text-rust">{params.id}</h1>

      {!data || error ? (
        <p className="card mt-6 text-ink/60">No parcel was found for this tracking ID.</p>
      ) : (
        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl uppercase text-ink">{data.parcel_type}</p>
            {isCancelled && (
              <span className="inline-block bg-rust/20 px-3 py-1 font-mono-track text-xs uppercase text-rust">
                Cancelled
              </span>
            )}
          </div>

          <div className="grid gap-4 mt-4 text-ink/80">
            <div>
              <p className="font-mono-track text-xs uppercase text-ink/50">Pickup</p>
              <p>{data.pickup_address}</p>
            </div>
            <div>
              <p className="font-mono-track text-xs uppercase text-ink/50">Delivery</p>
              <p>{data.delivery_address}</p>
            </div>
          </div>

          {!isCancelled && (
            <div className="mt-10">
              <p className="font-display text-lg uppercase text-ink">Timeline</p>

              {/* Stepper */}
              <div className="relative mt-8 mb-3">
                <div className="h-[3px] w-full bg-line" />
                <div
                  className="absolute left-0 top-0 h-[3px] bg-route transition-all"
                  style={{ width: `${progressPct}%` }}
                />
                <div
                  className="absolute -top-4 -translate-x-1/2 transition-all"
                  style={{ left: `${progressPct}%` }}
                  aria-hidden="true"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-route">
                    <rect x="1" y="7" width="13" height="9" rx="1" fill="currentColor" />
                    <path d="M14 10h4l3 3v3h-7v-6z" fill="currentColor" opacity="0.7" />
                    <circle cx="6" cy="18" r="2" fill="currentColor" />
                    <circle cx="17" cy="18" r="2" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className="flex justify-between">
                {STAGES.map((s, i) => (
                  <span
                    key={s.status}
                    className={`font-mono-track text-[11px] uppercase ${
                      i <= stageIndex ? "text-ink" : "text-ink/40"
                    }`}
                    style={{ maxWidth: "25%", textAlign: i === 0 ? "left" : i === STAGES.length - 1 ? "right" : "center" }}
                  >
                    {s.label}
                  </span>
                ))}
              </div>

              {/* Grouped event log */}
              <ul className="mt-10 flex flex-col gap-6 border-l-2 border-line pl-5">
                {groups.map((g, gi) => (
                  <li key={gi}>
                    <p className="font-display text-base uppercase text-ink">
                      {STAGES.find((s) => s.status === g.status)?.label ?? g.status}
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {g.entries.map((e) => (
                        <li key={e.id}>
                          {e.note && <p className="text-sm text-ink/80">- {e.note}</p>}
                          <p className="font-mono-track text-xs text-ink/40">{formatTime(e.created_at)}</p>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isCancelled && groups.length > 0 && (
            <div className="mt-8">
              <p className="font-display text-lg uppercase text-ink">Status history</p>
              <ul className="mt-4 flex flex-col gap-4 border-l-2 border-line pl-4">
                {history.map((h) => (
                  <li key={h.id}>
                    {h.note && <p className="text-sm text-ink/80">{h.note}</p>}
                    <p className="font-mono-track text-xs text-ink/40">{formatTime(h.created_at)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
