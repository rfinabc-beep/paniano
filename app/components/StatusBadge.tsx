import { StatusDef } from "@/lib/types";

export default function StatusBadge({ status, statuses }: { status: string; statuses: StatusDef[] }) {
  const def = statuses.find((s) => s.key === status);
  const label = def?.label ?? status;

  let style = "bg-line text-ink";
  if (def) {
    const stepperStatuses = statuses.filter((s) => s.in_stepper).sort((a, b) => a.sort_order - b.sort_order);
    const isLast = stepperStatuses.length > 0 && stepperStatuses[stepperStatuses.length - 1].key === status;
    if (def.is_exception) {
      style = "bg-rust/20 text-rust";
    } else if (isLast) {
      style = "bg-route text-paper";
    } else if (def.in_stepper && stepperStatuses[0]?.key !== status) {
      style = "bg-beacon/30 text-ink";
    }
  }

  return (
    <span className={`inline-block px-3 py-1 font-mono-track text-xs uppercase ${style}`}>
      {label}
    </span>
  );
}
