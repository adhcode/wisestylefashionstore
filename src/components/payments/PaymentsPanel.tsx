"use client";

import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { addJobPayment } from "@/actions/job-actions";
import { buildPaymentEntries, jobDerived } from "@/domain/calculations";
import { formatCurrency, styleLabelOf } from "@/domain/format";
import { STYLES } from "@/domain/constants";
import type { Job, JobStatus, PaymentType } from "@/domain/entities";

export function PaymentsPanel({ jobs }: { jobs: Job[] }) {
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStyle, setFilterStyle] = useState("All");
  const [filterStatus, setFilterStatus] = useState<JobStatus | "All">("All");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<"All" | "Outstanding" | "Fully Paid">("All");

  const [selectedJobId, setSelectedJobId] = useState("");
  const [payType, setPayType] = useState<PaymentType>("payment");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payNote, setPayNote] = useState("");
  const [payError, setPayError] = useState("");
  const [pending, startTransition] = useTransition();

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const d = jobDerived(j);
      if (filterStyle !== "All" && j.style !== filterStyle) return false;
      if (filterStatus !== "All" && d.status !== filterStatus) return false;
      if (filterPaymentStatus === "Outstanding" && d.outstanding <= 0) return false;
      if (filterPaymentStatus === "Fully Paid" && d.outstanding > 0) return false;
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        if (!`${j.customerName} ${j.jobNumber}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [jobs, filterStyle, filterStatus, filterPaymentStatus, filterSearch]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;
  const entries = useMemo(() => (selectedJob ? buildPaymentEntries(selectedJob) : []), [selectedJob]);
  const paidSoFar = entries.length ? entries[entries.length - 1].runningTotal : 0;

  const handleRecordPayment = () => {
    if (!selectedJob) {
      setPayError("Select a job first.");
      return;
    }
    const amt = Number(payAmount);
    if (!payAmount || Number.isNaN(amt) || amt <= 0) {
      setPayError("Enter an amount greater than 0.");
      return;
    }
    if (payType === "refund" && amt > paidSoFar) {
      setPayError(`Refund cannot exceed the total amount paid so far (${formatCurrency(paidSoFar)}).`);
      return;
    }
    setPayError("");
    startTransition(async () => {
      const result = await addJobPayment(selectedJob.id, {
        date: payDate,
        amount: amt,
        method: payType === "refund" ? "Refund" : payMethod,
        note: payNote || null,
        type: payType,
      });
      if (!result.success) {
        setPayError(result.error);
        return;
      }
      setPayAmount("");
      setPayNote("");
      setPayType("payment");
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-ink font-serif">Payments &amp; Receipts</h1>
        <p className="text-sm text-slate">Record payments and refunds, and download receipts for any job.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-line rounded px-3 py-2">
          <Search size={15} color="#6B6470" />
          <input placeholder="Search customer or job #…" className="text-sm outline-none border-none" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} />
        </div>
        <select className="border border-line rounded px-3 py-2 text-sm bg-white" value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)}>
          <option value="All">All styles</option>
          {STYLES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="border border-line rounded px-3 py-2 text-sm bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as JobStatus | "All")}>
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          className="border border-line rounded px-3 py-2 text-sm bg-white"
          value={filterPaymentStatus}
          onChange={(e) => setFilterPaymentStatus(e.target.value as "All" | "Outstanding" | "Fully Paid")}
        >
          <option value="All">All payment statuses</option>
          <option value="Outstanding">Outstanding balance</option>
          <option value="Fully Paid">Fully paid</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-line p-4" style={{ maxWidth: 560 }}>
        <Field label={`Job (${filteredJobs.length} match${filteredJobs.length === 1 ? "" : "es"} your filters)`}>
          <select className={inputCls} value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
            <option value="">Select a job…</option>
            {filteredJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.jobNumber} — {j.customerName} ({styleLabelOf(j)})
              </option>
            ))}
          </select>
        </Field>

        {selectedJob && (
          <>
            <ErrorBanner messages={payError ? [payError] : []} />
            <div className="grid grid-cols-2 gap-2">
              <select className={inputCls} value={payType} onChange={(e) => setPayType(e.target.value as PaymentType)}>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
              <input type="date" className={inputCls} value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input type="number" min="0" placeholder="Amount ₦" className={inputCls} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              {payType === "payment" ? (
                <select className={inputCls} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>POS</option>
                  <option>Other</option>
                </select>
              ) : (
                <input disabled className={inputCls} style={{ backgroundColor: "#F7F2E8", color: "#6B6470" }} value="Refund — corrects a mistake or excess payment" readOnly />
              )}
            </div>
            <input
              placeholder={payType === "refund" ? "Reason for refund (optional)" : "Note (optional)"}
              className={`${inputCls} mt-2`}
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
            />
            <button
              onClick={handleRecordPayment}
              disabled={pending}
              className="mt-2 w-full px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: payType === "refund" ? "#B23A48" : "#3D2645" }}
            >
              {payType === "refund" ? "Record Refund" : "Record Payment"}
            </button>

            <p className="text-xs font-semibold uppercase mt-4 mb-1 text-slate tracking-wide">Payment history</p>
            <div className="border border-line rounded-lg divide-y divide-line">
              {entries.length === 0 && <p className="text-sm px-3 py-3 text-slate">No payments recorded yet.</p>}
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-ink">
                    {entry.date || "—"} • {entry.type === "refund" ? "Refund" : entry.method || "Payment"}
                    {entry.note ? ` — ${entry.note}` : ""}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ color: entry.type === "refund" ? "#B23A48" : "#1E8A5F" }}>
                      {entry.type === "refund" ? "-" : ""}
                      {formatCurrency(entry.amount)}
                    </span>
                    <a href={`/api/documents/receipt/${selectedJob.id}/${entry.id}`} className="font-semibold underline" style={{ color: "#3D2645" }}>
                      {entry.type === "refund" ? "Refund slip" : "Receipt"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
