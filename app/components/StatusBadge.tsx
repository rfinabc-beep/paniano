import { ParcelStatus, STATUS_LABEL } from "@/lib/types";

const STYLES: Record<ParcelStatus, string> = {
  pending: "bg-line text-ink",
  picked_up: "bg-beacon/30 text-ink",
  in_transit: "bg-route/20 text-route",
  delivered: "bg-route text-paper",
  cancelled: "bg-rust/20 text-rust",
};

export default function StatusBadge({ status }: { status: ParcelStatus }) {
  return (
    <span className={`inline-block px-3 py-1 font-mono-track text-xs uppercase ${STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
