import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ParcelStatus, STATUS_LABEL, StatusHistoryRow } from "@/lib/types";
import StatusBadge from "../../components/StatusBadge";

interface TrackResult {
  tracking_id: string;
  status: ParcelStatus;
  parcel_type: string;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  updated_at: string;
}

export default async function TrackPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc("track_parcel", { p_tracking_id: params.id })
    .maybeSingle<TrackResult>();

  const { data: historyData } = await supabase.rpc("track_parcel_history", {
    p_tracking_id: params.id,
  });
  const history = historyData as StatusHistoryRow[] | null;

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
            <StatusBadge status={data.status} />
          </div>
          <div className="route-line route-dashes my-6" />
          <div className="grid gap-4 text-ink/80">
            <div>
              <p className="font-mono-track text-xs uppercase text-ink/50">Pickup</p>
              <p>{data.pickup_address}</p>
            </div>
            <div>
              <p className="font-mono-track text-xs uppercase text-ink/50">Delivery</p>
              <p>{data.delivery_address}</p>
            </div>
          </div>

          {history && history.length > 0 && (
            <div className="mt-8">
              <p className="font-display text-lg uppercase text-ink">Status history</p>
              <ul className="mt-4 flex flex-col gap-4 border-l-2 border-line pl-4">
                {history.map((h) => (
                  <li key={h.id}>
                    <p className="font-display uppercase text-ink">{STATUS_LABEL[h.status]}</p>
                    <p className="font-mono-track text-xs text-ink/50">
                      {new Date(h.created_at).toLocaleString("en-US")}
                    </p>
                    {h.note && <p className="text-sm text-ink/70">{h.note}</p>}
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
