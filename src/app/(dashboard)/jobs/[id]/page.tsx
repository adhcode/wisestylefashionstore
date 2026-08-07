import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/services/auth-service";
import { jobService } from "@/services/job-service";
import { buildPaymentEntries } from "@/domain/calculations";
import { jobDerived } from "@/domain/calculations";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { MATERIALS_DEF } from "@/domain/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MeasureBar } from "@/components/ui/MeasureBar";
import { ProgressUpdater } from "@/components/jobs/ProgressUpdater";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, job] = await Promise.all([getCurrentUser(), jobService.getById(id)]);
  if (!job) notFound();

  const d = jobDerived(job);
  const materials = MATERIALS_DEF.filter((md) => job.materials[md.key]?.included);
  const canSeeFinancials = user?.role !== "TAILOR";
  const payments = canSeeFinancials ? buildPaymentEntries(job) : [];

  return (
    <div className="max-w-3xl">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-slate mb-4">
        <ArrowLeft size={14} /> Back to Jobs
      </Link>

      <div className="bg-white rounded-lg border border-line p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-ink font-serif">
              {styleLabelOf(job)} — {job.jobNumber}
            </p>
            <p className="text-sm text-slate">
              {job.customerName}
            </p>
          </div>
          <StatusBadge status={d.status} />
        </div>

        <div className="mb-4">
          <MeasureBar value={d.progress} />
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
          <div>
            <p className="text-xs text-slate">Date Received</p>
            <p className="text-ink">{job.dateReceived ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate">Start Date</p>
            <p className="text-ink">{job.startDate ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate">Expected Completion</p>
            <p className="text-ink">{job.completionDate ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate">Actual Completion</p>
            <p className="text-ink">{job.actualCompletionDate ?? "—"}</p>
          </div>
        </div>

        <p className="text-xs font-semibold uppercase mb-2 text-slate tracking-wide">Materials needed (scope)</p>
        {materials.length === 0 ? (
          <p className="text-sm mb-4 text-slate">No materials ticked for this job.</p>
        ) : (
          <div className="border border-line rounded-lg divide-y divide-line mb-4">
            {materials.map((md) => {
              const m = job.materials[md.key];
              return (
                <div key={md.key} className="flex items-center justify-between px-3 py-1.5 text-sm">
                  <span className="text-ink">{md.label}</span>
                  <span className="text-slate">
                    {m.qty} {md.unit} × {formatCurrency(m.cost)}
                  </span>
                  {canSeeFinancials && <span className="font-semibold text-ink">{formatCurrency(m.qty * m.cost)}</span>}
                </div>
              );
            })}
          </div>
        )}

        <div className="mb-4">
          <ProgressUpdater jobId={job.id} initialProgress={job.progress} />
        </div>

        {canSeeFinancials && (
          <>
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: "#F7F2E8" }}>
              <p className="text-xs font-semibold uppercase mb-2 text-slate tracking-wide">Contract price allocation</p>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-slate">Contract Price</span>
                <span className="text-right font-semibold">{formatCurrency(d.contractPrice)}</span>
                <span className="text-slate">Material Budget</span>
                <span className="text-right font-semibold">{formatCurrency(d.materialBudget)}</span>
                <span className="text-slate">Tailor Fee (25%)</span>
                <span className="text-right font-semibold">{formatCurrency(d.tailorFee)}</span>
                <span className="text-slate">Office &amp; Utility (40%)</span>
                <span className="text-right font-semibold">{formatCurrency(d.officeUtility)}</span>
                <span className="text-slate">Miscellaneous (5%)</span>
                <span className="text-right font-semibold">{formatCurrency(d.miscellaneous)}</span>
                <span className="font-bold text-ink">Profit (30%)</span>
                <span className="text-right font-bold" style={{ color: "#1E8A5F" }}>
                  {formatCurrency(d.profit)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded p-2 text-center" style={{ backgroundColor: "#E4F3EC" }}>
                <p className="text-xs text-slate">Total Paid</p>
                <p className="font-bold" style={{ color: "#1E8A5F" }}>
                  {formatCurrency(d.totalPaid)}
                </p>
              </div>
              <div className="rounded p-2 text-center" style={{ backgroundColor: "#FBEAEA" }}>
                <p className="text-xs text-slate">Outstanding</p>
                <p className="font-bold" style={{ color: "#B23A48" }}>
                  {formatCurrency(d.outstanding)}
                </p>
              </div>
              <div className="rounded p-2 text-center" style={{ backgroundColor: "#F7F2E8" }}>
                <p className="text-xs text-slate">Tailor</p>
                <p className="font-bold text-ink">{job.tailorName ?? "—"}</p>
              </div>
            </div>

            {payments.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase mb-2 text-slate tracking-wide">Payment history</p>
                <div className="border border-line rounded-lg divide-y divide-line mb-4">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-1.5 text-sm">
                      <span className="text-ink">
                        {p.date || "—"} • {p.type === "refund" ? "Refund" : p.method || "—"}
                      </span>
                      <span className="font-semibold" style={{ color: p.type === "refund" ? "#B23A48" : "#1E8A5F" }}>
                        {p.type === "refund" ? "-" : ""}
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {job.notes && (
          <>
            <p className="text-xs font-semibold uppercase mb-1 text-slate tracking-wide">Notes</p>
            <p className="text-sm text-ink">{job.notes}</p>
          </>
        )}
      </div>
    </div>
  );
}
