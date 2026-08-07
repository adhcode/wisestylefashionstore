import { PALETTE } from "@/lib/palette";
import type { JobStatus } from "@/domain/entities";

const MAP: Record<JobStatus, { bg: string; color: string }> = {
  Completed: { bg: "#E4F3EC", color: PALETTE.emerald },
  "In Progress": { bg: "#FBF0DE", color: PALETTE.amber },
  Pending: { bg: "#F1EFEC", color: PALETTE.gray },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const s = MAP[status] ?? MAP.Pending;
  return (
    <span
      className="text-xs font-semibold px-2 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}
