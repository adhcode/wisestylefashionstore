import { MONTHS } from "./constants";
import type { Job } from "./entities";

export function formatCurrency(n: number): string {
  const val = Number(n) || 0;
  return "₦" + val.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export function monthNameFromDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return MONTHS[d.getMonth()];
}

export function daysUntil(dateStr: string, today: Date = new Date()): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const ref = new Date(today);
  ref.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - ref.getTime()) / 86_400_000);
}

export function styleLabelOf(job: Pick<Job, "style" | "styleOther">): string {
  return job.style === "Others" ? job.styleOther || "Others" : job.style;
}

export function pad(n: number, len = 4): string {
  return String(n).padStart(len, "0");
}
